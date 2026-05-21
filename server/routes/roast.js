import Anthropic from '@anthropic-ai/sdk'
import { Router } from 'express'
import nodeFetch, { Headers, Request, Response } from 'node-fetch'

/** Anthropic SDK uses global fetch APIs (built-in on Node 18+). */
if (typeof globalThis.Headers === 'undefined') {
  globalThis.fetch = nodeFetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}

const router = Router()

/** Override with ANTHROPIC_MODEL if your account exposes a different Sonnet ID. */
const DEFAULT_MODEL = 'claude-sonnet-4-6'

const MIN_RESUME_LENGTH = 200

router.post('/api/roast', async (req, res) => {
  const resumeText = req.body?.resumeText

  if (typeof resumeText !== 'string' || resumeText.trim().length < MIN_RESUME_LENGTH) {
    return res.status(400).json({
      error:
        'resumeText is required as a non-empty string with at least 200 characters.',
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set.')
    return res.status(500).json({
      error: 'Server is not configured with an Anthropic API key.',
    })
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const userContent = `You are a witty, brutally honest resume reviewer. Read this resume and provide a short roast that is funny but also genuinely useful. End with three concrete suggestions.${resumeText.trim()}`

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: userContent }],
    })

    const firstBlock = response.content?.[0]
    const roast = firstBlock?.type === 'text' ? firstBlock.text : ''

    if (!roast) {
      return res.status(500).json({ error: 'Unexpected response shape from AI.' })
    }

    return res.json({ roast })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: 'Something went wrong while generating your roast.',
    })
  }
})

export default router
