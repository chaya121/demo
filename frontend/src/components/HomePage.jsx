import React from 'react';

export default function HomePage({ onStart }) {
  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-logo">Apparel<br />Creations</div>
        <h1 className="home-title">ระบบบันทึกข้อมูลการผลิตเสื้อผ้า</h1>
        <p className="home-subtitle">บันทึก ติดตาม และจัดการขั้นตอนการผลิตทุกใบงานได้ในที่เดียว</p>
        <button className="home-cta-btn" onClick={onStart}>
          📋 เริ่มกรอกใบขั้นตอนการผลิต
        </button>
      </div>
    </div>
  );
}
