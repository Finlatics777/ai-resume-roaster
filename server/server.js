import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import router from './routes/roast.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5002

const allowedOrigins = [
  'https://ai-resume-roaster-goo5.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

if (process.env.CORS_ORIGINS) {
  allowedOrigins.push(
    ...process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  )
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
  }),
)
app.use(express.json({ limit: '1mb' }))

app.use(router)

app.listen(PORT, () => {
  console.log(`Resume roaster API listening on http://localhost:${PORT}`)
})