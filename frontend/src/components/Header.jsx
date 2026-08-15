import React from 'react';

export default function Header({ onLogoClick }) {
  return (
    <div className="app-header">
      <div
        className="logo-box"
        onClick={onLogoClick}
        style={{ cursor: onLogoClick ? 'pointer' : 'default' }}
        title={onLogoClick ? 'กลับหน้าแรก' : undefined}
      >
        Apparel<br />Creations
      </div>
      <div className="hdr-text">
        <h1>ใบตีขั้นตอนผลิต</h1>
        <p>ระบบบันทึกดิจิทัล · Apparel Creations</p>
      </div>
    </div>
  );
}
