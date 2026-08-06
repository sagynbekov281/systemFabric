from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import auth, schemas
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Колдонуучунун аты же пароль туура эмес",
        )
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role.value})
    return schemas.Token(
        access_token=access_token,
        role=user.role,
        full_name=user.full_name,
        username=user.username,
    )


@router.get("/me", response_model=schemas.UserOut)
def me(current_user=Depends(auth.get_current_user)):
    return current_user
