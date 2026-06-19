/* src/components/Toast.jsx - ป๊อปอัปแจ้งเตือนการทำงานต่างๆ เช่น บันทึกสำเร็จ */
import React, { useEffect, useState } from 'react';

export default function Toast({ message, isError, onClear }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClear, 300); // Wait for transition
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  return (
    <div className={`toast ${isError ? 'err' : ''} ${!visible ? 'hidden' : ''}`}>
      {message}
    </div>
  );
}
