/* src/components/PreviewModal.jsx - หน้าต่างป๊อปอัปสำหรับดูและแก้ไขข้อมูลได้โดยตรงก่อนกดยืนยันบันทึก */
import React from 'react';
import StepBuilder from './StepBuilder';

/* ── Editable Field ── แสดงเป็น input แก้ไขได้ */
const PvField = ({ label, value, unit, name, onChange, type = 'text' }) => (
  <div className="pv-field pv-field-edit">
    <span className="pv-flabel">{label} :</span>
    <input
      className="pv-finput"
      type={type}
      value={value || ''}
      onChange={e => onChange(name, e.target.value)}
    />
    {unit && <span className="pv-unit">{unit}</span>}
  </div>
);

/* ── Editable Checkbox ── */
const PvCheck = ({ label, checked, note, name, noteName, onChange }) => (
  <label className={`pv-ck ${checked ? 'on' : ''}`} style={{ cursor: 'pointer' }}>
    <input
      type="checkbox"
      style={{ width: 20, height: 20, accentColor: 'var(--primary)', flexShrink: 0 }}
      checked={!!checked}
      onChange={e => onChange(name, e.target.checked)}
    />
    {label}
    {checked && noteName && (
      <input
        className="pv-ck-edit"
        type="text"
        value={note || ''}
        placeholder="ระบุ..."
        onClick={e => e.stopPropagation()}
        onChange={e => onChange(noteName, e.target.value)}
      />
    )}
  </label>
);

/* ── Editable Textarea ── */
const PvTextbox = ({ value, name, onChange, noB }) => (
  <textarea
    className={`pv-tb-edit ${noB ? 'nb' : ''}`}
    value={value || ''}
    onChange={e => onChange(name, e.target.value)}
    rows={3}
    placeholder="—"
  />
);

export default function PreviewModal({ show, data, onDataChange, onSave, onCancel }) {
  if (!show || !data) return null;

  /* ── helper ── */
  const set = (key, val) => onDataChange({ ...data, [key]: val });
  const setEx = (key, val) => onDataChange({ ...data, extras: { ...data.extras, [key]: val } });

  const {
    date, merSelected, merText, brand, customer, model, qty, size, colors, perColor,
    sampleReal, samplePic, detail, extras = {}, images, noteProd, noteSales,
    supervisor, sewers, rate, estWage, confirmed, steps,
    warning, solution, startDt, endDt, actSewers, actDays, actRate, actWage, actTotal, remark
  } = data;

  const merStr = [...(merSelected || []), merText].filter(Boolean).join(', ');

  const formatDt = (dt) => dt ? new Date(dt).toLocaleString('th-TH') : '';

  return (
    <div className="pv-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="pv-sheet">
        <div className="pv-topbar">
          <button className="pv-btn-back" onClick={onCancel}>← กลับ</button>
          <span className="pv-topbar-title">✏️ ตรวจสอบ & แก้ไขใบดี</span>
          <button className="pv-btn-save" onClick={onSave}>💾 ยืนยันบันทึก</button>
        </div>

        <div className="pv-body">
          {/* ═══ หน้า 1 ═══ */}
          <div className="pv-page">
            <div className="pv-page-hdr">
              <div className="pv-logo">Apparel<br />Creations</div>
              <div className="pv-page-title">ใบดีขั้นตอนผลิต</div>
              <div className="pv-page-num">หน้า 1/2</div>
            </div>
            <div className="pv-page-body">
              <div className="pv-row2">
                <PvField label="วันที่" name="date" value={date} type="date" onChange={set} />
                <PvField label="ผู้ดูแล (Mer)" name="merText" value={merStr} onChange={set} />
              </div>
              <div className="pv-row2">
                <PvField label="แบรนด์" name="brand" value={brand} onChange={set} />
                <PvField label="ลูกค้า" name="customer" value={customer} onChange={set} />
              </div>
              <PvField label="ชื่อรุ่น" name="model" value={model} onChange={set} />
              <div className="pv-row4">
                <PvField label="จำนวนผลิต" name="qty" value={qty} unit="ตัว" type="number" onChange={set} />
                <PvField label="ไซส์" name="size" value={size} onChange={set} />
                <PvField label="จำนวนสี" name="colors" value={colors} unit="สี" type="number" onChange={set} />
                <PvField label="ตัว/สี" name="perColor" value={perColor} onChange={set} />
              </div>

              <div className="pv-sec">📝 รายละเอียดงาน & เพิ่มเติม</div>
              <div className="pv-checks">
                <PvCheck label="มีตัวอย่างจริง" name="sampleReal" checked={sampleReal} onChange={set} />
                <PvCheck label="ตีราคาจากรูป" name="samplePic" checked={samplePic} onChange={set} />
              </div>
              <PvTextbox value={detail} name="detail" onChange={set} />

              <div className="pv-extras" style={{ marginTop: 12 }}>
                <PvCheck label="ปัก" name="pak" noteName="pakN" checked={extras.pak} note={extras.pakN} onChange={setEx} />
                <PvCheck label="พิมพ์" name="print" noteName="printN" checked={extras.print} note={extras.printN} onChange={setEx} />
                <PvCheck label="ตัวรีดป้ายไซส์" name="tag" checked={extras.tag} onChange={setEx} />
                <PvCheck label="ตัวรีดใหญ่" name="big" noteName="bigN" checked={extras.big} note={extras.bigN} onChange={setEx} />
                <PvCheck label="รีดวีราเน่รองปัก" name="rib" checked={extras.rib} onChange={setEx} />
                <PvCheck label="ส่งซัก" name="send" noteName="sendN" checked={extras.send} note={extras.sendN} onChange={setEx} />
                <PvCheck label="ตัวรีดเล็ก" name="small" noteName="smallN" checked={extras.small} note={extras.smallN} onChange={setEx} />
              </div>

              {images?.length > 0 && (
                <>
                  <div className="pv-sec">📷 รูปสินค้า</div>
                  <div className="pv-imgs">
                    {images.map((img, i) => <img key={i} src={img} className="pv-img" alt="" />)}
                  </div>
                </>
              )}

              <div className="pv-row2" style={{ marginTop: 14 }}>
                <div>
                  <div className="pv-nlabel">📌 Note ฝ่ายผลิต</div>
                  <PvTextbox value={noteProd} name="noteProd" onChange={set} />
                </div>
                <div>
                  <div className="pv-nlabel">📌 Note ฝ่ายขาย</div>
                  <PvTextbox value={noteSales} name="noteSales" onChange={set} />
                </div>
              </div>

              <div className="pv-sec tan">การประเมินราคา & การผลิต</div>
              <div className="pv-row2">
                <div>
                  <PvField label="หัวหน้า/ผู้ดูแล" name="supervisor" value={supervisor} onChange={set} />
                  <PvField label="จำนวนคนเย็บ" name="sewers" value={sewers} unit="คน" type="number" onChange={set} />
                  <PvField label="จำนวนตัว/ชม." name="rate" value={rate} unit="ตัว" onChange={set} />
                  <PvField label="ประเมินค่าแรง" name="estWage" value={estWage} unit="บาท" type="number" onChange={set} />
                </div>
                <div>
                  <div className="pv-nlabel">✅ Confirmed ราคา/รายละเอียด</div>
                  <PvTextbox value={confirmed} name="confirmed" onChange={set} />
                </div>
              </div>
            </div>
          </div>

          {/* ═══ หน้า 2 ═══ */}
          <div className="pv-page">
            <div className="pv-page-hdr">
              <div className="pv-logo">Apparel<br />Creations</div>
              <div className="pv-page-title">ขั้นตอนการเย็บ & ผลิตจริง</div>
              <div className="pv-page-num">หน้า 2/2</div>
            </div>
            <div className="pv-page-body">
              <div className="pv-sec" style={{ marginTop: 0 }}>⚙️ ขั้นตอนการเย็บ</div>

              {(!steps || steps.length === 0) ? (
                <div className="pv-empty">— ยังไม่มีขั้นตอน —</div>
              ) : (
                <div className="pv-steps">
                  {steps.map((s, i) => {
                    const hasTokens = s.tokens && s.tokens.length > 0;
                    return (
                      <div key={s.id || i} className="pv-step-row">
                        <div className="pv-snum">{i + 1}</div>
                        <div className="pv-scontent">
                          <div className="pv-slabel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, lineHeight: 1.8 }}>
                            {hasTokens ? (
                              s.tokens.map(tok =>
                                tok.type === 'tag' ? (
                                  <span key={tok.id} className={`pv-stag ${tok.cat}`}>{tok.val}</span>
                                ) : tok.val ? <span key={tok.id}>{tok.val}</span> : null
                              )
                            ) : (
                              <span>{[s.action||[], s.part||[], s.direction||[], s.size||[], s.detail||''].flat().filter(Boolean).join(' ') || '(ไม่ระบุ)'}</span>
                            )}
                          </div>
                          {s.detail && <div className="pv-sdetail">{s.detail}</div>}
                          <div className="pv-stags" style={{ marginTop: 4 }}>
                            {!hasTokens && (s.action||[]).length > 0 && <span className="pv-stag a">{s.action.join('+')}</span>}
                            {!hasTokens && (s.part||[]).length > 0 && <span className="pv-stag p">{s.part.join('·')}</span>}
                            {!hasTokens && (s.direction||[]).length > 0 && <span className="pv-stag d">{s.direction.join('/')}</span>}
                            {!hasTokens && (s.size||[]).length > 0 && <span className="pv-stag z">{s.size.join(' ')}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pv-wf">
                <div className="pv-wf-box">
                  <div className="pv-wf-hdr warn">ข้อควรระวัง</div>
                  <PvTextbox value={warning} name="warning" onChange={set} noB />
                </div>
                <div className="pv-wf-box">
                  <div className="pv-wf-hdr fix">วิธีแก้ไข</div>
                  <PvTextbox value={solution} name="solution" onChange={set} noB />
                </div>
              </div>

              <div className="pv-actual">
                <div className="pv-actual-hdr">ผลิตจริง</div>
                <div className="pv-row2">
                  <PvField label="เริ่มเย็บ วันที่/เวลา" name="startDt" value={startDt} type="datetime-local" onChange={set} />
                  <PvField label="จบ วันที่" name="endDt" value={endDt} type="date" onChange={set} />
                  <PvField label="คนเย็บ (จริง)" name="actSewers" value={actSewers} unit="คน" type="number" onChange={set} />
                  <PvField label="ใช้เวลา (จริง)" name="actDays" value={actDays} unit="วัน" type="number" onChange={set} />
                  <PvField label="ตัว/ชั่วโมง" name="actRate" value={actRate} onChange={set} />
                  <PvField label="ค่าแรงเย็บจริง" name="actWage" value={actWage} unit="บาท" type="number" onChange={set} />
                  <div className="pv-field wide">
                    <span className="pv-flabel">ประเมินทุนรวมตัด-แฟ็ก :</span>
                    <input className="pv-finput" type="text" value={actTotal || ''} onChange={e => set('actTotal', e.target.value)} />
                    <span className="pv-unit">บาท</span>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div className="pv-nlabel">หมายเหตุ</div>
                  <PvTextbox value={remark} name="remark" onChange={set} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pv-bottom">
          <button className="pv-bottom-back" onClick={onCancel}>← กลับแก้ไขฟอร์ม</button>
          <button className="pv-bottom-save" onClick={onSave}>💾 ยืนยันบันทึกใบดี</button>
        </div>
      </div>
    </div>
  );
}
