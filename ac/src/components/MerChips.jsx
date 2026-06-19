/* src/components/MerChips.jsx - Component สำหรับเลือกสีของผู้ดูแล (Merchandiser) */
import React from 'react';
import { MER_COLORS } from '../constants';

export default function MerChips({ selected, onChange }) {
  const toggleMer = (color) => {
    if (selected.includes(color)) {
      onChange(selected.filter(c => c !== color));
    } else {
      onChange([...selected, color]);
    }
  };

  return (
    <div className="mer-row" id="mer-chips">
      {MER_COLORS.map(mer => {
        const isOn = selected.includes(mer.name);
        return (
          <div
            key={mer.name}
            className={`chip ${isOn ? 'on' : ''}`}
            style={{ background: mer.color }}
            title={mer.name}
            onClick={() => toggleMer(mer.name)}
          />
        );
      })}
    </div>
  );
}
