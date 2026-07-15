export function generatePDF(record, onStart, onSuccess, onError) {
  if (onStart) onStart();
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups for this website.');
    }

    const esc = (s) => s || '-';

    const rtf = (v, def = '-') => {
      return v ? v : `<span class="pv-blank">${def}</span>`;
    };

    const tf = (v, wide = false) => {
      return wide ? `<div class="pv-tb ${v ? 'pv-tb-val' : 'pv-tb-empty'}">${v ? v : 'ไม่มีข้อมูล'}</div>`
                  : `<div class="pv-fval ${!v ? 'empty' : ''}">${v ? v : '-'}</div>`;
    };

    const formatDateTime = (dstr) => {
      if (!dstr) return '';
      const d = new Date(dstr);
      if (isNaN(d)) return dstr;
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const secToMin = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}.${String(sec).padStart(2, '0')}`;
    };

    const getMachineBreakdown = (rows) => {
      const map = {};
      rows.forEach((r) => {
        const m = r.machine || '-';
        map[m] = (map[m] || 0) + 1;
      });
      return map;
    };

    const steps = record.steps || [];
    const totalSec = steps.reduce((s, r) => s + (parseInt(r.time) || 0), 0);
    const breakdown = getMachineBreakdown(steps);

    const extraFeatures = [
      { label: 'ปัก', checked: record.chk?.pak, note: record.chk?.pak_n },
      { label: 'พิมพ์', checked: record.chk?.print, note: record.chk?.print_n },
      { label: 'ตัวรีดป้ายไซส์', checked: record.chk?.tag },
      { label: 'ตัวรีดใหญ่', checked: record.chk?.big, note: record.chk?.big_n },
      { label: 'รีดวีราเน่รองปัก', checked: record.chk?.rib },
      { label: 'ส่งซัก', checked: record.chk?.send, note: record.chk?.send_n },
      { label: 'ตัวรีดเล็ก', checked: record.chk?.small, note: record.chk?.small_n },
    ];

    const extraFeaturesHtml = extraFeatures.map(x => `
      <div class="pv-ck ${x.checked ? 'on' : ''}">
        <span class="pv-ck-icon">${x.checked ? '☑' : '☐'}</span> ${x.label} 
        ${x.note ? `<span class="pv-ck-note"> (${x.note})</span>` : ''}
      </div>
    `).join('');

    const imagesHtml = record.imgs && record.imgs.length > 0
      ? `<div class="pv-imgs">${record.imgs.map(img => `<img src="${img}" class="pv-img" />`).join('')}</div>`
      : `<div class="pv-empty">ไม่ได้แนบรูป</div>`;

    const stepRowsHtml = steps.map((r, i) => `
      <tr style="background: ${i % 2 === 1 ? '#f9fbff' : '#ffffff'};">
        <td style="padding: 7px 6px; text-align: center; font-weight: 700; color: #1a5276; border: 1px solid #e0e0e0;">${i + 1}</td>
        <td style="padding: 7px 6px; color: #7f8c8d; border: 1px solid #e0e0e0;">${esc(r.part)}</td>
        <td style="padding: 7px 6px; font-weight: 600; border: 1px solid #e0e0e0;">${esc(r.step)}</td>
        <td style="padding: 7px 6px; color: #7f8c8d; border: 1px solid #e0e0e0;">${esc(r.machine)}</td>
        <td style="padding: 7px 6px; text-align: center; border: 1px solid #e0e0e0;">${r.time || 0}</td>
        <td style="padding: 7px 6px; text-align: center; border: 1px solid #e0e0e0;">${r.workers || 1}</td>
        <td style="padding: 7px 6px; color: #7f8c8d; border: 1px solid #e0e0e0;">${esc(r.note)}</td>
      </tr>
    `).join('');

    const machineBreakdownHtml = Object.entries(breakdown).map(([m, count]) => `
      <tr style="background: #f0f7ff;">
        <td colspan="4" style="padding: 6px 8px; text-align: right; color: #7f8c8d; border: 1px solid #e0e0e0;">${m}</td>
        <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #1a5276; border: 1px solid #e0e0e0;">${count}</td>
        <td colspan="2" style="padding: 6px 8px; color: #7f8c8d; border: 1px solid #e0e0e0;">ตัว</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ใบดีขั้นตอนผลิต - ${esc(record.brand)} ${esc(record.model)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root {
            --brand: #c8392b;
            --primary: #1a5276;
            --pri-lt: #eaf2f8;
            --tan: #d9c9b0;
            --tan-lt: #f7f0e6;
            --pink: #f5d5d5;
            --green-lt: #c8ddc8;
            --gray: #f4f6f9;
            --border: #d5dbdb;
            --text: #2c3e50;
            --muted: #7f8c8d;
            --r: 12px;
            --r-sm: 8px;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Sarabun', sans-serif;
            color: var(--text);
            background: #fff;
            padding: 10mm;
            font-size: 14px;
            line-height: 1.4;
          }

          @media print {
            body {
              padding: 0;
            }
            .pv-page {
              box-shadow: none !important;
              border: 1px solid var(--border) !important;
              page-break-after: always;
            }
            .pv-page:last-child {
              page-break-after: avoid;
            }
          }

          .pv-page {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: var(--r);
            margin-bottom: 20px;
            overflow: hidden;
          }

          .pv-page-hdr {
            background: var(--tan-lt);
            border-bottom: 2px solid var(--tan);
            padding: 10px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .pv-logo {
            background: var(--brand);
            color: #fff;
            font-size: 9px;
            font-weight: 800;
            line-height: 1.2;
            padding: 5px 8px;
            border-radius: 4px;
            text-align: center;
          }

          .pv-page-title {
            flex: 1;
            text-align: center;
            font-size: 16px;
            font-weight: 800;
            color: var(--text);
          }

          .pv-page-num {
            font-size: 13px;
            color: var(--muted);
            font-weight: 600;
          }

          .pv-page-body {
            padding: 16px;
          }

          .pv-row2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 16px;
            margin-bottom: 10px;
          }

          .pv-row4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px 12px;
            margin-bottom: 10px;
          }

          .pv-field {
            display: flex;
            align-items: baseline;
            gap: 6px;
            padding: 4px 0;
            border-bottom: 1px dashed #e8e8e8;
            min-height: 28px;
          }

          .pv-field.wide {
            grid-column: 1 / -1;
          }

          .pv-flabel {
            font-size: 13px;
            font-weight: 700;
            color: var(--muted);
            white-space: nowrap;
          }

          .pv-fval {
            font-size: 13px;
            font-weight: 500;
            color: var(--text);
            flex: 1;
            word-break: break-word;
          }

          .pv-fval.empty {
            color: #ccc;
          }

          .pv-blank {
            color: #d0d0d0;
          }

          .pv-unit {
            font-size: 12px;
            color: var(--muted);
          }

          .pv-checks {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 20px;
            margin-bottom: 12px;
            padding: 4px 0;
          }

          .pv-extras {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px 12px;
            margin-bottom: 12px;
          }

          .pv-ck {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--muted);
          }

          .pv-ck.on {
            color: var(--text);
            font-weight: 600;
          }

          .pv-ck-icon {
            font-size: 14px;
            line-height: 1;
          }

          .pv-ck-note {
            font-size: 12px;
            color: var(--primary);
            font-weight: 600;
          }

          .pv-sec {
            font-size: 13px;
            font-weight: 700;
            color: var(--primary);
            margin: 12px 0 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pv-sec::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e0e0e0;
          }

          .pv-sec.tan {
            background: var(--tan);
            color: #4a3b1a;
            padding: 6px 12px;
            margin: 12px -16px 8px;
            font-size: 14px;
            border-top: 1px solid var(--tan);
            border-bottom: 1px solid var(--tan);
          }

          .pv-sec.tan::after {
            display: none;
          }

          .pv-imgs {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 8px;
          }

          .pv-img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid var(--border);
          }

          .pv-nlabel {
            font-size: 13px;
            font-weight: 700;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .pv-tb {
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 13px;
            background: #fafafa;
            min-height: 40px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .pv-tb.nb {
            border: none;
            background: transparent;
            padding: 4px 8px;
          }

          .pv-tb-val {
            color: var(--text);
          }

          .pv-tb-empty {
            color: #ccc;
          }

          .pv-empty {
            text-align: center;
            padding: 12px;
            color: #ccc;
            font-size: 13px;
            border: 1px dashed #ddd;
            border-radius: 8px;
            margin-bottom: 8px;
          }

          .pv-wf {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border: 1px solid var(--border);
            border-radius: var(--r-sm);
            overflow: hidden;
            margin-bottom: 12px;
          }

          .pv-wf-box + .pv-wf-box {
            border-left: 1px solid var(--border);
          }

          .pv-wf-hdr {
            text-align: center;
            font-weight: 700;
            font-size: 13px;
            padding: 6px;
            border-bottom: 1px solid var(--border);
          }

          .pv-wf-hdr.warn {
            background: var(--pink);
            color: #7a1a1a;
          }

          .pv-wf-hdr.fix {
            background: var(--green-lt);
            color: #1a4a1a;
          }

          .pv-actual {
            background: var(--tan-lt);
            border-top: 2px solid var(--tan);
            padding: 12px 16px;
            margin: 12px -16px -16px;
            border-radius: 0 0 var(--r) var(--r);
          }

          .pv-actual-hdr {
            background: var(--tan);
            text-align: center;
            font-weight: 700;
            font-size: 14px;
            padding: 6px;
            margin: -12px -16px 8px;
            color: #4a3b1a;
            border-bottom: 1px solid var(--tan);
          }
        </style>
      </head>
      <body>

        <!-- --- หน้า 1 --- -->
        <div class="pv-page">
          <div class="pv-page-hdr">
            <div class="pv-logo">Apparel<br>Creations</div>
            <div class="pv-page-title">ใบดีขั้นตอนผลิต</div>
            <div class="pv-page-num">หน้า 1/2</div>
          </div>
          <div class="pv-page-body">
            <div class="pv-row4">
              <div class="pv-field wide"><span class="pv-flabel">วันที่ :</span><span class="pv-fval">${rtf(record.dispDate)}</span></div>
              <div class="pv-field wide"><span class="pv-flabel">Mer :</span><span class="pv-fval">${rtf(record.merText)}</span></div>
              <div class="pv-field wide"><span class="pv-flabel">แบรนด์ :</span><span class="pv-fval">${rtf(record.brand)}</span></div>
              <div class="pv-field wide"><span class="pv-flabel">ลูกค้า :</span><span class="pv-fval">${rtf(record.customer)}</span></div>
              <div class="pv-field wide"><span class="pv-flabel">ชื่อรุ่น :</span><span class="pv-fval">${rtf(record.model)}</span></div>
            </div>

            <div class="pv-row2">
              <div class="pv-field"><span class="pv-flabel">จำนวนผลิต :</span><span class="pv-fval">${rtf(record.qty)} <span class="pv-unit">ตัว</span></span></div>
              <div class="pv-field"><span class="pv-flabel">ไซส์ :</span><span class="pv-fval">${rtf(record.size)}</span></div>
              <div class="pv-field"><span class="pv-flabel">จำนวนสี :</span><span class="pv-fval">${rtf(record.colors)} <span class="pv-unit">สี</span></span></div>
              <div class="pv-field"><span class="pv-flabel">ตัว/สี :</span><span class="pv-fval">${rtf(record.perColor)} <span class="pv-unit">ตัว</span></span></div>
            </div>

            <div class="pv-checks">
              <div class="pv-ck ${record.sampleReal ? 'on' : ''}"><span class="pv-ck-icon">${record.sampleReal ? '☑' : '☐'}</span> มีตัวอย่างจริง</div>
              <div class="pv-ck ${record.samplePic ? 'on' : ''}"><span class="pv-ck-icon">${record.samplePic ? '☑' : '☐'}</span> ตีราคาจากรูป</div>
            </div>

            <div class="pv-sec">📝 รายละเอียดงาน</div>
            ${tf(record.detail, true)}

            <div class="pv-sec">➕ เพิ่มเติม</div>
            <div class="pv-extras">
              ${extraFeaturesHtml}
            </div>

            <div class="pv-sec">📷 รูปสินค้า</div>
            ${imagesHtml}

            <div class="pv-row2" style="margin-top: 10px;">
              <div>
                <div class="pv-nlabel">📌 Note ฝ่ายผลิต</div>
                ${tf(record.noteProd, true)}
              </div>
              <div>
                <div class="pv-nlabel">📌 Note ฝ่ายขาย</div>
                ${tf(record.noteSales, true)}
              </div>
            </div>

            <div class="pv-row2" style="margin-top: 10px;">
              <div>
                <div class="pv-field wide"><span class="pv-flabel">ผู้ดูแล (เมอร์) :</span>${tf(record.supervisor)}</div>
                <div class="pv-field wide">
                  <span class="pv-flabel">จำนวนคนเย็บ :</span>
                  <div class="pv-fval ${!record.sewers ? 'empty' : ''}">${record.sewers ? `${record.sewers} คน` : '-'}</div>
                </div>
                <div class="pv-field wide">
                  <span class="pv-flabel">จำนวนตัว/ชม. :</span>
                  <div class="pv-fval ${!record.rate ? 'empty' : ''}">${record.rate ? `${record.rate} ตัว` : '-'}</div>
                </div>
                <div class="pv-field wide">
                  <span class="pv-flabel">ประเมินค่าแรง :</span>
                  <div class="pv-fval ${!record.estWage ? 'empty' : ''}">${record.estWage ? `${record.estWage} บาท` : '-'}</div>
                </div>
              </div>
              <div>
                <div class="pv-nlabel">✅ Confirmed ราคา/รายละเอียด</div>
                ${tf(record.confirmed, true)}
              </div>
            </div>
          </div>
        </div>

        <!-- --- หน้า 2 --- -->
        <div class="pv-page">
          <div class="pv-page-hdr">
            <div class="pv-logo">Apparel<br>Creations</div>
            <div class="pv-page-title">ขั้นตอนการเย็บ</div>
            <div class="pv-page-num">หน้า 2/2</div>
          </div>
          <div class="pv-page-body">
            <div class="pv-sec">⚙️ ตารางขั้นตอนการผลิต</div>
            ${steps.length > 0 ? `
              <div style="overflow-x: auto; border: 1.5px solid #e0e0e0; border-radius: 8px; margin-bottom: 12px;">
                <table style="width: 100%; border-collapse: collapse; min-width: 540px; font-size: 13px;">
                  <thead>
                    <tr style="background: var(--primary); color: #fff;">
                      <th style="padding: 8px 6px; text-align: center; border: 1px solid #e0e0e0;">ลำดับ</th>
                      <th style="padding: 8px 6px; text-align: left; border: 1px solid #e0e0e0;">ชิ้นส่วน</th>
                      <th style="padding: 8px 6px; text-align: left; border: 1px solid #e0e0e0;">ขั้นตอนการเย็บ</th>
                      <th style="padding: 8px 6px; text-align: left; border: 1px solid #e0e0e0;">เครื่องจักร</th>
                      <th style="padding: 8px 6px; text-align: center; border: 1px solid #e0e0e0;">เวลา (วิ)</th>
                      <th style="padding: 8px 6px; text-align: center; border: 1px solid #e0e0e0;">คนงาน</th>
                      <th style="padding: 8px 6px; text-align: left; border: 1px solid #e0e0e0;">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stepRowsHtml}
                  </tbody>
                  <tfoot>
                    ${machineBreakdownHtml}
                    <tr style="background: var(--tan-lt); border-top: 2.5px solid var(--tan);">
                      <td colspan="4" style="padding: 9px 8px; text-align: right; font-weight: 700; color: #4a3b1a; border: 1px solid #e0e0e0;">⏱️ รวมทั้งหมด</td>
                      <td style="padding: 9px 8px; text-align: center; font-weight: 800; color: var(--primary); border: 1px solid #e0e0e0;">${secToMin(totalSec)}</td>
                      <td colspan="3" style="padding: 9px 8px; font-weight: 600; color: #4a3b1a; border: 1px solid #e0e0e0;">นาที (${totalSec} วิ)</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ` : `<div class="pv-empty">ยังไม่มีการเพิ่มขั้นตอน</div>`}

            <div class="pv-wf">
              <div class="pv-wf-box">
                <div class="pv-wf-hdr warn">ข้อควรระวัง</div>
                ${tf(record.warning, true)}
              </div>
              <div class="pv-wf-box">
                <div class="pv-wf-hdr fix">วิธีแก้ไข</div>
                ${tf(record.solution, true)}
              </div>
            </div>

            <div class="pv-actual">
              <div class="pv-actual-hdr">ผลิตจริง</div>
              <div class="pv-row2">
                <div class="pv-field wide"><span class="pv-flabel">เริ่มเย็บ :</span>${tf(formatDateTime(record.actual?.start))}</div>
                <div class="pv-field wide"><span class="pv-flabel">จบ :</span>${tf(formatDateTime(record.actual?.end))}</div>
                <div class="pv-field wide"><span class="pv-flabel">คนเย็บ/เวลา :</span><div class="pv-fval">${record.actual?.sewers || '-'} คน · ใช้เวลา ${record.actual?.days || '-'} วัน</div></div>
                <div class="pv-field wide"><span class="pv-flabel">ตัว/ชั่วโมง :</span><div class="pv-fval">${record.actual?.rate || '-'} <span class="pv-unit">ตัว (เฉลี่ยจบตัว)</span></div></div>
                <div class="pv-field wide"><span class="pv-flabel">ค่าแรงจริง :</span><div class="pv-fval">${record.actual?.wage || '-'} <span class="pv-unit">บาท (ไม่รวม ตัด QC รีด แฟ็ก)</span></div></div>
                <div class="pv-field wide"><span class="pv-flabel">ประเมินทุน :</span><div class="pv-fval">${record.actual?.total || '-'} <span class="pv-unit">บาท</span></div></div>
                <div class="pv-field wide" style="flex-direction: column; align-items: flex-start;">
                  <span class="pv-flabel">หมายเหตุ :</span>
                  <div class="pv-fval" style="width: 100%; margin-top: 4px;">
                    ${record.actual?.remark ? record.actual.remark : '<span class="pv-blank">-</span>'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    if (onSuccess) onSuccess();
  } catch (err) {
    console.error(err);
    if (onError) onError(err);
  }
}
