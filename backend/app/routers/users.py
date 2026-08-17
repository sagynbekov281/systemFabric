from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=schemas.UserListOut)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.require_admin),
):
    query = db.query(models.User)
    total = query.count()
    users = query.order_by(models.User.id).offset((page - 1) * page_size).limit(page_size).all()
    total_pages = max(1, (total + page_size - 1) // page_size)
    return schemas.UserListOut(items=users, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.post("/", response_model=schemas.UserOut)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    existing = db.query(models.User).filter(models.User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Мындай колдонуучунун аты мурунтан бар")

    if payload.role == models.UserRole.admin:
        existing_admin = db.query(models.User).filter(models.User.role == models.UserRole.admin).first()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Системада бир гана хозяин (администратор) болушу мүмкүн")

    user = models.User(
        username=payload.username,
        full_name=payload.full_name,
        role=payload.role,
        hashed_password=auth.get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), _=Depends(auth.require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Колдонуучу табылган жок")

    data = payload.model_dump(exclude_unset=True)

    if "username" in data and data["username"] and data["username"] != user.username:
        existing_username = db.query(models.User).filter(
            models.User.username == data["username"], models.User.id != user_id
        ).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Мындай колдонуучунун аты мурунтан бар")

    if data.get("role") == models.UserRole.admin and user.role != models.UserRole.admin:
        existing_admin = db.query(models.User).filter(
            models.User.role == models.UserRole.admin, models.User.id != user_id
        ).first()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Системада бир гана хозяин (администратор) болушу мүмкүн")

    if "password" in data and data["password"]:
        user.hashed_password = auth.get_password_hash(data.pop("password"))
    for key, value in data.items():
        if key != "password":
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current=Depends(auth.require_admin)):
    if user_id == current.id:
        raise HTTPException(status_code=400, detail="Өзүңүздү өчүрө албайсыз")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Колдонуучу табылган жок")

    has_records = (
        db.query(models.ProductionRecord).filter(models.ProductionRecord.created_by == user_id).first() is not None
        or db.query(models.SaleRecord).filter(models.SaleRecord.created_by == user_id).first() is not None
        or db.query(models.ReturnRecord).filter(models.ReturnRecord.created_by == user_id).first() is not None
    )
    if has_records:
        raise HTTPException(
            status_code=400,
            detail="Бул кызматкерде каттаган операциялары бар, андыктан аны өчүрүүгө болбойт. "
                   "Анын ордуна аны токтотуңуз (активсиз кылыңыз).",
        )

    db.delete(user)
    db.commit()
    return {"ok": True}