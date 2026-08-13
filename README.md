# Apparel Creations - ระบบบันทึกข้อมูลการผลิตเสื้อผ้า

ระบบบันทึกข้อมูลการผลิตเสื้อผ้าที่พัฒนาด้วย React + Express พร้อมรองรับการ deploy บน Vercel และใช้ Supabase เป็นฐานข้อมูล

## 🚀 เทคโนโลยีที่ใช้

- **Frontend**: React 19, Vite, Custom CSS (ไม่ได้ใช้ Tailwind หรือ UI framework ใด)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Supabase) / SQLite (fallback)
- **Deployment**: Vercel

## 📋 ข้อกำหนดระบบ (Requirements)

- Node.js 24.x
- npm หรือ yarn

## 🔧 การติดตั้ง (Installation)

1. Clone repository
```bash
git clone [your-repo-url]
cd domo_ac
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตั้งค่า Environment Variables
```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env` และ `backend/.env` ด้วยค่าจริงของคุณ

## 🗄️ การตั้งค่า Supabase Database

### 1. สร้าง Project ใหม่บน Supabase
- เข้าไปที่ [supabase.com](https://supabase.com)
- สร้าง project ใหม่
- รอให้ database พร้อมใช้งาน

### 2. รับ Connection String
- ไปที่ Settings → Database
- คัดลอก Connection string ในส่วน Connection pooling (Transaction mode)
- รูปแบบ: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### 3. รับ API Keys
- ไปที่ Settings → API
- คัดลอก Project URL และ anon public key

### 4. สร้าง Tables (อัตโนมัติ)
ระบบจะสร้าง tables โดยอัตโนมัติเมื่อเริ่มใช้งานครั้งแรก:
- `records` - เก็บข้อมูลรายการผลิต
- `master` - เก็บข้อมูลหลัก (master data)

### ⚠️ ข้อควรระวังเรื่อง Database

**SQLite เฉพาะ Local Development เท่านั้น!**
- SQLite ใช้สำหรับการพัฒนาในเครื่อง (Local Development) เท่านั้น
- **ห้ามใช้ SQLite บน Vercel Serverless** เด็ดขาด เพราะ:
  - Vercel Serverless เป็นแบบ Stateless และ Read-only
  - ข้อมูล SQLite จะสูญหายทันทีเมื่อ Serverless Instance ถูกปิด
  - ไม่มีการ persist ข้อมูลระหว่าง requests

**สำหรับ Production (Vercel):**
- ต้องใช้ Supabase (PostgreSQL) เท่านั้น
- ตั้งค่า `DATABASE_TYPE=postgresql`
- ตั้งค่า `DATABASE_URL` ให้ถูกต้อง
- ระบบจะตรวจสอบและป้องกันการใช้ SQLite บน Vercel อัตโนมัติ

## 🗄️ โครงสร้าง Database (Database Schema)

### Table: records
เก็บข้อมูลรายการผลิตเสื้อผ้าทั้งหมด

| Column | Type (PostgreSQL) | Type (SQLite) | Description |
|--------|-------------------|---------------|-------------|
| `id` | BIGINT PRIMARY KEY | INTEGER PRIMARY KEY | ID ของรายการ (ใช้ timestamp) |
| `data` | JSONB NOT NULL | TEXT NOT NULL | ข้อมูลรายการในรูปแบบ JSON |
| `created_at` | TIMESTAMP DEFAULT NOW() | TEXT DEFAULT (datetime('now')) | เวลาที่สร้างรายการ |

**ตัวอย่างโครงสร้างข้อมูลใน `data`:**
```json
{
  "id": 1720920000000,
  "job_no": "14072024L001",
  "date": "2024-07-14",
  "shipDate": "2024-07-20",
  "merText": "เหลง",
  "brand": "LFC",
  "customer": "ลูกค้า A",
  "model": "Action Tee",
  "clothingType": "โปโล",
  "qty": 300,
  "size": "S-XL",
  "colors": 5,
  "imgs": ["data:image/jpeg;base64,..."],
  "steps": [
    { "part": "ตัวหน้า", "step": "เย็บติดปก", "machine": "จักรเข็มคู่", "time": 12.5, "workers": 1, "note": "" }
  ],
  "estWage": 15000,
  "actual": { "start": "", "end": "", "wage": "", "total": "" },
  "chk": { "pak": false, "print": false, "tag": false }
}
```
> ฟิลด์อื่นๆ (เช่น `detail`, `warning`, `solution`, `noteProd`, `noteSales`) ถูกเก็บอยู่ใน `data` เช่นกันตามที่กรอกในฟอร์ม — ดูโครงสร้างเต็มได้ที่ `createEmptyFormState()` ใน `frontend/src/App.jsx`

### Table: master
เก็บข้อมูลหลัก (master data) สำหรับการตั้งค่าระบบ

| Column | Type (PostgreSQL) | Type (SQLite) | Description |
|--------|-------------------|---------------|-------------|
| `id` | INTEGER PRIMARY CHECK (id = 1) | INTEGER PRIMARY CHECK (id = 1) | ID เสมอเป็น 1 (single row) |
| `data` | JSONB NOT NULL | TEXT NOT NULL | ข้อมูลหลักในรูปแบบ JSON |

**ตัวอย่างโครงสร้างข้อมูลใน `data`:**
```json
{
  "mers": ["เหลง", "จูน", "ยุ้ย"],
  "brands": ["LFC", "Fasonaf"],
  "clothingTypes": ["โปโล", "เสื้อยืด"],
  "parts": ["ตัวหน้า", "ตัวหลัง", "ปก", "แขน"],
  "steps": ["เย็บต่อไหล่", "เย็บติดปก", "เย็บติดแขน"],
  "machines": ["จักรลา", "จักรเข็มเดี่ยว", "จักรเข็มคู่"]
}
```
> แต่ละ key คือรายการ (array of strings) ที่ใช้เป็นตัวเลือกในฟอร์ม จัดการได้จากหน้า "⚙️ ข้อมูลหลัก" ในแอป

### ความแตกต่างระหว่าง PostgreSQL และ SQLite

**PostgreSQL (Supabase):**
- ใช้ `JSONB` สำหรับเก็บข้อมูล JSON ที่รองรับการ query ขั้นสูง
- ใช้ `BIGINT` สำหรับ id
- ใช้ `TIMESTAMP` สำหรับเวลา
- รองรับ transaction และ concurrent access ได้ดีกว่า

**SQLite (Fallback):**
- ใช้ `TEXT` สำหรับเก็บข้อมูล JSON
- ใช้ `INTEGER` สำหรับ id
- ใช้ `TEXT` สำหรับเวลา
- เหมาะสำหรับการพัฒนาและทดสอบแบบ local

## 📊 ER Diagram (Entity-Relationship Diagram)

```mermaid
erDiagram
    records {
        BIGINT id PK
        JSONB data "ข้อมูลรายการผลิตแต่ละใบ"
        TIMESTAMP created_at
    }

    master {
        INTEGER id PK "เสมอเป็น 1 (single row)"
        JSONB data "ข้อมูลหลัก (mers, brands, parts ฯลฯ)"
    }
```
> `records` และ `master` เป็นตารางอิสระต่อกัน **ไม่มี foreign key เชื่อมกัน** — `master` เก็บแค่รายการตัวเลือกกลาง (dropdown options) ที่ฟอร์มดึงไปใช้ตอนกรอกข้อมูลของแต่ละ `records` เท่านั้น

## 📝 Environment Variables

### ตัวแปรที่ต้องตั้งค่าใน Vercel

**Backend Variables:**
- `DATABASE_TYPE` = `postgresql`
- `DATABASE_URL` = Supabase connection string
- `NODE_ENV` = `production`
- `PORT` = `3001`

**Frontend Variables:**
- `VITE_SUPABASE_URL` = Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = Supabase anon key

> ⚠️ ตัวแปรสองตัวนี้**ยังไม่ถูกใช้จริงในโค้ด frontend ปัจจุบัน** (ไม่มีการเรียก Supabase client ฝั่ง frontend เลย — ฝั่ง frontend คุยกับข้อมูลผ่าน `/api/*` ของ backend เท่านั้น) เก็บไว้เผื่อใช้งานในอนาคต (เช่น Supabase Storage) ข้ามได้ถ้ายังไม่ได้ใช้

**Frontend Variable (optional):**
- `VITE_API_URL` = base URL ของ backend API (ค่า default คือ `/api` ใช้ได้เลยถ้า deploy รวมกันแบบ monorepo ตามปกติของโปรเจกต์นี้ ตั้งเฉพาะถ้าแยก deploy frontend/backend คนละที่)

### สำหรับการพัฒนา (Development)

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:
```env
PORT=3001
NODE_ENV=development
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/`:
```env
VITE_SUPABASE_URL=https://[PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🏃 การรันโปรเจกต์ (Running the Project)

### Development Mode
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production Build
```bash
npm run build
npm start
```

## 🌐 การ Deploy บน Vercel

### ขั้นตอนการ Deploy

1. **Push code ไปยัง GitHub**
   - ตรวจสอบให้แน่ใจว่าโค้ดอยู่บน GitHub repository

2. **เชื่อมต่อกับ Vercel**
   - ไปที่ [vercel.com](https://vercel.com)
   - คลิก "Add New Project"
   - เลือก GitHub repository ของคุณ

3. **ตั้งค่า Environment Variables**
   ไปที่ Settings → Environment Variables และเพิ่มตัวแปรต่อไปนี้:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `DATABASE_TYPE` | `postgresql` | Production, Preview, Development |
   | `DATABASE_URL` | Supabase connection string | Production, Preview, Development |
   | `VITE_SUPABASE_URL` | Supabase project URL | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |
   | `PORT` | `3001` | All |

4. **Deploy**
   - คลิก "Deploy"
   - รอให้ build เสร็จสิ้น
   - Vercel จะให้ URL สำหรับเข้าใช้งาน

### การตั้งค่า Vercel (vercel.json)

โปรเจกต์นี้มีการตั้งค่า Vercel ไว้ในไฟล์ `vercel.json`:
- Build command: `npm run build`
- Output directory: `frontend/dist`
- API routes: ใช้ `api/index.js` เป็น serverless function
- Rewrites: ส่งคำขอ API ไปยัง serverless function

## 📂 โครงสร้างโปรเจกต์

```
domo_ac/
├── api/                          # Vercel serverless functions
│   └── index.js                  # API handler สำหรับ Vercel
├── backend/                      # Express backend
│   ├── db.js                     # Database layer (Supabase + SQLite)
│   ├── index.js                  # Express server
│   └── .env                      # Backend environment variables
├── frontend/                     # React frontend
│   ├── dist/                     # Build output (generated)
│   │   ├── assets/               # Static assets
│   │   ├── index.html            # Entry HTML
│   │   └── sw.js                 # Service Worker
│   ├── public/                   # Public static files
│   │   ├── favicon.svg           # Favicon
│   │   ├── icon-192.svg          # PWA icon (192x192)
│   │   ├── icon-512.svg          # PWA icon (512x512)
│   │   └── icons.svg             # Icons
│   ├── src/                      # Source code
│   │   ├── api/                  # API client
│   │   │   └── client.js         # fetch()-based client (ไม่ได้ใช้ Axios)
│   │   ├── assets/               # Assets
│   │   │   ├── hero.png          # Hero image
│   │   │   ├── react.svg         # React logo
│   │   │   └── vite.svg          # Vite logo
│   │   ├── components/           # React components
│   │   │   ├── DownloadPage.jsx     # Download/Export page
│   │   │   ├── FormPage.jsx         # Form input page
│   │   │   ├── Header.jsx           # Header component
│   │   │   ├── MasterPage.jsx       # Master data management
│   │   │   ├── PreviewModal.jsx     # Preview modal ก่อนบันทึก
│   │   │   ├── SearchableSelect.jsx # Combobox พิมพ์ค้นหาได้ (ใช้แทน <select> ทั้งระบบ)
│   │   │   ├── StatsPage.jsx        # Statistics page
│   │   │   └── TabBar.jsx           # Tab navigation
│   │   ├── utils/                # Utility functions
│   │   │   ├── imageUtils.js     # บีบอัดรูปภาพก่อนอัปโหลด
│   │   │   └── pdfGenerator.js   # PDF generation logic
│   │   ├── App.css               # App styles
│   │   ├── App.jsx               # Main App component
│   │   ├── index.css             # Global styles
│   │   └── main.jsx              # Entry point
│   ├── index.html                # HTML template
│   └── .env                      # Frontend environment variables
├── database/                     # Local database (SQLite fallback)
│   └── app.db                    # SQLite database file
├── node_modules/                 # Dependencies (generated)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── .git/                         # Git repository (generated)
├── package-lock.json             # Dependency lock file
├── package.json                  # Project dependencies and scripts
├── README.md                     # Project documentation
├── vercel.json                   # Vercel deployment configuration
└── vite.config.js                # Vite build configuration
```

## 🔌 API Endpoints

### Records
- `GET /api/records` - ดึงข้อมูลทั้งหมด (ไม่รวมรูปภาพ `imgs` เพื่อลดขนาด payload — มีแค่ `hasImages: true/false` แทน)
- `GET /api/records/:id` - ดึงข้อมูลเต็มของใบเดียว (รวมรูปภาพ) ใช้ตอนเปิดแก้ไข/สร้าง PDF
- `POST /api/records` - เพิ่มข้อมูลใหม่ (ระบบสร้าง `job_no` ให้อัตโนมัติ)
- `PUT /api/records/:id` - แก้ไขข้อมูล
- `DELETE /api/records/:id` - ลบข้อมูล
- `POST /api/records/bulk` - เพิ่มข้อมูลหลายรายการ

### Master Data
- `GET /api/master` - ดึงข้อมูลหลัก
- `PUT /api/master` - บันทึกข้อมูลหลัก

### Other
- `GET /api/health` - ตรวจสอบสถานะระบบ
- `DELETE /api/clear` - ลบข้อมูลทั้งหมด

## 🐛 การแก้ปัญหา (Troubleshooting)

### Database connection failed
- ตรวจสอบว่า `DATABASE_TYPE=postgresql` ถูกตั้งค่า
- ตรวจสอบ `DATABASE_URL` ว่าถูกต้อง
- ตรวจสอบว่า Supabase project พร้อมใช้งาน

### API ไม่ทำงานบน Vercel
- ตรวจสอบ environment variables ทั้งหมดใน Vercel dashboard
- ตรวจสอบ logs ใน Vercel
- ตรวจสอบว่า `api/index.js` มีอยู่และถูกต้อง

### Frontend ไม่โหลด
- ตรวจสอบว่า build สำเร็จ
- ตรวจสอบ `vercel.json` ว่า output directory ถูกต้อง

## 📄 License

MIT

## 👥 ผู้พัฒนา

ชยาพันธ์ วิโรจน์ชัยยันต์
