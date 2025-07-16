from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.schemas.finance import ExpenseCreate, ExpenseResponse, FinancialReport
from app.services.finance_service import FinanceService

router = APIRouter()

@router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    finance_service = FinanceService(db)
    return finance_service.create_expense(expense)

@router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    finance_service = FinanceService(db)
    return finance_service.get_expenses(skip, limit, start_date, end_date, category)

@router.get("/categories")
async def get_expense_categories(db: Session = Depends(get_db)):
    finance_service = FinanceService(db)
    return finance_service.get_expense_categories()

@router.get("/summary")
async def get_financial_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    finance_service = FinanceService(db)
    if not start_date or not end_date:
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
    
    return finance_service.get_financial_summary(start_date, end_date)

@router.get("/cash-flow")
async def get_cash_flow_analysis(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    finance_service = FinanceService(db)
    if not start_date or not end_date:
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
    
    return finance_service.get_cash_flow_analysis(start_date, end_date)

@router.get("/insights")
async def get_financial_insights(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    finance_service = FinanceService(db)
    if not start_date or not end_date:
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
    
    return finance_service.get_financial_insights(start_date, end_date)

@router.get("/export")
async def export_financial_report(
    format: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    finance_service = FinanceService(db)
    if format not in ["pdf", "excel"]:
        raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'excel'")
    
    if not start_date or not end_date:
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
    
    from fastapi.responses import Response
    
    report_data = finance_service.export_financial_report(format, start_date, end_date)
    
    if format == "pdf":
        return Response(
            content=report_data,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=financial-report.pdf"}
        )
    else:
        return Response(
            content=report_data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=financial-report.xlsx"}
        )