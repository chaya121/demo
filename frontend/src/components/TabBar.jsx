import React from 'react';

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="tab-bar">
      <button 
        className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`} 
        onClick={() => onTabChange('form')}
      >
        📋 กรอกใบขั้นตอนการผลิต
      </button>
      <button 
        className={`tab-btn ${activeTab === 'download' ? 'active' : ''}`} 
        onClick={() => onTabChange('download')}
      >
        📥 ประวัติ/PDF
      </button>
      <button 
        className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} 
        onClick={() => onTabChange('stats')}
      >
        📊 สถิติ
      </button>
      <button 
        className={`tab-btn ${activeTab === 'master' ? 'active' : ''}`} 
        onClick={() => onTabChange('master')}
      >
        ⚙️ ข้อมูลหลัก
      </button>
    </div>
  );
}
