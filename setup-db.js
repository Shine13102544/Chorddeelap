require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function runSchema() {
    try {
        console.log('⏳ กำลังสร้างตารางใน Turso Database...');
        const sql = fs.readFileSync('schema.sql', 'utf8');
        
        // แยกคำสั่ง SQL แต่ละบรรทัดแล้วรันเข้าฐานข้อมูล
        await client.executeMultiple(sql);
        
        console.log('✅ สร้างตารางสำเร็จเรียบร้อยแล้ว!');
    } catch (err) {
        console.error('❌ เกิดข้อผิดพลาด:', err.message || err);
    } process.exit(0);
}

runSchema();