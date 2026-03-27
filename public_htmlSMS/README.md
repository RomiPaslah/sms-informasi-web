# Sinergi Muda Strategis - Deployment Guide

## 📁 Struktur Folder Public HTML

```
public_html/
├── .htaccess                    # Apache rewrite rules (PENTING!)
├── index.html                   # Entry point aplikasi
├── assets/                      # CSS & JavaScript bundle
│   ├── index-B0HtnpZL.js       # Main JavaScript bundle
│   ├── google-auth-CZlBUQ9q.js # Google Auth library
│   └── index-DQLnJMTg.css      # Tailwind CSS bundle
└── images/                      # Gambar website
    ├── about-img.jpg
    ├── hero-bg.jpg
    ├── krispol-siregar.jpg
    ├── majalengka-collage.jpg
    └── sms-logo.png
```

## 🚀 Cara Upload ke cPanel

### Metode 1: File Manager (Paling Mudah)

1. **Login ke cPanel**
2. **Buka File Manager** → Navigasi ke **public_html**
3. **Upload semua file dan folder:**
   - Pilih semua file (Ctrl+A)
   - Upload (drag & drop atau upload button)
4. **Pastikan .htaccess ter-upload** (file tersembunyi, aktifkan "Show Hidden Files")

### Metode 2: FTP

1. **Connect FTP client** (FileZilla, WinSCP, dll)
2. **Upload semua file** ke folder `public_html`
3. **Set permissions:**
   - File: `644`
   - Folder: `755`
   - `.htaccess`: `644`

### Metode 3: Terminal SSH

```bash
scp -r public_html/* user@domain.com:/home/user/public_html/
```

## ✅ Verifikasi Deployment

Setelah upload, cek checklist ini:

- [ ] Index.html bisa diakses
- [ ] Halaman beranda muncul (bukan blank)
- [ ] Navigasi menu bekerja (Berita, Tentang, dll)
- [ ] Admin dashboard bisa diakses (`/admin`)
- [ ] Google AdSense aktif (jika sudah dikonfigurasi)
- [ ] Database/localStorage berfungsi

## 🔧 Troubleshooting

### Masalah: Halaman Blank

**Solusi:**
1. Buka F12 → Console untuk cek error
2. Pastikan `.htaccess` aktif (rewriting rules)
3. Pastikan Apache mod_rewrite enabled di hosting

### Masalah: Assets Tidak Load

**Penyebab:**
- Path relatif salah
- File tidak ter-upload

**Solusi:**
1. Cek file manager - pastikan folder `assets/` ada
2. Cek Network tab (F12 → Network) untuk file yang gagal

### Masalah: Routing Tidak Bekerja

**Penyebab:**
- `.htaccess` tidak aktif atau salah

**Solusi (alternatif tanpa .htaccess):**
Gunakan hash routing di `src/App.tsx`:
```tsx
import { HashRouter as Router } from 'react-router-dom';
// Ganti BrowserRouter jadi HashRouter
```

Rebuild: `npm run build`

## 🔑 Konfigurasi Penting

### Google AdSense

Edit `index.html` di public_html:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```

Ganti `ca-pub-YOUR_PUBLISHER_ID` dengan Publisher ID Anda.

### Database

Data disimpan di localStorage browser, jadi otomatis per user.
Untuk data persisten (backing up), buka Admin Dashboard → export data.

## 📊 Monitoring

- **Google Analytics:** Setup di Home page
- **Error Tracking:** Buka F12 Console untuk runtime errors
- **Performance:** Cek PageSpeed Insights

## 📞 Support

Jika ada error:
1. Buka F12 Console
2. Screenshot error message
3. Share dengan tim development

---

**Status:** ✅ Ready untuk Production
**Last Updated:** 27 Maret 2026
