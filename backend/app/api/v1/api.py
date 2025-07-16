from fastapi import APIRouter
from app.api.v1.endpoints import auth, sales, inventory, employees, marketing, finance, events, assistant

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["Marketing"])
api_router.include_router(finance.router, prefix="/finance", tags=["Finance"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Assistant"])