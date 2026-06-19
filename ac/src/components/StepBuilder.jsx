/* src/components/StepBuilder.jsx - ตัวจัดการและแสดงขั้นตอนการทำงานย่อยๆ */
import React, { useState } from 'react';
import { DEF_ACTIONS, DEF_PARTS, DEF_DIRS, DEF_SIZES } from '../constants';

function TokenSequence({ tokens, updateText, removeToken }) {
  return (
    <div className="token-builder-wrap">
      <div className="token-builder-hdr">✏️ ลำดับประโยคการเย็บ</div>
      <div className="token-seq">
        {tokens.map((tok, i) => {
          if (tok.type === 'tag') {
            return (
              <span key={tok.id} className={`pv-stag ${tok.cat} builder-tag`}>
                {tok.val}
                <button className="tag-x-btn" onClick={() => removeToken(tok.id)}>✕</button>
              </span>
            );
          } else {
            return (
              <input
                key={tok.id}
                className="text-token-input"
                value={tok.val}
                onChange={(e) => updateText(tok.id, e.target.value)}
                placeholder={tokens.length === 1 ? "พิมพ์ข้อความ หรือกดปุ่มด้านล่างเพื่อแทรกคำ..." : ""}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

function TagGroup({ step, cat, custField, defs, label, icon, ph, onAddTag, onAddCust, onRmCust }) {
  const all = [...defs, ...(step[custField] || [])];
  const [inpValue, setInpValue] = useState('');

  const handleAdd = () => {
    if (!inpValue.trim()) return;
    onAddCust(step.id, custField, inpValue.trim());
    setInpValue('');
  };

  return (
    <div className="tag-group">
      <div className="grp-label">{icon} {label}</div>
      <div className="tags">
        {all.map(t => {
          const isC = (step[custField] || []).includes(t);
          return (
            <span key={t} className="tag" onClick={() => onAddTag(step.id, cat, t)}>
              {t}
              {isC && (
                <button
                  className="tag-x"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRmCust(step.id, custField, t);
                  }}
                >
                  ✕
                </button>
              )}
            </span>
          );
        })}
      </div>
      <div className="add-tag-row">
        <input
          className="add-tag-input"
          type="text"
          placeholder={ph}
          value={inpValue}
          onChange={(e) => setInpValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button className="add-tag-btn" onClick={handleAdd}>+ เพิ่ม</button>
      </div>
    </div>
  );
}

export default function StepBuilder({ steps, setSteps }) {
  const addStep = () => {
    const newStep = {
      id: Date.now() + Math.random(),
      tokens: [{ id: Date.now() + Math.random(), type: 'text', val: '' }],
      cAction: [], cPart: [], cDir: [], cSize: [],
      detail: ''
    };
    setSteps([...steps, newStep]);
  };

  const rmStep = (id) => setSteps(steps.filter(s => s.id !== id));

  const updateDetail = (id, detail) => {
    setSteps(steps.map(s => s.id === id ? { ...s, detail } : s));
  };

  const addTagToStep = (stepId, cat, val) => {
    setSteps(steps.map(s => {
      if (s.id !== stepId) return s;
      return {
        ...s,
        tokens: [
          ...(s.tokens || []),
          { id: Date.now() + Math.random(), type: 'tag', cat, val },
          { id: Date.now() + Math.random(), type: 'text', val: '' }
        ]
      };
    }));
  };

  const updateText = (stepId, tokenId, val) => {
    setSteps(steps.map(s => {
      if (s.id !== stepId) return s;
      return {
        ...s,
        tokens: (s.tokens || []).map(t => t.id === tokenId ? { ...t, val } : t)
      };
    }));
  };

  const removeToken = (stepId, tokenId) => {
    setSteps(steps.map(s => {
      if (s.id !== stepId) return s;
      const newTokens = (s.tokens || []).filter(t => t.id !== tokenId);
      const merged = [];
      newTokens.forEach(t => {
        if (t.type === 'text' && merged.length > 0 && merged[merged.length - 1].type === 'text') {
          merged[merged.length - 1].val += ' ' + t.val;
        } else {
          merged.push(t);
        }
      });
      if (merged.length === 0 || merged[0].type === 'tag') {
        merged.unshift({ id: Date.now() + Math.random(), type: 'text', val: '' });
      }
      if (merged[merged.length - 1].type === 'tag') {
        merged.push({ id: Date.now() + Math.random(), type: 'text', val: '' });
      }
      return { ...s, tokens: merged };
    }));
  };

  const addCust = (id, cust, val) => {
    setSteps(steps.map(s => {
      if (s.id !== id) return s;
      if ((s[cust] || []).includes(val)) return s;
      return {
        ...s,
        [cust]: [...(s[cust] || []), val]
      };
    }));
  };

  const rmCust = (id, cust, val) => {
    setSteps(steps.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        [cust]: (s[cust] || []).filter(v => v !== val)
      };
    }));
  };

  return (
    <div>
      <div id="stepContainer">
        {steps.map((s, i) => (
          <div key={s.id} className="step-card">
            <div className="step-header">
              <span className="step-num">ขั้นตอนที่ {i + 1}</span>
              <button className="step-delete" onClick={() => rmStep(s.id)}>✕ ลบ</button>
            </div>
            
            <TokenSequence tokens={s.tokens || []} updateText={(tid, v) => updateText(s.id, tid, v)} removeToken={(tid) => removeToken(s.id, tid)} />

            <div className="step-body">
              <TagGroup step={s} cat="a" custField="cAction" defs={DEF_ACTIONS} label="ประเภทการกระทำ" icon="🔧" ph="เพิ่มการกระทำใหม่..." onAddTag={addTagToStep} onAddCust={addCust} onRmCust={rmCust} />
              <div className="grp-sep"></div>
              <TagGroup step={s} cat="p" custField="cPart" defs={DEF_PARTS} label="ชิ้นส่วนที่เกี่ยวข้อง" icon="🧩" ph="เพิ่มชิ้นส่วนใหม่..." onAddTag={addTagToStep} onAddCust={addCust} onRmCust={rmCust} />
              <div className="grp-sep"></div>
              <TagGroup step={s} cat="d" custField="cDir" defs={DEF_DIRS} label="ทิศทาง / ตำแหน่ง" icon="📐" ph="เพิ่มตำแหน่งใหม่..." onAddTag={addTagToStep} onAddCust={addCust} onRmCust={rmCust} />
              <div className="grp-sep"></div>
              <TagGroup step={s} cat="z" custField="cSize" defs={DEF_SIZES} label="ขนาด / จำนวน" icon="📏" ph="เช่น ¼, 2 นิ้ว..." onAddTag={addTagToStep} onAddCust={addCust} onRmCust={rmCust} />
              <div className="grp-sep"></div>
              <div className="tag-group">
                <div className="grp-label">✏️ รายละเอียดเพิ่มเติม (ส่วนท้ายสุด)</div>
                <textarea
                  className="step-detail-input"
                  rows="2"
                  placeholder="พิมพ์หรือแก้ไขรายละเอียดเพิ่มเติม (ต่อท้ายประโยค)"
                  value={s.detail || ''}
                  onChange={(e) => updateDetail(s.id, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="add-step-btn" onClick={addStep}>
        <span style={{ fontSize: '22px' }}>+</span> เพิ่มขั้นตอน
      </button>
    </div>
  );
}
