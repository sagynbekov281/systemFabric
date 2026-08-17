from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, auth
from ..database import get_db
from ..timezone_utils import local_today

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/dashboard", response_model=schemas.DashboardSummary)
def dashboard(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    today = local_today()  # Бишкек датасы, сервердин UTC датасы эмес
    products = db.query(models.Product).filter(models.Product.is_active == True).all()  # noqa
    total_products = len(products)

    today_produced = db.query(func.coalesce(func.sum(models.ProductionRecord.quantity), 0.0)).filter(
        models.ProductionRecord.record_date == today
    ).scalar() or 0.0
    today_sold_row = db.query(
        func.coalesce(func.sum(models.SaleRecord.quantity), 0.0),
        func.coalesce(func.sum(models.SaleRecord.quantity * func.coalesce(models.SaleRecord.price, 0)), 0.0),
    ).filter(models.SaleRecord.record_date == today).first() or (0.0, 0.0)
    today_sold, today_revenue = today_sold_row

    product_ids = [p.id for p in products]

    produced_rows = (
        db.query(models.ProductionRecord.product_id, func.coalesce(func.sum(models.ProductionRecord.quantity), 0.0))
        .filter(models.ProductionRecord.product_id.in_(product_ids))
        .group_by(models.ProductionRecord.product_id)
        .all()
    ) if product_ids else []
    sold_rows = (
        db.query(models.SaleRecord.product_id, func.coalesce(func.sum(models.SaleRecord.quantity), 0.0))
        .filter(models.SaleRecord.product_id.in_(product_ids))
        .group_by(models.SaleRecord.product_id)
        .all()
    ) if product_ids else []
    returned_rows = (
        db.query(models.ReturnRecord.product_id, func.coalesce(func.sum(models.ReturnRecord.quantity), 0.0))
        .filter(models.ReturnRecord.product_id.in_(product_ids))
        .group_by(models.ReturnRecord.product_id)
        .all()
    ) if product_ids else []

    produced_map = {pid: float(q) for pid, q in produced_rows}
    sold_map = {pid: float(q) for pid, q in sold_rows}
    returned_map = {pid: float(q) for pid, q in returned_rows}

    stock_list = []
    total_stock = 0.0
    for p in products:
        stock = produced_map.get(p.id, 0.0) + returned_map.get(p.id, 0.0) - sold_map.get(p.id, 0.0)
        total_stock += stock
        item = schemas.ProductWithStock.model_validate(p)
        item.stock = stock
        stock_list.append(item)

    low_stock = sorted(stock_list, key=lambda x: x.stock)[:5]

    return schemas.DashboardSummary(
        total_products=total_products,
        today_produced=float(today_produced),
        today_sold=float(today_sold),
        today_revenue=float(today_revenue),
        total_stock=total_stock,
        low_stock_products=low_stock,
    )


@router.get("/summary")
def summary_report(
    date_from: date = Query(...),
    date_to: date = Query(...),
    group_by: str = Query("day", pattern="^(day|week|month|year)$"),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    """
    Күндүк / жумалык / айлык / жылдык отчет.
    Ар бир продукт боюнча ошол мезгилдеги өндүрүш, сатуу, кайтаруу жана киреше.
    """
    products = db.query(models.Product).all()
    product_map = {p.id: p for p in products}

    production_rows = db.query(models.ProductionRecord).filter(
        models.ProductionRecord.record_date >= date_from,
        models.ProductionRecord.record_date <= date_to,
    ).all()
    sale_rows = db.query(models.SaleRecord).filter(
        models.SaleRecord.record_date >= date_from,
        models.SaleRecord.record_date <= date_to,
    ).all()
    return_rows = db.query(models.ReturnRecord).filter(
        models.ReturnRecord.record_date >= date_from,
        models.ReturnRecord.record_date <= date_to,
    ).all()

    def period_key(d: date) -> str:
        if group_by == "day":
            return d.isoformat()
        if group_by == "week":
            iso = d.isocalendar()
            return f"{iso[0]}-W{iso[1]:02d}"
        if group_by == "month":
            return f"{d.year}-{d.month:02d}"
        return str(d.year)

    agg = {}  # (period, product_id) -> {produced, sold, returned, revenue}
    for r in production_rows:
        key = (period_key(r.record_date), r.product_id)
        agg.setdefault(key, {"produced": 0.0, "sold": 0.0, "returned": 0.0, "revenue": 0.0})
        agg[key]["produced"] += r.quantity
    for r in sale_rows:
        key = (period_key(r.record_date), r.product_id)
        agg.setdefault(key, {"produced": 0.0, "sold": 0.0, "returned": 0.0, "revenue": 0.0})
        agg[key]["sold"] += r.quantity
        agg[key]["revenue"] += r.quantity * (r.price or 0)
    for r in return_rows:
        key = (period_key(r.record_date), r.product_id)
        agg.setdefault(key, {"produced": 0.0, "sold": 0.0, "returned": 0.0, "revenue": 0.0})
        agg[key]["returned"] += r.quantity

    result: List[schemas.ReportRow] = []
    for (period, product_id), vals in sorted(agg.items()):
        product = product_map.get(product_id)
        result.append(schemas.ReportRow(
            period=period,
            product_id=product_id,
            product_name=product.name if product else "?",
            produced=vals["produced"],
            sold=vals["sold"],
            returned=vals["returned"],
            revenue=vals["revenue"],
        ))
    return result