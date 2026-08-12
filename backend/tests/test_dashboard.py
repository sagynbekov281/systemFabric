from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models
from app.database import Base
from app.routers.reports import dashboard


def test_dashboard_handles_empty_sales_today():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    db = SessionLocal()
    try:
        user = models.User(
            username="u",
            full_name="Tester",
            role=models.UserRole.employee,
            hashed_password="x",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        result = dashboard(db, user)

        assert result.total_products == 0
        assert result.today_produced == 0.0
        assert result.today_sold == 0.0
        assert result.today_revenue == 0.0
        assert result.total_stock == 0.0
        assert result.low_stock_products == []
    finally:
        db.close()
