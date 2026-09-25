// ไฟล์นี้ไม่ใช่ endpoint (ขึ้นต้นด้วย _ ทำให้ Vercel ไม่นับเป็น route)
// เป็นแค่โค้ดใช้ร่วมกันระหว่าง endpoint อื่นๆ ในโฟลเดอร์ api/

const { createClient } = require('@libsql/client');

let cachedClient = null;

function getDb() {
    if (cachedClient) return cachedClient;
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        throw new Error('ยังไม่ได้ตั้งค่า TURSO_DATABASE_URL / TURSO_AUTH_TOKEN ใน Environment Variables ของ hosting');
    }
    cachedClient = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return cachedClient;
}

// รหัสแอดมิน: อ่านจาก Environment Variable ก่อน ถ้าไม่ได้ตั้งค่าไว้จะ fallback เป็นค่าที่ขอไว้
// แนะนำให้ไปตั้งค่า ADMIN_PIN ใน Environment Variables ของ hosting แทนการฝังไว้ในโค้ดตรงๆ เพื่อความปลอดภัย
function getAdminPin() {
    return process.env.ADMIN_PIN || '0123456789';
}

function checkPin(pin) {
    return typeof pin === 'string' && pin === getAdminPin();
}

// ใส่ CORS header ให้ทุก response เพื่อให้หน้าเว็บ (อาจอยู่คนละโดเมนกับ backend) เรียกได้
function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { getDb, checkPin, setCors };
