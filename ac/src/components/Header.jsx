/* src/components/Header.jsx - ส่วนหัวของแอปพลิเคชัน (Logo และ ชื่อระบบ) */
import React from 'react';

export default function Header() {
  return (
    <div className="app-header">
      <div className="logo-box">
        Apparel<br />Creations
      </div>
      <div className="hdr-text">
        <h1>ใบดีขั้นตอนผลิต</h1>
        <p>ระบบบันทึกดิจิทัล · Apparel Creations</p>
      </div>
    </div>
  );
}
