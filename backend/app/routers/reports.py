from datetime import date, datetime
from typing import List, Optional
from datetime import timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, auth
from ..database import get_db
from ..timezone_utils import local_today

router = APIRouter(prefix="/api/reports", tags=["reports"])

BISHKEK_TZ = timezone(timedelta(hours=6))


def _local_time_str(dt_utc, record_date, today):
    if dt_utc is None or record_date != today:
        return ""
    aware = dt_utc.replace(tzinfo=timezone.utc).astimezone(BISHKEK_TZ)
    return aware.strftime("%H:%M")


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

    # ---------- Бүгүнкү өндүрүш, бирдиги боюнча бөлүнүп (литр/кг/даана кошулбайт) ----------
    produced_today_rows = (
        db.query(models.Product.unit, func.coalesce(func.sum(models.ProductionRecord.quantity), 0.0))
        .join(models.Product, models.Product.id == models.ProductionRecord.product_id)
        .filter(models.ProductionRecord.record_date == today)
        .group_by(models.Product.unit)
        .all()
    )
    today_produced_by_unit = [
        schemas.UnitQuantity(unit=unit, quantity=float(qty)) for unit, qty in produced_today_rows
    ]

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

    # Минималдуу деңгээлден ылдый/барабар БАРДЫК товарлар — 5кө чектелген эмес,
    # ошондуктан "баарын көрсөтүү" толук тизмени көрсөтө алат.
    low_stock = sorted(
        (p for p in stock_list if p.stock <= (p.minimum_stock or 0)),
        key=lambda x: x.stock,
    )

    # ---------- Акыркы операциялар (өндүрүш + сатуу, жаңысынан баштап) ----------
    recent_limit = 50
    recent_production = (
        db.query(models.ProductionRecord)
        .order_by(models.ProductionRecord.created_at.desc())
        .limit(recent_limit)
        .all()
    )
    recent_sales = (
        db.query(models.SaleRecord)
        .order_by(models.SaleRecord.created_at.desc())
        .limit(recent_limit)
        .all()
    )

    product_by_id = {p.id: p for p in db.query(models.Product).all()}
    user_by_id = {u.id: u for u in db.query(models.User).all()}

    combined = []
    for r in recent_production:
        product = product_by_id.get(r.product_id)
        user = user_by_id.get(r.created_by)
        combined.append((r.created_at, schemas.RecentOperation(
            time=_local_time_str(r.created_at, r.record_date, today),
            product_name=product.name if product else "?",
            quantity=r.quantity,
            unit=product.unit if product else "",
            type="production",
            user_name=user.full_name if user else "?",
        )))
    for r in recent_sales:
        product = product_by_id.get(r.product_id)
        user = user_by_id.get(r.created_by)
        combined.append((r.created_at, schemas.RecentOperation(
            time=_local_time_str(r.created_at, r.record_date, today),
            product_name=product.name if product else "?",
            quantity=r.quantity,
            unit=product.unit if product else "",
            type="sale",
            user_name=user.full_name if user else "?",
        )))

    combined.sort(key=lambda x: x[0], reverse=True)
    recent_operations = [op for _, op in combined[:recent_limit]]

    return schemas.DashboardSummary(
        total_products=total_products,
        today_produced=float(today_produced),
        today_produced_by_unit=today_produced_by_unit,
        today_sold=float(today_sold),
        today_revenue=float(today_revenue),
        total_stock=total_stock,
        low_stock_products=low_stock,
        recent_operations=recent_operations,
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