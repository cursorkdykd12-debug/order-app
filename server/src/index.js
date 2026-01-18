const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()
const { connectDb, initDb } = require('./db')

const app = express()
const port = process.env.PORT || 4000

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', require('./routes'))

connectDb()
  .then(() => {
    console.log('Database connected')
    return initDb()
  })
  .then(() => {
    console.log('Database initialized')
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  })
