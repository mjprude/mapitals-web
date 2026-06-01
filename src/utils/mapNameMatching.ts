const COUNTRY_NAME_ALIASES: Record<string, string[]> = {
  bahamas: ['the bahamas'],
  'cape verde': ['cabo verde'],
  'czech republic': ['czechia'],
  micronesia: ['federated states of micronesia'],
  serbia: ['republic of serbia'],
  tanzania: ['united republic of tanzania'],
  'timor leste': ['east timor'],
  'united states': ['united states of america'],
  'vatican city': ['vatican']
}

export function normalizeMapName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function matchesTargetName(name: string, targetName: string, isUSStatesMode: boolean): boolean {
  const normalizedName = normalizeMapName(name)
  const normalizedTarget = normalizeMapName(targetName)

  if (normalizedName === normalizedTarget) return true
  if (isUSStatesMode) return false

  const aliases = COUNTRY_NAME_ALIASES[normalizedTarget] ?? []
  return aliases.some(alias => normalizeMapName(alias) === normalizedName)
}
