from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContentImage(BaseModel):
    src: str = ""
    alt: str = ""
    width: int = 800
    height: int = 520
    srcSet: str = ""
    sizes: str = "(min-width: 1024px) 33vw, 100vw"


class BlogOut(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str = ""
    author: str = ""
    publishedAt: str
    readingMinutes: int = 5
    category: str = ""
    featured: bool = False
    image: ContentImage
    href: str = "/blogs"


class EventOut(BaseModel):
    id: str
    slug: str
    title: str
    summary: str = ""
    startsAt: str
    location: str = ""
    category: str = ""
    image: ContentImage
    href: str = "/#events"


class BlogIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=1)
    slug: str = ""
    excerpt: str = ""
    author: str = ""
    category: str = ""
    published_at: datetime | None = None
    reading_minutes: int = 5
    featured: bool = False
    image_url: str = ""
    image_alt: str = ""
    published: bool = True


class EventIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=1)
    slug: str = ""
    summary: str = ""
    category: str = ""
    location: str = ""
    starts_at: datetime | None = None
    image_url: str = ""
    image_alt: str = ""
    published: bool = True


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminMe(BaseModel):
    id: int
    email: str
    name: str
