import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, Settings, Plus, Minus, X, Volume2, Bell, Moon, History, Printer, Check, Download, Utensils, Wine, Eye, EyeOff } from 'lucide-react'
import { processWithGroq, getProductByName, PRODUCTS } from './services/groqAI'

const PRODUCT_LIST = Object.values(PRODUCTS)
const formatCurrency = (amount) => `Rp ${amount.toLocaleString('id-ID')}`
const formatDate = (date) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)

// AI Hub Icon Component
const HubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
)

// Konfigurasi AI Otak Modal - Sesuai desain
function AIConfigModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [tempKey, setTempKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  
  if (!isOpen) return null
  
  const handleSave = () => {
    setApiKey(tempKey)
    localStorage.setItem('groq-api-key', tempKey)
    onClose()
  }
  
  const isConnected = apiKey && apiKey.length > 10
  
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative flex w-full max-w-lg flex-col gap-4 rounded-xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <p className="text-[#212121] text-2xl font-bold">Konfigurasi AI Otak</p>
            <button onClick={onClose} className="text-gray-500 hover:text-[#ff5724] transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="h-2" />
          
          {/* AI Status */}
          <div className="flex items-center gap-4 min-h-14 justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center rounded-lg size-10 ${isConnected ? 'text-green-500 bg-green-500/10' : 'text-gray-400 bg-gray-100'}`}>
                <HubIcon className="w-6 h-6" />
              </div>
              <p className="text-[#212121] text-base font-medium">{isConnected ? 'AI Connected' : 'AI Disconnected'}</p>
            </div>
            <div className="flex size-7 items-center justify-center">
              <div className={`size-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          </div>

          {/* API Key Input */}
          <div className="flex w-full flex-col items-start gap-2">
            <label className="flex flex-col w-full">
              <p className="text-[#212121] text-base font-medium pb-2">Groq API Key (Llama 3)</p>
              <div className="flex w-full flex-1 items-stretch rounded-xl group">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="gsk_..."
                  className="flex w-full min-w-0 flex-1 rounded-xl text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#ff5724]/50 border border-gray-300 bg-white h-14 placeholder:text-gray-400 p-4 rounded-r-none border-r-0 text-base"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="text-gray-400 flex border border-gray-300 bg-white items-center justify-center pr-4 rounded-r-xl border-l-0 hover:text-gray-600"
                >
                  {showKey ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </label>
          </div>
          
          {/* Helper Text */}
          <p className="text-gray-500 text-sm pt-1">
            Masukkan key dari console.groq.com untuk mengaktifkan fitur Cerdas.
          </p>
          
          <div className="h-4" />
          
          {/* Save Button */}
          <button 
            onClick={handleSave}
            className="flex w-full cursor-pointer items-center justify-center rounded-full h-12 px-5 bg-[#ff5724] text-white text-base font-bold hover:bg-[#e64d1f] transition-colors"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  )
}

// Dashboard Modal
function DashboardModal({ isOpen, onClose, history }) {
  if (!isOpen) return null
  const today = new Date().toDateString()
  const todayTx = history.filter(tx => new Date(tx.date).toDateString() === today)
  const todayTotal = todayTx.reduce((sum, tx) => sum + tx.total, 0)
  const productCount = {}
  history.forEach(tx => tx.items.forEach(item => { productCount[item.name] = (productCount[item.name] || 0) + item.quantity }))
  const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const exportCSV = () => {
    const headers = ['Tanggal', 'Items', 'Total']
    const rows = history.map(tx => [formatDate(new Date(tx.date)), tx.items.map(i => `${i.quantity}x ${i.name}`).join('; '), tx.total])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-kasir-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4" onClick={onClose}>
      <div className="relative flex w-full max-w-lg flex-col gap-6 rounded-xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        <h2 className="text-center text-2xl font-bold text-[#333]">Ringkasan Hari Ini</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-6">
            <p className="text-base font-medium text-gray-500">Total Penjualan</p>
            <p className="text-3xl font-bold text-[#333]">{formatCurrency(todayTotal)}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-6">
            <p className="text-base font-medium text-gray-500">Total Transaksi</p>
            <p className="text-3xl font-bold text-[#333]">{todayTx.length}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="px-4 text-lg font-bold text-[#333]">Produk Terlaris</h3>
          <div className="flex flex-col divide-y rounded-lg border overflow-hidden">
            {topProducts.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400">Belum ada data</div>
            ) : topProducts.map(([name, count], i) => (
              <div key={name} className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff5724]/10 text-[#ff5724]">
                    {i === 0 ? <Utensils className="w-5 h-5" /> : <Wine className="w-5 h-5" />}
                  </div>
                  <p className="text-base text-[#333]">{i + 1}. {name}</p>
                </div>
                <p className="text-base font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={exportCSV} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5724] py-3 text-base font-bold text-white hover:bg-[#e64d1f]">
          <Download className="w-5 h-5" />Download Laporan (CSV)
        </button>
      </div>
    </div>
  )
}


// Payment Success Modal
function PaymentSuccessModal({ isOpen, onClose, cart, total, onPrint }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4" onClick={onClose}>
      <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><Check className="w-12 h-12 text-green-600" /></div></div>
        <h1 className="text-[#1d100c] text-3xl font-bold pb-3">Pembayaran Berhasil!</h1>
        <div className="w-full my-6 text-left">
          <div className="space-y-3 p-4">
            {cart.map((item, i) => (<div key={i} className="flex justify-between py-2"><p className="text-[#a15a45]">{item.quantity}x {item.name}</p><p className="text-[#1d100c]">{formatCurrency(item.price * item.quantity)}</p></div>))}
          </div>
          <div className="border-t-2 border-dashed border-gray-200 my-2" />
          <div className="px-4 py-3"><h2 className="text-[#1d100c] text-2xl font-bold">Total: {formatCurrency(total)}</h2></div>
        </div>
        <div className="flex w-full gap-4 pt-3">
          <button onClick={onPrint} className="flex flex-1 items-center justify-center gap-2 rounded-full h-14 bg-[#ff5724] text-white text-lg font-bold"><Printer className="w-5 h-5" />Cetak Struk</button>
          <button onClick={onClose} className="flex flex-1 items-center justify-center rounded-full h-14 bg-[#f4e9e6] text-[#1d100c] text-lg font-bold">Tutup</button>
        </div>
      </div>
    </div>
  )
}
 


// History Modal
function HistoryModal({ isOpen, onClose, history }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {history.length === 0 ? <p className="text-center text-gray-400 py-8">Belum ada transaksi</p> : (
            history.map((tx, i) => (
              <div key={i} className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2"><span className="text-sm text-gray-500">{formatDate(new Date(tx.date))}</span><span className="font-bold text-[#ff5724]">{formatCurrency(tx.total)}</span></div>
                <div className="text-sm text-gray-600">{tx.items.map((item, j) => <span key={j}>{item.quantity}x {item.name}{j < tx.items.length - 1 ? ', ' : ''}</span>)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Settings Modal dengan opsi Konfigurasi AI Otak
function SettingsModal({ isOpen, onClose, settings, setSettings, apiKey, onOpenAIConfig }) {
  if (!isOpen) return null
  
  const Toggle = ({ checked, onChange }) => (
    <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full p-0.5" style={{ backgroundColor: checked ? '#ff5724' : '#e5e7eb' }}>
      <input type="checkbox" checked={checked} onChange={onChange} className="invisible absolute" />
      <div className={`h-full w-[27px] rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </label>
  )
  
  const isAIConnected = apiKey && apiKey.length > 10
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4" onClick={onClose}>
      <div className="flex flex-col w-full max-w-lg rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex flex-col p-2 overflow-y-auto">
          {/* Toggle Settings */}
          {[{ icon: Volume2, label: 'Mode Suara (TTS)', desc: 'Respons suara dari AI', key: 'voiceFeedback' }, { icon: Bell, label: 'Bunyi Konfirmasi', desc: 'Efek suara saat aksi', key: 'soundEnabled' }, { icon: Moon, label: 'Mode Gelap', desc: 'Tampilan gelap', key: 'darkMode' }].map(({ icon: Icon, label, desc, key }) => (
            <div key={key} className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-gray-700 flex items-center justify-center rounded-lg bg-gray-100 size-12"><Icon className="w-6 h-6" /></div>
                <div><p className="text-base font-medium text-gray-900">{label}</p><p className="text-sm text-gray-500">{desc}</p></div>
              </div>
              <Toggle checked={settings[key]} onChange={() => setSettings(s => ({ ...s, [key]: !s[key] }))} />
            </div>
          ))}
          
          {/* Divider */}
          <div className="border-t border-gray-100 my-2" />
          
          {/* Konfigurasi AI Otak - Opsi paling bawah */}
          <button 
            onClick={() => { onClose(); onOpenAIConfig(); }}
            className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center rounded-lg size-12 ${isAIConnected ? 'text-green-600 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>
                <HubIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-base font-medium text-gray-900">Konfigurasi AI Otak</p>
                <p className="text-sm text-gray-500">{isAIConnected ? 'AI Connected' : 'Belum dikonfigurasi'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAIConnected && <div className="size-2.5 rounded-full bg-green-500" />}
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}


function App() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [cart, setCart] = useState([])
  const [statusText, setStatusText] = useState('Tekan & Bicara')
  const [isSupported, setIsSupported] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showAIConfig, setShowAIConfig] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [lastPaidCart, setLastPaidCart] = useState([])
  const [lastPaidTotal, setLastPaidTotal] = useState(0)
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [quickActions, setQuickActions] = useState([])
  const [hasAISuggestion, setHasAISuggestion] = useState(false)
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('pos-history')
    return saved ? JSON.parse(saved) : []
  })
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pos-settings')
    return saved ? JSON.parse(saved) : { darkMode: false, soundEnabled: true, voiceFeedback: true }
  })
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('groq-api-key') || import.meta.env.VITE_GROQ_API_KEY || ''
  })

  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const cartRef = useRef(cart)
  const finalTranscriptRef = useRef('')
  
  useEffect(() => { cartRef.current = cart }, [cart])
  useEffect(() => { localStorage.setItem('pos-settings', JSON.stringify(settings)) }, [settings])
  useEffect(() => { localStorage.setItem('pos-history', JSON.stringify(history)) }, [history])

  const playSound = useCallback((type) => {
    if (!settings.soundEnabled) return
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = type === 'success' ? 800 : 400
      gain.gain.value = 0.1
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) { console.log('Audio not supported') }
  }, [settings.soundEnabled])

  const speak = useCallback((text) => {
    if (!settings.voiceFeedback || !text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    utterance.rate = 1.1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [settings.voiceFeedback])

  const handleConfirmPayment = useCallback(() => {
    const currentCart = cartRef.current
    if (currentCart.length === 0) return
    const totalAmount = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const newTx = { date: new Date().toISOString(), items: currentCart.map(({ name, quantity, price }) => ({ name, quantity, price })), total: totalAmount }
    setHistory(prev => [newTx, ...prev].slice(0, 50))
    setLastPaidCart([...currentCart])
    setLastPaidTotal(totalAmount)
    playSound('success')
    setCart([])
    setTranscript('')
    setShowPaymentSuccess(true)
    setStatusText('Tekan & Bicara')
    setAiResponse('')
    setQuickActions([])
    setHasAISuggestion(false)
  }, [playSound])

  // Handle quick action click
  const handleQuickAction = useCallback((action) => {
    if (action.type === 'add') {
      const product = getProductByName(action.product)
      if (product) {
        setCart(prev => {
          const existing = prev.find(item => item.name === product.name)
          if (existing) return prev.map(item => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
          return [...prev, { ...product, quantity: 1, id: Date.now() }]
        })
        playSound('success')
        speak(`Ditambahkan ${product.name}`)
      }
    }
    setQuickActions([])
    setHasAISuggestion(false)
    setStatusText('Tekan & Bicara')
  }, [playSound, speak])


  // Process with Groq AI
  const processWithAI = useCallback(async (text) => {
    if (!text?.trim()) {
      setStatusText('Tidak ada input')
      setTimeout(() => setStatusText('Tekan & Bicara'), 2000)
      return
    }

    setIsProcessingAI(true)
    setAiResponse('')
    setQuickActions([])
    setHasAISuggestion(false)
    setStatusText('AI memproses...')

    try {
      const result = await processWithGroq(text, cartRef.current)
      console.log('AI Response:', result)

      const { intent, items, voice_response, suggestion } = result

      switch (intent) {
        case 'checkout':
          if (cartRef.current.length > 0) {
            setAiResponse(voice_response || 'Memproses pembayaran...')
            speak(voice_response || 'Memproses pembayaran')
            setTimeout(() => handleConfirmPayment(), 500)
          } else {
            setAiResponse('Keranjang masih kosong. Silakan pesan dulu.')
            speak('Keranjang masih kosong')
          }
          break

        case 'clear_cart':
          setCart([])
          setAiResponse(voice_response || 'Semua pesanan dibatalkan')
          speak(voice_response || 'Pesanan dibatalkan')
          playSound('success')
          break

        case 'add_item':
        case 'remove_item':
          if (items?.length > 0) {
            let newCart = [...cartRef.current]
            let hasChanges = false
            
            for (const item of items) {
              const product = getProductByName(item.name)
              if (!product) continue

              if (item.action === 'add') {
                const existingIndex = newCart.findIndex(c => c.name === product.name)
                if (existingIndex >= 0) {
                  newCart[existingIndex] = { ...newCart[existingIndex], quantity: newCart[existingIndex].quantity + (item.quantity || 1) }
                } else {
                  newCart.push({ ...product, quantity: item.quantity || 1, id: Date.now() + Math.random() })
                }
                hasChanges = true
              } else if (item.action === 'remove') {
                const beforeLength = newCart.length
                newCart = newCart.filter(c => c.name !== product.name)
                if (newCart.length !== beforeLength) hasChanges = true
              }
            }
            
            if (hasChanges) {
              setCart(newCart)
              playSound('success')
            }
            
            setAiResponse(voice_response || 'Pesanan diperbarui')
            speak(voice_response || 'Pesanan diperbarui')
            
            // Generate quick actions for suggestions
            if (suggestion) {
              setHasAISuggestion(true)
              setQuickActions([
                { label: 'Ya, Boleh', type: 'add', product: 'Es Teh Manis' },
                { label: 'Tidak', type: 'dismiss' },
                { label: 'Tambah Nasi', type: 'add', product: 'Nasi Putih' }
              ])
              setStatusText('Menunggu jawaban...')
            }
          }
          break

        case 'query':
        case 'greeting':
          setAiResponse(voice_response || 'Ada yang bisa saya bantu?')
          speak(voice_response || 'Ada yang bisa saya bantu?')
          break

        default:
          setAiResponse(voice_response || 'Maaf, coba ulangi pesanan Anda.')
          speak(voice_response || 'Maaf, coba ulangi')
      }

      if (!hasAISuggestion) {
        setTimeout(() => setStatusText('Tekan & Bicara'), 2500)
      }
    } catch (error) {
      console.error('AI Error:', error)
      setAiResponse(`Error: ${error.message}`)
      speak('Terjadi kesalahan')
      setStatusText('Error')
      setTimeout(() => setStatusText('Tekan & Bicara'), 3000)
    } finally {
      setIsProcessingAI(false)
    }
  }, [apiKey, speak, playSound, handleConfirmPayment])


  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { 
      setIsSupported(false)
      setStatusText('Browser tidak mendukung')
      return 
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'id-ID'

    recognition.onstart = () => { 
      setIsListening(true)
      setStatusText('🎤 Mendengarkan...')
      playSound('add')
      setAiResponse('')
      setQuickActions([])
      setHasAISuggestion(false)
      finalTranscriptRef.current = ''
    }

    recognition.onresult = (event) => {
      let interim = '', final = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) final += result[0].transcript
        else interim += result[0].transcript
      }
      const current = final || interim
      setTranscript(current)
      if (final) finalTranscriptRef.current = final
      else if (current) finalTranscriptRef.current = current

      if (final && !timeoutRef.current) {
        timeoutRef.current = setTimeout(() => recognition.stop(), 800)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      const textToProcess = finalTranscriptRef.current.trim()
      if (textToProcess) processWithAI(textToProcess)
      else {
        setStatusText('Tidak terdengar suara')
        setTimeout(() => setStatusText('Tekan & Bicara'), 2000)
      }
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      const msgs = { 'not-allowed': 'Izin mikrofon ditolak', 'no-speech': 'Tidak ada suara', 'audio-capture': 'Mikrofon tidak tersedia' }
      setStatusText(msgs[event.error] || `Error: ${event.error}`)
      setTimeout(() => setStatusText('Tekan & Bicara'), 3000)
    }

    recognitionRef.current = recognition
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); recognition.abort() }
  }, [playSound, processWithAI])

  const handleMicClick = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isProcessingAI) return
    if (isListening) recognitionRef.current.stop()
    else {
      setTranscript('')
      setAiResponse('')
      setQuickActions([])
      finalTranscriptRef.current = ''
      try { recognitionRef.current.start() } catch (e) { console.warn('Recognition error:', e) }
    }
  }, [isSupported, isProcessingAI, isListening])

  const quickAddProduct = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === product.name)
      if (existing) return prev.map(item => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
      return [...prev, { ...product, quantity: 1, id: Date.now() }]
    })
    playSound('add')
    speak(`Ditambahkan ${product.name}`)
  }

  const updateQuantity = (index, delta) => {
    setCart(prev => {
      const newCart = [...prev]
      newCart[index].quantity = Math.max(0, newCart[index].quantity + delta)
      return newCart.filter(item => item.quantity > 0)
    })
    playSound('add')
  }

  const clearCart = () => { 
    setCart([])
    setTranscript('')
    setAiResponse('')
    setQuickActions([])
    setHasAISuggestion(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space' && !isProcessingAI) { e.preventDefault(); handleMicClick() }
      if (e.code === 'Enter' && cart.length > 0 && !isProcessingAI) { e.preventDefault(); handleConfirmPayment() }
      if (e.code === 'Escape') { e.preventDefault(); clearCart() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMicClick, cart, handleConfirmPayment, isProcessingAI])

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const dm = settings.darkMode


  return (
    <div className={`relative flex h-screen w-full flex-col overflow-hidden ${dm ? 'bg-[#23140f] text-white' : 'bg-[#f8f6f5] text-[#1d100c]'}`}>
      {/* Modals */}
      <AIConfigModal isOpen={showAIConfig} onClose={() => setShowAIConfig(false)} apiKey={apiKey} setApiKey={setApiKey} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} setSettings={setSettings} apiKey={apiKey} onOpenAIConfig={() => setShowAIConfig(true)} />
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} history={history} />
      <DashboardModal isOpen={showDashboard} onClose={() => setShowDashboard(false)} history={history} />
      <PaymentSuccessModal isOpen={showPaymentSuccess} onClose={() => setShowPaymentSuccess(false)} cart={lastPaidCart} total={lastPaidTotal} onPrint={() => window.print()} />

      {/* Header */}
      <header className={`flex shrink-0 items-center justify-between border-b px-6 py-3 ${dm ? 'border-[#23140f]/20' : 'border-[#f4e9e6]'}`}>
        <div className="flex items-center gap-4">
          <div className="size-6 text-[#ff5724]">
            <svg fill="currentColor" viewBox="0 0 48 48"><path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" /></svg>
          </div>
          <h2 className="text-lg font-bold tracking-tight">Kasir Suara</h2>
        </div>
        
        {/* New Order Badge */}
        <div className="flex items-center gap-2 rounded-full bg-[#ff5724]/20 px-3 py-1">
          <span className="text-sm font-medium text-[#ff5724]">New Order</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button onClick={() => setShowHistory(true)} className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${dm ? 'bg-[#23140f]/50 hover:bg-[#23140f]/70' : 'bg-[#f4e9e6] hover:bg-[#e8dcd8]'}`} title="Riwayat Transaksi">
            <History className="w-5 h-5" />
          </button>
          {/* Settings Button */}
          <button onClick={() => setShowSettings(true)} className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${dm ? 'bg-[#23140f]/50 hover:bg-[#23140f]/70' : 'bg-[#f4e9e6] hover:bg-[#e8dcd8]'}`} title="Pengaturan">
            <Settings className="w-5 h-5" />
          </button>
          {/* Dashboard/Profile Button */}
          <button onClick={() => setShowDashboard(true)} className="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-transparent hover:ring-[#ff5724] transition-all cursor-pointer" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCI8Vkhzl6j_QabhjuqcSNdBAyFEcNN0m6sYtQI_TbnBdaPhdHMYQ3Ujy60NxU9Wko2WmYLrYJ1DdnGiT0Mnf6P7xrAEWPjn8h_3c_w1EPexREAsGQpKs-u4aZO4Anu8aP_Tm9DmBfWcuLCCNx_J5kTCfCCji_JpUm4tFSb-RXJg6ysfIiH40NE3oaKvNpqDzU8BSbd5Jvx0ZP1wMEaeI-zo-53aPUbnlBArc2MGXZWucXt-k8XMykDQNnUO427BXL7TJ7l2USMCEs")' }}
            title="Dashboard" />
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-auto">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2">
          {/* Left Panel - Voice Interaction */}
          <div className="flex flex-col items-center justify-center p-8 md:p-16">
            <div className="flex w-full max-w-md flex-col items-center justify-center space-y-6">
              
              {/* AI Response Bubble - Sesuai desain */}
              {(aiResponse || isProcessingAI) && (
                <div className="mb-4 w-full rounded-lg bg-[#FF5722]/20 p-6 text-center">
                  <p className="mb-4 text-3xl">🤖</p>
                  {isProcessingAI ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#ff5724] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-[#ff5724] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-[#ff5724] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-lg text-[#ff5724]">AI sedang berpikir...</span>
                    </div>
                  ) : (
                    <p className={`text-2xl font-semibold leading-tight ${dm ? 'text-white' : 'text-[#1d100c]'}`}>
                      {aiResponse}
                    </p>
                  )}
                </div>
              )}
              
              {/* Quick Action Chips - Sesuai desain */}
              {quickActions.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {quickActions.map((action, i) => (
                    <button 
                      key={i}
                      onClick={() => action.type === 'dismiss' ? (setQuickActions([]), setHasAISuggestion(false), setStatusText('Tekan & Bicara')) : handleQuickAction(action)}
                      className={`rounded-full px-5 py-2.5 text-base font-semibold shadow-md transition-colors ${dm ? 'bg-[#23140f]/80 text-[#ff5724]/90 hover:bg-[#23140f]' : 'bg-white text-[#ff5724] hover:bg-gray-50'}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Mic Button - Sesuai desain */}
              <div className={`flex h-40 w-40 items-center justify-center rounded-full transition-all duration-300 mt-6 ${isProcessingAI ? 'bg-purple-500/20' : 'bg-[#ff5724]/20'}`}>
                <div className={`flex h-32 w-32 items-center justify-center rounded-full ${isProcessingAI ? 'bg-purple-500/30' : 'bg-[#ff5724]/30'}`}>
                  <button 
                    onClick={handleMicClick} 
                    disabled={!isSupported || isProcessingAI}
                    className={`flex h-24 w-24 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${isProcessingAI ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-[#ff5724]'} text-white ${isListening ? 'animate-pulse ring-4 ring-[#ff5724]/50' : ''} ${(!isSupported || isProcessingAI) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Mic className="w-14 h-14" />
                  </button>
                </div>
              </div>
              
              {/* Status Text */}
              <div className="text-center">
                <p className={`text-lg font-semibold ${dm ? 'text-white' : 'text-[#1d100c]'}`}>{statusText}</p>
              </div>
              
              {/* Live Transcript */}
              {isListening && transcript && (
                <div className={`w-full rounded-lg p-4 ${dm ? 'bg-[#23140f]/50' : 'bg-white'} shadow-sm`}>
                  <p className="text-sm text-gray-500">Mendengarkan:</p>
                  <p className="text-base mt-1">{transcript}<span className="animate-pulse">|</span></p>
                </div>
              )}
            </div>
          </div>


          {/* Right Panel - Order List */}
          <div className={`flex flex-col border-l ${dm ? 'border-[#23140f]/20 bg-[#23140f]/30' : 'border-[#f4e9e6] bg-white'}`}>
            <div className="flex-1 space-y-4 overflow-y-auto p-8">
              <h3 className={`text-xl font-bold ${dm ? 'text-white' : 'text-[#1d100c]'}`}>Current Order</h3>
              {cart.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-12 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  <p>Belum ada pesanan</p>
                  <p className="text-sm mt-1">Tekan mic atau klik produk di bawah</p>
                  {/* Quick Add Products */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {PRODUCT_LIST.map(p => (
                      <button key={p.name} onClick={() => quickAddProduct(p)}
                        className="rounded-full border-2 border-[#ff5724] px-4 py-2 text-sm font-medium text-[#ff5724] hover:bg-[#ff5724]/10">
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-2 min-h-[72px] justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-center bg-cover rounded-lg size-14" style={{ backgroundImage: `url("${item.image}")` }} />
                      <div>
                        <p className={`text-base font-medium ${dm ? 'text-white' : 'text-[#1d100c]'}`}>{item.name}</p>
                        <p className={`text-sm ${dm ? 'text-[#ff5724]/80' : 'text-[#a15a45]'}`}>{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(index, -1)} className={`flex h-7 w-7 items-center justify-center rounded-full ${dm ? 'bg-[#23140f]/80' : 'bg-[#f4e9e6]'}`}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-base font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className={`flex h-7 w-7 items-center justify-center rounded-full ${dm ? 'bg-[#23140f]/80' : 'bg-[#f4e9e6]'}`}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={`shrink-0 border-t p-6 ${dm ? 'border-[#23140f]/20 bg-[#23140f]/50' : 'border-[#f4e9e6] bg-[#f8f6f5]'}`}>
              <div className="space-y-4">
                <div className={`flex justify-between items-center ${dm ? 'text-white' : 'text-[#1d100c]'}`}>
                  <span className="text-lg">Subtotal</span>
                  <span className="text-lg font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className={`flex justify-between items-center text-2xl font-bold ${dm ? 'text-white' : 'text-[#1d100c]'}`}>
                  <span>Total</span>
                  <span className="text-[#ff5724]">{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button onClick={clearCart} className={`flex h-12 w-full items-center justify-center rounded-full text-base font-bold ${dm ? 'bg-[#23140f]/80 text-white' : 'bg-gray-200 text-[#1d100c]'}`}>
                  Batalkan
                </button>
                <button onClick={handleConfirmPayment} disabled={cart.length === 0} className="flex h-12 w-full items-center justify-center rounded-full bg-[#ff5724] text-base font-bold text-white hover:bg-[#e64d1f] disabled:opacity-50 disabled:cursor-not-allowed">
                  Konfirmasi Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
