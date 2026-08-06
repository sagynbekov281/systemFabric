from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


def _compute_stock(db: Session, product_id: int) -> float:
    produced = db.query(func.coalesce(func.sum(models.ProductionRecord.quantity), 0.0)).filter(
        models.ProductionRecord.product_id == product_id
    ).scalar()
    sold = db.query(func.coalesce(func.sum(models.SaleRecord.quantity), 0.0)).filter(
        models.SaleRecord.product_id == product_id
    ).scalar()
    return float(produced) - float(sold)


@router.get("/", response_model=List[schemas.ProductWithStock])
def list_products(
    active_only: bool = False,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    query = db.query(models.Product)
    if active_only:
        query = query.filter(models.Product.is_active == True)  # noqa: E712
    products = query.order_by(models.Product.name).all()
    result = []
    for p in products:
        item = schemas.ProductWithStock.model_validate(p)
        item.stock = _compute_stock(db, p.id)
        result.append(item)
    return result


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
    product.is_active = False
    db.commit()
    return {"ok": True}
