import React from 'react';

export default function PreviewModal({ data, isOpen, onClose, onConfirm }) {
  if (!isOpen || !data) return null;

  const esc = (s) => s || '-';

  const rtf = (v, def = '-') => {
    return v ? v : <span className="pv-blank">{def}</span>;
  };

  const tf = (v, wide = false) => {
    return wide ? (
      <div className={`pv-tb ${v ? 'pv-tb-val' : 'pv-tb-empty'}`}>
        {v ? v : 'ไม่มีข้อมูล'}
      </div>
    ) : (
      <div className={`pv-fval ${!v ? 'empty' : ''}`}>{v ? v : '-'}</div>
    );
  };

  const formatDateTime = (dstr) => {
    if (!dstr) return '';
    const d = new Date(dstr);
    if (isNaN(d)) return dstr;
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const secToMin = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}.${String(sec).padStart(2, '0')}`;
  };

  const getMachineBreakdown = (rows) => {
    const map = {};
    rows.forEach((r) => {
      const m = r.machine || '-';
      map[m] = (map[m] || 0) + 1;
    });
    return map;
  };

  const steps = data.steps || [];
  const totalSec = steps.reduce((s, r) => s + (parseInt(r.time) || 0), 0);
  const breakdown = getMachineBreakdown(steps);

  const extraFeatures = [
    { label: 'ปัก', checked: data.chk?.pak, note: data.chk?.pak_n },
    { label: 'พิมพ์', checked: data.chk?.print, note: data.chk?.print_n },
    { label: 'ตัวรีดป้ายไซส์', checked: data.chk?.tag },
    { label: 'ตัวรีดใหญ่', checked: data.chk?.big, note: data.chk?.big_n },
    { label: 'รีดวีราเน่รองปัก', checked: data.chk?.rib },
    { label: 'ส่งซัก', checked: data.chk?.send, note: data.chk?.send_n },
    { label: 'ตัวรีดเล็ก', checked: data.chk?.small, note: data.chk?.small_n },
  ];

  return (
    <div className="pv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pv-sheet">
        <div className="pv-topbar">
          <button className="pv-btn-back" onClick={onClose}>← กลับแก้ไข</button>
          <span className="pv-topbar-title">ตรวจสอบใบดี</span>
          <button className="pv-btn-save" onClick={onConfirm}>💾 ยืนยันบันทึก</button>
        </div>

        <div className="pv-body">
          {/* --- หน้า 1 --- */}
          <div className="pv-page">
            <div className="pv-page-hdr">
              <div className="pv-logo">Apparel<br />Creations</div>
              <div className="pv-page-title">
                ใบดีขั้นตอนผลิต
                {data.job_no && <div style={{ fontSize: '14px', marginTop: '4px', color: '#555' }}>เลขที่: {data.job_no}</div>}
              </div>
              <div className="pv-page-num">หน้า 1/2</div>
            </div>
            <div className="pv-page-body">
              <div className="pv-row4">
                <div className="pv-field wide">
                  <span className="pv-flabel">วันที่ :</span>
                  <span className="pv-fval">{rtf(data.dispDate)}</span>
                </div>
                <div className="pv-field wide">
                  <span className="pv-flabel">Mer :</span>
                  <span className="pv-fval">{rtf(data.merText)}</span>
                </div>
                <div className="pv-field wide">
                  <span className="pv-flabel">แบรนด์ :</span>
                  <span className="pv-fval">{rtf(data.brand)}</span>
                </div>
                <div className="pv-field wide">
                  <span className="pv-flabel">ลูกค้า :</span>
                  <span className="pv-fval">{rtf(data.customer)}</span>
                </div>
                <div className="pv-field wide">
                  <span className="pv-flabel">ชื่อรุ่น :</span>
                  <span className="pv-fval">{rtf(data.model)}</span>
                </div>
              </div>

              <div className="pv-row2">
                <div className="pv-field">
                  <span className="pv-flabel">จำนวนผลิต :</span>
                  <span className="pv-fval">{rtf(data.qty)} <span className="pv-unit">ตัว</span></span>
                </div>
                <div className="pv-field">
                  <span className="pv-flabel">ไซส์ :</span>
                  <span className="pv-fval">{rtf(data.size)}</span>
                </div>
                <div className="pv-field">
                  <span className="pv-flabel">จำนวนสี :</span>
                  <span className="pv-fval">{rtf(data.colors)} <span className="pv-unit">สี</span></span>
                </div>
                <div className="pv-field">
                  <span className="pv-flabel">ตัว/สี :</span>
                  <span className="pv-fval">{rtf(data.perColor)} <span className="pv-unit">ตัว</span></span>
                </div>
              </div>

              <div className="pv-checks">
                <div className={`pv-ck ${data.sampleReal ? 'on' : ''}`}>
                  <span className="pv-ck-icon">{data.sampleReal ? '☑' : '☐'}</span> มีตัวอย่างจริง
                </div>
                <div className={`pv-ck ${data.samplePic ? 'on' : ''}`}>
                  <span className="pv-ck-icon">{data.samplePic ? '☑' : '☐'}</span> ตีราคาจากรูป
                </div>
              </div>

              <div className="pv-sec">📝 รายละเอียดงาน</div>
              {tf(data.detail, true)}

              <div className="pv-sec">➕ เพิ่มเติม</div>
              <div className="pv-extras">
                {extraFeatures.map((x, i) => (
                  <div className={`pv-ck ${x.checked ? 'on' : ''}`} key={i}>
                    <span className="pv-ck-icon">{x.checked ? '☑' : '☐'}</span> {x.label} 
                    {x.note ? <span className="pv-ck-note"> ({x.note})</span> : ''}
                  </div>
                ))}
              </div>

              <div className="pv-sec">📷 รูปสินค้า</div>
              {data.imgs && data.imgs.length > 0 ? (
                <div className="pv-imgs">
                  {data.imgs.map((img, i) => (
                    <img key={i} src={img} className="pv-img" alt={`product-${i}`} />
                  ))}
                </div>
              ) : (
                <div className="pv-empty">ไม่ได้แนบรูป</div>
              )}

              <div className="pv-row2" style={{ marginTop: '14px' }}>
                <div>
                  <div className="pv-nlabel">📌 Note ฝ่ายผลิต</div>
                  {tf(data.noteProd, true)}
                </div>
                <div>
                  <div className="pv-nlabel">📌 Note ฝ่ายขาย</div>
                  {tf(data.noteSales, true)}
                </div>
              </div>

              <div className="pv-row2" style={{ marginTop: '14px' }}>
                <div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">ผู้ดูแล (เมอร์) :</span>
                    {tf(data.supervisor)}
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">จำนวนคนเย็บ :</span>
                    <div className={`pv-fval ${!data.sewers ? 'empty' : ''}`}>
                      {data.sewers ? `${data.sewers} คน` : '-'}
                    </div>
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">จำนวนตัว/ชม. :</span>
                    <div className={`pv-fval ${!data.rate ? 'empty' : ''}`}>
                      {data.rate ? `${data.rate} ตัว` : '-'}
                    </div>
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">ประเมินค่าแรง :</span>
                    <div className={`pv-fval ${!data.estWage ? 'empty' : ''}`}>
                      {data.estWage ? `${data.estWage} บาท` : '-'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="pv-nlabel">✅ Confirmed ราคา/รายละเอียด</div>
                  {tf(data.confirmed, true)}
                </div>
              </div>
            </div>
          </div>

          {/* --- หน้า 2 --- */}
          <div className="pv-page">
            <div className="pv-page-hdr">
              <div className="pv-logo">Apparel<br />Creations</div>
              <div className="pv-page-title">
                ใบดีขั้นตอนผลิต
                {data.job_no && <div style={{ fontSize: '14px', marginTop: '4px', color: '#555' }}>เลขที่: {data.job_no}</div>}
              </div>
              <div className="pv-page-num">หน้า 2/2</div>
            </div>
            <div className="pv-page-body">
              <div className="pv-sec">⚙️ ตารางขั้นตอนการผลิต</div>
              {steps.length > 0 ? (
                <div style={{ overflowX: 'auto', border: '1.5px solid #e0e0e0', borderRadius: '8px', marginBottom: '14px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '540px', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                        <th style={{ padding: '8px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>ลำดับ</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left' }}>ชิ้นส่วน</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left' }}>ขั้นตอนการเย็บ</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left' }}>เครื่องจักร</th>
                        <th style={{ padding: '8px 6px', textAlign: 'center' }}>เวลา (วิ)</th>
                        <th style={{ padding: '8px 6px', textAlign: 'center' }}>คนงาน</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left' }}>หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.map((r, i) => (
                        <tr style={{ background: i % 2 === 1 ? '#f9fbff' : '' }} key={i}>
                          <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>{i + 1}</td>
                          <td style={{ padding: '7px 6px', color: 'var(--muted)' }}>{r.part}</td>
                          <td style={{ padding: '7px 6px', fontWeight: '600' }}>{r.step}</td>
                          <td style={{ padding: '7px 6px', color: 'var(--muted)' }}>{r.machine}</td>
                          <td style={{ padding: '7px 6px', textAlign: 'center' }}>{r.time}</td>
                          <td style={{ padding: '7px 6px', textAlign: 'center' }}>{r.workers || 1}</td>
                          <td style={{ padding: '7px 6px', color: 'var(--muted)' }}>{r.note}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {Object.entries(breakdown).map(([m, count]) => (
                        <tr style={{ background: '#f0f7ff' }} key={m}>
                          <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)' }}>{m}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>{count}</td>
                          <td colSpan={2} style={{ padding: '6px 8px', color: 'var(--muted)' }}>ตัว</td>
                        </tr>
                      ))}
                      <tr style={{ background: 'var(--tan-lt)', borderTop: '2.5px solid var(--tan)' }}>
                        <td colSpan={4} style={{ padding: '9px 8px', textAlign: 'right', fontWeight: '700', color: '#4a3b1a' }}>⏱️ รวมทั้งหมด</td>
                        <td style={{ padding: '9px 8px', textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>{secToMin(totalSec)}</td>
                        <td colSpan={3} style={{ padding: '9px 8px', fontWeight: '600', color: '#4a3b1a' }}>นาที ({totalSec} วิ)</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="pv-empty">ยังไม่มีการเพิ่มขั้นตอน</div>
              )}

              <div className="pv-wf">
                <div className="pv-wf-box">
                  <div className="pv-wf-hdr warn">ข้อควรระวัง</div>
                  {tf(data.warning, true)}
                </div>
                <div className="pv-wf-box">
                  <div className="pv-wf-hdr fix">วิธีแก้ไข</div>
                  {tf(data.solution, true)}
                </div>
              </div>

              <div className="pv-actual">
                <div className="pv-actual-hdr">ผลิตจริง</div>
                <div className="pv-row2">
                  <div className="pv-field wide">
                    <span className="pv-flabel">เริ่มเย็บ :</span>
                    {tf(formatDateTime(data.actual?.start))}
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">จบ :</span>
                    {tf(formatDateTime(data.actual?.end))}
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">คนเย็บ/เวลา :</span>
                    <div className="pv-fval">{data.actual?.sewers || '-'} คน · ใช้เวลา {data.actual?.days || '-'} วัน</div>
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">ตัว/ชั่วโมง :</span>
                    <div className="pv-fval">{data.actual?.rate || '-'} <span className="pv-unit">ตัว (เฉลี่ยจบตัว)</span></div>
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">ค่าแรงจริง :</span>
                    <div className="pv-fval">{data.actual?.wage || '-'} <span className="pv-unit">บาท (ไม่รวม ตัด QC รีด แฟ็ก)</span></div>
                  </div>
                  <div className="pv-field wide">
                    <span className="pv-flabel">ประเมินทุน :</span>
                    <div className="pv-fval">{data.actual?.total || '-'} <span className="pv-unit">บาท</span></div>
                  </div>
                  <div className="pv-field wide" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="pv-flabel">หมายเหตุ :</span>
                    <div className="pv-fval" style={{ width: '100%', marginTop: '4px' }}>
                      {data.actual?.remark ? data.actual.remark : <span className="pv-blank">-</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pv-bottom">
          <button className="pv-bottom-back" onClick={onClose}>← กลับแก้ไข</button>
          <button className="pv-bottom-save" onClick={onConfirm}>💾 ยืนยันบันทึกใบดี</button>
        </div>
      </div>
    </div>
  );
}
