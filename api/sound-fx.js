const { getDb, checkPin, setCors } = require('./_db');

module.exports = async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    let db;
    try {
        db = getDb();
    } catch (e) {
        return res.status(500).json({ error: 'ตั้งค่าฐานข้อมูลไม่ถูกต้อง', detail: String(e.message || e) });
    }

    if (req.method === 'GET') {
        try {
            const result = await db.execute('SELECT * FROM sound_fx');
            const slots = result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                icon: row.icon,
                audioUrl: row.audio_url,
            }));
            return res.status(200).json({ slots });
        } catch (e) {
            return res.status(500).json({ error: 'โหลดข้อมูลไม่สำเร็จ', detail: String(e.message || e) });
        }
    }

    // POST: บันทึกช่องเสียงเอฟเฟกต์ 1 ช่อง — audioUrl ต้องเป็น secure_url ที่ได้จาก Cloudinary มาแล้ว
    // (หน้าเว็บอัปโหลดไฟล์ขึ้น Cloudinary ตรงๆ ก่อน แล้วค่อยส่ง URL ที่ได้มาบันทึกที่นี่ — เซิร์ฟเวอร์นี้ไม่รับไฟล์ตรงๆ)
    if (req.method === 'POST') {
        const body = req.body || {};
        const { pin, slot } = body;

        if (!checkPin(pin)) {
            return res.status(401).json({ error: 'รหัสแอดมินไม่ถูกต้อง' });
        }
        if (!slot || !slot.id) {
            return res.status(400).json({ error: 'ข้อมูลช่องเสียงไม่ครบ' });
        }

        try {
            await db.execute({
                sql: `INSERT INTO sound_fx (id, name, icon, audio_url, updated_at)
                      VALUES (?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO UPDATE SET
                          name = excluded.name,
                          icon = excluded.icon,
                          audio_url = excluded.audio_url,
                          updated_at = excluded.updated_at`,
                args: [
                    slot.id,
                    slot.name || '',
                    slot.icon || '',
                    slot.audioUrl || null,
                    Date.now(),
                ],
            });
            return res.status(200).json({ ok: true });
        } catch (e) {
            return res.status(500).json({ error: 'บันทึกไม่สำเร็จ', detail: String(e.message || e) });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
