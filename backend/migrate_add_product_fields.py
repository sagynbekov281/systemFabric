"""
Одноразовая миграция: добавляет колонки price и minimum_stock в таблицу products.
Запустить ОДИН РАЗ из папки backend (venv активирован):

    python migrate_add_product_fields.py

Безопасно запускать повторно — сначала проверяет, есть ли уже колонки.
"""
import sqlite3

DB_PATH = "milk_factory.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(products)")
existing_columns = {row[1] for row in cur.fetchall()}

if "price" not in existing_columns:
    cur.execute("ALTER TABLE products ADD COLUMN price FLOAT")
    print("Добавлена колонка: price")
else:
    print("Колонка 'price' уже существует, пропускаю")

if "minimum_stock" not in existing_columns:
    cur.execute("ALTER TABLE products ADD COLUMN minimum_stock FLOAT DEFAULT 0")
    print("Добавлена колонка: minimum_stock")
else:
    print("Колонка 'minimum_stock' уже существует, пропускаю")

conn.commit()
conn.close()
print("Готово.")