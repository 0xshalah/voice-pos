# 🎤 Voice POS - Kasir Suara Berbasis AI

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq_AI-Llama_3.1-FF6B35?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <b>Solusi kasir modern untuk UMKM Indonesia dengan teknologi Voice Recognition dan AI</b>
</p>

---

## 🚀 Demo

> **"Ayam bakar dua sama es teh"** → AI langsung memproses dan menambahkan ke keranjang!

## 💡 Latar Belakang Masalah

Di Indonesia, banyak pelaku UMKM (warung makan, kedai kopi, PKL) menghadapi tantangan:

- ❌ **Keterbatasan SDM** - Pemilik sering merangkap sebagai kasir, koki, dan pelayan
- ❌ **Antrian panjang** - Input manual ke mesin kasir memakan waktu
- ❌ **Kesalahan pencatatan** - Human error saat rush hour
- ❌ **Biaya tinggi** - Sistem POS modern terlalu mahal untuk UMKM kecil
- ❌ **Literasi digital rendah** - Banyak pelaku UMKM tidak familiar dengan teknologi

## ✨ Solusi: Voice POS

**Voice POS** adalah aplikasi kasir berbasis web yang menggunakan **Speech Recognition** dan **AI (Groq Llama 3.1)** untuk memproses pesanan melalui suara dalam **Bahasa Indonesia**.

### Keunggulan Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🎤 **Voice-First** | Cukup bicara, tidak perlu ketik atau klik |
| 🧠 **AI-Powered** | Memahami bahasa informal Indonesia ("bang, ayam dua ya") |
| ⚡ **Super Cepat** | Proses pesanan dalam hitungan detik |
| 💰 **Gratis** | Open source, tanpa biaya langganan |
| 📱 **Responsive** | Berjalan di HP, tablet, atau laptop |
| 🔊 **Voice Feedback** | AI merespons dengan suara (TTS) |

## 🎯 Fitur Lengkap

### 1. Natural Language Understanding
```
Input: "Mas, ayam bakar dua sama es teh tiga ya"
Output: 2x Ayam Bakar + 3x Es Teh Manis ✅
```

### 2. Smart Cart Management
- Tambah item dengan suara
- Hapus item ("gajadi es tehnya")
- Update quantity ("tambah satu lagi")
- Clear cart ("batalkan semua")

### 3. Checkout Cerdas
```
Input: "Udah, bayar aja"
Output: Proses pembayaran otomatis ✅
```

### 4. Dashboard & Laporan
- Ringkasan penjualan harian
- Produk terlaris
- Export laporan CSV

### 5. Pengaturan Lengkap
- Mode gelap/terang
- Voice feedback on/off
- Sound effects
- Konfigurasi API Key

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **React 19** | UI Framework |
| **Vite 7** | Build Tool |
| **Tailwind CSS 4** | Styling |
| **Express.js** | Backend Proxy Server |
| **Web Speech API** | Speech Recognition |
| **Groq AI (Llama 3.1)** | Natural Language Processing |
| **LocalStorage** | Data Persistence |

## 📦 Instalasi

### Prerequisites
- Node.js 18+
- NPM atau Yarn
- Browser modern (Chrome/Edge recommended)

### Quick Start

```bash
# Clone repository
git clone https://github.com/0xshalah/voice-pos.git
cd voice-pos

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Menjalankan Aplikasi

**Development (2 terminal):**

```bash
# Terminal 1 - Backend proxy server
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

**Atau jalankan keduanya:**
```bash
# Install concurrently (opsional)
npm install -g concurrently

# Jalankan frontend + backend
concurrently "npm run dev" "cd server && npm run dev"
```

### Environment Variables (Server)

```env
# server/.env (opsional, sudah ada default)
GROQ_API_KEY=gsk_your_api_key_here
PORT=3001
```

> ⚠️ **Keamanan:** API Key disimpan di backend server, tidak terekspos ke client-side.

## 🎮 Cara Penggunaan

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Mulai/Stop voice input |
| `Enter` | Konfirmasi pembayaran |
| `Escape` | Kosongkan keranjang |

### Voice Commands (Bahasa Indonesia)

**Menambah Pesanan:**
- "Ayam bakar dua"
- "Es teh manis tiga"
- "Nasi putih satu"
- "Ayam sama es teh"

**Menghapus Pesanan:**
- "Gajadi es tehnya"
- "Hapus ayam bakar"
- "Batalkan nasi"

**Checkout:**
- "Bayar"
- "Selesai"
- "Udah, checkout"

**Lainnya:**
- "Berapa totalnya?"
- "Hapus semua"

## 📊 Arsitektur Sistem

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Voice    │────▶│  Web Speech API  │────▶│   Transcript    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Update Cart   │◀────│   Parse JSON     │◀────│  Backend Proxy  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │   Groq AI API       │
                                               │   (API Key Secure)  │
                                               └─────────────────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │  Voice Response     │
                                               │  (Text-to-Speech)   │
                                               └─────────────────────┘
```

## 📁 Struktur Project

```
voice-pos/
├── server/                 # Backend proxy server
│   ├── index.js           # Express server (API key tersimpan di sini)
│   └── package.json
├── src/
│   ├── services/
│   │   └── groqAI.js      # AI service (calls proxy)
│   ├── App.jsx            # Main React component
│   └── ...
├── package.json           # Frontend dependencies
└── vite.config.js         # Vite config dengan proxy
```

## 🔮 Roadmap

- [x] Voice recognition Bahasa Indonesia
- [x] AI-powered NLU dengan Groq
- [x] Cart management
- [x] Payment flow
- [x] Transaction history
- [x] Dashboard analytics
- [ ] Multi-language support
- [ ] Offline mode (PWA)
- [ ] Printer integration
- [ ] Inventory management
- [ ] Multi-outlet support

## 👥 Tim Pengembang

**HACKATHON IMPHNEN 2024**

| Nama | Role |
|------|------|
| Shalahuddin | Full Stack Developer |

## 📄 Lisensi

MIT License - Bebas digunakan untuk keperluan komersial maupun non-komersial.

## 🙏 Acknowledgments

- [Groq](https://groq.com) - Lightning-fast AI inference
- [Meta Llama](https://llama.meta.com) - Open source LLM
- [IMPHNEN](https://imphnen.dev) - Komunitas programmer Indonesia

---

<p align="center">
  <b>🇮🇩 Dibuat dengan ❤️ untuk UMKM Indonesia</b>
</p>

<p align="center">
  <a href="https://github.com/0xshalah/voice-pos">⭐ Star this repo</a> •
  <a href="https://github.com/0xshalah/voice-pos/issues">🐛 Report Bug</a> •
  <a href="https://github.com/0xshalah/voice-pos/pulls">✨ Request Feature</a>
</p>
