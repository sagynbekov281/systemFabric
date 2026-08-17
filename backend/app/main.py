from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth, users, products, production, sales, reports
from .routers import returns

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Сүт заводунун ички веб-системасы",
    description="Өндүрүш, сатуу жана кампа эсебин жүргүзүү системасы",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # продакшинде домениңизди көрсөтүңүз
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(returns.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(production.router)
app.include_router(sales.router)
app.include_router(reports.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
