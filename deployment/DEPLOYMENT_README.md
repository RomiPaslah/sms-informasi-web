# 🚀 Panduan Deployment SMS Informasi Web ke cPanel

## 📋 Daftar File yang Perlu Diupload

Upload semua file dan folder berikut ke **public_html** atau subfolder di cPanel Anda:

```
📁 deployment/
├── 📄 .env                    # File konfigurasi environment
├── 📄 .htaccess              # Konfigurasi Apache untuk SPA
├── 📄 index.html             # File utama aplikasi
├── 📄 robots.txt             # SEO robots configuration
├── 📄 site.webmanifest       # PWA manifest
├── 📄 sitemap.xml            # Sitemap untuk SEO
├── 📄 favicon.ico            # Favicon website
├── 📁 assets/                # CSS, JS, dan assets lainnya
├── 📁 images/                # Gambar dan media website
```

## ⚙️ Konfigurasi Google OAuth

### 1. Setup Google Cloud Console
1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project existing
3. Enable **Google Identity Services API**
4. Pergi ke **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Pilih **Web application**
6. Isi informasi:
   - **Name**: SMS Informasi Web
   - **Authorized JavaScript origins**: Tambahkan domain Anda
     - `https://yourdomain.com`
     - `http://localhost:5173` (untuk development)
   - **Authorized redirect URIs**: Kosongkan (tidak diperlukan untuk web apps)

### 2. Konfigurasi Environment Variable
Edit file `.env` di server Anda:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

### 3. Upload dan Test
1. Upload semua file ke cPanel
2. Pastikan domain sudah mengarah ke folder yang benar
3. Test login dengan Google di halaman `/login` dan `/register`

## 🔧 Konfigurasi Server

### PHP Version
- Minimal PHP 7.4 (walaupun tidak menggunakan PHP, pastikan kompatibilitas)

### Permissions
- Set permission folder `assets/` dan `images/` ke **755**
- File lainnya **644**

### SSL Certificate
- Pastikan SSL certificate aktif untuk domain Anda
- Google OAuth memerlukan HTTPS di production

## 🧪 Testing Fitur

Setelah deployment, test fitur berikut:

### ✅ Authentication
- [ ] Login dengan email/password
- [ ] Register akun baru
- [ ] Login dengan Google
- [ ] Register dengan Google
- [ ] Logout

### ✅ Admin Features
- [ ] Akses dashboard admin (`/admin`)
- [ ] Kelola berita
- [ ] Edit halaman depan
- [ ] Kelola komentar
- [ ] Pengaturan iklan

### ✅ User Features
- [ ] Baca berita
- [ ] Beri komentar
- [ ] Beri reaksi
- [ ] Mode dark/light

## 🚨 Troubleshooting

### Google OAuth tidak berfungsi
1. Pastikan `VITE_GOOGLE_CLIENT_ID` sudah diisi dengan benar
2. Pastikan domain sudah ditambahkan di Authorized JavaScript origins
3. Cek console browser untuk error messages

### Halaman tidak loading
1. Pastikan `.htaccess` sudah terupload
2. Cek permission files
3. Pastikan base path di `vite.config.ts` sesuai dengan subfolder

### Images tidak muncul
1. Pastikan folder `images/` sudah terupload
2. Cek permission folder (755)
3. Pastikan path gambar benar

## 📞 Support

Jika ada masalah, periksa:
1. Browser console untuk error JavaScript
2. Network tab untuk failed requests
3. Server error logs di cPanel

---

**🎉 Selamat! Website SMS Informasi Web sudah siap digunakan!**