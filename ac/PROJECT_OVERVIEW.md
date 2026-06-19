# Project Architecture Overview

## บทนำ
**Apparel Creations - ใบดีขั้นตอนผลิต** เป็น Web Application แบบ Offline-First (ทำงานผ่าน Local Storage เป็นหลัก) สำหรับใช้เป็นระบบบันทึกและติดตามการสั่งผลิตเสื้อผ้าในโรงงาน ตั้งแต่กระบวนการรับออเดอร์, ประเมินราคา, ไปจนถึงการลงบันทึกรายละเอียดการผลิตจริง

จากการเป็นไฟล์ `index.html` ไฟล์เดียวที่ยากต่อการบำรุงรักษา ระบบถูกรื้อถอนและวางรากฐานใหม่ด้วย **React 18** บนเครื่องมือสร้างโปรเจกต์อย่าง **Vite**

## Architecture Design

การออกแบบยึดหลัก **"Component-based UI"** และ **"Single Source of Truth"**:

1. **State Management (การจัดการสถานะ)**
   - ข้อมูลฐานข้อมูล (Database) สมมติใช้ `localStorage` (ผ่านตัวแปร `acRec3`) โดยมี Custom Hook `useLocalStorage` ทำหน้าที่เชื่อมระหว่าง React State กับเบราว์เซอร์ เพื่อให้ข้อมูลบันทึกอัตโนมัติ ไม่หายเมื่อรีเฟรชหน้าเว็บ
   - ฟอร์มข้อมูลการกรอก ถูกแยกไว้ต่างหากใน Local state ของ component เพื่อไม่ให้การพิมพ์ในฟอร์มกระทบกับ Performance ของระบบในภาพรวม

2. **Component Hierarchy (ลำดับชั้น)**
   - `App.jsx` เป็นหน้ากากรวม (Shell) โดยถือสถานะหน้าแท็บปัจจุบัน (`activeTab`) 
   - แบ่งหน้าเนื้อหาเป็น 3 หมวด (Pages)
     1. `FormPage`: จัดการและรวบรวมฟอร์มข้อมูลใบดี มี Component ย่อยคือ `MerChips` (เลือกสีเมอร์), `StepBuilder` (ระบบสร้างลิสต์ขั้นตอนแบบปรับแต่งได้)
     2. `DownloadPage`: เรียกดูลิสต์ประวัติ 
     3. `StatsPage`: นำข้อมูลที่ถูกบันทึกมาคำนวณและแสดงผลเชิงสถิติผ่าน Dashboard

3. **Design System & Styles (ระบบดีไซน์)**
   - นำ CSS เดิมมาจัดระเบียบใน `global.css`
   - ใช้ CSS Custom Properties (Variables) คุมสีหลักของแบรนด์เพื่อให้ดูพรีเมียม (สีแดง `#c8392b` สีน้ำเงิน `#1a5276`) 
   - Responsive design รองรับการดูบนมือถือและแท็บเล็ตได้สมบูรณ์

## อนาคตของการพัฒนา (Scalability)
ด้วยโครงสร้าง React แบบ Modular ทำให้สามารถ:
- สลับ Local Storage ไปเชื่อมกับ API หลังบ้าน (Backend) เช่น Node.js + MongoDB, หรือ Firebase ได้ง่ายเพียงแค่แก้ฟังก์ชันที่ไฟล์ `src/utils/storage.js` 
- เพิ่มฟีเจอร์ "ออกรายงาน PDF" โดยสามารถเรียกใช้ `jspdf` ในหน้า `DownloadPage.jsx` ได้อย่างไม่ซับซ้อน
- ทำระบบ Login สิทธิ์แบบ Admin / User ได้ง่ายๆ ผ่าน React Router
