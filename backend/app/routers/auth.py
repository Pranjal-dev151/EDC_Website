from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import create_access_token, get_current_admin, verify_password
from ..database import get_db

router = APIRouter(tags=["admin-auth"])


@router.post("/api/admin/login", response_model=schemas.Token)
def admin_login(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.execute(
        select(models.AdminUser).where(
            models.AdminUser.email == payload.email.strip().lower()
        )
    ).scalar_one_or_none()
    if admin is None or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return schemas.Token(access_token=create_access_token(admin.id))


@router.get("/api/admin/me", response_model=schemas.AdminMe)
def admin_me(admin: models.AdminUser = Depends(get_current_admin)):
    return schemas.AdminMe(id=admin.id, email=admin.email, name=admin.name)
