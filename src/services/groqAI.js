// Groq AI Service for Natural Language Understanding - Production Ready

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Menu untuk context AI
const MENU = [
  { name: 'Ayam Bakar', price: 15000, aliases: ['ayam', 'ayam bakar', 'ayam panggang'] },
  { name: 'Es Teh Manis', price: 5000, aliases: ['es teh', 'teh', 'es teh manis', 'esteh', 'teh manis'] },
  { name: 'Nasi Putih', price: 4000, aliases: ['nasi', 'nasi putih'] },
]

const SYSTEM_PROMPT = `Kamu adalah asisten kasir AI untuk warung makan Indonesia yang LUCU dan FRIENDLY. Tugasmu menganalisis perintah suara pelanggan dan mengembalikan JSON.

KEPRIBADIAN:
- Kamu pelayan warung yang ramah, lucu, dan suka bercanda
- Pakai bahasa gaul Indonesia yang natural
- Sesekali kasih candaan atau respons lucu
- Tapi tetap profesional dan helpful

MENU TERSEDIA:
${MENU.map(m => `- ${m.name}: Rp ${m.price.toLocaleString('id-ID')} (alias: ${m.aliases.join(', ')})`).join('\n')}

ATURAN PARSING:
1. Angka bisa berupa kata: satu=1, dua=2, tiga=3, empat=4, lima=5, enam=6, tujuh=7, delapan=8, sembilan=9, sepuluh=10
2. "sama", "dan", "plus", "dengan" = menambah item lain
3. "gajadi", "ga jadi", "batal", "hapus", "cancel" + nama item = hapus item tersebut
4. "hapus semua", "batalkan semua", "kosongkan" = clear cart
5. "bayar", "selesai", "checkout", "konfirmasi", "udah", "cukup" = proses pembayaran
6. "berapa", "total", "harga" = query informasi
7. "tambah satu lagi", "lagi satu" = tambah 1 item terakhir yang disebut/ditambahkan
8. Jika quantity tidak disebutkan, default = 1

BAHASA INFORMAL YANG HARUS DIPAHAMI:
- "bang", "mas", "kak", "pak" = sapaan, abaikan
- "dong", "deh", "aja", "ya", "yuk" = partikel, abaikan
- "mau", "pesan", "order", "beli" = intent add
- "gak jadi", "ga jadi", "gajadi", "cancel" = intent remove
- "gak punya duit", "ga ada uang", "bokek", "kantong kering", "gabisa bayar", "gak bisa bayar" = intent refuse_pay (pelanggan enggan bayar)

FORMAT OUTPUT (JSON ONLY, NO MARKDOWN):
{
  "intent": "add_item|remove_item|clear_cart|checkout|query|greeting|refuse_pay|out_of_context",
  "items": [{"action": "add|remove", "name": "NAMA PERSIS DARI MENU", "quantity": NUMBER}],
  "voice_response": "Respons ramah dalam Bahasa Indonesia",
  "suggestion": "Saran opsional atau null"
}

DETEKSI OUT OF CONTEXT (PENTING!):
Jika pelanggan bicara hal yang TIDAK BERHUBUNGAN dengan:
- Memesan makanan/minuman
- Membatalkan pesanan
- Bertanya harga/total
- Proses pembayaran
- Sapaan/greeting

Maka gunakan intent "out_of_context". Contoh bicara di luar konteks:
- Curhat masalah pribadi
- Tanya soal politik, agama, berita
- Minta bantuan coding/programming
- Tanya hal random yang tidak ada hubungannya dengan warung
- Ngobrol ngalor ngidul

Untuk out_of_context: cukup kembalikan intent "out_of_context" saja, voice_response bisa kosong atau "YNTKTS".

Untuk refuse_pay (PELANGGAN GAK MAU BAYAR - WAJIB BERCANDA):
- "Wah kalo gitu cuci piring dulu ya kak, ada 100 piring nunggu~"
- "Yaudah gapapa kak, piringnya banyak nih butuh bantuan cuci"
- "Oke kak, kebetulan butuh tukang cuci piring nih hehe"
- "Santai kak, bisa bayar pake tenaga. Cuci piring 2 jam ya!"
- "Gapapa kak, dapur kita butuh superhero pencuci piring!"
- "Wkwk yaudah kak, shift cuci piring jam 8 malem ya"
- "Boleh kak, tapi ada syaratnya: cuci piring sampe kinclong!"

PENTING:
- Gunakan nama produk PERSIS seperti di menu (case sensitive)
- Jangan tambahkan markdown atau formatting lain, hanya JSON murni
- Setelah menambahkan item, kadang kasih saran menu yang cocok
- voice_response harus natural dan ramah seperti pelayan warung`


export async function processWithGroq(userMessage, currentCart, apiKey) {
  if (!apiKey) {
    throw new Error('API Key Groq belum diatur. Silakan masukkan di Pengaturan.')
  }

  // Build cart context
  const cartContext = currentCart.length > 0 
    ? `\n\nKERANJANG SAAT INI:\n${currentCart.map(item => `- ${item.quantity}x ${item.name}`).join('\n')}\nTotal: Rp ${currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('id-ID')}`
    : '\n\nKERANJANG: Kosong'

  // Get last added item for context
  const lastItem = currentCart.length > 0 ? currentCart[currentCart.length - 1].name : null
  const lastItemContext = lastItem ? `\nItem terakhir ditambahkan: ${lastItem}` : ''

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT + cartContext + lastItemContext
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `API Error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from AI')
    }

    // Parse JSON, handle potential markdown wrapping
    let parsed
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleanContent)
    } catch (e) {
      console.error('JSON Parse Error:', content)
      // Fallback response
      return {
        intent: 'unclear',
        items: [],
        voice_response: 'Maaf, saya tidak mengerti. Coba ulangi pesanan Anda.',
        suggestion: null
      }
    }

    // Validate and normalize response
    return {
      intent: parsed.intent || 'unclear',
      items: Array.isArray(parsed.items) ? parsed.items.map(item => ({
        action: item.action || 'add',
        name: normalizeProductName(item.name),
        quantity: parseInt(item.quantity) || 1
      })) : [],
      voice_response: parsed.voice_response || 'Pesanan diproses',
      suggestion: parsed.suggestion || null
    }
  } catch (error) {
    console.error('Groq AI Error:', error)
    throw error
  }
}

// Normalize product name to match exactly with menu
function normalizeProductName(name) {
  if (!name) return null
  const lower = name.toLowerCase().trim()
  
  for (const product of MENU) {
    // Exact match
    if (product.name.toLowerCase() === lower) return product.name
    // Alias match
    if (product.aliases.some(alias => alias.toLowerCase() === lower)) return product.name
    // Partial match
    if (product.aliases.some(alias => lower.includes(alias) || alias.includes(lower))) return product.name
  }
  
  // Fuzzy fallback
  if (lower.includes('ayam')) return 'Ayam Bakar'
  if (lower.includes('teh') || lower.includes('es')) return 'Es Teh Manis'
  if (lower.includes('nasi')) return 'Nasi Putih'
  
  return name // Return original if no match
}

// Product database for UI
export const PRODUCTS = {
  'Ayam Bakar': { 
    name: 'Ayam Bakar', 
    price: 15000, 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA20n4GmtIxIBQhtLJN2DMfC8CT3vPYFCDwfzBaTgI8eog3GHPQgEAhuAdtDrhyK7R7qfmgYv-oYf7Wtb4eVHWj5Wu09KP3NwKPPdfsx_hb0955qmc8SSB0DmrMUYmSQkBfCtwcjFZKarWdB3XGxm37-0V5ZACiEe5UlobCEC-G27lGCCHYMFOpnycniVesoO2NcQ8kQ7bHlMlp38-tSSY02O9Sy2cuWA407NTruTlmx6LF7QbXbp5mXbiKYPwo840esb-yBJUMe2U' 
  },
  'Es Teh Manis': { 
    name: 'Es Teh Manis', 
    price: 5000, 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6pp7G79RRtX5ts0RFJMnZokSyPEFaFgdYQ-hwn4zvoPUi5AAHPwlH9je2jNPIsgZy-JUipVFpp8yIsTyU15d4ByGrwgzQ8d5JuyVIFvl8CwonnerqIvLT1fAPMI-6M8anUPLUY6zgq80nPTG-It52J8pI557Sd4BSDs27-iOcsx3UBhgDpsaIxH4YGEaZ5xlsJiiYhifiUUDSYjT8tnlFQkYcZuRp1bS6LalXgAfZR_WINOxphKF7DWNKFyKgek-dXgISA7LBaPM' 
  },
  'Nasi Putih': { 
    name: 'Nasi Putih', 
    price: 4000, 
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=200&fit=crop' 
  },
}

export function getProductByName(name) {
  if (!name) return null
  const normalized = normalizeProductName(name)
  return PRODUCTS[normalized] || null
}
