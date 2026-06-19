/* src/utils/storage.js - ฟังก์ชันตัวช่วยสำหรับจัดการ Local Storage */

const STORAGE_KEY = 'acRec3';

export const getRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

export const saveRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const addRecord = (record) => {
  const records = getRecords();
  records.unshift(record);
  saveRecords(records);
  return records;
};

export const deleteRecord = (index) => {
  const records = getRecords();
  records.splice(index, 1);
  saveRecords(records);
  return records;
};
