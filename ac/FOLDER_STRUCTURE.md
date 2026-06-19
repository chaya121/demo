# Folder Structure Guide

โครงสร้างโฟลเดอร์ในโปรเจกต์นี้ถูกออกแบบมาแบบ Component-based เพื่อให้ง่ายต่อการค้นหาและการนำกลับมาใช้ใหม่

```text
d:\ac\
├── .vscode/               # การตั้งค่าต่างๆ สำหรับ VS Code
├── src/
│   ├── components/        # UI Components ที่ถูกใช้งานซ้ำๆ
│   │   ├── Header.jsx       - แถบโลโก้ด้านบน
│   │   ├── TabBar.jsx       - เมนูสลับหน้า
│   │   ├── Toast.jsx        - แจ้งเตือน Pop-up มุมล่าง
│   │   ├── MerChips.jsx     - ปุ่มเลือกสี Mer
│   │   ├── StepBuilder.jsx  - ระบบเพิ่ม/ลบ สเตปการเย็บ
│   │   └── PreviewModal.jsx - หน้าต่างป๊อปอัปตรวจสอบใบดี
│   │
│   ├── pages/             # หน้าจอหลักของแอปพลิเคชัน
│   │   ├── FormPage.jsx     - หน้ากรอกใบดี (ฟอร์ม)
│   │   ├── DownloadPage.jsx - หน้าดาวน์โหลด/ลบ ประวัติ
│   │   └── StatsPage.jsx    - หน้าสรุปสถิติ
│   │
│   ├── hooks/             # Custom React Hooks
│   │   └── useLocalStorage.js - จัดการ Local Storage อัตโนมัติ
│   │
│   ├── utils/             # ฟังก์ชันช่วยเหลือ (Helper)
│   │   └── storage.js       - CRUD ฟังก์ชันสำหรับฐานข้อมูลจำลอง
│   │
│   ├── constants/         # ข้อมูลตัวเลือกตั้งต้น (Static data)
│   │   └── index.js         - คำศัพท์เย็บ, สี Mer, ไซส์ ฯลฯ
│   │
│   ├── styles/            # ระบบหน้าตา (CSS)
│   │   └── global.css       - เก็บ CSS และ Variables ทั้งหมด
│   │
│   ├── App.jsx            # โครงสร้างหลักของแอป ควบคุมหน้า
│   └── main.jsx           # จุดเริ่มต้นที่ React ทำงาน
│
├── package.json           # ข้อมูลโปรเจกต์และ Dependencies (Vite, React)
├── vite.config.js         # การตั้งค่า Vite
└── index.html             # ไฟล์หลักที่เชื่อมกับ main.jsx
```
