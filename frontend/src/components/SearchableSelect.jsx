import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

function sortThaiFirst(arr) {
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
    // Guard against a redundant focus event re-firing while already open
    // (e.g. the browser auto-scrolling/refocusing the input to keep the
    // caret visible once typed text overflows its width) — that must not
    // wipe out whatever the user has already typed.
    if (isOpen) return;
    setQuery('');
    setHighlight(0);
    setIsOpen(true);
  };

  // addToMaster tells the caller whether this value should be written into
  // the shared master list/database (true for an explicit choice — clicking
  // an option, pressing Enter, clicking "+ เพิ่ม") or kept only on this one
  // field/row without touching master data (false — see commitOrClose below).
  const commit = (val, addToMaster = true) => {
    onChange(val, addToMaster);
    closeDropdown();
  };

  // Used by both blur and page-scroll below. If what's typed already matches
  // an existing option, select it — that's just finishing a filter, not data
  // entry. Brand-new custom text (not confirmed via Enter/"+ เพิ่ม") is still
  // kept as this field's value so it doesn't look lost on an accidental
  // click-away or scroll, but committed with addToMaster=false so it does
  // NOT get written into the shared master list/database — that must stay
  // an explicit action. Fields that don't allow custom values at all
  // (allowCustom=false, e.g. filter dropdowns) never soft-commit typed text.
  // Kept in a ref (refreshed every render) rather than as a useLayoutEffect
  // dependency, because the scroll/resize listeners below are only
  // re-subscribed when `isOpen` changes; if they closed over `highlight`/
  // `filtered` directly they'd keep seeing stale values from when the
  // dropdown first opened, not what's current.
  const commitOrClose = () => {
    if (!trimmedQuery) {
      closeDropdown();
    } else if (highlight < filtered.length && filtered[highlight] !== undefined) {
      commit(filtered[highlight]);
    } else if (allowCustom) {
      commit(trimmedQuery, false);
    } else {
      closeDropdown();
    }
  };
  const commitOrCloseRef = useRef(commitOrClose);
  commitOrCloseRef.current = commitOrClose;

  // handleBlur schedules commitOrCloseRef 150ms out (see below). If the row
  // this field belongs to gets deleted (e.g. "✕ ลบแถว") while that timer is
  // still pending, the callback would otherwise fire after unmount and try
  // to setState on a gone component — cancel it on unmount instead.
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    positionMenu();
    const handleScroll = (e) => {
      // Ignore scrolling inside the menu itself (e.g. mouse-wheel through
      // a long options list) — only close when an ancestor/the page scrolls.
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      commitOrCloseRef.current();
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
    // Clicking an option is handled via onMouseDown={preventDefault} on the
    // menu so it never reaches here. A real blur (click elsewhere, tab away)
    // must not silently throw away text the user already typed — commit it
    // (matching what Enter would do) instead of resetting to empty.
    closeTimer.current = setTimeout(() => commitOrCloseRef.current(), 150);
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
