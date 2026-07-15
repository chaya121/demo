import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 เชื่อมต่อกับ Supabase ผ่าน Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// 1. API: ดึงข้อมูลรายการผลิต (records)
// ==========================================
app.get('/api/records', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    // แปลงกลับเป็น format เดิมที่หน้าบ้านต้องการ
    const records = data.map(item => typeof item.data === 'string' ? JSON.parse(item.data) : item.data);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. API: บันทึกข้อมูลรายการผลิตใหม่
// ==========================================
app.post('/api/records', async (req, res) => {
  try {
    const newRecord = req.body;
    const { error } = await supabase
      .from('records')
      .insert([{ id: newRecord.id, data: newRecord }]);

    if (error) throw error;
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. API: ดึงข้อมูลหลัก (master)
// ==========================================
app.get('/api/master', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('master')
      .select('data')
      .eq('id', 1)
      .single();

    if (error) throw error;
    res.json(typeof data.data === 'string' ? JSON.parse(data.data) : data.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. หน้าตาเว็บ (Frontend HTML)
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Apparel Production</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-6">
        <div id="app" class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
            <h1 class="text-2xl font-bold mb-4">ระบบจัดการการผลิตเสื้อผ้า</h1>
            <div id="status" class="text-sm mb-4 text-gray-500">กำลังโหลดข้อมูล...</div>
            <div id="output" class="space-y-2"></div>
        </div>

        <script>
          // ✅ ปรับแก้ตรงนี้ให้ฉลาดขึ้น: วิ่งหา URL ปัจจุบันของเว็บโดยอัตโนมัติ ไม่ว่าจะอยู่บน localhost หรือ Vercel
          const API_URL = window.location.origin + '/api';

          async function init() {
            try {
              document.getElementById('status').innerText = 'กำลังเชื่อมต่อเซิร์ฟเวอร์...';
              const res = await fetch(\`\${API_URL}/records\`);
              if(!res.ok) throw new Error('เรียกข้อมูลไม่สำเร็จ');
              const data = await res.json();
              
              document.getElementById('status').innerText = 'เชื่อมต่อสำเร็จ! จำนวนรายการ: ' + data.length;
              document.getElementById('output').innerHTML = data.map(r => 
                \`<div class="p-3 border rounded">📋 Order: \${r.orderNo} | ลูกค้า: \${r.customer} | สถานะ: \${r.status}</div>\`
              ).join('');
            } catch(err) {
              document.getElementById('status').innerHTML = \`<span class="text-red-500">❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (\${err.message})</span>\`;
            }
          }
          init();
        </script>
    </body>
    </html>
  `);
});

// ลบ app.listen ออกเมื่อรันบน Vercel
export const handler = serverless(app);
export default app;
