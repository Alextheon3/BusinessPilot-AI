from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.models.inventory import InventoryItem
from app.schemas.inventory import InventoryCreate, InventoryUpdate
import pandas as pd
from prophet import Prophet


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def create_item(self, item_create: InventoryCreate) -> InventoryItem:
        db_item = InventoryItem(
            name=item_create.name,
            description=item_create.description,
            sku=item_create.sku,
            category=item_create.category,
            quantity=item_create.quantity,
            min_stock_level=item_create.min_stock_level,
            unit_price=item_create.unit_price,
            cost_price=item_create.cost_price,
            supplier=item_create.supplier
        )
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def get_item(self, item_id: int) -> Optional[InventoryItem]:
        return self.db.query(InventoryItem).filter(InventoryItem.id == item_id).first()

    def get_item_by_sku(self, sku: str) -> Optional[InventoryItem]:
        return self.db.query(InventoryItem).filter(InventoryItem.sku == sku).first()

    def get_items(self, skip: int = 0, limit: int = 100, 
                  category: Optional[str] = None,
                  search: Optional[str] = None) -> List[InventoryItem]:
        query = self.db.query(InventoryItem)
        
        if category:
            query = query.filter(InventoryItem.category == category)
        
        if search:
            query = query.filter(
                func.lower(InventoryItem.name).contains(search.lower()) |
                func.lower(InventoryItem.description).contains(search.lower())
            )
        
        return query.order_by(InventoryItem.name).offset(skip).limit(limit).all()

    def update_item(self, item_id: int, item_update: InventoryUpdate) -> Optional[InventoryItem]:
        db_item = self.get_item(item_id)
        if not db_item:
            return None
        
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def delete_item(self, item_id: int) -> bool:
        db_item = self.get_item(item_id)
        if not db_item:
            return False
        
        self.db.delete(db_item)
        self.db.commit()
        return True

    def get_low_stock_items(self) -> List[Dict[str, Any]]:
        items = self.db.query(InventoryItem).filter(
            InventoryItem.quantity <= InventoryItem.min_stock_level
        ).all()
        
        return [
            {
                "id": item.id,
                "name": item.name,
                "current_stock": item.quantity,
                "min_stock_level": item.min_stock_level,
                "shortage": item.min_stock_level - item.quantity,
                "category": item.category,
                "supplier": item.supplier
            }
            for item in items
        ]

    def update_stock(self, item_id: int, quantity_change: int, 
                    operation: str = "add") -> Optional[InventoryItem]:
        db_item = self.get_item(item_id)
        if not db_item:
            return None
        
        if operation == "add":
            db_item.quantity += quantity_change
        elif operation == "subtract":
            db_item.quantity -= quantity_change
        elif operation == "set":
            db_item.quantity = quantity_change
        
        # Ensure quantity doesn't go below 0
        if db_item.quantity < 0:
            db_item.quantity = 0
        
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def get_inventory_value(self) -> Dict[str, Any]:
        items = self.db.query(InventoryItem).all()
        
        total_value = sum(item.quantity * item.cost_price for item in items)
        retail_value = sum(item.quantity * item.unit_price for item in items)
        total_items = len(items)
        total_quantity = sum(item.quantity for item in items)
        
        categories = {}
        for item in items:
            if item.category not in categories:
                categories[item.category] = {
                    "count": 0,
                    "value": 0,
                    "quantity": 0
                }
            categories[item.category]["count"] += 1
            categories[item.category]["value"] += item.quantity * item.cost_price
            categories[item.category]["quantity"] += item.quantity
        
        return {
            "total_value": total_value,
            "retail_value": retail_value,
            "potential_profit": retail_value - total_value,
            "total_items": total_items,
            "total_quantity": total_quantity,
            "categories": categories
        }

    def get_categories(self) -> List[str]:
        categories = self.db.query(InventoryItem.category).distinct().all()
        return [cat[0] for cat in categories if cat[0]]

    def forecast_demand(self, item_id: int, days: int = 30) -> List[Dict[str, Any]]:
        try:
            # Get historical sales data for this item
            from app.models.sales import SaleItem
            
            sales_data = self.db.query(
                func.date(SaleItem.sale.created_at).label('ds'),
                func.sum(SaleItem.quantity).label('y')
            ).join(SaleItem.sale).filter(
                SaleItem.product_name == self.get_item(item_id).name
            ).group_by(func.date(SaleItem.sale.created_at)).order_by('ds').all()
            
            if len(sales_data) < 10:
                return []
            
            # Convert to DataFrame
            df = pd.DataFrame([
                {"ds": pd.to_datetime(row.ds), "y": float(row.y)}
                for row in sales_data
            ])
            
            # Create and fit Prophet model
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True
            )
            model.fit(df)
            
            # Make future predictions
            future = model.make_future_dataframe(periods=days)
            forecast = model.predict(future)
            
            # Return last 'days' predictions
            forecast_data = forecast.tail(days)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
            
            return [
                {
                    "date": row['ds'].strftime('%Y-%m-%d'),
                    "predicted_demand": max(0, row['yhat']),
                    "lower_bound": max(0, row['yhat_lower']),
                    "upper_bound": max(0, row['yhat_upper'])
                }
                for _, row in forecast_data.iterrows()
            ]
        except Exception as e:
            print(f"Demand forecasting error: {e}")
            return []

    def get_reorder_suggestions(self) -> List[Dict[str, Any]]:
        low_stock = self.get_low_stock_items()
        suggestions = []
        
        for item in low_stock:
            db_item = self.get_item(item["id"])
            if not db_item:
                continue
            
            # Get demand forecast for next 30 days
            forecast = self.forecast_demand(item["id"], 30)
            
            if forecast:
                avg_daily_demand = sum(f["predicted_demand"] for f in forecast) / len(forecast)
                suggested_quantity = int(avg_daily_demand * 30) + db_item.min_stock_level
            else:
                # Fallback to simple calculation
                suggested_quantity = db_item.min_stock_level * 2
            
            suggestions.append({
                "item_id": item["id"],
                "name": item["name"],
                "current_stock": item["current_stock"],
                "suggested_quantity": suggested_quantity,
                "supplier": item["supplier"],
                "estimated_cost": suggested_quantity * db_item.cost_price,
                "urgency": "high" if item["shortage"] > 0 else "medium"
            })
        
        return sorted(suggestions, key=lambda x: x["urgency"] == "high", reverse=True)

    def get_top_selling_items(self, days: int = 30) -> List[Dict[str, Any]]:
        from app.models.sales import SaleItem, Sale
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        results = self.db.query(
            SaleItem.product_name,
            func.sum(SaleItem.quantity).label('total_quantity'),
            func.sum(SaleItem.total_price).label('total_revenue')
        ).join(Sale).filter(
            Sale.created_at >= start_date,
            Sale.created_at <= end_date
        ).group_by(SaleItem.product_name).order_by(
            desc('total_quantity')
        ).limit(10).all()
        
        return [
            {
                "product_name": result.product_name,
                "total_quantity": result.total_quantity,
                "total_revenue": result.total_revenue,
                "avg_price": result.total_revenue / result.total_quantity if result.total_quantity > 0 else 0
            }
            for result in results
        ]

    def get_slow_moving_items(self, days: int = 90) -> List[Dict[str, Any]]:
        from app.models.sales import SaleItem, Sale
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get all inventory items
        all_items = self.db.query(InventoryItem).all()
        
        # Get items that have been sold
        sold_items = self.db.query(
            SaleItem.product_name,
            func.sum(SaleItem.quantity).label('total_sold')
        ).join(Sale).filter(
            Sale.created_at >= start_date,
            Sale.created_at <= end_date
        ).group_by(SaleItem.product_name).all()
        
        sold_dict = {item.product_name: item.total_sold for item in sold_items}
        
        slow_moving = []
        for item in all_items:
            sold_quantity = sold_dict.get(item.name, 0)
            if sold_quantity == 0 or (item.quantity > 0 and sold_quantity < item.quantity * 0.1):
                slow_moving.append({
                    "id": item.id,
                    "name": item.name,
                    "current_stock": item.quantity,
                    "sold_quantity": sold_quantity,
                    "tied_up_value": item.quantity * item.cost_price,
                    "category": item.category,
                    "days_without_sale": days if sold_quantity == 0 else None
                })
        
        return sorted(slow_moving, key=lambda x: x["tied_up_value"], reverse=True)