# Getting Started

วิธีการติดตั้งและรันโปรเจกต์แบบทีละขั้นตอน (Step-by-step)

## Prerequisites (สิ่งที่ต้องมี)
- **Node.js** (เวอร์ชัน 18+ ขึ้นไป)
- **VS Code** หรือ Code Editor อื่นๆ

## ขั้นตอนการติดตั้ง
1. เปิด Terminal ในโฟลเดอร์โปรเจกต์ (`d:\ac`)
2. รันคำสั่งต่อไปนี้เพื่อติดตั้ง dependencies ทั้งหมด:
   ```bash
   npm install
   ```
3. เมื่อติดตั้งเสร็จ ให้รันเซิร์ฟเวอร์สำหรับพัฒนา:
   ```bash
   npm run dev
   ```
4. เบราว์เซอร์จะเปิดไปที่ `http://localhost:5173` อัตโนมัติ (หรือคลิกลิงก์ใน Terminal)

## คำสั่งอื่นๆ ที่มีประโยชน์
- `npm run build` - สำหรับสร้างไฟล์ Production ไปใช้งานจริง
- `npm run preview` - สำหรับทดสอบไฟล์ Production ที่ build เสร็จแล้ว
