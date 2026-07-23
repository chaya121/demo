import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function MasterPage({ masterLists, onUpdateMaster, showToast }) {
  const categories = [
    { type: 'mers', label: 'Mer', icon: '🎨', placeholder: 'เพิ่ม Mer ใหม่...' },
    { type: 'brands', label: 'แบรนด์ (Brand)', icon: '🏷️', placeholder: 'เพิ่มแบรนด์ใหม่...' },
    { type: 'types', label: 'ประเภท (Type)', icon: '📁', placeholder: 'เพิ่มประเภทใหม่...' },
    { type: 'parts', label: 'ชิ้นส่วน (Parts)', icon: '🧩', placeholder: 'เพิ่มชิ้นส่วนใหม่...' },
    { type: 'steps', label: 'ขั้นตอนการเย็บ (Sewing Operations)', icon: '🧵', placeholder: 'เพิ่มขั้นตอนใหม่...' },
    { type: 'machines', label: 'เครื่องจักร (Machines)', icon: '🔧', placeholder: 'เพิ่มเครื่องจักรใหม่...' },
  ];

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          showToast('ไม่พบข้อมูลในไฟล์ Excel', 'err');
          return;
        }

        const firstRow = json[0];
        const keys = Object.keys(firstRow);

        const machineKey = keys.find(k => ['เครื่องจักร', 'machine', 'machines', 'เครื่อง'].includes(k.toLowerCase().trim()));
        const stepKey = keys.find(k => ['ขั้นตอน', 'ขั้นตอนการเย็บ', 'step', 'steps', 'operation', 'operations'].includes(k.toLowerCase().trim()));
        const partKey = keys.find(k => ['ชิ้นส่วน', 'part', 'parts'].includes(k.toLowerCase().trim()));
        const merKey = keys.find(k => ['mer', 'mers', 'merchandiser', 'ผู้ประสานงาน'].includes(k.toLowerCase().trim()));
        const brandKey = keys.find(k => ['แบรนด์', 'brand', 'brands'].includes(k.toLowerCase().trim()));
        const typeKey = keys.find(k => ['ประเภท', 'type', 'types'].includes(k.toLowerCase().trim()));

        const importedMers = [];
        const importedBrands = [];
        const importedTypes = [];
        const importedParts = [];
        const importedSteps = [];
        const importedMachines = [];

        json.forEach(row => {
          if (merKey && row[merKey]) {
            const v = String(row[merKey]).trim();
            if (v && !importedMers.includes(v)) importedMers.push(v);
          }
          if (brandKey && row[brandKey]) {
            const v = String(row[brandKey]).trim();
            if (v && !importedBrands.includes(v)) importedBrands.push(v);
          }
          if (typeKey && row[typeKey]) {
            const v = String(row[typeKey]).trim();
            if (v && !importedTypes.includes(v)) importedTypes.push(v);
          }
          if (partKey && row[partKey]) {
            const v = String(row[partKey]).trim();
            if (v && !importedParts.includes(v)) importedParts.push(v);
          }
          if (stepKey && row[stepKey]) {
            const v = String(row[stepKey]).trim();
            if (v && !importedSteps.includes(v)) importedSteps.push(v);
          }
          if (machineKey && row[machineKey]) {
            const v = String(row[machineKey]).trim();
            if (v && !importedMachines.includes(v)) importedMachines.push(v);
          }
        });

        let summary = [];
        if (importedMers.length) {
          const updated = [...new Set([...(masterLists.mers || []), ...importedMers])];
          onUpdateMaster('mers', updated);
          summary.push(`Mer +${importedMers.length}`);
        }
        if (importedBrands.length) {
          const updated = [...new Set([...(masterLists.brands || []), ...importedBrands])];
          onUpdateMaster('brands', updated);
          summary.push(`แบรนด์ +${importedBrands.length}`);
        }
        if (importedTypes.length) {
          const updated = [...new Set([...(masterLists.types || []), ...importedTypes])];
          onUpdateMaster('types', updated);
          summary.push(`ประเภท +${importedTypes.length}`);
        }
        if (importedParts.length) {
          const updated = [...new Set([...(masterLists.parts || []), ...importedParts])];
          onUpdateMaster('parts', updated);
          summary.push(`ชิ้นส่วน +${importedParts.length}`);
        }
        if (importedSteps.length) {
          const updated = [...new Set([...(masterLists.steps || []), ...importedSteps])];
          onUpdateMaster('steps', updated);
          summary.push(`ขั้นตอน +${importedSteps.length}`);
        }
        if (importedMachines.length) {
          const updated = [...new Set([...(masterLists.machines || []), ...importedMachines])];
          onUpdateMaster('machines', updated);
          summary.push(`เครื่องจักร +${importedMachines.length}`);
        }

        if (summary.length > 0) {
          showToast(`นำเข้าสำเร็จ: ${summary.join(', ')}`);
        } else {
          showToast('ไม่พบข้อมูลตามหัวข้อคอลัมน์ที่กำหนดใน Excel', 'err');
        }
      } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการอ่านไฟล์', 'err');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  return (
    <div className="page active">
      <div className="stat-hdr">
        <h2>⚙️ ข้อมูลหลัก</h2>
        <p>จัดการรายการ Mer · แบรนด์ · ชิ้นส่วน · ขั้นตอน · เครื่องจักร</p>
      </div>

      <div style={{ padding: '0 8px 24px' }}>
        <div className="form-card" style={{ padding: '16px 18px', marginBottom: '20px' }}>
          <div className="sec-label">📥 นำเข้าข้อมูลการตั้งค่าจาก Excel / CSV</div>
          <div className="upload-zone" style={{ minHeight: '100px', borderStyle: 'dashed', marginTop: '8px' }}>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
            />
            <div className="upload-icon" style={{ fontSize: '28px' }}>📊</div>
            <div className="upload-txt" style={{ fontSize: '14px' }}>เลือกไฟล์ Excel / CSV เพื่อนำเข้าข้อมูลหลัก</div>
            <div className="upload-hint" style={{ fontSize: '11px', marginTop: '4px' }}>
              หัวคอลัมน์ที่รองรับ: เครื่องจักร, ขั้นตอนการเย็บ, ชิ้นส่วน, Mer, แบรนด์
            </div>
          </div>
        </div>

        {categories.map(cat => (
          <MasterListSection
            key={cat.type}
            type={cat.type}
            label={cat.label}
            icon={cat.icon}
            placeholder={cat.placeholder}
            list={masterLists[cat.type] || []}
            onUpdate={(newList) => onUpdateMaster(cat.type, newList)}
            showToast={showToast}
          />
        ))}
      </div>
    </div>
  );
}

function MasterListSection({ type, label, icon, placeholder, list, onUpdate, showToast }) {
  const [newValue, setNewValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState('');
  const [deletingIndex, setDeletingIndex] = useState(-1);

  const handleAdd = () => {
    const val = newValue.trim();
    if (!val) {
      showToast('กรุณาใส่ชื่อ', 'err');
      return;
    }
    if (list.includes(val)) {
      showToast('มีรายการนี้อยู่แล้ว', 'err');
      return;
    }
    const updated = [...list, val];
    onUpdate(updated);
    setNewValue('');
    showToast(`เพิ่ม "${val}" สำเร็จ ✓`);
  };

  const handleStartEdit = (idx, currentVal) => {
    setEditingIndex(idx);
    setEditingValue(currentVal);
  };

  const handleSaveEdit = (idx) => {
    const val = editingValue.trim();
    if (!val) {
      showToast('กรุณาใส่ชื่อ', 'err');
      return;
    }
    const updated = [...list];
    updated[idx] = val;
    onUpdate(updated);
    setEditingIndex(-1);
    showToast('แก้ไขสำเร็จ ✓');
  };

  const handleConfirmDelete = (idx) => {
    const val = list[idx];
    const updated = list.filter((_, i) => i !== idx);
    onUpdate(updated);
    setDeletingIndex(-1);
    showToast(`ลบ "${val}" สำเร็จ`);
  };

  return (
    <div className="form-card" style={{ padding: '16px 18px', marginBottom: '16px' }}>
      <div className="sec-label">{icon} {label}</div>
      
      <div className="master-list">
        {list.length > 0 ? (
          list.map((item, idx) => (
            <div className="master-item" key={idx}>
              <span className="master-item-icon">{icon}</span>
              
              {editingIndex === idx ? (
                <input
                  className="master-item-name-edit"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(idx);
                    if (e.key === 'Escape') setEditingIndex(-1);
                  }}
                  autoFocus
                />
              ) : (
                <span className="master-item-name">{item}</span>
              )}

              <div className="master-item-btns">
                {editingIndex === idx ? (
                  <>
                    <button className="master-save-btn" onClick={() => handleSaveEdit(idx)}>💾 บันทึก</button>
                    <button className="master-del-btn" onClick={() => setEditingIndex(-1)}>✕ ยกเลิก</button>
                  </>
                ) : deletingIndex === idx ? (
                  <>
                    <span style={{ fontSize: '14px', color: '#c0392b', fontWeight: '600', alignSelf: 'center' }}>ลบแน่ใจ?</span>
                    <button 
                      className="master-del-btn" 
                      style={{ background: '#c0392b', color: '#fff', borderColor: '#c0392b' }}
                      onClick={() => handleConfirmDelete(idx)}
                    >
                      ✓ ลบ
                    </button>
                    <button className="master-edit-btn" onClick={() => setDeletingIndex(-1)}>✕ ยกเลิก</button>
                  </>
                ) : (
                  <>
                    <button className="master-edit-btn" onClick={() => handleStartEdit(idx, item)}>✏️ แก้ไข</button>
                    <button className="master-del-btn" onClick={() => setDeletingIndex(idx)}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="master-empty">ยังไม่มีรายการ</div>
        )}
      </div>

      <div className="master-add-row">
        <input
          className="master-inp"
          type="text"
          placeholder={placeholder}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
        />
        <button className="master-add-btn" onClick={handleAdd}>+ เพิ่ม</button>
      </div>
    </div>
  );
}
