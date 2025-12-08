const express = require('express');
const cors = require('cors');
require('dotenv').config();

const emailRoutes = require('./routes/email.routes');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

console.log('Mailer Service Startup Check:');
console.log('CWD:', process.cwd());
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'MISSING (Check .env file)');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'MISSING (Check .env file)');

app.use('/api/email', emailRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'mailer-service' });
});

app.listen(PORT, () => {
    console.log(`Mailer Service running on port ${PORT}`);
});
