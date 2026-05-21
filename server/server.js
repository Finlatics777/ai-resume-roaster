import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import router from './routes/roast.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5002

app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

app.use(router)

app.listen(PORT, () => {
  console.log(`Resume roaster API listening on http://localhost:${PORT}`)
})