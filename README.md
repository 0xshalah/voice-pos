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
| **Web Speech API** | Speech Recognition |
| **Groq AI (Llama 3.1)** | Natural Language Processing |
| **LocalStorage** | Data Persistence |

## 📦 Instalasi

### Prerequisites
- Node.js 18+
- NPM atau Yarn
- Browser modern (Chrome/Edge recommended)
- Groq API Key (gratis di [console.groq.com](https://console.groq.com))

### Quick Start

```bash
# Clone repository
git clone https://github.com/0xshalah/voice-pos.git
cd voice-pos

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

### Konfigurasi API Key

1. Buka aplikasi di browser
2. Klik ikon ⚙️ (Pengaturan) di pojok kanan atas
3. Pilih "Konfigurasi AI Otak"
4. Masukkan Groq API Key kamu
5. Klik "Simpan Konfigurasi"

> 💡 Dapatkan API Key gratis di [console.groq.com](https://console.groq.com)

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

**Enggan Bayar (Easter Egg 😂):**
- "Gak punya duit"
- "Bokek nih"
- "Gabisa bayar"
→ AI akan suruh cuci piring!

**Lainnya:**
- "Berapa totalnya?"
- "Hapus semua"

**Bicara di Luar Konteks:**
→ YNTKTS sound effect! 🔊

## 📊 Arsitektur Sistem

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Voice    │────▶│  Web Speech API  │────▶│   Transcript    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Update Cart   │◀────│   Parse JSON     │◀────│   Groq AI API   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
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
├── src/
│   ├── services/
│   │   └── groqAI.js      # AI service untuk Groq API
│   ├── App.jsx            # Main React component
│   ├── App.css            # Styles
│   └── main.jsx           # Entry point
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## 🔮 Roadmap

- [x] Voice recognition Bahasa Indonesia
- [x] AI-powered NLU dengan Groq
- [x] Cart management
- [x] Payment flow
- [x] Transaction history
- [x] Dashboard analytics
- [x] Easter egg: Cuci piring untuk yang enggan bayar 😂
- [x] YNTKTS sound effect untuk bicara di luar konteks
- [ ] Multi-language support
- [ ] Offline mode (PWA)
- [ ] Printer integration
- [ ] Inventory management
- [ ] Multi-outlet support

## � STim Pengembang

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
