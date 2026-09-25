-- รันไฟล์นี้ครั้งเดียวเพื่อสร้างตารางใน Turso
-- วิธีรัน: turso db shell <ชื่อฐานข้อมูล> < schema.sql
-- หรือก็อปวางทีละคำสั่งใน Turso web shell ก็ได้

CREATE TABLE IF NOT EXISTS patterns (
    id TEXT PRIMARY KEY,          -- เช่น 's_1', 'f_23'
    category TEXT NOT NULL,       -- 'slow' หรือ 'fast'
    name TEXT NOT NULL,
    icon TEXT,
    bpm INTEGER,
    time_sig TEXT,
    steps_json TEXT,              -- เก็บ object ของ steps เป็น JSON string
    velocity_json TEXT,           -- เก็บ object ของ velocity เป็น JSON string
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS instruments (
    id TEXT PRIMARY KEY,          -- เช่น 'conga_hi', 'cowbell'
    name TEXT,
    icon TEXT,
    pan REAL,
    vol REAL,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS sound_fx (
    id TEXT PRIMARY KEY,          -- เช่น 'fx_1' .. 'fx_20'
    name TEXT,
    icon TEXT,
    audio_url TEXT,               -- secure_url ที่ได้จาก Cloudinary หลังอัปโหลด
    updated_at INTEGER
);
