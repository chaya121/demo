/* src/pages/DownloadPage.jsx - หน้าจอสำหรับดูประวัติการบันทึกใบดี และสร้าง PDF (ถ้ามี) */
import React from 'react';

export default function DownloadPage({ records, setRecords }) {
  const delRec = (idx) => {
    if (!window.confirm('ยืนยันการลบข้อมูลนี้?')) return;
    const newRecords = [...records];
    newRecords.splice(idx, 1);
    setRecords(newRecords);
  };

  const handlePdf = () => {
    alert('ฟังก์ชันสร้าง PDF อยู่ระหว่างการพัฒนา');
  };

  return (
    <div className="page active" id="page-download">
      <div className="form-card" style={{ padding: '22px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📥</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
          ประวัติใบดี & ดาวน์โหลด PDF
        </div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
          กดปุ่มดาวน์โหลด PDF ได้เลย
        </div>
      </div>

      <div id="downloadList">
        {records.length === 0 ? (
          <div className="empty">
            <div className="ei">📋</div>
            <p>ยังไม่มีบันทึกใบดี<br />กรุณากรอกและบันทึกก่อน</p>
          </div>
        ) : (
          records.map((r, i) => (
            <div key={r.id || i} className="rec-card">
              <div className="rec-hdr">
                <div>
                  <div className="rec-title">{r.model || r.brand || 'ไม่ระบุรุ่น'}</div>
                  <div className="rec-sub">ลูกค้า: {r.customer || '-'} · {r.createdAt}</div>
                </div>
                <div className="rec-badge">
                  <span className="bn">{r.qty || 0}</span>
                  <span className="bl">ตัว</span>
                </div>
              </div>
              <div className="rec-body">
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  ขั้นตอนเย็บ: <b>{r.stepCount || 0}</b> ขั้นตอน
                </div>
                <button className="btn-pdf" onClick={handlePdf}>📄 ดาวน์โหลด PDF</button>
                <button className="btn-del" onClick={() => delRec(i)}>ลบข้อมูลนี้</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
