"""
Сервер (Render) UTC убакытта иштейт, ал эми фабрика Кыргызстанда (UTC+6).
Ошондуктан "бүгүн" дегенди server'дин UTC датасы менен эмес, so жергиликтүү
Бишкек датасы менен эсептөө керек — антпесе түн ортосунда (00:00–06:00) жазылган
өндүрүш/сатуу/кайтаруу жазуулары "кечээ" катары эсептелип, отчетто жоголуп калат.
"""
from datetime import date, datetime, timezone, timedelta

BISHKEK_TZ = timezone(timedelta(hours=6))


def local_today() -> date:
    return datetime.now(BISHKEK_TZ).date()