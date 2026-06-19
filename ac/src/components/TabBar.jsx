/* src/components/TabBar.jsx - แถบนำทางด้านบนสำหรับสลับหน้าจอ */
import React from 'react';

export default function TabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'form', icon: '📋', label: 'กรอกใบดี' },
    { id: 'download', icon: '📥', label: 'ประวัติ/PDF' },
    { id: 'stats', icon: '📊', label: 'สถิติ' }
  ];

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}
