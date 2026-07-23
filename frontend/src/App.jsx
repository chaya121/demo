import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import FormPage from './components/FormPage';
import DownloadPage from './components/DownloadPage';
import StatsPage from './components/StatsPage';
import MasterPage from './components/MasterPage';
import PreviewModal from './components/PreviewModal';
import { api, migrateFromLocalStorage } from './api/client';

const DEF_STEPS = [];

const SEW_STEPS = [
  'เย็บต่อไหล่', 'เย็บติดปก', 'เย็บทับปก', 'เย็บติดสาบหน้า', 'เย็บติดสาบข้าง',
  'เย็บติดแขน', 'เย็บปิดข้าง', 'เย็บชายแขน', 'เย็บชายล่าง', 'เย็บต่อไหล่หลัง',
  'เย็บติดคอ', 'เย็บปิดคอ', 'เย็บทบคอ', 'ติดป้ายคอ', 'เย็บติดซิป', 'เย็บปิดซิป',
  'เย็บติดกระเป๋า', 'เย็บปากกระเป๋า', 'เย็บทับกระเป๋า', 'เย็บติดสายเอว',
  'เย็บพับชาย', 'เย็บม้วนชาย', 'เย็บติดยาง', 'เย็บดึงยาง', 'ถักรังดุม',
  'ติดกระดุม', 'ย้ำตะขอ', 'ย้ำสาย', 'ย้ำหูกางเกง', 'เย็บติดลูกไม้',
  'เย็บติดฟองน้ำ', 'รีดเก็บงาน', 'รีดวีรา', 'QC ตรวจสอบ', 'พับแพ็ค',
];

const MACHINE_LIST = [
  'จักรลา', 'จักรเข็มเดี่ยว', 'จักรเข็มคู่', 'จักรโพ้ง', 'โพ้ง', 'โพ้ง 4 เส้น',
  'จักรคัฟเวอร์', 'จักรซิกแซก', 'จักรติดกระดุม', 'เครื่องติดกระดุม',
  'จักรทำรังดุม', 'เครื่องรังดุม', 'จักรดึงยาง', 'จักรแท็ก (ย้ำ)',
  'จักรแพทเทิร์น', 'เตารีดไอน้ำ', 'เตารีด', '-',
];

const PART_LIST = [
  'ตัวหน้า', 'ตัวหลัง', 'ตัวหน้า/ตัวหลัง', 'ลำตัว', 'ปก', 'สาบหน้า', 'สาบข้าง',
  'แขนซ้าย', 'แขนขวา', 'แขน', 'ชายแขน', 'ชายเสื้อ', 'คอเสื้อ',
  'กระเป๋าหน้า', 'กระเป๋าหลัง', 'ปากกระเป๋า', 'ตัวกระเป๋า',
  'เอว', 'สายเอว', 'หูกางเกง', 'ขาใน', 'ขานอก', 'เป้า',
  'ซิป', 'ป้าย', 'ลูกไม้', 'ฟองน้ำ', 'ทั้งตัว',
];

const MER_LIST = [];
const BRAND_LIST = [];

const DEFAULT_MASTER = {
  mers: MER_LIST,
  brands: BRAND_LIST,
  parts: PART_LIST,
  steps: SEW_STEPS,
  machines: MACHINE_LIST
};

const createEmptyFormState = () => ({
  date: '',
  merText: '',
  brand: '',
  customer: '',
  model: '',
  clothingType: '',
  qty: '',
  size: '',
  colors: '',
  perColor: '',
  sampleReal: false,
  samplePic: false,
  detail: '',
  chk: {
    pak: false, pak_n: '',
    print: false, print_n: '',
    tag: false,
    big: false, big_n: '',
    rib: false,
    send: false, send_n: '',
    small: false, small_n: ''
  },
  imgs: [],
  noteProd: '',
  noteSales: '',
  supervisor: '',
  sewers: '',
  rate: '',
  estWage: '',
  confirmed: '',
  steps: JSON.parse(JSON.stringify(DEF_STEPS)),
  warning: '',
  solution: '',
  actual: {
    start: '',
    end: '',
    sewers: '',
    days: '',
    rate: '',
    wage: '',
    total: '',
    remark: ''
  }
});

export default function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [masterLists, setMasterLists] = useState(DEFAULT_MASTER);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState(createEmptyFormState);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, err: type === 'err' }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        await migrateFromLocalStorage(DEFAULT_MASTER);

        const [recordsData, masterData] = await Promise.all([
          api.getRecords(),
          api.getMaster(),
        ]);

        if (cancelled) return;

        setRecords(recordsData);
        setMasterLists(masterData || DEFAULT_MASTER);

        if (!masterData) {
          await api.saveMaster(DEFAULT_MASTER);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          showToast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณารัน npm run dev', 'err');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleUpdateMaster = async (type, newList) => {
    const updated = {
      ...masterLists,
      [type]: newList
    };
    setMasterLists(updated);
    try {
      await api.saveMaster(updated);
    } catch (err) {
      console.error(err);
      showToast('บันทึกข้อมูลหลักไม่สำเร็จ', 'err');
    }
  };

  const handleAddMasterItem = (type, val) => {
    const list = masterLists[type] || [];
    if (list.includes(val)) return;
    const updatedList = [...list, val];
    handleUpdateMaster(type, updatedList);
  };

  const handleClearForm = () => {
    setFormState(createEmptyFormState());
    setEditingId(null);
    showToast('ล้างฟอร์มแล้ว');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreview = () => {
    if (!formState.brand && !formState.customer && !formState.model) {
      showToast('กรุณาระบุ แบรนด์, ลูกค้า หรือ รุ่น', 'err');
      return;
    }

    let dispDate = '';
    if (formState.date) {
      const d = new Date(formState.date);
      if (!isNaN(d)) {
        dispDate = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    }

    const dataToPreview = {
      ...formState,
      dispDate,
    };

    setPreviewData(dataToPreview);
    setIsPreviewOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!previewData) return;

    try {
      if (editingId) {
        // Update existing record
        const updatedRecord = {
          ...previewData,
          id: editingId
        };
        const saved = await api.updateRecord(editingId, updatedRecord);
        setRecords(prev => prev.map(r => r.id === editingId ? saved : r));
        setEditingId(null);
        showToast(`แก้ไขข้อมูลสำเร็จ: ${saved.job_no || ''}`);
      } else {
        // Create new record
        const newRecord = {
          ...previewData,
          id: Date.now()
        };
        const saved = await api.createRecord(newRecord);
        setRecords(prev => [saved, ...prev]);
        showToast(`บันทึกสำเร็จ: เลขที่ ${saved.job_no || ''}`);
      }
      setIsPreviewOpen(false);
      setFormState(createEmptyFormState());
      setActiveTab('download');
    } catch (err) {
      console.error(err);
      showToast('บันทึกไม่สำเร็จ', 'err');
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await api.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast('ลบสำเร็จ');
    } catch (err) {
      console.error(err);
      showToast('ลบไม่สำเร็จ', 'err');
    }
  };

  const handleLoadRecord = (id) => {
    const r = records.find(rec => rec.id === id);
    if (!r) return;
    
    setEditingId(id);
    
    // Handle old grouped steps format if any
    let steps = [];
    if (r.steps && r.steps.length && r.steps[0].subSteps) {
      r.steps.forEach(g => {
        g.subSteps.forEach(s => {
          steps.push({
            part: g.part || '',
            step: s.action || '',
            machine: s.machine || '',
            time: 0,
            workers: 1,
            note: s.detail || ''
          });
        });
      });
    } else {
      steps = JSON.parse(JSON.stringify(r.steps || []));
    }

    setFormState({
      date: r.date || '',
      merText: r.merText || (r.mer && r.mer[0]) || '',
      brand: r.brand || '',
      customer: r.customer || '',
      model: r.model || '',
      qty: r.qty || '',
      size: r.size || '',
      colors: r.colors || '',
      perColor: r.perColor || '',
      sampleReal: !!r.sampleReal,
      samplePic: !!r.samplePic,
      detail: r.detail || '',
      chk: {
        pak: !!r.chk?.pak, pak_n: r.chk?.pak_n || '',
        print: !!r.chk?.print, print_n: r.chk?.print_n || '',
        tag: !!r.chk?.tag,
        big: !!r.chk?.big, big_n: r.chk?.big_n || '',
        rib: !!r.chk?.rib,
        send: !!r.chk?.send, send_n: r.chk?.send_n || '',
        small: !!r.chk?.small, small_n: r.chk?.small_n || ''
      },
      imgs: r.imgs || [],
      noteProd: r.noteProd || '',
      noteSales: r.noteSales || '',
      supervisor: r.supervisor || '',
      sewers: r.sewers || '',
      rate: r.rate || '',
      estWage: r.estWage || '',
      confirmed: r.confirmed || '',
      steps: steps,
      warning: r.warning || '',
      solution: r.solution || '',
      actual: {
        start: r.actual?.start || '',
        end: r.actual?.end || '',
        sewers: r.actual?.sewers || '',
        days: r.actual?.days || '',
        rate: r.actual?.rate || '',
        wage: r.actual?.wage || '',
        total: r.actual?.total || '',
        remark: r.actual?.remark || ''
      }
    });

    setActiveTab('form');
    showToast('โหลดข้อมูลเรียบร้อย');
  };

  return (
    <div>
      <Header />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {isLoading ? (
        <div className="wrap" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: 'var(--muted)' }}>กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</p>
        </div>
      ) : (
      <div className="wrap">
        {activeTab === 'form' && (
          <FormPage 
            formState={formState}
            setFormState={setFormState}
            masterLists={masterLists}
            onAddMasterItem={handleAddMasterItem}
            onClear={handleClearForm}
            onPreview={handlePreview}
          />
        )}
        {activeTab === 'download' && (
          <DownloadPage 
            records={records}
            onDelete={handleDeleteRecord}
            onLoad={handleLoadRecord}
            showToast={showToast}
          />
        )}
        {activeTab === 'stats' && (
          <StatsPage records={records} />
        )}
        {activeTab === 'master' && (
          <MasterPage 
            masterLists={masterLists}
            onUpdateMaster={handleUpdateMaster}
            showToast={showToast}
          />
        )}
      </div>
      )}

      <PreviewModal
        data={previewData}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.err ? 'err' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
