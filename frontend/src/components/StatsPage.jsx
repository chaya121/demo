import React, { useMemo, useState } from 'react';
import SearchableSelect from './SearchableSelect';

export default function StatsPage({ records }) {
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterMer, setFilterMer] = useState('');
  const [filterClothingType, setFilterClothingType] = useState('');

  // Each dropdown's choices narrow to whatever the *other two* filters
  // still allow (e.g. picking brand "E" leaves only the customers who
  // actually have an "E" record), without ever disabling a field — you
  // can still start from whichever one you like.
  const uniqueCustomers = useMemo(() => {
    const customers = new Set();
    records.forEach(r => {
      if (r.customer && (!filterBrand || r.brand === filterBrand) && (!filterMer || r.merText === filterMer)) {
        customers.add(r.customer);
      }
    });
    return Array.from(customers).sort((a, b) => a.localeCompare(b, 'th'));
  }, [records, filterBrand, filterMer]);

  const uniqueMers = useMemo(() => {
    const mers = new Set();
    records.forEach(r => {
      if (r.merText && (!filterCustomer || r.customer === filterCustomer) && (!filterBrand || r.brand === filterBrand)) {
        mers.add(r.merText);
      }
    });
    return Array.from(mers).sort((a, b) => a.localeCompare(b, 'th'));
  }, [records, filterCustomer, filterBrand]);

  const availableBrands = useMemo(() => {
    const brands = new Set();
    records.forEach(r => {
      if (r.brand && (!filterCustomer || r.customer === filterCustomer) && (!filterMer || r.merText === filterMer)) {
        brands.add(r.brand);
      }
    });
    return Array.from(brands).sort((a, b) => a.localeCompare(b, 'th'));
  }, [records, filterCustomer, filterMer]);

  const stats = useMemo(() => {
    const filteredRecords = records.filter(r => {
      const matchCustomer = !filterCustomer || r.customer === filterCustomer;
      const matchBrand = !filterBrand || r.brand === filterBrand;
      const matchMer = !filterMer || r.merText === filterMer;
      return matchCustomer && matchBrand && matchMer;
    });

    const tot = filteredRecords.length;
    let sTot = 0;
    let qTot = 0;
    const groups = {};
    const clothingTypeStats = {};

    filteredRecords.forEach(r => {
      const steps = r.steps || [];
      sTot += steps.length;
      qTot += parseInt(r.qty || 0, 10);
      
      const brand = r.brand || 'ไม่ระบุ';
      if (!groups[brand]) {
        groups[brand] = { count: 0, qty: 0, customers: new Set() };
      }
      groups[brand].count++;
      groups[brand].qty += parseInt(r.qty || 0, 10);
      if (r.customer) {
        groups[brand].customers.add(r.customer);
      }
      
      const clothingType = r.clothingType || 'ไม่ระบุ';
      if (!clothingTypeStats[clothingType]) {
        clothingTypeStats[clothingType] = { count: 0, totalSteps: 0 };
      }
      clothingTypeStats[clothingType].count++;
      clothingTypeStats[clothingType].totalSteps += steps.length;
    });

    const arr = Object.keys(groups)
      .map(k => ({ name: k, ...groups[k], customers: Array.from(groups[k].customers) }))
      .sort((a, b) => b.count - a.count);

    const clothingTypeArr = Object.keys(clothingTypeStats)
      .map(k => ({
        name: k,
        count: clothingTypeStats[k].count,
        avgSteps: clothingTypeStats[k].count ? (clothingTypeStats[k].totalSteps / clothingTypeStats[k].count).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalForms: tot,
      totalSteps: sTot,
      avgSteps: tot ? (sTot / tot).toFixed(1) : 0,
      totalQty: qTot,
      groupedStats: arr,
      clothingTypeStats: clothingTypeArr,
    };
  }, [records, filterCustomer, filterBrand, filterMer]);

  return (
    <div className="page active">
      <div className="stat-hdr" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px' }}>📊 สถิติการผลิต</h2>
        <p style={{ fontSize: '16px' }}>ข้อมูลรวมทั้งหมด</p>
      </div>
      
      <div className="stat-grid" style={{ marginBottom: '20px', width: '100%', gridTemplateColumns: '1fr' }}>
        <div className="stat-box" style={{ padding: '20px' }}>
          <div className="sn" style={{ fontSize: '36px' }}>{stats.totalForms}</div>
          <div className="sl" style={{ fontSize: '16px' }}>ใบขั้นตอนการผลิต</div>
        </div>
      </div>

      <div className="form-card" style={{ padding: '20px 22px' }}>
        <div className="sec-label" style={{ fontSize: '16px' }}>🔍 กรองข้อมูล</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>ลูกค้า</label>
            <SearchableSelect
              className="ssel-filter-lg"
              allowCustom={false}
              clearLabel="ทั้งหมด"
              options={uniqueCustomers}
              value={filterCustomer}
              placeholder="ทั้งหมด"
              onChange={setFilterCustomer}
            />
          </div>
          <div>
            <label style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>แบรนด์</label>
            <SearchableSelect
              className="ssel-filter-lg"
              allowCustom={false}
              clearLabel="ทั้งหมด"
              options={availableBrands}
              value={filterBrand}
              placeholder="ทั้งหมด"
              onChange={setFilterBrand}
            />
          </div>
          <div>
            <label style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Mer</label>
            <SearchableSelect
              className="ssel-filter-lg"
              allowCustom={false}
              clearLabel="ทั้งหมด"
              options={uniqueMers}
              value={filterMer}
              placeholder="ทั้งหมด"
              onChange={setFilterMer}
            />
          </div>
        </div>
        {(filterCustomer || filterBrand || filterMer) && (
          <div style={{ marginTop: '12px', fontSize: '15px', color: 'var(--primary)' }}>
            แสดง {stats.totalForms} รายการ
          </div>
        )}
      </div>

      <div className="form-card" style={{ padding: '20px 22px' }}>
        <div className="sec-label" style={{ fontSize: '16px' }}>👕 สถิติตามรุ่น / แบรนด์</div>
        
        {stats.groupedStats.length > 0 ? (
          <div>
            {stats.groupedStats.map((x, i) => (
              <div className="type-row" key={i} style={{ padding: '14px 0' }}>
                <div className="ic" style={{ fontSize: '28px' }}>👕</div>
                <div className="inf">
                  <div className="nm" style={{ fontSize: '16px' }}>{x.name}</div>
                  <div className="dt" style={{ fontSize: '14px' }}>ผลิต {x.qty.toLocaleString()} ตัว</div>
                  {x.customers.length > 0 && (
                    <div className="dt" style={{ fontSize: '14px', color: 'var(--muted)' }}>
                      ลูกค้า: {x.customers.join(', ')}
                    </div>
                  )}
                </div>
                <div className="type-badge">
                  <span className="tn" style={{ fontSize: '18px' }}>{x.count}</span>
                  <span className="tl" style={{ fontSize: '14px' }}>ใบ</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: '32px' }}>
            <div className="ei" style={{ fontSize: '48px' }}>📊</div>
            <p style={{ fontSize: '16px' }}>ยังไม่มีข้อมูล</p>
          </div>
        )}
      </div>

      <div className="form-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div className="sec-label" style={{ fontSize: '16px', marginBottom: 0 }}>🏷️ สถิติตามประเภทเสื้อผ้า</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>ดูเฉพาะ:</span>
            <SearchableSelect
              className="ssel-filter"
              allowCustom={false}
              clearLabel="ทั้งหมด"
              options={stats.clothingTypeStats.map(x => x.name)}
              value={filterClothingType}
              placeholder="ทั้งหมด"
              onChange={setFilterClothingType}
            />
          </div>
        </div>

        {stats.clothingTypeStats.length > 0 ? (
          <div>
            {stats.clothingTypeStats
              .filter(x => !filterClothingType || x.name === filterClothingType)
              .map((x, i) => (
              <div className="type-row" key={i} style={{ padding: '14px 0' }}>
                <div className="ic" style={{ fontSize: '28px' }}>👚</div>
                <div className="inf">
                  <div className="nm" style={{ fontSize: '16px' }}>{x.name}</div>
                  <div className="dt" style={{ fontSize: '14px' }}>เฉลี่ย {x.avgSteps} ขั้นตอน/ใบ</div>
                </div>
                <div className="type-badge">
                  <span className="tn" style={{ fontSize: '18px' }}>{x.count}</span>
                  <span className="tl" style={{ fontSize: '14px' }}>ใบ</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: '32px' }}>
            <div className="ei" style={{ fontSize: '48px' }}>🏷️</div>
            <p style={{ fontSize: '16px' }}>ยังไม่มีข้อมูลประเภทเสื้อผ้า</p>
          </div>
        )}
      </div>
    </div>
  );
}
