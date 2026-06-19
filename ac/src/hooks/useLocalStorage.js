/* src/hooks/useLocalStorage.js - Custom React Hook สำหรับซิงค์ state กับ localStorage อัตโนมัติ */
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // เริ่มต้น state โดยอ่านจาก localStorage ก่อน ถ้าไม่มีให้ใช้ค่า initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage', error);
      return initialValue;
    }
  });

  // ฟังก์ชันอัปเดต state และเซฟลง localStorage พร้อมๆ กัน
  const setValue = (value) => {
    try {
      // ให้รองรับการอัปเดตแบบฟังก์ชัน (เหมือน useState ปกติ)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('Error setting localStorage', error);
    }
  };

  return [storedValue, setValue];
}
