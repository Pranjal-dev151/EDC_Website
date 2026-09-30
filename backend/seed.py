"""Create the initial admin user. Run once: `python seed.py` (from backend/)."""

from sqlalchemy import select

from app.auth import hash_password
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import AdminUser

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    email = settings.ADMIN_EMAIL.strip().lower()
    existing = db.execute(
        select(AdminUser).where(AdminUser.email == email)
    ).scalar_one_or_none()
    if existing is not None:
        print(f"Admin already exists: {email}")
    else:
        admin = AdminUser(
            email=email,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            name=settings.ADMIN_NAME,
        )
        db.add(admin)
        db.commit()
        print(f"Admin created: {email}")
finally:
    db.close()
