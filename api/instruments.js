const { getDb, checkPin, setCors } = require('./_db');

module.exports = async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    let db;
    try {
        db = getDb();
    } catch (e) {
        console.error("❌ DB GET ERROR:", e); // <--- เพิ่มบรรทัดนี้
        return res.status(500).json({ error: 'ตั้งค่าฐานข้อมูลไม่ถูกต้อง', detail: String(e.message || e) });
    }

    if (req.method === 'GET') {
        try {
            const result = await db.execute('SELECT * FROM instruments');
            const instruments = result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                icon: row.icon,
                pan: row.pan,
                vol: row.vol,
            }));
            return res.status(200).json({ instruments });
        } catch (e) {
            console.error("❌ QUERY ERROR:", e); // <--- เพิ่มบรรทัดนี้
            return res.status(500).json({ error: 'โหลดข้อมูลไม่สำเร็จ', detail: String(e.message || e) });
        }
    }

    if (req.method === 'POST') {
        const body = req.body || {};
        const { pin, instrument } = body;

        if (!checkPin(pin)) {
            return res.status(401).json({ error: 'รหัสแอดมินไม่ถูกต้อง' });
        }
        if (!instrument || !instrument.id) {
            return res.status(400).json({ error: 'ข้อมูลเครื่องดนตรีไม่ครบ' });
        }

        try {
            await db.execute({
                sql: `INSERT INTO instruments (id, name, icon, pan, vol, updated_at)
                      VALUES (?, ?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO UPDATE SET
                          name = excluded.name,
                          icon = excluded.icon,
                          pan = excluded.pan,
                          vol = excluded.vol,
                          updated_at = excluded.updated_at`,
                args: [
                    instrument.id,
                    instrument.name || '',
                    instrument.icon || '',
                    instrument.pan ?? 0,
                    instrument.vol ?? 1,
                    Date.now(),
                ],
            });
            return res.status(200).json({ ok: true });
        } catch (e) {
            console.error("❌ POST ERROR:", e); // <--- เพิ่มบรรทัดนี้
            return res.status(500).json({ error: 'บันทึกไม่สำเร็จ', detail: String(e.message || e) });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};