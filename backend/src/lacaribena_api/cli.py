import uvicorn


def main() -> None:
    uvicorn.run(
        "lacaribena_api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
