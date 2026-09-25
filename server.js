require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files
app.use(express.static('.'));
app.use('/Fx', express.static('Fx'));

// ตัวแปลง Vercel Function + Print Error ออกทาง Terminal
const handleVercel = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error('================ API ERROR ================');
        console.error(err);
        console.error('===========================================');
        if (!res.headersSent) {
            res.status(500).json({ error: err.message || 'Internal Server Error' });
        }
    }
};

// Import Endpoints
const patternsHandler = require('./api/patterns.js');
const instrumentsHandler = require('./api/instruments.js');
const soundFxHandler = require('./api/sound-fx.js');

app.all('/api/patterns', handleVercel(patternsHandler));
app.all('/api/instruments', handleVercel(instrumentsHandler));
app.all('/api/sound-fx', handleVercel(soundFxHandler));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});