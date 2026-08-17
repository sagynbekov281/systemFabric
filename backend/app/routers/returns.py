from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..timezone_utils import local_today

router = APIRouter(prefix="/api/returns", tags=["returns"])


def _to_out(r: models.ReturnRecord) -> schemas.ReturnOut:
    return schemas.ReturnOut(
        id=r.id,
        product_id=r.product_id,
        product_name=r.product.name if r.product else None,
        quantity=r.quantity,
        customer=r.customer,
        record_date=r.record_date,
        note=r.note,
        created_by=r.created_by,
        created_by_name=r.created_by_user.full_name if r.created_by_user else None,
        created_at=r.created_at,
    )


@router.get("/", response_model=schemas.ReturnListOut)
def list_returns(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    product_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    query = db.query(models.ReturnRecord)
    if date_from:
        query = query.filter(models.ReturnRecord.record_date >= date_from)
    if date_to:
        query = query.filter(models.ReturnRecord.record_date <= date_to)
    if product_id:
        query = query.filter(models.ReturnRecord.product_id == product_id)

    total = query.count()
    records = (
        query.order_by(models.ReturnRecord.record_date.desc(), models.ReturnRecord.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return schemas.ReturnListOut(
        items=[_to_out(r) for r in records], total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.post("/", response_model=schemas.ReturnOut)
def create_return(
    payload: schemas.ReturnCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар табылган жок")
    record = models.ReturnRecord(
        product_id=payload.product_id,
        quantity=payload.quantity,
        customer=payload.customer,
        record_date=payload.record_date or local_today(),
        note=payload.note,
        created_by=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_out(record)


@router.delete("/{record_id}")
def delete_return(record_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    record = db.query(models.ReturnRecord).filter(models.ReturnRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Жазуу табылган жок")
    if current_user.role != models.UserRole.admin and record.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Бул жазууну өчүрүүгө укугуңуз жок")
    db.delete(record)
    db.commit()
    return {"ok": True}