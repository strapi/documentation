import { SPECIFIC_AREA_PATTERNS, YES_PATH_PATTERNS } from '../config/constants.js'

export function categorizePRByDocumentation(analysis) {
  const { claudeSuggestions, files, title } = analysis
  
  if (!claudeSuggestions || !claudeSuggestions.affectedAreas) {
    return { mainCategory: 'cms', section: 'Other', specificArea: '' }
  }

  if (claudeSuggestions.documentationSection) {
    const mainCategory = claudeSuggestions.documentationSection.toLowerCase().includes('cloud') ? 'cloud' : 'cms'
    return { 
      mainCategory, 
      section: claudeSuggestions.documentationSection,
      specificArea: claudeSuggestions.documentationSection.split(' - ')[1] || ''
    }
  }

  const affectedAreas = claudeSuggestions.affectedAreas.join(' ').toLowerCase()
  const filePaths = files.map(f => f.filename.toLowerCase()).join(' ')
  const titleLower = (title || '').toLowerCase()
  const allText = `${affectedAreas} ${filePaths} ${titleLower}`.toLowerCase()

  let mainCategory = 'cms'
  if (allText.includes('cloud') || allText.includes('/cloud/')) {
    mainCategory = 'cloud'
    if (allText.includes('deployment')) return { mainCategory, section: 'Deployments', specificArea: '' }
    if (allText.includes('project')) return { mainCategory, section: 'Projects Management', specificArea: '' }
  }

  for (const [pattern, { section, area }] of Object.entries(SPECIFIC_AREA_PATTERNS)) {
    if (new RegExp(pattern, 'i').test(allText)) {
      const sectionLabel = area ? `${section} - ${area}` : section
      return { mainCategory, section: sectionLabel, specificArea: area }
    }
  }

  const firstAffectedArea = claudeSuggestions.affectedAreas[0] || 'Other'
  return { mainCategory, section: firstAffectedArea, specificArea: '' }
}

export function classifyImpact(prAnalysis) {
  const files = prAnalysis.files || []
  const title = (prAnalysis.title || '').toLowerCase()

  if (files.length === 0) {
    return { verdict: 'maybe', reason: 'No files listed; uncertain impact.' }
  }

  const allUnder = (prefix) => files.every(f => f.filename.startsWith(prefix))
  const onlyExtensions = (exts) => files.every(f => exts.some(ext => f.filename.endsWith(ext)))

  // Clear "No" buckets: tests, CI, metadata only, or dev-only noise
  const isTestsOnly = allUnder('tests/') || files.every(f => /(^|\/)__(tests|mocks)__(\/|$)|\.test\./.test(f.filename))
  const isCIOnly = files.every(f => f.filename.startsWith('.github/') || f.filename.includes('/.github/'))
  const isLocksOnly = onlyExtensions(['yarn.lock', 'pnpm-lock.yaml', 'package-lock.json'])
  const isMetaOnly = files.every(f => /(^|\/)package\.json$|^tsconfig.*\.json$|^jest\.config|^\.eslintrc/.test(f.filename))
  if (isTestsOnly || isCIOnly || isLocksOnly || isMetaOnly) {
    return { verdict: 'no', reason: 'Non-user facing changes (tests/CI/locks/metadata).' }
  }

  // Strong Yes signals
  if (/breaking|deprecat|remove|feat|feature|introduc|add\b/.test(title)) {
    return { verdict: 'yes', reason: 'PR title indicates user-facing changes.' }
  }

  const hitYes = files.some(f => YES_PATH_PATTERNS.some(re => re.test(f.filename)))
  if (hitYes) {
    return { verdict: 'yes', reason: 'Touches user-facing code paths (API/config/features).' }
  }

  // Maybe by default when code changes but signals are weak
  return { verdict: 'maybe', reason: 'Code changes detected; possible docs impact.' }
}

