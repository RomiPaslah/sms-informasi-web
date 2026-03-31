# Panduan Fitur Guest Comments & Video Upload

## Ringkasan Implementasi

Anda telah berhasil mengimplementasikan dua fitur besar:

### 1. **Fitur Komentar Guest (Tanpa Login)**

Pengunjung website dapat sekarang memberikan komentar dan emotikon pada postingan berita **tanpa harus login atau membuat akun**. 

#### Cara Kerja:
- **Guest Comments**: Pengunjung cukup mengisi nama dan email di form "Tambah Komentar", tidak perlu login
- **Guest Reactions**: Pengunjung dapat memberikan emotikon/reaksi langsung tanpa login
  - Sistem menggunakan unique ID berbasis localStorage untuk melacak reaksi guest
  - Setiap komentar guest ditandai dengan badge "Pengunjung"

#### File yang Dimodifikasi:

**Backend:**
- ✅ `/public_html/api/setup.php` - Database schema untuk mendukung guest fields
- ✅ `/public_html/api/comments.php` - Handle guest & registered user comments
- ✅ `/public_html/api/reactions.php` - Handle guest & registered user reactions  
- ✅ `/public_html/api/news.php` - Return guest info dalam comments & reactions
- ✅ `/public_html/api/config.php` - Tambah helper function `getAuthUser()`

**Frontend:**
- ✅ `app/src/types/index.ts` - Update interfaces untuk guest support
- ✅ `app/src/lib/api.ts` - Update API clients untuk guest parameters
- ✅ `app/src/context/NewsContext.tsx` - Handle guest comments flow
- ✅ `app/src/components/news/GuestCommentForm.tsx` - **NEW**: Form khusus guest
- ✅ `app/src/components/news/NewsEngagement.tsx` - Support guest reactions
- ✅ `app/src/pages/NewsDetail.tsx` - Display guest form & comments

#### Preview Fitur:

**GuestCommentForm Component:**
- Terletak di `components/news/GuestCommentForm.tsx`
- Menampilkan form: Nama, Email, Komentar
- Validasi client-side untuk email
- Feedback success/error
- Bisa di-reuse di mana saja

**NewsDetail Page:**
- Section "Diskusi & Komentar" menampilkan:
  1. GuestCommentForm (selalu visible)
  2. UserCommentForm (jika user login)
  3. List semua comments dengan badge penanda (Guest/Registered)

---

### 2. **Fitur Upload Video untuk Berita (Admin Only)**

Admin dapat menambahkan video ke postingan berita untuk enhancement konten.

#### Cara Kerja:
- **Input Video URL**: Admin mengisi URL video (YouTube, Vimeo, atau video hosting lain)
- **Display Video**: Video ditampilkan dengan responsive iframe di halaman detail berita
- **Optional Field**: Field video adalah opsional, tidak wajib diisi
- **Support Format**: 
  - YouTube: `https://youtube.com/embed/VIDEO_ID`
  - Vimeo: `https://vimeo.com/VIDEO_ID` 
  - Direct URL: `https://example.com/video.mp4`

#### File yang Dimodifikasi:

**Backend:**
- ✅ `/public_html/api/setup.php` - Database schema `video_url` column
- ✅ `/public_html/api/news.php` - Handle video_url in create/update/get operations

**Frontend:**
- ✅ `app/src/types/index.ts` - Tambah `video_url` field ke News interface
- ✅ `app/src/lib/api.ts` - Extend NewsFormPayload untuk video
- ✅ `app/src/pages/NewsForm.tsx` - Input field untuk video URL
- ✅ `app/src/pages/NewsDetail.tsx` - Display video section

#### UI di NewsForm:
```
Media Utama Section
├── URL Gambar
├── Upload Gambar Lokal  
├── Pilihan Gambar Sample
├── Preview Gambar
└── ✨ NEW: URL Video (Opsional)
    └── Helper text: "Link video YouTube, Vimeo, atau hosting lain"
```

#### UI di NewsDetail:
```
Article Content
├── Konten artikel
└── [Tombol "Baca Selengkapnya"]

✨ NEW: Video Section (jika ada)
└── Responsive Video Player (16:9 aspect ratio)

Comments Section
├── Guest Comment Form
├── User Comment Form (jika login)
└── List Komentar
```

---

## Testing Checklist

### Guest Comments:

- [ ] Buka halaman detail berita (`/berita/:id`)
- [ ] Tanpa login, isi form "Tambah Komentar" (Nama, Email, Komentar)
- [ ] Submit dan verify komentar muncul dengan badge "Pengunjung"
- [ ] Provision email verification untuk delete comment (opsional)
- [ ] Multiple guest comments berfungsi dengan baik

### Guest Reactions:

- [ ] Buka halaman detail berita
- [ ] Tanpa login, klik emotikon/reaksi
- [ ] Verify emotikon ter-record tanpa page refresh
- [ ] Refresh page, verify emotikon masih ada (localStorage-based)
- [ ] Klik emotikon yang sama untuk toggle off

### Video Upload (Admin):

- [ ] Login sebagai admin
- [ ] Buat berita baru (atau edit existing)
- [ ] Isi URL Video: `https://www.youtube.com/embed/VIDEO_ID`
- [ ] Save berita
- [ ] Buka detail berita, verify video ditampilkan
- [ ] Test dengan YouTube, Vimeo, atau direct URL
- [ ] Biarkan field video kosong, verify berita masih berfungsi

### User Comments (Existing Feature):

- [ ] Login sebagai user
- [ ] Verify user comment form ditampilkan di NewsDetail
- [ ] Submit comment sebagai user
- [ ] Verify user comments dan guest comments tampil bersama
- [ ] User comment ter-label dengan badge "Pengguna Terdaftar"

---

## Database Schema Changes

### Tabel `comments`:
```sql
ALTER TABLE comments ADD COLUMN user_email VARCHAR(191);
ALTER TABLE comments ADD COLUMN guest_email VARCHAR(191);
ALTER TABLE comments MODIFY COLUMN user_id INT NULL;
```

### Tabel `news`:
```sql
ALTER TABLE news ADD COLUMN video_url LONGTEXT NULL;
```

### Tabel `reactions`:
```sql
ALTER TABLE reactions ADD COLUMN guest_id VARCHAR(100);
ALTER TABLE reactions MODIFY COLUMN user_id VARCHAR(100) NULL;
```

> ✅ Sudah di-setup di dalam script `setup.php`

---

## Backend API Endpoints

### Comments Endpoint: `/api/comments.php`

**POST - Guest Comment:**
```json
{
  "newsId": "news-123",
  "content": "Komentar singkat",
  "userName": "Nama Pengunjung",
  "guestEmail": "guest@example.com"
}
```

**POST - User Comment:**
```json
{
  "newsId": "news-123",
  "content": "Komentar pengguna"
}
```

**DELETE - Guest Comment (dengan email verification):**
```
DELETE /api/comments.php?id=COMMENT_ID
Body: { "guestEmail": "guest@example.com" }
```

### Reactions Endpoint: `/api/reactions.php`

**POST - Guest Reaction:**
```json
{
  "newsId": "news-123",
  "emoji": "👍",
  "guestId": "guest_1234567890_abc123"
}
```

**POST - User Reaction:**
```json
{
  "newsId": "news-123",
  "emoji": "👍",
  "userId": "123"
}
```

### News Endpoint: `/api/news.php`

**POST - Create News dengan Video:**
```json
{
  "title": "Judul Berita",
  "content": "<p>Konten berita</p>",
  "excerpt": "Ringkasan",
  "image": "/images/hero.jpg",
  "video_url": "https://www.youtube.com/embed/VIDEO_ID",
  "category": "Berita",
  "published": true
}
```

---

## Fitur Tambahan yang Bisa Dikembangkan

1. **Email Notification**
   - Notify admin ketika ada comment guest baru
   - Notify kepada commenter jika ada reply

2. **Comment Moderation**
   - Admin perlu approve guest comments sebelum published
   - Flag spam/inappropriate comments

3. **Comment Threading**
   - Nested comments/replies untuk lebih interaktif

4. **Advanced Video Support**
   - Upload video lokal ke server
   - Video preview thumbnail
   - Transcoding untuk multiple quality

5. **Analytics**
   - Track guest reactions & comments
   - Most engaged articles

6. **Notification System**
   - Real-time comment updates
   - Like/mention notifications

---

## Catatan Penting

⚠️ **Database Migration:**
- Jika menggunakan database yang sudah ada, jalankan setup.php atau execute migration SQL
- Backup database sebelum menjalankan schema changes

⚠️ **Deployment:**
- Test fitur di development terlebih dahulu
- Verify CORS headers di `/public_html/api/config.php` sudah proper
- Check localStorage support di browser yang ditargetkan

⚠️ **Spam Prevention:**
- Pertimbangkan menambah CAPTCHA untuk guest comments di masa depan
- Rate limiting untuk prevent comment spam

---

## Troubleshooting

### Guest Comments tidak muncul:
1. Check browser console untuk error
2. Verify database columns sudah ditambahkan
3. Check API logs di server

### Video tidak ditampilkan:
1. Verify URL format benar (gunakan embed URL untuk YouTube)
2. Check iframing allowed (no X-Frame-Options block)
3. Verify video_url column exist di database

### Emotikon guest tidak persist:
1. Check localStorage enabled di browser
2. Verify setGuestId() dipanggil di useEffect
3. Check guestId format: `guest_TIMESTAMP_RANDOM`

---

## Support & Next Steps

Fitur sudah siap production! Untuk deployment:

1. Run setup.php atau execute migrations
2. Test semua fitur di staging
3. Monitor guest comments untuk quality
4. Collect user feedback untuk improvement

---

Dokumentasi dibuat: **31 Maret 2026**
