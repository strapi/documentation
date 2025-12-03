import path from 'path'
import { FEATURE_HINTS, GENERIC_DROP_TOKENS } from '../config/constants.js'

export function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\/_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

// Collect high-signal tokens from file paths and diffs to aid coverage checks
export function collectHighSignalTokens(prAnalysis, cap = 20) {
  const out = new Set()
  const files = prAnalysis.files || []

  for (const f of files) {
    const parts = String(f.filename || '').toLowerCase().split(/[\/]/).filter(Boolean)
    for (const p of parts) {
      if (GENERIC_DROP_TOKENS.has(p)) continue
      const sub = p.split(/[._-]/).filter(s => s.length >= 3)
      for (const s of sub) out.add(s)
    }
    const base = path.basename(f.filename || '').toLowerCase().replace(/\.(mdx?|js|ts|tsx|jsx|json|yml|yaml|css|scss|less)$/,'')
    if (base && base.length >= 3) out.add(base)
  }
  for (const hint of FEATURE_HINTS) if ((prAnalysis.title||'').toLowerCase().includes(hint)) out.add(hint)

  // Extract option-like keys and env vars from added lines
  for (const f of files) {
    const patch = String(f.patch || '')
    const lines = patch.split(/\r?\n/)
    for (const line of lines) {
      if (!line.startsWith('+')) continue
      const l = line.slice(1)
      const envMatch = l.match(/process\.env\.([A-Z0-9_]+)/)
      if (envMatch) out.add(envMatch[1].toLowerCase())
      const keyMatches = l.match(/[A-Za-z][A-Za-z0-9_-]{3,}/g)
      if (keyMatches) {
        for (const k of keyMatches) {
          const kk = k.toLowerCase()
          if (kk.length >= 4 && !GENERIC_DROP_TOKENS.has(kk)) out.add(kk)
        }
      }
    }
  }

  return Array.from(out).slice(0, cap)
}

