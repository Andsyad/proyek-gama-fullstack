// server.js - Backend Utama Anda

const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Modul File System untuk membaca/menulis file
const path = require('path');

const app = express();
const PORT = 3000; // Server kita akan berjalan di port 3000

// --- Middleware ---
app.use(cors()); // Mengizinkan akses dari frontend
app.use(express.json()); // Memungkinkan server membaca data JSON dari request

// --- Fungsi untuk membaca data dari database.json ---
function readDatabase() {
    const dbPath = path.join(__dirname, 'database.json');
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
}

// --- API Endpoint untuk mencari merchant berdasarkan No. Rekening ---
app.get('/api/merchants/:noRekening', (req, res) => {
    console.log(`Menerima permintaan untuk no rekening: ${req.params.noRekening}`);
    const db = readDatabase();
    const merchant = db.merchants.find(m => m.noRekening === req.params.noRekening);
    
    if (merchant) {
        res.json(merchant); // Kirim data merchant jika ditemukan
    } else {
        res.status(404).json({ message: 'Data rekening tidak ditemukan.' }); // Kirim error jika tidak ada
    }
});

// --- API Endpoint untuk mendaftarkan merchant baru ---
app.post('/api/merchants/register', (req, res) => {
    const { noRekening } = req.body;
    console.log(`Menerima permintaan pendaftaran untuk no rekening: ${noRekening}`);
    
    if (!noRekening) {
        return res.status(400).json({ message: 'Nomor rekening diperlukan.' });
    }

    const db = readDatabase();
    const merchantIndex = db.merchants.findIndex(m => m.noRekening === noRekening);
    
    if (merchantIndex !== -1) {
        // Update status merchant yang ada
        db.merchants[merchantIndex].status = 'Terdaftar';
        
        // Tulis perubahan kembali ke file database.json
        const dbPath = path.join(__dirname, 'database.json');
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        
        res.json({ message: `Pengajuan untuk "${db.merchants[merchantIndex].namaUsaha}" berhasil dikirim!` });
    } else {
        res.status(404).json({ message: 'Data rekening untuk pendaftaran tidak ditemukan.' });
    }
});


// --- Menjalankan Server ---
app.listen(PORT, () => {
    console.log(`🎉 Server GAMA Backend berjalan di http://localhost:${PORT}`);
    console.log('Server siap menerima permintaan dari frontend!');
});