import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(tags=["events"])


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "event"


def unique_slug(db: Session, base: str, exclude_id: int | None = None) -> str:
    candidate = base
    n = 1
    while True:
        q = select(models.Event).where(models.Event.slug == candidate)
        if exclude_id is not None:
            q = q.where(models.Event.id != exclude_id)
        if db.execute(q).scalar_one_or_none() is None:
            return candidate
        n += 1
        candidate = f"{base}-{n}"


def event_to_out(row: models.Event) -> schemas.EventOut:
    src = row.image_url or ""
    alt = row.image_alt or row.title
    starts = row.starts_at
    if starts.tzinfo is None:
        starts = starts.replace(tzinfo=timezone.utc)
    return schemas.EventOut(
        id=f"event-{row.id}",
        slug=row.slug,
        title=row.title,
        summary=row.summary or "",
        startsAt=starts.isoformat(),
        location=row.location or "",
        category=row.category or "",
        image=schemas.ContentImage(
            src=src,
            alt=alt,
            width=800,
            height=600,
            srcSet=f"{src} 1x" if src else "",
            sizes="(min-width: 1024px) 33vw, 100vw",
        ),
        href="/#events",
    )


def apply_event_in(row: models.Event, payload: schemas.EventIn) -> None:
    row.title = payload.title
    row.summary = payload.summary or ""
    row.category = payload.category or ""
    row.location = payload.location or ""
    row.published = payload.published
    row.image_url = payload.image_url or ""
    row.image_alt = payload.image_alt or ""
    if payload.starts_at is not None:
        dt = payload.starts_at
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        row.starts_at = dt


@router.get("/api/events", response_model=list[schemas.EventOut])
def public_list_events(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(models.Event)
            .where(models.Event.published.is_(True))
            .order_by(models.Event.starts_at.asc())
        )
        .scalars()
        .all()
    )
    return [event_to_out(r) for r in rows]


@router.get("/api/admin/events", response_model=list[schemas.EventOut])
def admin_list_events(
    db: Session = Depends(get_db),
    _admin: models.AdminUser = Depends(get_current_admin),
):
    rows = (
        db.execute(select(models.Event).order_by(models.Event.starts_at.desc()))
        .scalars()
        .all()
    )
    return [event_to_out(r) for r in rows]


@router.post(
    "/api/admin/events",
    response_model=schemas.EventOut,
    status_code=status.HTTP_201_CREATED,
)
def admin_create_event(
    payload: schemas.EventIn,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    base = payload.slug.strip() or slugify(payload.title)
    row = models.Event(
        slug=unique_slug(db, base),
        starts_at=datetime.now(timezone.utc),
        created_by=admin.id,
    )
    apply_event_in(row, payload)
    db.add(row)
    db.commit()
    db.refresh(row)
    return event_to_out(row)


@router.put("/api/admin/events/{event_id}", response_model=schemas.EventOut)
def admin_update_event(
    event_id: int,
    payload: schemas.EventIn,
    db: Session = Depends(get_db),
    _admin: models.AdminUser = Depends(get_current_admin),
):
    row = db.get(models.Event, event_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Event not found")
    base = payload.slug.strip() or row.slug
    if base != row.slug:
        row.slug = unique_slug(db, base, exclude_id=row.id)
    apply_event_in(row, payload)
    db.commit()
    db.refresh(row)
    return event_to_out(row)


@router.delete("/api/admin/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    _admin: models.AdminUser = Depends(get_current_admin),
):
    row = db.get(models.Event, event_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(row)
    db.commit()
    return None
