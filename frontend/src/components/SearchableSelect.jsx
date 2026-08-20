import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export function sortThaiFirst(arr) {
  const isThai = s => /^[฀-๿]/.test(s || '');
  const thai = arr.filter(isThai).sort((a, b) => a.localeCompare(b, 'th'));
  const eng = arr.filter(s => !isThai(s)).sort((a, b) => a.localeCompare(b, 'en'));
  return [...thai, ...eng];
}

// Combobox: type to filter an existing list, or type a value that isn't
// in the list yet to add it (caller decides what "new" means via onChange).
export default function SearchableSelect({
  value,
  options = [],
  onChange,
  placeholder = '-- เลือก --',
  className = '',
  style,
  disabled = false,
  allowCustom = true,
  clearLabel = '✕ ล้างค่า',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [menuStyle, setMenuStyle] = useState(null);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);

  const sortedOptions = useMemo(() => {
    const base = value && !options.includes(value) ? [value, ...options] : options;
    return sortThaiFirst(base);
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedOptions;
    return sortedOptions.filter(o => o.toLowerCase().includes(q));
  }, [sortedOptions, query]);

  const trimmedQuery = query.trim();
  const exactMatch = filtered.some(o => o.toLowerCase() === trimmedQuery.toLowerCase());
  const showAddNew = allowCustom && trimmedQuery.length > 0 && !exactMatch;

  const positionMenu = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxWidth = window.innerWidth - rect.left - 8;
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 2,
      left: rect.left,
      width: Math.min(Math.max(rect.width, 180), maxWidth),
      zIndex: 2000,
    });
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery('');
  };

  const openDropdown = () => {
    if (disabled) return;
    clearTimeout(closeTimer.current);
    setQuery('');
    setHighlight(0);
    setIsOpen(true);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    positionMenu();
    const handleScroll = (e) => {
      // Ignore scrolling inside the menu itself (e.g. mouse-wheel through
      // a long options list) — only close when an ancestor/the page scrolls.
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      closeDropdown();
    };
    // Resize alone should NOT close the dropdown — on touch devices, opening
    // the on-screen keyboard to type fires a resize event, and closing here
    // would silently discard whatever the user had just typed. Just move
    // the menu to match the new layout instead.
    const handleResize = () => positionMenu();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const commit = (val) => {
    onChange(val);
    closeDropdown();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    const total = filtered.length + (showAddNew ? 1 : 0);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlight < filtered.length && filtered[highlight] !== undefined) {
        commit(filtered[highlight]);
      } else if (showAddNew) {
        commit(trimmedQuery);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  };

  const handleBlur = () => {
    closeTimer.current = setTimeout(closeDropdown, 150);
  };

  return (
    <div className={`ssel ${className}`.trim()} style={style} ref={wrapRef}>
      <input
        className="ssel-input"
        type="text"
        value={isOpen ? query : (value || '')}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={openDropdown}
        onClick={() => { if (!isOpen) openDropdown(); }}
        onChange={(e) => { setQuery(e.target.value); setHighlight(0); if (!isOpen) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {isOpen && menuStyle && createPortal(
        <div className="ssel-menu" style={menuStyle} ref={menuRef} onMouseDown={(e) => e.preventDefault()}>
          {value && (
            <div className="ssel-opt ssel-clear" onClick={() => commit('')}>{clearLabel}</div>
          )}
          {filtered.map((o, i) => (
            <div
              key={o}
              className={`ssel-opt ${i === highlight ? 'hl' : ''} ${o === value ? 'sel' : ''}`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => commit(o)}
            >
              {o}
            </div>
          ))}
          {filtered.length === 0 && !showAddNew && (
            <div className="ssel-empty">ไม่พบรายการ</div>
          )}
          {showAddNew && (
            <div
              className={`ssel-opt ssel-new ${highlight === filtered.length ? 'hl' : ''}`}
              onMouseEnter={() => setHighlight(filtered.length)}
              onClick={() => commit(trimmedQuery)}
            >
              ➕ เพิ่ม "{trimmedQuery}"
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
