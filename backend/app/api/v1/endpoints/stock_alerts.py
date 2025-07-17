"""
Stock Alerts API Endpoints for BusinessPilot AI
Real-time inventory monitoring and intelligent stock predictions
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from enum import Enum

from app.services.stock_alerts_service import stock_alerts_service, AlertUrgency, AlertType

router = APIRouter()

class AlertUrgencyEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertTypeEnum(str, Enum):
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    OVERSTOCK = "overstock"
    REORDER_POINT = "reorder_point"
    EXPIRY_WARNING = "expiry_warning"

class StockAlertRequest(BaseModel):
    product_id: str = Field(..., description="Product ID")
    min_stock: int = Field(..., description="Minimum stock level")
    reorder_point: int = Field(..., description="Reorder point threshold")
    max_stock: Optional[int] = Field(None, description="Maximum stock level")
    alert_emails: List[str] = Field(default=[], description="Email addresses for alerts")

class UpdateStockRequest(BaseModel):
    product_id: str = Field(..., description="Product ID")
    current_stock: int = Field(..., description="Current stock level")
    location: Optional[str] = Field(None, description="Storage location")

class AlertSettingsRequest(BaseModel):
    enable_low_stock: bool = Field(default=True, description="Enable low stock alerts")
    enable_overstock: bool = Field(default=True, description="Enable overstock alerts")
    enable_expiry: bool = Field(default=True, description="Enable expiry warnings")
    alert_frequency: str = Field(default="immediate", description="Alert frequency")
    notification_channels: List[str] = Field(default=["email"], description="Notification channels")

@router.get("/alerts")
async def get_stock_alerts(
    urgency: Optional[AlertUrgencyEnum] = None,
    alert_type: Optional[AlertTypeEnum] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Get current stock alerts with filtering options
    """
    try:
        # Convert enum values to service types
        service_urgency = AlertUrgency(urgency.value) if urgency else None
        service_alert_type = AlertType(alert_type.value) if alert_type else None
        
        result = stock_alerts_service.get_active_alerts(
            urgency=service_urgency,
            alert_type=service_alert_type,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/critical")
async def get_critical_alerts() -> Dict[str, Any]:
    """
    Get critical stock alerts that require immediate attention
    """
    try:
        result = stock_alerts_service.get_critical_alerts()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/predictions")
async def get_stock_predictions(
    days_ahead: int = 7,
    product_ids: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Get stock level predictions and reorder recommendations
    """
    try:
        result = stock_alerts_service.get_stock_predictions(
            days_ahead=days_ahead,
            product_ids=product_ids
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/configure")
async def configure_stock_alert(
    request: StockAlertRequest
) -> Dict[str, Any]:
    """
    Configure stock alert settings for a product
    """
    try:
        result = stock_alerts_service.configure_product_alert(
            product_id=request.product_id,
            min_stock=request.min_stock,
            reorder_point=request.reorder_point,
            max_stock=request.max_stock,
            alert_emails=request.alert_emails
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "message": "Stock alert configured successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stock/update")
async def update_stock_level(
    request: UpdateStockRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Update stock level and trigger alert checking
    """
    try:
        # Update stock level
        result = stock_alerts_service.update_stock_level(
            product_id=request.product_id,
            current_stock=request.current_stock,
            location=request.location
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Check for alerts in background
        background_tasks.add_task(
            stock_alerts_service.check_and_send_alerts,
            product_id=request.product_id
        )
        
        return {
            "success": True,
            "message": "Stock level updated successfully",
            "data": result,
            "alerts_triggered": result.get("alerts_triggered", 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/bulk-check")
async def bulk_check_stock_alerts(
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Perform bulk stock alert checking for all products
    """
    try:
        # Start bulk checking in background
        background_tasks.add_task(
            stock_alerts_service.bulk_check_alerts
        )
        
        return {
            "success": True,
            "message": "Bulk stock alert checking initiated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/settings")
async def get_alert_settings() -> Dict[str, Any]:
    """
    Get current alert settings
    """
    try:
        result = stock_alerts_service.get_alert_settings()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/alerts/settings")
async def update_alert_settings(
    request: AlertSettingsRequest
) -> Dict[str, Any]:
    """
    Update global alert settings
    """
    try:
        result = stock_alerts_service.update_alert_settings(
            enable_low_stock=request.enable_low_stock,
            enable_overstock=request.enable_overstock,
            enable_expiry=request.enable_expiry,
            alert_frequency=request.alert_frequency,
            notification_channels=request.notification_channels
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "message": "Alert settings updated successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_stock_analytics(
    days_back: int = 30
) -> Dict[str, Any]:
    """
    Get stock analytics and alert statistics
    """
    try:
        result = stock_alerts_service.get_stock_analytics(days_back=days_back)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reorder-suggestions")
async def get_reorder_suggestions(
    urgency: Optional[AlertUrgencyEnum] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Get intelligent reorder suggestions based on stock levels and sales patterns
    """
    try:
        service_urgency = AlertUrgency(urgency.value) if urgency else None
        
        result = stock_alerts_service.get_reorder_suggestions(
            urgency=service_urgency,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    acknowledged_by: str = "system"
) -> Dict[str, Any]:
    """
    Acknowledge a stock alert
    """
    try:
        result = stock_alerts_service.acknowledge_alert(
            alert_id=alert_id,
            acknowledged_by=acknowledged_by
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "message": "Alert acknowledged successfully",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/alerts/{alert_id}")
async def dismiss_alert(
    alert_id: str,
    dismissed_by: str = "system"
) -> Dict[str, Any]:
    """
    Dismiss a stock alert
    """
    try:
        result = stock_alerts_service.dismiss_alert(
            alert_id=alert_id,
            dismissed_by=dismissed_by
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "message": "Alert dismissed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/history")
async def get_alert_history(
    days_back: int = 30,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Get historical stock alerts
    """
    try:
        result = stock_alerts_service.get_alert_history(
            days_back=days_back,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def get_system_health() -> Dict[str, Any]:
    """
    Get stock alerts system health status
    """
    try:
        result = stock_alerts_service.get_system_health()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))