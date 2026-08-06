"""
Баштапкы маалыматтарды түзүү (админ колдонуучу ж.б.)
Иштетүү: python seed.py
"""
from app.database import SessionLocal, engine, Base
from app import models, auth

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing_admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not existing_admin:
        admin = models.User(
            username="admin",
            full_name="Башкы администратор",
            role=models.UserRole.admin,
            hashed_password=auth.get_password_hash("admin123"),
        )
        db.add(admin)
        print("Админ түзүлдү: логин=admin, пароль=admin123")
    else:
        print("Админ мурунтан бар.")

    existing_worker = db.query(models.User).filter(models.User.username == "worker").first()
    if not existing_worker:
        worker = models.User(
            username="worker",
            full_name="Сынак кызматкер",
            role=models.UserRole.employee,
            hashed_password=auth.get_password_hash("worker123"),
        )
        db.add(worker)
        print("Кызматкер түзүлдү: логин=worker, пароль=worker123")

    db.commit()

    # Мисал продуктылар
    if db.query(models.Product).count() == 0:
        sample_products = [
            models.Product(name="Пастеризацияланган сүт 1л", unit="литр"),
            models.Product(name="Кефир 1л", unit="литр"),
            models.Product(name="Айран", unit="литр"),
            models.Product(name="Сары май", unit="кг"),
            models.Product(name="Творог", unit="кг"),
        ]
        db.add_all(sample_products)
        db.commit()
        print("Мисал продуктылар кошулду.")

finally:
    db.close()
