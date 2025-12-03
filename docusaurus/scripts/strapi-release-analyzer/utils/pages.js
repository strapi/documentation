import path from 'path'
import { tokenize } from './tokens.js'

export function resolvePageForTarget(llmsIndex, candidates, targetPath) {
  if (!llmsIndex || !Array.isArray(llmsIndex.pages) || llmsIndex.pages.length === 0) return null
  const wanted = String(targetPath || '').toLowerCase()
  const slug = path.basename(wanted).replace(/\.mdx?$/i, '').toLowerCase()

  if (slug && llmsIndex.bySlug && llmsIndex.bySlug.has(slug)) {
    return llmsIndex.bySlug.get(slug)
  }

  if (Array.isArray(candidates) && candidates.length > 0 && slug) {
    const hit = candidates.find(p => p.url && p.url.toLowerCase().includes(slug))
    if (hit) return hit
  }

  const slugTokens = tokenize(slug)
  let best = null
  let bestScore = 0
  for (const p of llmsIndex.pages) {
    const title = (p.title || '').toLowerCase()
    const url = (p.url || '').toLowerCase()
    let score = 0
    if (slug && title.includes(slug)) score += 5
    if (slug && url.includes(slug)) score += 4
    const titleTokens = tokenize(title)
    const urlTokens = tokenize(url)
    for (const t of slugTokens) {
      if (titleTokens.includes(t)) score += 2
      if (urlTokens.includes(t)) score += 1
    }
    if (score > bestScore) { bestScore = score; best = p }
  }
  return best || (Array.isArray(candidates) && candidates[0]) || null
}

export function suggestCandidateDocs(llmsIndex, prAnalysis, limit = 5) {
  if (!llmsIndex || !llmsIndex.pages || llmsIndex.pages.length === 0) return []
  const hay = []
  hay.push(...tokenize(prAnalysis.title))
  for (const f of prAnalysis.files || []) hay.push(...tokenize(f.filename))
  const bag = new Map()
  for (const t of hay) bag.set(t, (bag.get(t) || 0) + 1)

  const scored = llmsIndex.pages.map(p => {
    const titleTokens = tokenize(p.title)
    const urlTokens = tokenize(p.url || '')
    let score = 0
    for (const t of titleTokens) score += (bag.get(t) || 0) * 3
    for (const t of urlTokens) score += (bag.get(t) || 0)
    return { page: p, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.filter(s => s.score > 0).slice(0, limit).map(s => s.page)
}

