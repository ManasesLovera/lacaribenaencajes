from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from lacaribena_api.api.router import api_router
from lacaribena_api.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "API de inventario, ventas y márgenes de La Caribeña Encajes. "
        "Autenticación con JWT; datos persistidos en SQLite durante el desarrollo."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router, prefix="/api")


@app.get("/", tags=["root"])
def root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/health",
        "auth": "/api/auth/login",
    }
