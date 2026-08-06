from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/sales", tags=["sales"])


def _to_out(r: models.SaleRecord) -> schemas.SaleOut:
    return schemas.SaleOut(
        id=r.id,
        product_id=r.product_id,
        product_name=r.product.name if r.product else None,
        quantity=r.quantity,
        price=r.price,
        customer=r.customer,
        record_date=r.record_date,
        note=r.note,
        created_by=r.created_by,
        created_by_name=r.created_by_user.full_name if r.created_by_user else None,
        created_at=r.created_at,
    )


@router.get("/", response_model=List[schemas.SaleOut])
def list_sales(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    query = db.query(models.SaleRecord)
    if date_from:
        query = query.filter(models.SaleRecord.record_date >= date_from)
    if date_to:
        query = query.filter(models.SaleRecord.record_date <= date_to)
    if product_id:
        query = query.filter(models.SaleRecord.product_id == product_id)
    records = query.order_by(models.SaleRecord.record_date.desc(), models.SaleRecord.id.desc()).all()
    return [_to_out(r) for r in records]


@router.post("/", response_model=schemas.SaleOut)
def create_sale(
    payload: schemas.SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар табылган жок")

    # Учурдагы калдыкты текшерүү
    from sqlalchemy import func
    produced = db.query(func.coalesce(func.sum(models.ProductionRecord.quantity), 0.0)).filter(
        models.ProductionRecord.product_id == payload.product_id
    ).scalar()
    sold = db.query(func.coalesce(func.sum(models.SaleRecord.quantity), 0.0)).filter(
        models.SaleRecord.product_id == payload.product_id
    ).scalar()
    current_stock = float(produced) - float(sold)
    if payload.quantity > current_stock:
        raise HTTPException(
            status_code=400,
            detail=f"Жетишсиз калдык! Кампада {current_stock} {product.unit} гана бар",
        )

    record = models.SaleRecord(
        product_id=payload.product_id,
        quantity=payload.quantity,
        price=payload.price,
        customer=payload.customer,
        record_date=payload.record_date or date.today(),
        note=payload.note,
        created_by=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_out(record)


@router.delete("/{record_id}")
def delete_sale(record_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    record = db.query(models.SaleRecord).filter(models.SaleRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Жазуу табылган жок")
    if current_user.role != models.UserRole.admin and record.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Бул жазууну өчүрүүгө укугуңуз жок")
    db.delete(record)
    db.commit()
    return {"ok": True}
