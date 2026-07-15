# Apparel Creations - ระบบบันทึกข้อมูลการผลิตเสื้อผ้า

ระบบบันทึกข้อมูลการผลิตเสื้อผ้าที่พัฒนาด้วย React + Express พร้อมรองรับการ deploy บน Vercel และใช้ Supabase เป็นฐานข้อมูล

## 🚀 เทคโนโลยีที่ใช้

- **Frontend**: React 19, Vite, TailwindCSS
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

## � โครงสร้าง Database (Database Schema)

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
  "date": "2024-07-14",
  "orderNo": "ORD-001",
  "customer": "Customer Name",
  "style": "Style-A",
  "quantity": 100,
  "status": "completed",
  "otherFields": "..."
}
```

### Table: master
เก็บข้อมูลหลัก (master data) สำหรับการตั้งค่าระบบ

| Column | Type (PostgreSQL) | Type (SQLite) | Description |
|--------|-------------------|---------------|-------------|
| `id` | INTEGER PRIMARY CHECK (id = 1) | INTEGER PRIMARY CHECK (id = 1) | ID เสมอเป็น 1 (single row) |
| `data` | JSONB NOT NULL | TEXT NOT NULL | ข้อมูลหลักในรูปแบบ JSON |

**ตัวอย่างโครงสร้างข้อมูลใน `data`:**
```json
{
  "customers": ["Customer A", "Customer B", "Customer C"],
  "styles": ["Style-A", "Style-B", "Style-C"],
  "statuses": ["pending", "in-progress", "completed"],
  "settings": {
    "defaultQuantity": 100,
    "currency": "THB"
  }
}
```

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
        JSONB data "ข้อมูลรายการผลิต"
        TIMESTAMP created_at
    }
    
    master {
        INTEGER id PK "เสมอเป็น 1"
        JSONB data "ข้อมูลหลัก (master data)"
    }
    
    master ||--|| records : "อ้างอิง"
    
    notes {
        type: "records เก็บข้อมูลรายการผลิตแต่ละรายการ"
        type: "master เก็บข้อมูลหลักแบบ single row"
        type: "ทั้งสองตารางใช้ JSON/JSONB เก็บข้อมูลที่ยืดหยุ่น"
    }
```

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
│   │   │   └── client.js         # Axios client configuration
│   │   ├── assets/               # Assets
│   │   │   ├── hero.png          # Hero image
│   │   │   ├── react.svg         # React logo
│   │   │   └── vite.svg          # Vite logo
│   │   ├── components/           # React components
│   │   │   ├── DownloadPage.jsx  # Download/Export page
│   │   │   ├── FormPage.jsx      # Form input page
│   │   │   ├── Header.jsx        # Header component
│   │   │   ├── MasterPage.jsx    # Master data management
│   │   │   ├── PreviewModal.jsx  # PDF preview modal
│   │   │   ├── StatsPage.jsx     # Statistics page
│   │   │   └── TabBar.jsx        # Tab navigation
│   │   ├── utils/                # Utility functions
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
- `GET /api/records` - ดึงข้อมูลทั้งหมด
- `POST /api/records` - เพิ่มข้อมูลใหม่
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
