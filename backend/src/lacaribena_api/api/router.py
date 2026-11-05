from fastapi import APIRouter

from lacaribena_api.api.routes import (
    admin,
    analytics,
    auth,
    categories,
    health,
    orders,
    products,
    settings,
    tasks,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(tasks.router)
api_router.include_router(settings.router)
api_router.include_router(analytics.router)
api_router.include_router(admin.router)
