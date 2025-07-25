from fastapi import APIRouter
from app.api.v1.endpoints import auth, sales, inventory, employees, marketing, finance, events, assistant, paperwork, email_invoices, payment_reminders, stock_alerts, business_setup, taxisnet_auth, ai_legal, predictive_timeline, ai_contracts, multimodal_inbox, profitability_optimizer, ai_supplier_marketplace

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(taxisnet_auth.router, prefix="/auth", tags=["TaxisNet Authentication"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["Marketing"])
api_router.include_router(finance.router, prefix="/finance", tags=["Finance"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Assistant"])
api_router.include_router(paperwork.router, prefix="/paperwork", tags=["Paperwork & Documents"])
api_router.include_router(email_invoices.router, prefix="/email-invoices", tags=["Email Invoices"])
api_router.include_router(payment_reminders.router, prefix="/payment-reminders", tags=["Payment Reminders"])
api_router.include_router(stock_alerts.router, prefix="/stock-alerts", tags=["Stock Alerts"])
api_router.include_router(business_setup.router, tags=["Business Setup"])
api_router.include_router(ai_legal.router, tags=["AI Legal Navigator"])
api_router.include_router(predictive_timeline.router, tags=["Predictive Timeline"])
api_router.include_router(ai_contracts.router, tags=["AI Contract Generator"])
api_router.include_router(multimodal_inbox.router, tags=["Multimodal AI Inbox"])
api_router.include_router(profitability_optimizer.router, tags=["Profitability Optimizer"])
api_router.include_router(ai_supplier_marketplace.router, prefix="/ai-supplier-marketplace", tags=["AI Supplier Marketplace"])