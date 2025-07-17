"""
Stock Alerts Service for BusinessPilot AI
Intelligent inventory monitoring with predictive analytics
"""

import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import logging
import json
from collections import defaultdict
import statistics

logger = logging.getLogger(__name__)

class AlertUrgency(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertType(Enum):
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    OVERSTOCK = "overstock"
    REORDER_POINT = "reorder_point"
    EXPIRY_WARNING = "expiry_warning"

class AlertStatus(Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    DISMISSED = "dismissed"
    RESOLVED = "resolved"

@dataclass
class Product:
    """Product inventory data"""
    id: str
    name: str
    current_stock: int
    min_stock: int
    reorder_point: int
    max_stock: Optional[int] = None
    unit_cost: float = 0.0
    location: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    last_updated: datetime = field(default_factory=datetime.now)
    
    # Sales analytics
    daily_sales_avg: float = 0.0
    weekly_sales_avg: float = 0.0
    monthly_sales_avg: float = 0.0
    seasonal_factor: float = 1.0
    
    # Predictions
    predicted_stock_7d: Optional[int] = None
    predicted_stock_14d: Optional[int] = None
    predicted_stock_30d: Optional[int] = None
    next_reorder_date: Optional[datetime] = None

@dataclass
class StockAlert:
    """Stock alert data"""
    id: str
    product_id: str
    product_name: str
    alert_type: AlertType
    urgency: AlertUrgency
    current_stock: int
    threshold: int
    message: str
    created_at: datetime
    status: AlertStatus = AlertStatus.ACTIVE
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    dismissed_by: Optional[str] = None
    dismissed_at: Optional[datetime] = None
    
    # Additional context
    predicted_stockout_date: Optional[datetime] = None
    recommended_order_quantity: Optional[int] = None
    cost_impact: Optional[float] = None

@dataclass
class ReorderSuggestion:
    """Intelligent reorder suggestion"""
    product_id: str
    product_name: str
    current_stock: int
    suggested_quantity: int
    order_cost: float
    urgency: AlertUrgency
    reasoning: str
    supplier: Optional[str] = None
    expected_delivery: Optional[datetime] = None

class StockAlertsService:
    """
    Stock Alerts Service
    Provides intelligent inventory monitoring and predictive analytics
    """
    
    def __init__(self):
        self.products: Dict[str, Product] = {}
        self.alerts: Dict[str, StockAlert] = {}
        self.alert_settings = {
            "enable_low_stock": True,
            "enable_overstock": True,
            "enable_expiry": True,
            "alert_frequency": "immediate",
            "notification_channels": ["email", "dashboard"],
            "business_hours_only": False
        }
        
        # Initialize with mock data
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        """Initialize with mock product data"""
        mock_products = [
            Product(
                id="prod_coffee_beans",
                name="Coffee Beans Premium",
                current_stock=5,
                min_stock=10,
                reorder_point=15,
                max_stock=50,
                unit_cost=12.50,
                location="Warehouse A",
                category="Beverages",
                supplier="Greek Coffee Co.",
                daily_sales_avg=2.5,
                weekly_sales_avg=17.5,
                monthly_sales_avg=75.0
            ),
            Product(
                id="prod_sugar",
                name="Sugar White 1kg",
                current_stock=2,
                min_stock=5,
                reorder_point=8,
                max_stock=25,
                unit_cost=1.20,
                location="Storage Room",
                category="Ingredients",
                supplier="Sugar Suppliers Ltd",
                daily_sales_avg=1.2,
                weekly_sales_avg=8.4,
                monthly_sales_avg=36.0
            ),
            Product(
                id="prod_milk",
                name="Fresh Milk 1L",
                current_stock=8,
                min_stock=15,
                reorder_point=20,
                max_stock=40,
                unit_cost=1.50,
                location="Refrigerator",
                category="Dairy",
                supplier="Local Dairy",
                daily_sales_avg=3.0,
                weekly_sales_avg=21.0,
                monthly_sales_avg=90.0
            ),
            Product(
                id="prod_flour",
                name="Bread Flour 5kg",
                current_stock=12,
                min_stock=20,
                reorder_point=25,
                max_stock=60,
                unit_cost=3.80,
                location="Dry Storage",
                category="Baking",
                supplier="Flour Mills Inc",
                daily_sales_avg=1.8,
                weekly_sales_avg=12.6,
                monthly_sales_avg=54.0
            ),
            Product(
                id="prod_olive_oil",
                name="Extra Virgin Olive Oil 1L",
                current_stock=25,
                min_stock=10,
                reorder_point=15,
                max_stock=50,
                unit_cost=8.90,
                location="Pantry",
                category="Oils",
                supplier="Olive Groves SA",
                daily_sales_avg=0.8,
                weekly_sales_avg=5.6,
                monthly_sales_avg=24.0
            )
        ]
        
        for product in mock_products:
            self.products[product.id] = product
            # Calculate predictions
            self._calculate_predictions(product)
        
        # Generate initial alerts
        self._generate_initial_alerts()
    
    def _calculate_predictions(self, product: Product):
        """Calculate stock predictions for a product"""
        try:
            # Simple prediction based on daily sales average
            daily_usage = product.daily_sales_avg
            
            if daily_usage > 0:
                # Predict stock levels
                product.predicted_stock_7d = max(0, product.current_stock - int(daily_usage * 7))
                product.predicted_stock_14d = max(0, product.current_stock - int(daily_usage * 14))
                product.predicted_stock_30d = max(0, product.current_stock - int(daily_usage * 30))
                
                # Predict next reorder date
                if product.current_stock > product.reorder_point:
                    days_until_reorder = (product.current_stock - product.reorder_point) / daily_usage
                    product.next_reorder_date = datetime.now() + timedelta(days=days_until_reorder)
                else:
                    product.next_reorder_date = datetime.now()  # Reorder now
            
        except Exception as e:
            logger.error(f"Error calculating predictions for {product.id}: {str(e)}")
    
    def _generate_initial_alerts(self):
        """Generate initial alerts based on current stock levels"""
        for product in self.products.values():
            self._check_product_alerts(product)
    
    def _check_product_alerts(self, product: Product):
        """Check and generate alerts for a specific product"""
        alerts_generated = []
        
        # Check for out of stock
        if product.current_stock == 0:
            alert = self._create_alert(
                product=product,
                alert_type=AlertType.OUT_OF_STOCK,
                urgency=AlertUrgency.CRITICAL,
                threshold=0,
                message=f"{product.name} is out of stock!"
            )
            alerts_generated.append(alert)
        
        # Check for low stock
        elif product.current_stock <= product.min_stock:
            urgency = AlertUrgency.HIGH if product.current_stock < product.min_stock * 0.5 else AlertUrgency.MEDIUM
            alert = self._create_alert(
                product=product,
                alert_type=AlertType.LOW_STOCK,
                urgency=urgency,
                threshold=product.min_stock,
                message=f"{product.name} is running low ({product.current_stock} remaining)"
            )
            alerts_generated.append(alert)
        
        # Check for reorder point
        elif product.current_stock <= product.reorder_point:
            alert = self._create_alert(
                product=product,
                alert_type=AlertType.REORDER_POINT,
                urgency=AlertUrgency.MEDIUM,
                threshold=product.reorder_point,
                message=f"{product.name} has reached reorder point ({product.current_stock} remaining)"
            )
            alerts_generated.append(alert)
        
        # Check for overstock
        elif product.max_stock and product.current_stock > product.max_stock:
            alert = self._create_alert(
                product=product,
                alert_type=AlertType.OVERSTOCK,
                urgency=AlertUrgency.LOW,
                threshold=product.max_stock,
                message=f"{product.name} is overstocked ({product.current_stock} units)"
            )
            alerts_generated.append(alert)
        
        return alerts_generated
    
    def _create_alert(self, product: Product, alert_type: AlertType, urgency: AlertUrgency, 
                     threshold: int, message: str) -> StockAlert:
        """Create a new stock alert"""
        alert_id = f"alert_{product.id}_{alert_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        alert = StockAlert(
            id=alert_id,
            product_id=product.id,
            product_name=product.name,
            alert_type=alert_type,
            urgency=urgency,
            current_stock=product.current_stock,
            threshold=threshold,
            message=message,
            created_at=datetime.now()
        )
        
        # Add additional context
        if alert_type in [AlertType.LOW_STOCK, AlertType.OUT_OF_STOCK]:
            # Calculate predicted stockout date
            if product.daily_sales_avg > 0:
                days_until_stockout = product.current_stock / product.daily_sales_avg
                alert.predicted_stockout_date = datetime.now() + timedelta(days=days_until_stockout)
            
            # Calculate recommended order quantity
            alert.recommended_order_quantity = max(
                product.reorder_point - product.current_stock,
                int(product.weekly_sales_avg * 2)  # 2 weeks of sales
            )
            
            # Calculate cost impact
            alert.cost_impact = alert.recommended_order_quantity * product.unit_cost
        
        self.alerts[alert_id] = alert
        return alert
    
    def get_active_alerts(self, urgency: Optional[AlertUrgency] = None, 
                         alert_type: Optional[AlertType] = None, 
                         limit: int = 50) -> Dict[str, Any]:
        """Get active stock alerts with filtering"""
        try:
            alerts = [
                alert for alert in self.alerts.values()
                if alert.status == AlertStatus.ACTIVE
            ]
            
            # Apply filters
            if urgency:
                alerts = [alert for alert in alerts if alert.urgency == urgency]
            
            if alert_type:
                alerts = [alert for alert in alerts if alert.alert_type == alert_type]
            
            # Sort by urgency and creation date
            urgency_order = {
                AlertUrgency.CRITICAL: 0,
                AlertUrgency.HIGH: 1,
                AlertUrgency.MEDIUM: 2,
                AlertUrgency.LOW: 3
            }
            
            alerts.sort(key=lambda x: (urgency_order[x.urgency], x.created_at), reverse=True)
            alerts = alerts[:limit]
            
            return {
                "success": True,
                "total": len(alerts),
                "alerts": [
                    {
                        "id": alert.id,
                        "product_id": alert.product_id,
                        "product_name": alert.product_name,
                        "alert_type": alert.alert_type.value,
                        "urgency": alert.urgency.value,
                        "current_stock": alert.current_stock,
                        "threshold": alert.threshold,
                        "message": alert.message,
                        "created_at": alert.created_at.isoformat(),
                        "predicted_stockout_date": alert.predicted_stockout_date.isoformat() if alert.predicted_stockout_date else None,
                        "recommended_order_quantity": alert.recommended_order_quantity,
                        "cost_impact": alert.cost_impact
                    }
                    for alert in alerts
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting active alerts: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_critical_alerts(self) -> Dict[str, Any]:
        """Get critical alerts that require immediate attention"""
        return self.get_active_alerts(urgency=AlertUrgency.CRITICAL)
    
    def get_stock_predictions(self, days_ahead: int = 7, 
                            product_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get stock level predictions"""
        try:
            products = self.products.values()
            if product_ids:
                products = [p for p in products if p.id in product_ids]
            
            predictions = []
            for product in products:
                self._calculate_predictions(product)
                
                prediction = {
                    "product_id": product.id,
                    "product_name": product.name,
                    "current_stock": product.current_stock,
                    "daily_sales_avg": product.daily_sales_avg,
                    "predictions": {
                        "7_days": product.predicted_stock_7d,
                        "14_days": product.predicted_stock_14d,
                        "30_days": product.predicted_stock_30d
                    },
                    "next_reorder_date": product.next_reorder_date.isoformat() if product.next_reorder_date else None,
                    "reorder_recommended": product.current_stock <= product.reorder_point
                }
                predictions.append(prediction)
            
            return {
                "success": True,
                "predictions": predictions,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting stock predictions: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def configure_product_alert(self, product_id: str, min_stock: int, 
                              reorder_point: int, max_stock: Optional[int] = None,
                              alert_emails: List[str] = None) -> Dict[str, Any]:
        """Configure alert settings for a product"""
        try:
            if product_id not in self.products:
                return {"success": False, "error": "Product not found"}
            
            product = self.products[product_id]
            product.min_stock = min_stock
            product.reorder_point = reorder_point
            product.max_stock = max_stock
            
            # Recalculate predictions
            self._calculate_predictions(product)
            
            # Check for new alerts
            self._check_product_alerts(product)
            
            return {
                "success": True,
                "product_id": product_id,
                "updated_settings": {
                    "min_stock": min_stock,
                    "reorder_point": reorder_point,
                    "max_stock": max_stock
                }
            }
            
        except Exception as e:
            logger.error(f"Error configuring product alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def update_stock_level(self, product_id: str, current_stock: int, 
                          location: Optional[str] = None) -> Dict[str, Any]:
        """Update stock level and trigger alert checking"""
        try:
            if product_id not in self.products:
                return {"success": False, "error": "Product not found"}
            
            product = self.products[product_id]
            old_stock = product.current_stock
            product.current_stock = current_stock
            product.last_updated = datetime.now()
            
            if location:
                product.location = location
            
            # Recalculate predictions
            self._calculate_predictions(product)
            
            # Check for new alerts
            new_alerts = self._check_product_alerts(product)
            
            return {
                "success": True,
                "product_id": product_id,
                "old_stock": old_stock,
                "new_stock": current_stock,
                "alerts_triggered": len(new_alerts),
                "updated_at": product.last_updated.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error updating stock level: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_reorder_suggestions(self, urgency: Optional[AlertUrgency] = None,
                               limit: int = 20) -> Dict[str, Any]:
        """Get intelligent reorder suggestions"""
        try:
            suggestions = []
            
            for product in self.products.values():
                if product.current_stock <= product.reorder_point:
                    # Calculate suggested quantity
                    suggested_qty = max(
                        product.reorder_point - product.current_stock,
                        int(product.weekly_sales_avg * 2)  # 2 weeks of sales
                    )
                    
                    # Determine urgency
                    if product.current_stock == 0:
                        suggestion_urgency = AlertUrgency.CRITICAL
                    elif product.current_stock <= product.min_stock * 0.5:
                        suggestion_urgency = AlertUrgency.HIGH
                    elif product.current_stock <= product.min_stock:
                        suggestion_urgency = AlertUrgency.MEDIUM
                    else:
                        suggestion_urgency = AlertUrgency.LOW
                    
                    # Apply urgency filter
                    if urgency and suggestion_urgency != urgency:
                        continue
                    
                    # Generate reasoning
                    reasoning = self._generate_reorder_reasoning(product, suggested_qty)
                    
                    suggestion = ReorderSuggestion(
                        product_id=product.id,
                        product_name=product.name,
                        current_stock=product.current_stock,
                        suggested_quantity=suggested_qty,
                        order_cost=suggested_qty * product.unit_cost,
                        urgency=suggestion_urgency,
                        reasoning=reasoning,
                        supplier=product.supplier,
                        expected_delivery=datetime.now() + timedelta(days=3)  # Mock delivery time
                    )
                    
                    suggestions.append(suggestion)
            
            # Sort by urgency
            urgency_order = {
                AlertUrgency.CRITICAL: 0,
                AlertUrgency.HIGH: 1,
                AlertUrgency.MEDIUM: 2,
                AlertUrgency.LOW: 3
            }
            
            suggestions.sort(key=lambda x: urgency_order[x.urgency])
            suggestions = suggestions[:limit]
            
            return {
                "success": True,
                "total": len(suggestions),
                "suggestions": [
                    {
                        "product_id": s.product_id,
                        "product_name": s.product_name,
                        "current_stock": s.current_stock,
                        "suggested_quantity": s.suggested_quantity,
                        "order_cost": s.order_cost,
                        "urgency": s.urgency.value,
                        "reasoning": s.reasoning,
                        "supplier": s.supplier,
                        "expected_delivery": s.expected_delivery.isoformat() if s.expected_delivery else None
                    }
                    for s in suggestions
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting reorder suggestions: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _generate_reorder_reasoning(self, product: Product, suggested_qty: int) -> str:
        """Generate reasoning for reorder suggestion"""
        reasons = []
        
        if product.current_stock == 0:
            reasons.append("Product is out of stock")
        elif product.current_stock <= product.min_stock:
            reasons.append(f"Stock below minimum level ({product.min_stock})")
        elif product.current_stock <= product.reorder_point:
            reasons.append(f"Reorder point reached ({product.reorder_point})")
        
        if product.daily_sales_avg > 0:
            days_of_supply = product.current_stock / product.daily_sales_avg
            reasons.append(f"Current stock will last {days_of_supply:.1f} days")
        
        reasons.append(f"Suggested quantity covers {suggested_qty / product.daily_sales_avg:.1f} days of sales")
        
        return ". ".join(reasons)
    
    def acknowledge_alert(self, alert_id: str, acknowledged_by: str) -> Dict[str, Any]:
        """Acknowledge an alert"""
        try:
            if alert_id not in self.alerts:
                return {"success": False, "error": "Alert not found"}
            
            alert = self.alerts[alert_id]
            alert.status = AlertStatus.ACKNOWLEDGED
            alert.acknowledged_by = acknowledged_by
            alert.acknowledged_at = datetime.now()
            
            return {
                "success": True,
                "alert_id": alert_id,
                "acknowledged_by": acknowledged_by,
                "acknowledged_at": alert.acknowledged_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error acknowledging alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def dismiss_alert(self, alert_id: str, dismissed_by: str) -> Dict[str, Any]:
        """Dismiss an alert"""
        try:
            if alert_id not in self.alerts:
                return {"success": False, "error": "Alert not found"}
            
            alert = self.alerts[alert_id]
            alert.status = AlertStatus.DISMISSED
            alert.dismissed_by = dismissed_by
            alert.dismissed_at = datetime.now()
            
            return {
                "success": True,
                "alert_id": alert_id,
                "dismissed_by": dismissed_by,
                "dismissed_at": alert.dismissed_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error dismissing alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_alert_settings(self) -> Dict[str, Any]:
        """Get current alert settings"""
        return {
            "success": True,
            "settings": self.alert_settings
        }
    
    def update_alert_settings(self, **kwargs) -> Dict[str, Any]:
        """Update alert settings"""
        try:
            for key, value in kwargs.items():
                if key in self.alert_settings:
                    self.alert_settings[key] = value
            
            return {
                "success": True,
                "updated_settings": self.alert_settings
            }
            
        except Exception as e:
            logger.error(f"Error updating alert settings: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_stock_analytics(self, days_back: int = 30) -> Dict[str, Any]:
        """Get stock analytics and alert statistics"""
        try:
            # Calculate analytics
            total_products = len(self.products)
            low_stock_products = sum(1 for p in self.products.values() if p.current_stock <= p.min_stock)
            out_of_stock_products = sum(1 for p in self.products.values() if p.current_stock == 0)
            
            active_alerts = len([a for a in self.alerts.values() if a.status == AlertStatus.ACTIVE])
            critical_alerts = len([a for a in self.alerts.values() if a.status == AlertStatus.ACTIVE and a.urgency == AlertUrgency.CRITICAL])
            
            # Calculate total inventory value
            total_value = sum(p.current_stock * p.unit_cost for p in self.products.values())
            
            return {
                "success": True,
                "analytics": {
                    "total_products": total_products,
                    "low_stock_products": low_stock_products,
                    "out_of_stock_products": out_of_stock_products,
                    "active_alerts": active_alerts,
                    "critical_alerts": critical_alerts,
                    "total_inventory_value": total_value,
                    "stock_turnover_rate": 0.15,  # Mock data
                    "average_days_of_supply": 21.5,  # Mock data
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting stock analytics: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_alert_history(self, days_back: int = 30, limit: int = 100) -> Dict[str, Any]:
        """Get historical alerts"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_back)
            
            historical_alerts = [
                alert for alert in self.alerts.values()
                if alert.created_at >= cutoff_date
            ]
            
            historical_alerts.sort(key=lambda x: x.created_at, reverse=True)
            historical_alerts = historical_alerts[:limit]
            
            return {
                "success": True,
                "total": len(historical_alerts),
                "alerts": [
                    {
                        "id": alert.id,
                        "product_name": alert.product_name,
                        "alert_type": alert.alert_type.value,
                        "urgency": alert.urgency.value,
                        "message": alert.message,
                        "status": alert.status.value,
                        "created_at": alert.created_at.isoformat(),
                        "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
                        "dismissed_at": alert.dismissed_at.isoformat() if alert.dismissed_at else None
                    }
                    for alert in historical_alerts
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting alert history: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get system health status"""
        try:
            return {
                "success": True,
                "system_health": {
                    "status": "healthy",
                    "total_products_monitored": len(self.products),
                    "active_alerts": len([a for a in self.alerts.values() if a.status == AlertStatus.ACTIVE]),
                    "last_update": datetime.now().isoformat(),
                    "monitoring_enabled": True,
                    "notification_services": {
                        "email": "active",
                        "dashboard": "active",
                        "sms": "inactive"
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting system health: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def check_and_send_alerts(self, product_id: str):
        """Check and send alerts for a specific product"""
        try:
            if product_id in self.products:
                product = self.products[product_id]
                alerts = self._check_product_alerts(product)
                
                # In a real implementation, send notifications here
                logger.info(f"Generated {len(alerts)} alerts for product {product_id}")
                
        except Exception as e:
            logger.error(f"Error checking alerts for product {product_id}: {str(e)}")
    
    async def bulk_check_alerts(self):
        """Perform bulk alert checking for all products"""
        try:
            total_alerts = 0
            for product in self.products.values():
                alerts = self._check_product_alerts(product)
                total_alerts += len(alerts)
            
            logger.info(f"Bulk check completed. Generated {total_alerts} alerts")
            
        except Exception as e:
            logger.error(f"Error during bulk alert check: {str(e)}")

# Singleton instance
stock_alerts_service = StockAlertsService()