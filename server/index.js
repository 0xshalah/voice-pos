import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'

config() // Load .env file

const app = express()
const PORT = process.env.PORT || 3001

// API Key disimpan di server via environment variable
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

app.use(cors())
app.use(express.json())

// Proxy endpoint untuk Groq AI
app.post('/api/groq', async (req, res) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    })

    if (!response.ok) {
      const error = await response.json()
      return res.status(response.status).json(error)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Proxy Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`)
})
