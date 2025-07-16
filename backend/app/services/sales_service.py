from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc
from datetime import datetime, timedelta
from app.models.sales import Sale, SaleItem
from app.schemas.sales import SaleCreate, SaleUpdate
import pandas as pd
from prophet import Prophet


class SalesService:
    def __init__(self, db: Session):
        self.db = db

    def create_sale(self, sale_create: SaleCreate) -> Sale:
        db_sale = Sale(
            total_amount=sale_create.total_amount,
            tax_amount=sale_create.tax_amount,
            discount_amount=sale_create.discount_amount,
            payment_method=sale_create.payment_method,
            customer_name=sale_create.customer_name,
            customer_email=sale_create.customer_email,
            notes=sale_create.notes
        )
        self.db.add(db_sale)
        self.db.flush()
        
        # Add sale items
        for item_data in sale_create.items:
            db_item = SaleItem(
                sale_id=db_sale.id,
                product_name=item_data.product_name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=item_data.total_price
            )
            self.db.add(db_item)
        
        self.db.commit()
        self.db.refresh(db_sale)
        return db_sale

    def get_sale(self, sale_id: int) -> Optional[Sale]:
        return self.db.query(Sale).filter(Sale.id == sale_id).first()

    def get_sales(self, skip: int = 0, limit: int = 100, 
                  start_date: Optional[datetime] = None, 
                  end_date: Optional[datetime] = None) -> List[Sale]:
        query = self.db.query(Sale)
        
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        
        return query.order_by(desc(Sale.created_at)).offset(skip).limit(limit).all()

    def get_sales_analytics(self, start_date: Optional[datetime] = None, 
                           end_date: Optional[datetime] = None) -> Dict[str, Any]:
        query = self.db.query(Sale)
        
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        
        sales = query.all()
        
        if not sales:
            return {
                "total_sales": 0,
                "total_revenue": 0.0,
                "average_sale": 0.0,
                "growth_rate": 0.0,
                "top_products": [],
                "sales_by_day": []
            }
        
        total_sales = len(sales)
        total_revenue = sum(sale.total_amount for sale in sales)
        average_sale = total_revenue / total_sales if total_sales > 0 else 0.0
        
        # Calculate growth rate (comparing to previous period)
        growth_rate = self._calculate_growth_rate(start_date, end_date)
        
        # Get top products
        top_products = self._get_top_products(start_date, end_date)
        
        # Get sales by day
        sales_by_day = self._get_sales_by_day(start_date, end_date)
        
        return {
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "average_sale": average_sale,
            "growth_rate": growth_rate,
            "top_products": top_products,
            "sales_by_day": sales_by_day
        }

    def _calculate_growth_rate(self, start_date: Optional[datetime], 
                              end_date: Optional[datetime]) -> float:
        if not start_date or not end_date:
            return 0.0
        
        period_length = (end_date - start_date).days
        previous_start = start_date - timedelta(days=period_length)
        previous_end = start_date
        
        current_revenue = self.db.query(func.sum(Sale.total_amount)).filter(
            Sale.created_at >= start_date,
            Sale.created_at <= end_date
        ).scalar() or 0.0
        
        previous_revenue = self.db.query(func.sum(Sale.total_amount)).filter(
            Sale.created_at >= previous_start,
            Sale.created_at <= previous_end
        ).scalar() or 0.0
        
        if previous_revenue == 0:
            return 0.0
        
        return ((current_revenue - previous_revenue) / previous_revenue) * 100

    def _get_top_products(self, start_date: Optional[datetime], 
                         end_date: Optional[datetime]) -> List[Dict[str, Any]]:
        query = self.db.query(
            SaleItem.product_name,
            func.sum(SaleItem.quantity).label('total_quantity'),
            func.sum(SaleItem.total_price).label('total_revenue')
        ).join(Sale)
        
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        
        results = query.group_by(SaleItem.product_name).order_by(
            desc('total_revenue')
        ).limit(10).all()
        
        return [
            {
                "product_name": result.product_name,
                "total_quantity": result.total_quantity,
                "total_revenue": result.total_revenue
            }
            for result in results
        ]

    def _get_sales_by_day(self, start_date: Optional[datetime], 
                         end_date: Optional[datetime]) -> List[Dict[str, Any]]:
        query = self.db.query(
            func.date(Sale.created_at).label('date'),
            func.count(Sale.id).label('count'),
            func.sum(Sale.total_amount).label('revenue')
        )
        
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        
        results = query.group_by(func.date(Sale.created_at)).order_by('date').all()
        
        return [
            {
                "date": result.date.isoformat(),
                "count": result.count,
                "revenue": result.revenue
            }
            for result in results
        ]

    def forecast_sales(self, days: int = 30) -> List[Dict[str, Any]]:
        try:
            # Get historical sales data
            sales_data = self.db.query(
                func.date(Sale.created_at).label('ds'),
                func.sum(Sale.total_amount).label('y')
            ).group_by(func.date(Sale.created_at)).order_by('ds').all()
            
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
                    "predicted_revenue": max(0, row['yhat']),
                    "lower_bound": max(0, row['yhat_lower']),
                    "upper_bound": max(0, row['yhat_upper'])
                }
                for _, row in forecast_data.iterrows()
            ]
        except Exception as e:
            print(f"Forecasting error: {e}")
            return []

    def get_sales_trends(self, period: str = "monthly") -> Dict[str, Any]:
        if period == "daily":
            date_part = func.date(Sale.created_at)
        elif period == "weekly":
            date_part = func.date_trunc('week', Sale.created_at)
        elif period == "monthly":
            date_part = func.date_trunc('month', Sale.created_at)
        else:
            date_part = func.date(Sale.created_at)
        
        results = self.db.query(
            date_part.label('period'),
            func.count(Sale.id).label('sales_count'),
            func.sum(Sale.total_amount).label('revenue'),
            func.avg(Sale.total_amount).label('avg_sale')
        ).group_by(date_part).order_by(date_part).all()
        
        return {
            "period": period,
            "data": [
                {
                    "period": result.period.isoformat() if result.period else None,
                    "sales_count": result.sales_count,
                    "revenue": result.revenue,
                    "avg_sale": result.avg_sale
                }
                for result in results
            ]
        }

    def update_sale(self, sale_id: int, sale_update: SaleUpdate) -> Optional[Sale]:
        db_sale = self.get_sale(sale_id)
        if not db_sale:
            return None
        
        update_data = sale_update.dict(exclude_unset=True, exclude={'items'})
        for field, value in update_data.items():
            setattr(db_sale, field, value)
        
        self.db.commit()
        self.db.refresh(db_sale)
        return db_sale

    def delete_sale(self, sale_id: int) -> bool:
        db_sale = self.get_sale(sale_id)
        if not db_sale:
            return False
        
        self.db.delete(db_sale)
        self.db.commit()
        return True