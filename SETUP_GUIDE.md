# 🚀 Panduan Cepat Setup - Sinergi Muda Strategis

## 📋 Daftar Isi
1. [Setup Local Development](#setup-local)
2. [Deploy ke cPanel](#deploy-cpanel)
3. [Konfigurasi Google Services](#google-services)
4. [Troubleshooting](#troubleshooting)

---

## <a name="setup-local"></a>1️⃣ Setup Local Development

### Requirement
- Node.js 16+ & npm
- Text Editor (VS Code recommended)
- Browser (Chrome/Firefox)

### Instalasi

```bash
# 1. Buka folder app
cd "c:\Users\SPC STYLE 5\Downloads\SMS Informasi Web\app"

# 2. Install dependencies (jika belum)
npm install

# 3. Jalankan development server
npm run dev

# Output: ➜ Local: http://localhost:5176/
```

### Akses Aplikasi
- **Homepage:** http://localhost:5176/
- **Berita:** http://localhost:5176/berita
- **Admin:** http://localhost:5176/admin

### Test Fitur
- [ ] Homepage muncul dengan benar
- [ ] Navigasi menu bekerja
- [ ] Login/Register berfungsi
- [ ] Admin dashboard bisa diakses
- [ ] Buat berita untuk testing

---

## <a name="deploy-cpanel"></a>2️⃣ Deploy ke cPanel

### Step 1: Build untuk Production

```bash
cd "c:\Users\SPC STYLE 5\Downloads\SMS Informasi Web\app"
npm run build
```

✅ Output akan ada di folder `app/dist/` dan sudah di-copy ke `public_html/`

### Step 2: Upload ke cPanel

#### Via File Manager (PALING MUDAH):

1. **Login ke cPanel account**
2. **Buka File Manager**
3. **Navigate ke public_html folder**
4. **Hapus file lama jika ada** (optional)
5. **Upload file dari `public_html` lokal:**
   - Buka Windows Explorer
   - Navigasi ke `C:\Users\SPC STYLE 5\Downloads\SMS Informasi Web\public_html`
   - Select semua file (Ctrl+A)
   - Drag & drop ke File Manager cPanel
   - **IMPORTANT:** Upload juga file `.htaccess` (file tersembunyi)

#### Via FTP (ALTERNATIF):

1. **Download FileZilla** (atau FTP client lain)
2. **Connect ke server:**
   - Host: `ftp.yourdomain.com`
   - Username: `cPanel username`
   - Password: `cPanel password`
3. **Navigate ke public_html**
4. **Drag all files dari public_html lokal**

### Step 3: Verifikasi

```
✅ Check ini harus berhasil:

1. Open https://yourdomain.com
   → Halaman beranda muncul, bukan blank

2. Navigate ke https://yourdomain.com/berita
   → Page berita muncul, bukan 404

3. Open https://yourdomain.com/admin
   → Admin login page muncul

4. Open browser console (F12)
   → Tidak ada error merah (warning OK)
```

### Jika Setup di Subdomain

Jika domain Anda: `yourdomain.com` dan subdomain: `blog.yourdomain.com`

**Di cPanel:**
1. Create addon domain `blog.yourdomain.com`
2. Set document root ke `public_html`
3. Upload file ke folder `blog.yourdomain.com`
4. Upload `.htaccess` juga

---

## <a name="google-services"></a>3️⃣ Konfigurasi Google Services

### A. Google OAuth Login

**Untuk mengaktifkan login Google:**

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Create project baru atau gunakan existing
3. Enable OAuth 2.0:
   - Search "OAuth 2.0 Credentials"
   - Create "OAuth 2.0 Client ID"
   - Type: Web Application
   - Authorized redirect URIs:
     ```
     https://yourdomain.com/
     https://yourdomain.com/login
     ```
4. Copy Client ID
5. Edit `src/lib/google-auth.ts`:
   ```tsx
   const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com'
   ```
6. Rebuild: `npm run build`
7. Upload ulang ke cPanel

### B. Google AdSense Setup

**Untuk monetisasi dengan iklan:**

1. Daftar [Google AdSense](https://www.google.com/adsense/)
2. Dapatkan Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)
3. Edit `public_html/index.html` (di cPanel atau lokal):
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID_HERE" crossorigin="anonymous"></script>
   ```
4. Buka Admin Dashboard → Pengaturan Iklan
5. Aktifkan iklan dan masukkan Publisher ID

---

## <a name="troubleshooting"></a>4️⃣ Troubleshooting

### ❓ Halaman Blank / Putih

**Penyebab:** Assets tidak load atau JS error

**Solusi:**
```
1. F12 → Console → cek error message
2. F12 → Network → cek file yang status 404
3. If error "Cannot find module":
   - Pastikan .htaccess ter-upload
   - Cek permission file (644)
4. If still blank:
   - Contact hosting support
   - Enable mod_rewrite di Apache
```

### ❓ Routing Tidak Bekerja (404 di halaman lain)

**Penyebab:** .htaccess tidak aktif

**Solusi Quick:**
1. Buka `index.html` lokal
2. Ubah `BrowserRouter` jadi `HashRouter` di `App.tsx`
3. Rebuild dan upload ulang
4. Akses via hash: `https://yourdomain.com/#/berita`

**Solusi Proper:**
1. Buka cPanel → EasyApache/Apache Configuration
2. Pastikan `mod_rewrite` enabled
3. Cek `.htaccess` di-upload dengan benar
4. Set permission `.htaccess` ke 644

### ❓ Image Tidak Muncul

**Penyebab:** Path image salah

**Solusi:**
1. F12 → Network → filter Images
2. Lihat actual URL yang di-request
3. Pastikan folder `images/` ada di public_html
4. Check spelling: case-sensitive!

### ❓ Admin Login Tidak Bekerja

**Penyebab:** localStorage cache lama

**Solusi:**
1. F12 → Application → Local Storage
2. Delete seluruh entries
3. Refresh page
4. Coba login lagi

### ❓ Google Login Error

**Penyebab:** Client ID salah atau domain tidak di-whitelist

**Solusi:**
1. Cek Google Cloud Console
2. Pastikan `yourdomain.com` ada di authorized redirect URIs
3. Wait 5-10 minutes (Google cache)
4. Clear browser cache: Ctrl+Shift+Del

### ❓ AdSense Iklan Tidak Muncul

**Penyebab:** Publisher ID salah atau belum approved

**Solusi:**
1. Cek Google AdSense account
2. Verify Publisher ID: `ca-pub-xxxxx...`
3. Jika pending approval: tunggu 24-48 jam
4. Admin Dashboard → Pengaturan Iklan → Aktifkan

---

## 📞 Quick Support

| Problem | Quick Fix |
|---------|-----------|
| Blank page | `F12` → Console → cek error |
| 404 errors | Upload `.htaccess` |
| Images missing | Check `images/` folder path |
| Login fails | Clear localStorage |
| Ads not showing | Verify Publisher ID |
| Slow loading | Enable gzip di cPanel |

---

## 📊 File Penting

| File | Fungsi | Lokasi |
|------|--------|--------|
| `.htaccess` | Apache routing rules | `public_html/` |
| `index.html` | Entry point | `public_html/` |
| `vite.config.ts` | Build config | `app/` |
| Settings | localStorage | Browser |
| Berita & User | localStorage | Browser |

---

## ✅ Pre-Launch Checklist

- [ ] Build successful (`npm run build`)
- [ ] All files uploaded to cPanel
- [ ] `.htaccess` ter-upload (unhide hidden files)
- [ ] Homepage loads correctly
- [ ] Navigation works (no 404)
- [ ] Admin dashboard accessible
- [ ] No console errors
- [ ] Mobile responsive (check with phone)
- [ ] Google Services configured (if needed)
- [ ] SSL certificate enabled (https)
- [ ] Backup data di tempat aman

---

## 🎉 Selesai!

Website Anda sekarang **siap production!**

Untuk update di masa depan:
1. Edit file di folder `app/src/`
2. Run `npm run build`
3. Upload dari `app/dist/` atau `public_html/`

**Happy coding! 🚀**

---

**Created:** 27 Maret 2026
**Updated:** 27 Maret 2026
