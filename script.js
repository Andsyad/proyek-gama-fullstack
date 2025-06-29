// script.js (Terhubung ke Backend)

// URL Alamat Backend kita
const API_URL = 'http://localhost:3000';

// ... (Fungsi showNotification tetap sama) ...
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // ... (Logika Sidebar & Navigasi Aktif tetap sama) ...
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('is-open'));
    }
    if (sidebarCloseBtn && sidebar) {
        sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('is-open'));
    }

    const currentPage = document.documentElement.dataset.page;
    const navLinks = document.querySelectorAll('.sidebar-menu li a');
    navLinks.forEach(link => {
        const linkPage = new URL(link.href).pathname.split('/').pop().replace('.html', '');
        if (linkPage === currentPage) {
            link.parentElement.classList.add('active');
        }
    });

    // Logika per halaman
    if (currentPage === 'pengajuan') {
        initPengajuanPage();
    }
});

// --- FUNGSI HALAMAN PENGAJUAN (Versi Backend) ---
function initPengajuanPage() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-value');
    const resultArea = document.getElementById('result-area');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            showNotification('Silakan masukkan nomor rekening.', 'error');
            return;
        }

        resultArea.innerHTML = `<p style="text-align:center; padding: 20px 0;">Mencari... <i class="fa-solid fa-spinner fa-spin"></i></p>`;

        // Menggunakan FETCH untuk memanggil API backend
        fetch(`${API_URL}/api/merchants/${searchTerm}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Data tidak ditemukan');
                }
                return response.json();
            })
            .then(merchant => {
                renderPengajuanResult(merchant, resultArea);
            })
            .catch(error => {
                console.error('Error:', error);
                resultArea.innerHTML = `<p style="text-align:center; padding: 20px 0;">Data rekening tidak ditemukan.</p>`;
            });
    });
}

function renderPengajuanResult(merchant, container) {
    let actionButtonHTML = '';
    if (merchant.status === 'Belum Terdaftar') {
        actionButtonHTML = `<button class="btn btn-primary" id="register-btn" data-rekening="${merchant.noRekening}">Daftar Sebagai Merchant</button>`;
    } else {
        actionButtonHTML = `<p style="font-weight:600; color:var(--success-green);">Rekening ini sudah terdaftar sebagai merchant.</p>`;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table class="data-table">
                <tr><th>Nama Usaha</th><td>${merchant.namaUsaha}</td></tr>
                <tr><th>Alamat</th><td>${merchant.alamat}</td></tr>
                <tr><th>Jenis Usaha</th><td>${merchant.jenisUsaha}</td></tr>
                <tr><th>Status Pendaftaran</th><td>${merchant.status}</td></tr>
            </table>
        </div>
        <div class="action-buttons">
            ${actionButtonHTML}
        </div>
    `;

    if (merchant.status === 'Belum Terdaftar') {
        document.getElementById('register-btn').addEventListener('click', (e) => {
            const noRekening = e.target.dataset.rekening;
            registerMerchant(noRekening, container);
        });
    }
}

function registerMerchant(noRekening, container) {
    // Mengirim data pendaftaran ke backend menggunakan POST
    fetch(`${API_URL}/api/merchants/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noRekening: noRekening }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showNotification(data.message, 'success');
            container.innerHTML = `<p style="text-align:center; padding: 20px 0; color:var(--success-green);">Pendaftaran berhasil diajukan!</p>`;
        } else {
            showNotification('Terjadi kesalahan saat pendaftaran.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Gagal terhubung ke server.', 'error');
    });
}