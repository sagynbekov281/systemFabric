from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


def _stock_map(db: Session, product_ids: List[int]) -> dict:
    if not product_ids:
        return {}

    produced_rows = (
        db.query(models.ProductionRecord.product_id, func.coalesce(func.sum(models.ProductionRecord.quantity), 0.0))
        .filter(models.ProductionRecord.product_id.in_(product_ids))
        .group_by(models.ProductionRecord.product_id)
        .all()
    )
    sold_rows = (
        db.query(models.SaleRecord.product_id, func.coalesce(func.sum(models.SaleRecord.quantity), 0.0))
        .filter(models.SaleRecord.product_id.in_(product_ids))
        .group_by(models.SaleRecord.product_id)
        .all()
    )
    returned_rows = (
        db.query(models.ReturnRecord.product_id, func.coalesce(func.sum(models.ReturnRecord.quantity), 0.0))
        .filter(models.ReturnRecord.product_id.in_(product_ids))
        .group_by(models.ReturnRecord.product_id)
        .all()
    )
    produced_map = {pid: float(q) for pid, q in produced_rows}
    sold_map = {pid: float(q) for pid, q in sold_rows}
    returned_map = {pid: float(q) for pid, q in returned_rows}
    return {
        pid: produced_map.get(pid, 0.0) + returned_map.get(pid, 0.0) - sold_map.get(pid, 0.0)
        for pid in product_ids
    }


@router.get("/", response_model=schemas.ProductListOut)
def list_products(
    active_only: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    query = db.query(models.Product)
    if active_only:
        query = query.filter(models.Product.is_active == True)  # noqa: E712

    total = query.count()
    products = (
        query.order_by(models.Product.name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    stocks = _stock_map(db, [p.id for p in products])
    result = []
    for p in products:
        item = schemas.ProductWithStock.model_validate(p)
        item.stock = stocks.get(p.id, 0.0)
        result.append(item)

    total_pages = max(1, (total + page_size - 1) // page_size)
    return schemas.ProductListOut(
        items=result, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.post("/", response_model=schemas.ProductOut)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар табылган жок")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар табылган жок")

    # If the product has any history (production/sales/returns), a hard delete would
    # break those records and corrupt reports. Archive it instead of removing it.
    has_records = (
        db.query(models.ProductionRecord).filter(models.ProductionRecord.product_id == product_id).first() is not None
        or db.query(models.SaleRecord).filter(models.SaleRecord.product_id == product_id).first() is not None
        or db.query(models.ReturnRecord).filter(models.ReturnRecord.product_id == product_id).first() is not None
    )

    if has_records:
        product.is_active = False
        db.commit()
        return {"ok": True, "hard_deleted": False}

    db.delete(product)
    db.commit()
    return {"ok": True, "hard_deleted": True}