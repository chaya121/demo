/* src/App.jsx - Root Component ควบคุมสถานะและหน้าจอทั้งหมด */
import React, { useState } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Toast from './components/Toast';
import FormPage from './pages/FormPage';
import DownloadPage from './pages/DownloadPage';
import StatsPage from './pages/StatsPage';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [records, setRecords] = useLocalStorage('acRec3', []);
  const [toastMessage, setToastMessage] = useState(null);

  const handleSaveSuccess = (newRecord) => {
    setRecords([newRecord, ...records]);
    setToastMessage('✅ บันทึกใบดีเรียบร้อยแล้ว');
    setActiveTab('download');
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Header />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="wrap">
        {activeTab === 'form' && <FormPage onSaveSuccess={handleSaveSuccess} />}
        {activeTab === 'download' && <DownloadPage records={records} setRecords={setRecords} />}
        {activeTab === 'stats' && <StatsPage records={records} />}
      </div>

      <Toast 
        message={toastMessage} 
        isError={false} 
        onClear={() => setToastMessage(null)} 
      />
    </>
  );
}
