/* src/pages/FormPage.jsx - หน้าหลักสำหรับกรอกแบบฟอร์มใบดี แบ่งเป็น 2 ส่วน */
import React, { useState, useRef } from 'react';
import MerChips from '../components/MerChips';
import StepBuilder from '../components/StepBuilder';
import PreviewModal from '../components/PreviewModal';

export default function FormPage({ onSaveSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    merSelected: ['เหลือง'],
    merText: '',
    brand: '', customer: '', model: '',
    qty: '', size: '', colors: '', perColor: '',
    sampleReal: false, samplePic: false, detail: '',
    extras: { pak: false, pakN: '', print: false, printN: '', tag: false, big: false, bigN: '', rib: false, send: false, sendN: '', small: false, smallN: '' },
    noteProd: '', noteSales: '',
    supervisor: '', sewers: '', rate: '', estWage: '', confirmed: '',
    warning: '', solution: '', startDt: '', endDt: '',
    actSewers: '', actDays: '', actRate: '', actWage: '', actTotal: '', remark: ''
  });

  const [images, setImages] = useState([]);
  const [steps, setSteps] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  // previewData เก็บข้อมูลที่แก้ไขในหน้าตรวจสอบผลลัพธ์กับ formData ในไฟล์หลัก
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('ex_')) {
      const exField = name.split('_')[1];
      setFormData(prev => ({ ...prev, extras: { ...prev.extras, [exField]: type === 'checkbox' ? checked : value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleMerChange = (selected) => {
    setFormData(prev => ({ ...prev, merSelected: selected }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    if (!window.confirm('ลบข้อมูลที่กำลังกรอกทั้งหมด?')) return;
    setFormData({
      date: new Date().toISOString().split('T')[0],
      merSelected: ['เหลือง'], merText: '',
      brand: '', customer: '', model: '', qty: '', size: '', colors: '', perColor: '',
      sampleReal: false, samplePic: false, detail: '',
      extras: { pak: false, pakN: '', print: false, printN: '', tag: false, big: false, bigN: '', rib: false, send: false, sendN: '', small: false, smallN: '' },
      noteProd: '', noteSales: '',
      supervisor: '', sewers: '', rate: '', estWage: '', confirmed: '',
      warning: '', solution: '', startDt: '', endDt: '',
      actSewers: '', actDays: '', actRate: '', actWage: '', actTotal: '', remark: ''
    });
    setImages([]);
    setSteps([]);
  };

  const handleSaveClick = () => {
    if (!formData.model && !formData.brand) {
      alert('\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01\u0e0a\u0e37\u0e48\u0e2d\u0e23\u0e38\u0e48\u0e19 \u0e2b\u0e23\u0e37\u0e2d \u0e41\u0e1a\u0e23\u0e19\u0e14\u0e4c\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e19\u0e49\u0e2d\u0e22 1 \u0e2d\u0e22\u0e48\u0e32\u0e07');
      return;
    }
    // snapshot ข้อมูลตอนเปิด preview
    setPreviewData({ ...formData, images, steps });
    setShowPreview(true);
  };

  const handleConfirmSave = () => {
    const now = new Date();
    // ใช้ข้อมูลจาก previewData (อาจถูกแก้ไขในหน้าตรวจสอบ)
    const finalData = {
      ...(previewData || formData),
      stepCount: (previewData?.steps || steps).length,
      createdAt: now.toLocaleString('th-TH')
    };
    // sync แก้ไขจาก preview กลับไปที่ formData ด้วย
    if (previewData) {
      const { images: pi, steps: ps, ...rest } = previewData;
      setFormData(f => ({ ...f, ...rest }));
      setImages(pi || images);
      setSteps(ps || steps);
    }
    onSaveSuccess(finalData);
    setShowPreview(false);
    clearForm();
  };

  return (
    <div className="page active" id="page-form">
      <div className="form-card">
        <div className="form-titlebar">
          <div className="logo">Apparel<br/>Creations</div>
          <div className="form-main-title">ใบดีขั้นตอนผลิต</div>
          <div className="page-num">หน้า 1/2</div>
        </div>
        <div className="form-body">
          <div className="frow">
            <span className="flabel">วันที่</span>
            <input type="date" name="date" className="finput" value={formData.date} onChange={handleChange} />
          </div>
          <div className="sec-label">ผู้ดูแล (Mer)</div>
          <MerChips selected={formData.merSelected} onChange={handleMerChange} />
          <input type="text" name="merText" className="finput" placeholder="พิมพ์ชื่อผู้ดูแลเพิ่มเติม..." style={{ marginTop: '10px' }} value={formData.merText} onChange={handleChange} />

          <div className="sec-hdr">ข้อมูลทั่วไป</div>
          <div className="frow"><span className="flabel">แบรนด์</span><input type="text" name="brand" className="finput" value={formData.brand} onChange={handleChange} /></div>
          <div className="frow"><span className="flabel">ลูกค้า</span><input type="text" name="customer" className="finput" value={formData.customer} onChange={handleChange} /></div>
          <div className="frow"><span className="flabel">ชื่อรุ่น</span><input type="text" name="model" className="finput" value={formData.model} onChange={handleChange} /></div>
          <div className="two-col">
            <div className="frow"><span className="flabel" style={{minWidth:'70px'}}>จำนวนผลิต</span><input type="number" name="qty" className="finput" value={formData.qty} onChange={handleChange} /><span className="unit">ตัว</span></div>
            <div className="frow"><span className="flabel" style={{minWidth:'40px'}}>ไซส์</span><input type="text" name="size" className="finput" value={formData.size} onChange={handleChange} /></div>
          </div>
          <div className="two-col">
            <div className="frow"><span className="flabel" style={{minWidth:'70px'}}>จำนวนสี</span><input type="number" name="colors" className="finput" value={formData.colors} onChange={handleChange} /><span className="unit">สี</span></div>
            <div className="frow"><span className="flabel" style={{minWidth:'40px'}}>ตัว/สี</span><input type="text" name="perColor" className="finput" value={formData.perColor} onChange={handleChange} /></div>
          </div>

          <div className="sec-hdr">รายละเอียดงาน & เพิ่มเติม</div>
          <div className="check-row">
            <label className="ck"><input type="checkbox" name="sampleReal" checked={formData.sampleReal} onChange={handleChange} />มีตัวอย่างจริง</label>
            <label className="ck"><input type="checkbox" name="samplePic" checked={formData.samplePic} onChange={handleChange} />ตีราคาจากรูป</label>
          </div>
          <textarea name="detail" className="ta" placeholder="รายละเอียดเพิ่มเติม / สีผ้า / วัตถุดิบ..." value={formData.detail} onChange={handleChange} />

          <div className="sec-label" style={{marginTop:'18px'}}>สิ่งที่มีเพิ่มเติม</div>
          <div className="check-row">
            <label className="ck"><input type="checkbox" name="ex_pak" checked={formData.extras.pak} onChange={handleChange} />ปัก <input type="text" className="ck-note" name="ex_pakN" placeholder="(ระบุตำแหน่ง)" value={formData.extras.pakN} onChange={handleChange} /></label>
            <label className="ck"><input type="checkbox" name="ex_print" checked={formData.extras.print} onChange={handleChange} />พิมพ์ <input type="text" className="ck-note" name="ex_printN" placeholder="(ระบุตำแหน่ง)" value={formData.extras.printN} onChange={handleChange} /></label>
            <label className="ck"><input type="checkbox" name="ex_tag" checked={formData.extras.tag} onChange={handleChange} />ตัวรีดป้ายไซส์</label>
            <label className="ck"><input type="checkbox" name="ex_big" checked={formData.extras.big} onChange={handleChange} />ตัวรีดใหญ่ <input type="text" className="ck-note" name="ex_bigN" placeholder="(ตำแหน่ง)" value={formData.extras.bigN} onChange={handleChange} /></label>
            <label className="ck"><input type="checkbox" name="ex_rib" checked={formData.extras.rib} onChange={handleChange} />รีดวีราเน่รองปัก</label>
            <label className="ck"><input type="checkbox" name="ex_send" checked={formData.extras.send} onChange={handleChange} />ส่งซัก <input type="text" className="ck-note" name="ex_sendN" placeholder="(ชนิดซัก)" value={formData.extras.sendN} onChange={handleChange} /></label>
            <label className="ck"><input type="checkbox" name="ex_small" checked={formData.extras.small} onChange={handleChange} />ตัวรีดเล็ก <input type="text" className="ck-note" name="ex_smallN" placeholder="(ตำแหน่ง)" value={formData.extras.smallN} onChange={handleChange} /></label>
          </div>

          <div className="sec-label" style={{marginTop:'18px'}}>อัปโหลดรูปภาพสินค้า</div>
          <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
            <input type="file" ref={fileInputRef} multiple accept="image/*,.heic" onChange={handleImageUpload} />
            <div className="upload-icon">📷</div>
            <div className="upload-txt">แตะเพื่ออัปโหลดรูปภาพ</div>
            <div className="upload-hint">รองรับ JPG, PNG, HEIC</div>
          </div>
          {images.length > 0 && (
            <div className="img-grid">
              {images.map((img, i) => (
                <div key={i} className="img-thumb">
                  <img src={img} alt="preview" />
                  <button className="del" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="two-col">
            <div><div className="note-label">📌 Note ฝ่ายผลิต</div><textarea name="noteProd" className="ta" value={formData.noteProd} onChange={handleChange} /></div>
            <div><div className="note-label">📌 Note ฝ่ายขาย</div><textarea name="noteSales" className="ta" value={formData.noteSales} onChange={handleChange} /></div>
          </div>

          <div className="sec-hdr">การประเมินราคา & การผลิต</div>
          <div className="two-col">
            <div>
              <div className="frow"><span className="flabel" style={{minWidth:'90px'}}>หัวหน้า/ผู้ดูแล</span><input type="text" name="supervisor" className="finput" value={formData.supervisor} onChange={handleChange} /></div>
              <div className="frow"><span className="flabel" style={{minWidth:'90px'}}>จำนวนคนเย็บ</span><input type="number" name="sewers" className="finput" value={formData.sewers} onChange={handleChange} /><span className="unit">คน</span></div>
              <div className="frow"><span className="flabel" style={{minWidth:'90px'}}>จำนวนตัว/ชม.</span><input type="text" name="rate" className="finput" value={formData.rate} onChange={handleChange} /><span className="unit">ตัว</span></div>
              <div className="frow"><span className="flabel" style={{minWidth:'90px'}}>ประเมินค่าแรง</span><input type="number" name="estWage" className="finput" value={formData.estWage} onChange={handleChange} /><span className="unit">บาท</span></div>
            </div>
            <div>
              <div className="note-label">✅ Confirmed ราคา/รายละเอียด</div>
              <textarea name="confirmed" className="ta" style={{minHeight:'115px'}} value={formData.confirmed} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-titlebar">
          <div className="logo">Apparel<br/>Creations</div>
          <div className="form-main-title">ขั้นตอนการเย็บ & ผลิตจริง</div>
          <div className="page-num">หน้า 2/2</div>
        </div>
        <div className="form-body">
          <div className="sec-hdr" style={{marginTop:0}}>⚙️ ขั้นตอนการเย็บ</div>
          <StepBuilder steps={steps} setSteps={setSteps} />

          <div className="wf-wrap">
            <div className="wf-box">
              <div className="wf-hdr warn">ข้อควรระวัง</div>
              <textarea name="warning" className="wfta" placeholder="ระบุข้อควรระวังในการเย็บ..." value={formData.warning} onChange={handleChange}></textarea>
            </div>
            <div className="wf-box">
              <div className="wf-hdr fix">วิธีแก้ไข</div>
              <textarea name="solution" className="wfta" placeholder="ระบุวิธีแก้ไขปัญหา..." value={formData.solution} onChange={handleChange}></textarea>
            </div>
          </div>

          <div className="actual-wrap">
            <div className="actual-hdr">ผลิตจริง (กรอกภายหลัง)</div>
            <div className="actual-grid">
              <div className="af"><label>เริ่มเย็บ วันที่/เวลา</label><input type="datetime-local" name="startDt" className="ainput" value={formData.startDt} onChange={handleChange} /></div>
              <div className="af"><label>จบ วันที่</label><input type="date" name="endDt" className="ainput" value={formData.endDt} onChange={handleChange} /></div>
              <div className="af"><label>คนเย็บ (จริง)</label><input type="number" name="actSewers" className="ainput" placeholder="จำนวนคน" value={formData.actSewers} onChange={handleChange} /></div>
              <div className="af"><label>ใช้เวลา (จริง)</label><input type="number" name="actDays" className="ainput" placeholder="จำนวนวัน" value={formData.actDays} onChange={handleChange} /></div>
              <div className="af"><label>ตัว/ชั่วโมง</label><input type="text" name="actRate" className="ainput" placeholder="เฉลี่ยจบตัว" value={formData.actRate} onChange={handleChange} /></div>
              <div className="af"><label>ค่าแรงเย็บจริง</label><input type="number" name="actWage" className="ainput" placeholder="บาท" value={formData.actWage} onChange={handleChange} /></div>
              <div className="af" style={{gridColumn:'1/-1', marginTop:'6px'}}>
                <label>ประเมินทุนรวมตัด-แฟ็ก <span className="anote">(ใช้สำหรับอ้างอิง)</span></label>
                <input type="text" name="actTotal" className="ainput" style={{fontWeight:700, fontSize:'16px'}} value={formData.actTotal} onChange={handleChange} />
              </div>
            </div>
            <div style={{marginTop:'12px'}}>
              <div className="note-label">หมายเหตุการผลิตจริง</div>
              <textarea name="remark" className="ta" style={{minHeight:'60px'}} value={formData.remark} onChange={handleChange}></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="btns">
        <button className="btn-clear" onClick={clearForm}>🗑️ ล้างข้อมูล</button>
        <button className="btn-save" onClick={handleSaveClick}>📝 ตรวจสอบ & บันทึกใบดี</button>
      </div>

      <PreviewModal
        show={showPreview}
        data={previewData}
        onDataChange={setPreviewData}
        onSave={handleConfirmSave}
        onCancel={() => setShowPreview(false)}
      />
    </div>
  );
}
