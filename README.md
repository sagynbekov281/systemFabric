# 🥛 Сүт заводунун ички веб-системасы

Заводдо өндүрүлгөн жана сатылган сүт продукцияларын эсепке алуучу веб-система.
Кампадагы калдык автоматтык эсептелет, ролго жараша укуктар бөлүнөт (администратор / кызматкер).

## Технологиялар

- **Frontend:** React + TypeScript + Vite + TailwindCSS + Recharts
- **Backend:** Python + FastAPI + SQLAlchemy
- **Маалымат базасы:** SQLite (демейки, орнотуусуз иштейт) — каалаган учурда PostgreSQL'ге которсо болот

## Мүмкүнчүлүктөр (v1)

- 🔐 Логин/пароль аркылуу кирүү (JWT токен)
- 👥 Эки роль: **администратор** (баарын көрөт, башкарат) жана **кызматкер** (товарларды көрөт, өндүрүш/сатууну кошот)
- 🥛 Товарларды кошуу, өзгөртүү, активсиз кылуу
- 🏭 Өндүрүштү каттоо (кампага кирим)
- 🧾 Сатууну каттоо (кампадан чыгым, калдык жетишсиз болсо — үзгүлтүккө учурайт)
- 📦 Кампадагы калдыктын **автоматтык** эсеби (өндүрүш − сатуу)
- 📈 Dashboard: бүгүнкү көрсөткүчтөр, аз калган товарлар
- 📊 Отчеттор: күндүк / жумалык / айлык / жылдык, график менен
- 📱 Телефонго жана компьютерге ылайыкташкан интерфейс (responsive)

## Иштетүү

### 1. Backend (FastAPI)

```bash
cd backend
py -3.12-64 -m venv .venv
.venv\Scripts\activate      # Windows PowerShell
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt

# Баштапкы маалыматтарды түзүү (админ, тест кызматкер, мисал товарлар)
python seed.py

# Серверди иштетүү
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

Backend `http://localhost:8001` дареги боюнча иштейт.
Автоматтык документация: `http://localhost:8001/docs`

**Баштапкы колдонуучулар (seed.py түзөт):**
- `admin` / `admin123` — администратор
- `worker` / `worker123` — кызматкер

⚠️ Продакшинге чыгарардан мурун бул пароldорду жана `app/auth.py` ичиндеги `SECRET_KEY`'ди алмаштырыңыз (`.env` файлы же чөйрө өзгөрмөлөрү аркылуу).

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` дареги боюнча ачылат жана `/api` сурамдарын автоматтык түрдө `http://localhost:8001`'ге жиберет (`vite.config.ts` ичиндеги proxy аркылуу).

Продакшин үчүн курулуш:
```bash
npm run build
```
(`dist/` папкасы пайда болот — аны каалаган статикалык хостингге же nginx'ке жайгаштырсаңыз болот)

## PostgreSQL'ге которуу

`backend` папкасында `.env` файл түзүп, төмөнкүнү жазыңыз:
```
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/milk_factory
```
Жана `psycopg2-binary` пакетин кошуңуз: `pip install psycopg2-binary`

## Долбоордун түзүлүшү

```
milk-factory-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI негизги файл
│   │   ├── models.py        # Маалымат базасынын моделдери
│   │   ├── schemas.py       # Pydantic схемалары
│   │   ├── auth.py          # JWT аутентификация
│   │   ├── database.py      # DB туташуу
│   │   └── routers/         # API endpoint'тер (auth, products, production, sales, reports, users)
│   ├── seed.py               # Баштапкы маалыматтар
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/            # Login, Dashboard, Products, Production, Sales, Reports, Users
    │   ├── components/       # Layout, ProtectedRoute
    │   ├── context/          # AuthContext
    │   ├── api.ts             # Axios instance
    │   └── types.ts
    └── package.json
```

## Кийинки кадамдар (сиз айткандай, ТЗ толук эмес)

Кийинки версияда кошула турган нерселер (толук ТЗ келгенде):
- Чийки заттар (сүт, ачыткы ж.б.) эсебин кошуу
- Кампа/филиалдар боюнча бөлүү
- Экспорт (Excel/PDF отчеттор)
- Push/SMS эскертүүлөр (калдык азайганда)
- Кызматкерлердин иш-аракет тарыхы (audit log)

## Deploy на GitHub + Vercel

### 1. GitHub

1. Репозиторий түзүңүз жана файлдарды кошуңуз:
   - `backend/requirements.txt`
   - `frontend/package.json`
   - `backend/.env.example`
   - `frontend/.env.example`
   - `vercel.json`

2. Git командасы:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```

### 2. Frontend на Vercel

1. Vercel'ге кириңиз жана "New Project" баскычын басыңыз.
2. GitHub репозиторийиңизди тандаңыз.
3. Project Settings:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL` = `https://<YOUR_BACKEND_URL>/api`

### 3. Backend на Railway / Render / VPS

Бул долбоорду Vercel'ге бекенд катары коюу жакшы эмес, анткени FastAPI + SQLite Serverless чөйрөсүндө иштегенге ылайык эмес.

#### Railway / Render (же окшош хостинг)

1. Жаңы сервис түзүңүз.
2. Source катары GitHub тандаңыз.
3. Root Directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Environment Variables:
   - `SECRET_KEY` = `your-secret-key`
   - `DATABASE_URL` = `sqlite:///./milk_factory.db` (же PostgreSQL URL)

### 4. Vite API URL

Фронтендте азыр `frontend/src/api.ts` төмөндөгүдөй иштейт:

```ts
const baseURL = import.meta.env.VITE_API_URL || "/api";
```

Ошондуктан, продакшнде `VITE_API_URL` туура көрүнүшү керек.

---
Бул долбоорду GitHub'ге жүктөп, фронтендди Vercel'ге, бекендди Railways/Render же башка серверге коюсаңыз, система иштейт.
