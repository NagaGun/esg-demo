const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const Groq = require('groq-sdk')

const app = express()
app.use(cors())
app.use(express.json())

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

console.log('GROQ Key loaded:', !!process.env.GROQ_API_KEY)

app.get('/api/test', (req, res) => {
  res.json({
    keyLoaded: !!process.env.GROQ_API_KEY,
    keyPrefix: process.env.GROQ_API_KEY?.substring(0, 10) + '...'
  })
})

app.post('/api/claude', async (req, res) => {
  console.log('--- NEW REQUEST ---')

  try {
    const userMessage = req.body.messages[0].content

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: userMessage }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: req.body.max_tokens || 1024,
    })

    console.log('SUCCESS')

    // Format response to match Claude structure
    // so agent files dont need any changes
    const text = completion.choices[0].message.content

    res.json({
      content: [{ type: 'text', text: text }]
    })

  } catch (error) {
    console.log('GROQ ERROR:', error.message)
    res.status(500).json({ error: error.message })
  }
})

app.listen(3001, () => {
  console.log('Proxy server running on port 3001')
})
