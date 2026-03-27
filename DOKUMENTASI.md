# Sinergi Muda Strategis - Dokumentasi Teknis

## 🏗️ Arsitektur Aplikasi

### Technology Stack

```
Frontend:
- React 18 (dengan TypeScript)
- React Router (SPA Navigation)
- Tailwind CSS (Styling)
- Radix UI (Components)
- Vite (Build Tool)

State Management:
- React Context API
  - AuthContext (Login/Users)
  - NewsContext (Berita & Komentar)
  - ThemeContext (Dark Mode)
  - SiteContentContext (Homepage & Settings)

Storage:
- localStorage (Persistent Data)
- Browser Sessions

External Services:
- Google OAuth 2.0
- Google AdSense (Monetization)
```

## 📂 Struktur Aplikasi

```
app/
├── src/
│   ├── components/           # Reusable UI Components
│   │   ├── ui/              # Shadcn UI Components
│   │   ├── news/            # News Components
│   │   ├── Ad.tsx           # Ad Component
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── context/             # State Management
│   │   ├── AuthContext.tsx
│   │   ├── NewsContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── SiteContentContext.tsx
│   ├── pages/               # Page Components
│   │   ├── Home.tsx
│   │   ├── News.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── lib/                 # Utilities
│   │   ├── utils.ts
│   │   ├── google-auth.ts
│   │   └── image-upload.ts
│   ├── types/               # TypeScript Types
│   │   └── index.ts
│   ├── App.tsx             # Main App Component
│   └── main.tsx            # React DOM Entry
│
├── public/                 # Static Assets
│   └── images/
│
├── dist/                   # Production Build (untuk local testing)
│
└── public_html/            # DEPLOYMENT FOLDER (untuk cPanel)
    ├── .htaccess           # Apache Config
    ├── index.html
    ├── assets/
    └── images/
```

## 🔄 Data Flow

```
User Action
    ↓
Component → Context API
    ↓
localStorage (Persist)
    ↓
Re-render Component
```

## 📋 Fitur Utama

### 1. Authentication
- Login/Register lokal
- Google OAuth 2.0
- Role-based access (admin, editor, participant)

### 2. News Management
- CRUD berita
- Draft & Publish
- Image upload & compression
- Comments & reactions
- Search & filter

### 3. Homepage Management
- Edit content (About, Vision, Mission, etc)
- Manage media gallery
- Manage contact info

### 4. Advertising
- Google AdSense integration
- Custom ad management
- Position control (header, sidebar, footer, content)

### 5. Dark Mode
- Toggle theme
- Persistent theme preference

## 🔐 Security

### Implemented
- Input sanitization (React auto-escapes)
- HTTPS recommended (configure di cPanel)
- CORS configured
- localStorage encryption (via Google Auth)

### TODO
- Backend API untuk persistent data
- Database (MySQL/MongoDB)
- Server-side validation
- Rate limiting

## 🚀 Deployment Checklist

- [x] Build optimized (npm run build)
- [x] .htaccess configured
- [x] Base path set to relative paths
- [x] Images included
- [x] All assets minified
- [x] Error boundary implemented
- [ ] Google Analytics setup
- [ ] Google AdSense configured (if monetizing)
- [ ] SSL certificate enabled
- [ ] Cache headers configured

## 📦 Build Info

```
dist/index.html              0.41 kB
dist/assets/index-B0HtnpZL.js    305.23 kB (gzipped: 83.51 kB)
dist/assets/index-DQLnJMTg.css   128.40 kB (gzipped: 20.57 kB)
Total: ~434 kB (uncompressed) → ~104 kB (gzipped)
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5176/)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
tsc -b
```

## 📝 Environment Variables

Jika diperlukan di masa depan, buat `.env.local`:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=https://api.yourdomain.com
```

## 🎨 Customization Guides

### Ganti Logo
1. Replace `public/images/sms-logo.png`
2. Update reference di `src/components/Navbar.tsx`

### Ganti Warna Brand
Edit `src/index.css` atau Tailwind config:
- Brand Red: `#d90429` → ganti ke warna baru
- Ganti di seluruh components

### Tambah Halaman Baru
1. Buat file di `src/pages/NamaPage.tsx`
2. Import di `src/App.tsx`
3. Add route di Routes component

## 🐛 Debugging

### Enable Console Logging
```tsx
// Di development
console.error('Error:', error)
console.log('Debug:', value)

// Di production (F12 Console)
localStorage.setItem('debug_mode', 'true')
```

### Check Network Requests
F12 → Network tab → check XHR/Fetch requests

### Check Storage
F12 → Application → Local Storage → https://yourdomain.com

## 📱 Responsive Design

- Mobile: 328px+
- Tablet: 768px+
- Desktop: 1024px+
- Large: 1280px+

Tested on:
- iPhone (Safari)
- Android (Chrome)
- Safari (macOS)
- Chrome/Firefox (Desktop)

## 🎯 Performance Optimizations

- ✅ Code splitting (Vite auto)
- ✅ Image compression
- ✅ CSS minification
- ✅ JS minification
- ✅ Lazy loading routes
- [ ] Service Worker (PWA) - Future
- [ ] Image CDN - Future
- [ ] API caching layer - Future

## 📞 Support & Maintenance

### Weekly
- Check console errors
- Monitor performance
- Backup data

### Monthly
- Update npm packages
- Review analytics
- Check security updates

### Quarterly
- Full backup
- Performance audit
- Feature review

---

**Last Updated:** 27 Maret 2026
**Version:** 1.0.0
**Status:** Production Ready
