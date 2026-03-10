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
  console.log('Messages count:', req.body.messages?.length)
  console.log('Roles:', req.body.messages?.map(m => m.role))

  try {
    // Pass through ALL messages exactly as received
    // This supports system role messages for precise extraction
    const messages = req.body.messages || []

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: req.body.model || 'llama-3.3-70b-versatile',
      max_tokens: req.body.max_tokens || 1024,
      temperature: 0.1  // Low temperature = more precise, consistent output
    })

    console.log('SUCCESS')

    // Format response to match Claude structure
    const text = completion.choices[0].message.content

    res.json({
      content: [{ type: 'text', text: text }]
    })

  } catch (error) {
    console.log('GROQ ERROR:', error.response?.data || error.message)
    res.status(500).json({ error: error.response?.data || error.message })
  }
})


const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

app.post('/api/send-email', async (req, res) => {
  console.log('Portal email for:', req.body.toEmail)
  console.log('Portal URL:', req.body.portalUrl)
  // SendGrid integration added post-launch
  res.json({
    success: true,
    note: 'Email logged — SendGrid pending'
  })
})

app.listen(3001, () => {
  console.log('Proxy server running on port 3001')
})
