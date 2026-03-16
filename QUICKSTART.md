# ⚡ Quick Start Guide - Local Development

Panduan cepat untuk setup dan run project **Explore Batam Next.js** di local/perangkat kamu.

## 📋 Prerequisites

### 1. Install Node.js

**Minimum: Node.js 18.17 atau lebih tinggi**

**Check versi Node.js:**
```bash
node --version
```

**Kalau belum install atau versi lama:**

- **Windows**: Download dari [nodejs.org](https://nodejs.org/) → pilih LTS version
- **Mac**: 
  ```bash
  # Via Homebrew
  brew install node
  ```
- **Linux**: 
  ```bash
  # Ubuntu/Debian
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

### 2. Install Git (Optional tapi recommended)

**Check Git:**
```bash
git --version
```

**Install Git:**
- Download dari [git-scm.com](https://git-scm.com/)

### 3. Text Editor

Recommended: **VS Code** ([code.visualstudio.com](https://code.visualstudio.com/))

**VS Code Extensions (Optional but helpful):**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter

## 🚀 Setup Project

### Method 1: Download ZIP (Paling Mudah)

1. **Download project**
   - Go to GitHub repository
   - Click "Code" → "Download ZIP"
   - Extract ZIP file

2. **Open di Terminal/CMD**
   ```bash
   # Windows (CMD atau PowerShell)
   cd C:\path\to\explore-batam\nextjs-app
   
   # Mac/Linux
   cd /path/to/explore-batam/nextjs-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```
   
   Wait 1-3 menit (tergantung internet speed)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   - Buka [http://localhost:3000](http://localhost:3000)
   - Website langsung jalan! 🎉

### Method 2: Via Git Clone

```bash
# Clone repository
git clone https://github.com/your-username/explore-batam.git

# Masuk ke folder
cd explore-batam/nextjs-app

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Akses di Perangkat Lain (HP/Tablet)

### Via Local Network

1. **Check IP Address komputer kamu**
   
   **Windows:**
   ```bash
   ipconfig
   # Look for "IPv4 Address" (contoh: 192.168.1.100)
   ```
   
   **Mac/Linux:**
   ```bash
   ifconfig
   # atau
   ip addr show
   # Look for inet (contoh: 192.168.1.100)
   ```

2. **Run dev server dengan --host**
   ```bash
   npm run dev -- --hostname 0.0.0.0
   ```

3. **Akses dari HP/Tablet**
   - Pastikan HP/Tablet dalam WiFi yang sama
   - Buka browser di HP
   - Go to: `http://192.168.1.100:3000`
   - (Ganti 192.168.1.100 dengan IP komputer kamu)

### Via ngrok (Akses dari Internet)

**Untuk share ke orang lain via internet:**

1. **Install ngrok**
   - Download dari [ngrok.com](https://ngrok.com/)
   - Extract & setup

2. **Run ngrok**
   ```bash
   # Terminal 1: Run Next.js
   npm run dev
   
   # Terminal 2: Run ngrok
   ngrok http 3000
   ```

3. **Share URL**
   - Ngrok akan kasih URL: `https://xxxx-xx-xxx.ngrok.io`
   - Share URL ini ke siapa aja
   - Mereka bisa akses dari mana aja!

## 📱 Testing di Mobile Device

### Via Chrome DevTools

1. Run `npm run dev`
2. Open Chrome → F12 (DevTools)
3. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
4. Select device (iPhone, Samsung, etc)
5. Test responsive design

### Via Real Device

**Method 1: Local Network (Recommended)**
```bash
# Run with custom host
npm run dev -- --hostname 0.0.0.0

# Access from phone: http://YOUR-IP:3000
```

**Method 2: USB Debugging (Android)**
1. Enable USB Debugging di HP
2. Connect HP ke komputer via USB
3. Chrome → `chrome://inspect`
4. Port forwarding: 3000 → 3000
5. Access `localhost:3000` dari HP

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Run linting
npm run lint

# Clean cache (if needed)
rm -rf .next
npm run dev
```

## 🐛 Troubleshooting

### Error: "Port 3000 is already in use"

**Solution 1: Kill process**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Solution 2: Use different port**
```bash
npm run dev -- -p 3001
# Access: http://localhost:3001
```

### Error: "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot find module 'next'"

```bash
# Make sure you're in correct directory
cd nextjs-app

# Reinstall
npm install
```

### Images not loading

- Check internet connection
- Images dari Unsplash CDN butuh internet
- Wait a few seconds untuk load

### Map not showing

- Check console for errors
- Make sure Leaflet CSS loaded
- Check browser console (F12)

### CSS not applying

```bash
# Rebuild Tailwind
npm run dev
# Stop and restart if needed
```

## 📊 Development Workflow

### 1. Make Changes

Edit files di `app/`, `components/`, atau `lib/`

### 2. See Changes

Next.js auto-reload! Save file → browser refresh otomatis

### 3. Check Console

Always check browser console (F12) untuk errors

### 4. Test Responsive

- Mobile view (DevTools)
- Tablet view
- Desktop view

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:
```js
colors: {
  primary: '#YOUR_COLOR',
  // ...
}
```

### Add New Place

Edit `lib/data.ts` → add to `PLACES_DATA` array

### Add New Page

Create file di `app/your-page/page.tsx`

## 📁 Project Structure Overview

```
nextjs-app/
├── app/                  # Pages & routes
│   ├── page.tsx         # Homepage (/)
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/          # Reusable components
├── lib/                 # Utilities & data
│   └── data.ts         # Places database
├── types/              # TypeScript types
├── public/             # Static files
└── package.json        # Dependencies
```

## 🚀 Ready to Deploy?

Setelah test di local dan semua OK, ready untuk deploy ke Vercel!

See main [README.md](./README.md) untuk deployment guide.

## ❓ Need Help?

### Check Logs

```bash
# Terminal akan show errors
# Browser console (F12) → Console tab
```

### Common Issues

1. Port already in use → Use different port
2. Module not found → Reinstall dependencies
3. Build errors → Check console logs
4. Styling issues → Clear cache & rebuild

### Still Stuck?

- Check [Next.js Docs](https://nextjs.org/docs)
- Check project README.md
- Google the error message
- Ask in GitHub Issues

## 🎉 You're Ready!

```bash
# Quick recap:
cd nextjs-app
npm install
npm run dev
# Open http://localhost:3000
```

Happy coding! 🚀

---

**Next Steps:**
- ✅ Setup local development
- 🔄 Make changes & test
- 📱 Test on mobile
- 🚀 Deploy to Vercel
