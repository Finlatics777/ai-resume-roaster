import { useMemo, useState } from 'react'

import { api } from './api.js'

const MIN_LENGTH = 200

export default function App() {
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState(null)
  const [clientError, setClientError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const trimmedLength = resumeText.trim().length
  const isValidLength = trimmedLength >= MIN_LENGTH

  const charHint = useMemo(() => {
    if (trimmedLength === 0) {
      return `Paste at least ${MIN_LENGTH} characters of resume text to enable roasting.`
    }
    const remaining = MIN_LENGTH - trimmedLength
    return remaining > 0
      ? `${remaining} more character${remaining === 1 ? '' : 's'} needed`
      : 'Ready to roast'
  }, [trimmedLength])

  const handleRoast = async () => {
    setSubmitError('')
    setRoast(null)

    if (!isValidLength) {
      setClientError(`Resume must be at least ${MIN_LENGTH} characters.`)
      return
    }
    setClientError('')

    setLoading(true)

    try {
      const { data } = await api.post('/api/roast', { resumeText })
      setRoast(typeof data.roast === 'string' ? data.roast : '')
    } catch (err) {
      const message =
        err.response?.data?.error ??
        err.message ??
        'Could not reach the server. Try again.'
      setSubmitError(typeof message === 'string' ? message : 'Roast failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-br from-slate-950 via-slate-950 to-slate-900">
      <div
        className="pointer-events-none absolute -left-40 top-24 h-80 w-80 rounded-full opacity-35 blur-[100px]"
        style={{ background: 'color-mix(in oklch, var(--color-accent) 55%, transparent)' }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col gap-14 px-4 py-14 sm:px-6 lg:gap-16 lg:py-20">
        <header className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            SaaS warmup
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            AI Resume Roaster
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-300">
            Roast my resume—but make it actionable.
          </p>
          <p className="mx-auto max-w-2xl text-pretty text-slate-400">
            Paste a real resume chunk. Claude delivers a witty takedown and three constructive
            punches so recruiters stop yawning before they hit bullet three.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-8">
          <label htmlFor="resume" className="sr-only">
            Resume text
          </label>
          <textarea
            id="resume"
            value={resumeText}
            disabled={loading}
            onChange={(e) => {
              setResumeText(e.target.value)
              if (submitError) setSubmitError('')
            }}
            placeholder="Paste your full resume text here..."
            rows={14}
            className="focus:ring-accent/40 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-accent focus:outline-none focus:ring-2 disabled:opacity-70"
          />
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={`text-sm ${
                trimmedLength >= MIN_LENGTH ? 'text-emerald-400/90' : 'text-slate-500'
              }`}
            >
              {charHint}
            </p>
            <button
              type="button"
              disabled={loading || !isValidLength}
              onClick={handleRoast}
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_-20px_oklch(0.55_0.2_343_/_0.9)] transition hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Roasting…' : 'Roast My Resume'}
            </button>
          </div>
          {(clientError || submitError) && (
            <p className="border-accent/35 bg-accent/8 text-accent mt-4 rounded-2xl border px-4 py-3 text-sm">
              {clientError || submitError}
            </p>
          )}
        </section>

        {roast != null && roast !== '' && (
          <section
            aria-live="polite"
            className="fade-in-result space-y-3 rounded-3xl border border-white/10 bg-slate-900/40 p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-white">Your roast</h2>
            <div className="max-w-none text-base leading-relaxed text-slate-200">
              {roast.split('\n').map((para, i) =>
                para.trim() === '' ? (
                  <br key={`b-${i}`} />
                ) : (
                  <p key={i} className="mb-3 last:mb-0">
                    {para}
                  </p>
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
