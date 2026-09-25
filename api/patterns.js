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

    // GET: โหลดจังหวะทั้งหมดที่เคยบันทึกไว้ — ไม่ต้องใช้รหัสแอดมัน (ใครก็เปิดดู/เล่นได้)
    if (req.method === 'GET') {
        try {
            const result = await db.execute('SELECT * FROM patterns');
            const patterns = result.rows.map((row) => ({
                id: row.id,
                category: row.category,
                name: row.name,
                icon: row.icon,
                bpm: row.bpm,
                timeSig: row.time_sig,
                steps: row.steps_json ? JSON.parse(row.steps_json) : {},
                velocity: row.velocity_json ? JSON.parse(row.velocity_json) : {},
            }));
            return res.status(200).json({ patterns });
        } catch (e) {
            return res.status(500).json({ error: 'โหลดข้อมูลไม่สำเร็จ', detail: String(e.message || e) });
        }
    }

    // POST: บันทึก/แก้ไขจังหวะ 1 อัน — ต้องใส่รหัสแอดมินให้ถูกต้อง
    if (req.method === 'POST') {
        const body = req.body || {};
        const { pin, pattern } = body;

        if (!checkPin(pin)) {
            return res.status(401).json({ error: 'รหัสแอดมินไม่ถูกต้อง' });
        }
        if (!pattern || !pattern.id || !pattern.category) {
            return res.status(400).json({ error: 'ข้อมูลจังหวะไม่ครบ (ต้องมี id และ category)' });
        }

        try {
            await db.execute({
                sql: `INSERT INTO patterns (id, category, name, icon, bpm, time_sig, steps_json, velocity_json, updated_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO UPDATE SET
                          category = excluded.category,
                          name = excluded.name,
                          icon = excluded.icon,
                          bpm = excluded.bpm,
                          time_sig = excluded.time_sig,
                          steps_json = excluded.steps_json,
                          velocity_json = excluded.velocity_json,
                          updated_at = excluded.updated_at`,
                args: [
                    pattern.id,
                    pattern.category,
                    pattern.name || '',
                    pattern.icon || '',
                    pattern.bpm || 0,
                    pattern.timeSig || '4/4',
                    JSON.stringify(pattern.steps || {}),
                    JSON.stringify(pattern.velocity || {}),
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
