/* src/pages/StatsPage.jsx - หน้า Dashboard สรุปสถิติจากใบดีทั้งหมด */
import React, { useMemo } from 'react';

export default function StatsPage({ records }) {
  const stats = useMemo(() => {
    let steps = 0, qty = 0;
    const brandMap = {};
    records.forEach(r => {
      steps += r.stepCount || 0;
      const q = parseInt(r.qty) || 0;
      qty += q;
      const key = (r.brand || 'ไม่ระบุแบรนด์') + (r.model ? ' - ' + r.model : '');
      if (!brandMap[key]) brandMap[key] = { qty: 0, count: 0 };
      brandMap[key].qty += q;
      brandMap[key].count += 1;
    });

    const t = records.length;
    const avg = t ? (steps / t).toFixed(1) : 0;
    const list = Object.keys(brandMap)
      .map(k => ({ name: k, ...brandMap[k] }))
      .sort((a, b) => b.qty - a.qty);

    return { total: t, steps, qty, avg, list };
  }, [records]);

  return (
    <div className="page active" id="page-stats">
      <div className="stat-hdr">
        <h2>📊 สถิติการผลิต</h2>
        <p style={{ opacity: .8, fontSize: '13px', marginTop: '3px' }}>ข้อมูลรวมทั้งหมด</p>
      </div>

      <div className="stat-grid">
        <div className="stat-box"><div className="sn">{stats.total}</div><div className="sl">ใบดีทั้งหมด</div></div>
        <div className="stat-box"><div className="sn">{stats.steps}</div><div className="sl">ขั้นตอนรวม</div></div>
        <div className="stat-box"><div className="sn">{stats.avg}</div><div className="sl">เฉลี่ยขั้นตอน/ใบ</div></div>
        <div className="stat-box"><div className="sn">{stats.qty}</div><div className="sl">ตัวผลิตรวม</div></div>
      </div>

      <div className="form-card" style={{ padding: '16px 18px' }}>
        <div className="sec-label">👕 สถิติตามรุ่น / แบรนด์</div>
        {stats.list.length === 0 ? (
          <div className="empty" style={{ padding: '28px' }}>
            <div className="ei" style={{ fontSize: '40px' }}>📊</div>
            <p>ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          stats.list.map((item, idx) => (
            <div key={idx} className="type-row">
              <div className="ic">👕</div>
              <div className="inf">
                <div className="nm">{item.name}</div>
                <div className="dt">{item.count} ใบดี</div>
              </div>
              <div className="type-badge">
                <span className="tn">{item.qty}</span>
                <span className="tl">ตัว</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
