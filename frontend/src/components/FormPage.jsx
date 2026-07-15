import React from 'react';

export default function FormPage({
  formState,
  setFormState,
  masterLists,
  onAddMasterItem,
  onClear,
  onPreview
}) {

  const sortThaiFirst = (arr) => {
    const isThai = s => /^[\u0E00-\u0E7F]/.test(s || '');
    const thai = arr.filter(isThai).sort((a, b) => a.localeCompare(b, 'th'));
    const eng  = arr.filter(s => !isThai(s)).sort((a, b) => a.localeCompare(b, 'en'));
    return [...thai, ...eng];
  };

  const handleFieldChange = (field, val) => {
    setFormState(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormState(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleNestedCheckboxChange = (nestedField, checked) => {
    setFormState(prev => ({
      ...prev,
      chk: {
        ...prev.chk,
        [nestedField]: checked
      }
    }));
  };

  const handleNestedNoteChange = (nestedField, val) => {
    setFormState(prev => ({
      ...prev,
      chk: {
        ...prev.chk,
        [nestedField]: val
      }
    }));
  };

  const handleActualChange = (field, val) => {
    setFormState(prev => ({
      ...prev,
      actual: {
        ...prev.actual,
        [field]: val
      }
    }));
  };

  // ── Images ──
  const handleImagesUpload = (e) => {
    const files = [...e.target.files];
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormState(prev => ({
          ...prev,
          imgs: [...prev.imgs, event.target.result]
        }));
      };
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setFormState(prev => ({
      ...prev,
      imgs: prev.imgs.filter((_, i) => i !== idx)
    }));
  };

  // ── Step Table Logic ──
  const addStepRow = () => {
    setFormState(prev => ({
      ...prev,
      steps: [...prev.steps, { part: '', step: '', machine: '', time: 0, workers: 1, note: '' }]
    }));
  };

  const removeStepRow = (idx) => {
    setFormState(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx)
    }));
  };

  const updateStepField = (idx, field, val) => {
    setFormState(prev => {
      const newSteps = [...prev.steps];
      if (field === 'time') {
        newSteps[idx][field] = parseInt(val) || 0;
      } else if (field === 'workers') {
        newSteps[idx][field] = parseFloat(val) || 1;
      } else {
        newSteps[idx][field] = val;
      }
      return { ...prev, steps: newSteps };
    });
  };

  const handleSelectChange = (idx, field, val, isCustom, masterType) => {
    if (isCustom) {
      updateStepField(idx, field, val);
      onAddMasterItem(masterType, val);
    } else {
      updateStepField(idx, field, val);
    }
  };

  const secToMin = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}.${String(sec).padStart(2, '0')}`;
  };

  const getTotalWorkers = (rows) => {
    return rows.reduce((total, r) => total + (parseFloat(r.workers) || 0), 0);
  };

  const getMachineBreakdown = (rows) => {
    const map = {};
    rows.forEach(r => {
      const m = r.machine || '-';
      map[m] = (map[m] || 0) + 1;
    });
    return map;
  };

  const getTotalMachines = (rows) => {
    return rows.reduce((total, r) => total + (r.machine ? 1 : 0), 0);
  };

  const totalSec = formState.steps.reduce((s, r) => s + (parseInt(r.time) || 0), 0);
  const totalWorkers = getTotalWorkers(formState.steps);
  const machineBreakdown = getMachineBreakdown(formState.steps);
  const totalMachines = getTotalMachines(formState.steps);

  const sortedMers = sortThaiFirst(masterLists.mers || []);
  const sortedBrands = sortThaiFirst(masterLists.brands || []);
  const sortedClothingTypes = sortThaiFirst(masterLists.clothingTypes || []);

  const handleDropdownChange = (field, value, masterType) => {
    if (value === '__custom__') {
      const custom = prompt('พิมพ์ค่าที่ต้องการ:');
      if (custom && custom.trim()) {
        handleFieldChange(field, custom.trim());
        onAddMasterItem(masterType, custom.trim());
      }
    } else {
      handleFieldChange(field, value);
    }
  };

  const makeSelectElement = (list, value, idx, field, masterType) => {
    const base = list.includes(value) ? list : (value ? [value, ...list] : list);
    const sorted = sortThaiFirst(base);
    return (
      <select
        className="step-tbl-select"
        value={value}
        onChange={(e) => {
          if (e.target.value === '__custom__') {
            const custom = prompt('พิมพ์ค่าที่ต้องการ:');
            if (custom && custom.trim()) {
              handleSelectChange(idx, field, custom.trim(), true, masterType);
            }
          } else {
            handleSelectChange(idx, field, e.target.value, false, masterType);
          }
        }}
      >
        <option value="">-- เลือก --</option>
        {sorted.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value="__custom__">✏️ พิมพ์เอง...</option>
      </select>
    );
  };

  return (
    <div className="page active">
      {/* --- การ์ด หน้า 1 --- */}
      <div className="form-card" style={{ marginBottom: '20px' }}>
        <div className="form-titlebar">
          <div className="logo">Apparel<br />Creations</div>
          <div className="form-main-title">ใบขั้นตอนการผลิต</div>
          <div className="page-num">หน้า 1/2</div>
        </div>
        <div className="form-body">
          <div className="sec-label" style={{ fontSize: '16px', marginBottom: '12px' }}>📋 ข้อมูลพื้นฐาน</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="frow">
              <span className="flabel" style={{ fontSize: '14px' }}>วันที่ :</span>
              <input 
                type="date" 
                className="finput" 
                style={{ maxWidth: '160px', fontSize: '14px' }}
                value={formState.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
            </div>
            <div className="frow">
              <span className="flabel" style={{ fontSize: '14px' }}>Mer :</span>
              <select 
                className="finput" 
                style={{ maxWidth: '200px', fontSize: '14px' }}
                value={formState.merText}
                onChange={(e) => handleDropdownChange('merText', e.target.value, 'mers')}
              >
                <option value="">-- เลือก Mer --</option>
                {sortedMers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="__custom__">✏️ พิมพ์เอง...</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="frow">
              <span className="flabel" style={{ fontSize: '14px' }}>แบรนด์ :</span>
              <select 
                className="finput"
                style={{ fontSize: '14px' }}
                value={formState.brand}
                onChange={(e) => handleDropdownChange('brand', e.target.value, 'brands')}
              >
                <option value="">-- เลือกแบรนด์ --</option>
                {sortedBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="__custom__">✏️ พิมพ์เอง...</option>
              </select>
            </div>
            <div className="frow">
              <span className="flabel" style={{ fontSize: '14px' }}>ลูกค้า :</span>
              <input 
                type="text" 
                className="finput" 
                placeholder="ชื่อลูกค้า"
                style={{ fontSize: '14px' }}
                value={formState.customer}
                onChange={(e) => handleFieldChange('customer', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="frow">
              <span className="flabel" style={{ minWidth: '130px', fontSize: '14px' }}>ชื่อรุ่น (ถ้ามี) :</span>
              <input 
                type="text" 
                className="finput" 
                placeholder="เช่น Action Tee"
                style={{ fontSize: '14px' }}
                value={formState.model}
                onChange={(e) => handleFieldChange('model', e.target.value)}
              />
            </div>
            <div className="frow">
              <span className="flabel" style={{ minWidth: '130px', fontSize: '14px' }}>ประเภทเสื้อผ้า :</span>
              <select 
                className="finput"
                style={{ fontSize: '14px' }}
                value={formState.clothingType || ''}
                onChange={(e) => handleDropdownChange('clothingType', e.target.value, 'clothingTypes')}
              >
                <option value="">-- เลือกประเภท --</option>
                {sortedClothingTypes.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
                <option value="__custom__">✏️ พิมพ์เอง...</option>
              </select>
            </div>
          </div>

          <div className="sec-label" style={{ fontSize: '16px', marginBottom: '12px' }}>📦 ข้อมูลการผลิต</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="frow">
              <span className="flabel" style={{ minWidth: '130px', fontSize: '14px' }}>จำนวนผลิต :</span>
              <input 
                type="number" 
                className="finput" 
                style={{ width: '80px', flex: 'none', fontSize: '14px' }} 
                placeholder="300" 
                min="0"
                value={formState.qty}
                onChange={(e) => handleFieldChange('qty', e.target.value)}
              />
              <span className="unit" style={{ fontSize: '14px' }}>ตัว</span>
              <span className="flabel" style={{ minWidth: 'auto', marginLeft: '10px', fontSize: '14px' }}>ไซส์</span>
              <input 
                type="text" 
                className="finput" 
                style={{ maxWidth: '120px', fontSize: '14px' }} 
                placeholder="S-XL"
                value={formState.size}
                onChange={(e) => handleFieldChange('size', e.target.value)}
              />
            </div>
            <div className="frow">
              <span className="flabel" style={{ minWidth: '130px', fontSize: '14px' }}>จำนวนสี :</span>
              <input 
                type="number" 
                className="finput" 
                style={{ width: '80px', flex: 'none', fontSize: '14px' }} 
                placeholder="5" 
                min="0"
                value={formState.colors}
                onChange={(e) => handleFieldChange('colors', e.target.value)}
              />
              <span className="unit" style={{ fontSize: '14px' }}>สี ·</span>
              <input 
                type="number" 
                className="finput" 
                style={{ width: '80px', flex: 'none', fontSize: '14px' }} 
                placeholder="60" 
                min="0"
                value={formState.perColor}
                onChange={(e) => handleFieldChange('perColor', e.target.value)}
              />
              <span className="unit" style={{ fontSize: '14px' }}>ตัว/สี</span>
            </div>
          </div>

          <div className="frow" style={{ marginBottom: '16px' }}>
            <label className="ck" style={{ fontSize: '14px', marginRight: '20px' }}>
              <input 
                type="checkbox"
                checked={formState.sampleReal}
                onChange={(e) => handleCheckboxChange('sampleReal', e.target.checked)}
              /> 
              มีตัวอย่างจริง
            </label>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox"
                checked={formState.samplePic}
                onChange={(e) => handleCheckboxChange('samplePic', e.target.checked)}
              /> 
              ตีราคาจากรูป
            </label>
          </div>

          <div className="sec-label" style={{ fontSize: '16px', marginBottom: '8px' }}>📝 รายละเอียดงาน</div>
          <textarea 
            className="ta" 
            rows="2" 
            placeholder="รายละเอียดงาน..."
            style={{ fontSize: '14px', marginBottom: '16px' }}
            value={formState.detail}
            onChange={(e) => handleFieldChange('detail', e.target.value)}
          ></textarea>

          <div className="sec-label" style={{ fontSize: '16px', marginBottom: '8px' }}>➕ เพิ่มเติม</div>
          <div className="check-row" style={{ marginBottom: '16px' }}>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={formState.chk.pak} 
                onChange={(e) => handleNestedCheckboxChange('pak', e.target.checked)}
              /> 
              ปัก
              <input 
                className="ck-note" 
                type="text" 
                placeholder="จด"
                style={{ fontSize: '14px' }}
                value={formState.chk.pak_n}
                onChange={(e) => handleNestedNoteChange('pak_n', e.target.value)}
              />
            </label>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={formState.chk.print}
                onChange={(e) => handleNestedCheckboxChange('print', e.target.checked)}
              /> 
              พิมพ์
              <input 
                className="ck-note" 
                type="text" 
                placeholder="จด"
                style={{ fontSize: '14px' }}
                value={formState.chk.print_n}
                onChange={(e) => handleNestedNoteChange('print_n', e.target.value)}
              />
            </label>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={formState.chk.tag}
                onChange={(e) => handleNestedCheckboxChange('tag', e.target.checked)}
              /> 
              ตัวรีดป้ายไซส์
            </label>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={formState.chk.big}
                onChange={(e) => handleNestedCheckboxChange('big', e.target.checked)}
              /> 
              ตัวรีดใหญ่
              <input 
                className="ck-note" 
                type="text" 
                placeholder="จด"
                style={{ fontSize: '14px' }}
                value={formState.chk.big_n}
                onChange={(e) => handleNestedNoteChange('big_n', e.target.value)}
              />
            </label>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={formState.chk.rib}
                onChange={(e) => handleNestedCheckboxChange('rib', e.target.checked)}
              /> 
              รีดวีราเน่รองปัก
            </label>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={formState.chk.send}
                onChange={(e) => handleNestedCheckboxChange('send', e.target.checked)}
              /> 
              ส่งซัก
              <input 
                className="ck-note" 
                type="text" 
                placeholder="จด"
                style={{ fontSize: '14px' }}
                value={formState.chk.send_n}
                onChange={(e) => handleNestedNoteChange('send_n', e.target.value)}
              />
            </label>
            <label className="ck" style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={formState.chk.small}
                onChange={(e) => handleNestedCheckboxChange('small', e.target.checked)}
              /> 
              ตัวรีดเล็ก
              <input 
                className="ck-note" 
                type="text" 
                placeholder="จด"
                style={{ fontSize: '14px' }}
                value={formState.chk.small_n}
                onChange={(e) => handleNestedNoteChange('small_n', e.target.value)}
              />
            </label>
          </div>

          <div className="sec-hdr" style={{ fontSize: '16px', marginBottom: '12px' }}>📷 รูป และ รายละเอียดสินค้า</div>
          <div className="upload-zone" style={{ marginBottom: '16px' }}>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImagesUpload}
            />
            <div className="upload-icon" style={{ fontSize: '32px' }}>📷</div>
            <div className="upload-txt" style={{ fontSize: '14px' }}>กดเพื่อแนบรูปสินค้า</div>
            <div className="upload-hint" style={{ fontSize: '12px' }}>เพิ่มได้หลายรูป · JPG, PNG, HEIC</div>
          </div>
          <div className="img-grid" style={{ marginBottom: '16px' }}>
            {formState.imgs.map((img, i) => (
              <div className="img-thumb" key={i}>
                <img src={img} alt={`uploaded-${i}`} />
                <button className="del" onClick={() => removeImage(i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="two-col" style={{ marginBottom: '16px' }}>
            <div>
              <div className="note-label" style={{ fontSize: '14px' }}>📌 Note ฝ่ายผลิต</div>
              <textarea 
                className="ta" 
                rows="3" 
                placeholder="บันทึกฝ่ายผลิต..."
                style={{ fontSize: '14px' }}
                value={formState.noteProd}
                onChange={(e) => handleFieldChange('noteProd', e.target.value)}
              ></textarea>
            </div>
            <div>
              <div className="note-label" style={{ fontSize: '14px' }}>📌 Note ฝ่ายขาย</div>
              <textarea 
                className="ta" 
                rows="3" 
                placeholder="บันทึกฝ่ายขาย..."
                style={{ fontSize: '14px' }}
                value={formState.noteSales}
                onChange={(e) => handleFieldChange('noteSales', e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="sec-label" style={{ fontSize: '16px', marginBottom: '12px' }}>👥 ข้อมูลคนงานและราคา</div>
          <div className="two-col" style={{ marginBottom: '16px' }}>
            <div>
              <div className="frow">
                <span className="flabel" style={{ minWidth: '130px', fontSize: '14px' }}>จำนวนคนเย็บ :</span>
                <input 
                  type="number" 
                  className="finput" 
                  style={{ width: '80px', flex: 'none', fontSize: '14px' }} 
                  min="0"
                  value={formState.sewers}
                  onChange={(e) => handleFieldChange('sewers', e.target.value)}
                />
                <span className="unit" style={{ fontSize: '14px' }}>คน</span>
              </div>
              <div className="frow">
                <span className="flabel" style={{ minWidth: '130px', fontSize: '14px' }}>จำนวนตัว/ชม. :</span>
                <input 
                  type="number" 
                  className="finput" 
                  style={{ width: '80px', flex: 'none', fontSize: '14px' }} 
                  min="0"
                  value={formState.rate}
                  onChange={(e) => handleFieldChange('rate', e.target.value)}
                />
                <span className="unit" style={{ fontSize: '14px' }}>ตัว</span>
              </div>
              <div className="frow">
                <span className="flabel" style={{ minWidth: '130px', fontSize: '14px' }}>ประเมินค่าแรง :</span>
                <input 
                  type="number" 
                  className="finput" 
                  style={{ width: '80px', flex: 'none', fontSize: '14px' }} 
                  min="0"
                  value={formState.estWage}
                  onChange={(e) => handleFieldChange('estWage', e.target.value)}
                />
                <span className="unit" style={{ fontSize: '14px' }}>บาท</span>
              </div>
            </div>
            <div>
              <div className="note-label" style={{ fontSize: '14px' }}>✅ Confirmed ราคา/รายละเอียด</div>
              <textarea 
                className="ta" 
                rows="5" 
                placeholder="ราคาที่ confirmed..."
                style={{ fontSize: '14px' }}
                value={formState.confirmed}
                onChange={(e) => handleFieldChange('confirmed', e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* --- การ์ด หน้า 2 --- */}
      <div className="form-card" style={{ marginBottom: '20px' }}>
        <div className="form-titlebar">
          <div className="logo">Apparel<br />Creations</div>
          <div className="form-main-title">ขั้นตอนการเย็บ</div>
          <div className="page-num">หน้า 2/2</div>
        </div>
        <div className="form-body">
          <div className="sec-label" style={{ fontSize: '16px', marginBottom: '12px' }}>⚙️ ตารางขั้นตอนการผลิต</div>
          
          <div className="step-tbl-wrap" style={{ marginBottom: '16px' }}>
            <table className="step-tbl">
              <thead>
                <tr>
                  <th style={{ fontSize: '14px' }}>ลำดับ</th>
                  <th style={{ fontSize: '14px' }}>ชิ้นส่วน</th>
                  <th style={{ fontSize: '14px' }}>ขั้นตอนการเย็บ</th>
                  <th style={{ fontSize: '14px' }}>เครื่องจักร</th>
                  <th style={{ fontSize: '14px' }}>เวลา (วินาที)</th>
                  <th style={{ fontSize: '14px' }}>คนงาน</th>
                  <th style={{ fontSize: '14px' }}>หมายเหตุ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formState.steps.map((r, i) => (
                  <tr key={i}>
                    <td className="td-num" style={{ fontSize: '14px' }}>{i + 1}</td>
                    <td className="td-part">
                      {makeSelectElement(masterLists.parts || [], r.part || '', i, 'part', 'parts')}
                    </td>
                    <td className="td-act">
                      {makeSelectElement(masterLists.steps || [], r.step || '', i, 'step', 'steps')}
                    </td>
                    <td className="td-mac">
                      {makeSelectElement(masterLists.machines || [], r.machine || '', i, 'machine', 'machines')}
                    </td>
                    <td className="td-time">
                      <input 
                        className="step-tbl-input" 
                        type="number" 
                        min="0" 
                        style={{ fontSize: '14px' }}
                        value={r.time || ''} 
                        onChange={(e) => updateStepField(i, 'time', e.target.value)}
                      />
                    </td>
                    <td className="td-wrk">
                      <input 
                        className="step-tbl-input" 
                        type="number" 
                        min="0.5" 
                        step="0.5"
                        placeholder="0.5"
                        style={{ fontSize: '14px', width: '60px', textAlign: 'center' }}
                        value={r.workers || 1} 
                        onChange={(e) => updateStepField(i, 'workers', e.target.value)}
                      />
                    </td>
                    <td className="td-note">
                      <input 
                        className="step-tbl-input" 
                        value={r.note || ''} 
                        placeholder="หมายเหตุ" 
                        style={{ fontSize: '14px', width: '80px' }}
                        onChange={(e) => updateStepField(i, 'note', e.target.value)}
                      />
                    </td>
                    <td className="td-del">
                      <button 
                        className="step-delete" 
                        style={{ padding: '4px 8px', fontSize: '16px' }} 
                        onClick={() => removeStepRow(i)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f0f7ff' }}>
                  <td colSpan={3} style={{ padding: '5px 10px', textAlign: 'right', fontSize: '14px', color: 'var(--muted)' }}>👥 จำนวนคนงานทั้งหมด</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '14px', color: 'var(--primary)', fontWeight: '700' }}>{totalWorkers}</td>
                  <td colSpan={4} style={{ padding: '5px 8px', fontSize: '14px', color: 'var(--muted)' }}>คน</td>
                </tr>
                <tr style={{ background: '#f0f7ff' }}>
                  <td colSpan={3} style={{ padding: '5px 10px', textAlign: 'right', fontSize: '14px', color: 'var(--muted)' }}>⚙️ จักรที่ใช้ทั้งหมด</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '14px', color: 'var(--primary)', fontWeight: '700' }}>{totalMachines}</td>
                  <td colSpan={4} style={{ padding: '5px 8px', fontSize: '14px', color: 'var(--muted)' }}>เครื่อง</td>
                </tr>
                {Object.entries(machineBreakdown).map(([m, count]) => (
                  <tr style={{ background: '#f0f7ff' }} key={m}>
                    <td colSpan={3} style={{ padding: '5px 10px', textAlign: 'right', fontSize: '14px', color: 'var(--muted)' }}>└─ {m}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '14px', color: 'var(--primary)', fontWeight: '700' }}>{count}</td>
                    <td colSpan={4} style={{ padding: '5px 8px', fontSize: '14px', color: 'var(--muted)' }}>เครื่อง</td>
                  </tr>
                ))}
                <tr className="step-tbl-total" style={{ borderTop: '2.5px solid var(--tan)' }}>
                  <td colSpan={3} style={{ textAlign: 'right', fontSize: '14px' }}>⏱️ รวมทั้งหมด</td>
                  <td style={{ textAlign: 'center', fontSize: '14px', color: 'var(--primary)' }}>{secToMin(totalSec)}</td>
                  <td colSpan={4} style={{ fontSize: '14px', color: 'var(--muted)' }}>นาที ({totalSec} วิ)</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button className="add-step-btn" style={{ fontSize: '14px', marginBottom: '16px' }} onClick={addStepRow}>➕ เพิ่มแถวขั้นตอน</button>
          
          <div className="wf-wrap" style={{ marginBottom: '16px' }}>
            <div className="wf-box">
              <div className="wf-hdr warn" style={{ fontSize: '14px' }}>ข้อควรระวัง</div>
              <textarea 
                className="wfta" 
                placeholder="บันทึกข้อควรระวัง..."
                style={{ fontSize: '14px' }}
                value={formState.warning}
                onChange={(e) => handleFieldChange('warning', e.target.value)}
              ></textarea>
            </div>
            <div className="wf-box">
              <div className="wf-hdr fix" style={{ fontSize: '14px' }}>วิธีแก้ไข</div>
              <textarea 
                className="wfta" 
                placeholder="บันทึกวิธีแก้ไข..."
                style={{ fontSize: '14px' }}
                value={formState.solution}
                onChange={(e) => handleFieldChange('solution', e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="actual-wrap">
            <div className="actual-hdr" style={{ fontSize: '16px', marginBottom: '12px' }}>ผลิตจริง</div>
            <div className="actual-grid">
              <div className="af">
                <label style={{ fontSize: '14px' }}>เริ่มเย็บ วันที่/เวลา</label>
                <input 
                  type="datetime-local" 
                  className="ainput"
                  style={{ fontSize: '14px' }}
                  value={formState.actual.start}
                  onChange={(e) => handleActualChange('start', e.target.value)}
                />
              </div>
              <div className="af">
                <label style={{ fontSize: '14px' }}>จบ วันที่</label>
                <input 
                  type="datetime-local" 
                  className="ainput"
                  style={{ fontSize: '14px' }}
                  value={formState.actual.end}
                  onChange={(e) => handleActualChange('end', e.target.value)}
                />
              </div>
              <div className="af">
                <label style={{ fontSize: '14px' }}>จำนวนคนเย็บ</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="number" 
                    className="ainput" 
                    min="0" 
                    style={{ maxWidth: '70px', fontSize: '14px' }}
                    value={formState.actual.sewers}
                    onChange={(e) => handleActualChange('sewers', e.target.value)}
                  />
                  <span className="unit" style={{ fontSize: '14px' }}>คน · ใช้เวลา</span>
                  <input 
                    type="number" 
                    className="ainput" 
                    min="0" 
                    style={{ maxWidth: '60px', fontSize: '14px' }}
                    value={formState.actual.days}
                    onChange={(e) => handleActualChange('days', e.target.value)}
                  />
                  <span className="unit" style={{ fontSize: '14px' }}>วัน</span>
                </div>
              </div>
              <div className="af">
                <label style={{ fontSize: '14px' }}>ตัว/ชั่วโมง</label>
                <input 
                  type="number" 
                  className="ainput" 
                  min="0"
                  style={{ fontSize: '14px' }}
                  value={formState.actual.rate}
                  onChange={(e) => handleActualChange('rate', e.target.value)}
                />
                <div className="anote" style={{ fontSize: '12px' }}>*เฉลี่ยจบตัว*</div>
              </div>
              <div className="af">
                <label style={{ fontSize: '14px' }}>ค่าแรงเย็บจริง</label>
                <input 
                  type="number" 
                  className="ainput" 
                  min="0"
                  style={{ fontSize: '14px' }}
                  value={formState.actual.wage}
                  onChange={(e) => handleActualChange('wage', e.target.value)}
                />
                <div className="anote" style={{ fontSize: '12px' }}>*ไม่รวม ตัด QC รีด แฟ็ก*</div>
              </div>
              <div className="af">
                <label style={{ fontSize: '14px' }}>ประเมินทุนรวมตัด-แฟ็ก</label>
                <input 
                  type="number" 
                  className="ainput" 
                  min="0"
                  style={{ fontSize: '14px' }}
                  value={formState.actual.total}
                  onChange={(e) => handleActualChange('total', e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <div className="note-label" style={{ fontSize: '14px' }}>หมายเหตุ</div>
              <textarea 
                className="ta" 
                rows="2" 
                placeholder="หมายเหตุ..."
                style={{ fontSize: '14px' }}
                value={formState.actual.remark}
                onChange={(e) => handleActualChange('remark', e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="btns">
        <button className="btn-clear" onClick={onClear}>🗑 ล้างฟอร์ม</button>
        <button className="btn-save" onClick={onPreview}>👁 ดูตัวอย่าง / บันทึก</button>
      </div>
    </div>
  );
}
