import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Region } from '@/capitals'

type RegionSelectorVariant = 'header' | 'header-compact' | 'menu'

interface RegionSelectorProps {
  region: Region
  setRegion: (region: Region) => void
  onOpenChange?: (open: boolean) => void
  onSelect?: () => void
  variant?: RegionSelectorVariant
}

const variantStyles: Record<RegionSelectorVariant, { trigger: string; width: string }> = {
  'header': {
    trigger: 'bg-white/20 border-white/30 text-white hover:bg-white/30',
    width: 'w-32',
  },
  'header-compact': {
    trigger: 'bg-white/20 border-white/30 text-white hover:bg-white/30 h-9 text-sm',
    width: 'w-28',
  },
  'menu': {
    trigger: 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600',
    width: 'w-full',
  },
}

export function RegionSelector({
  region,
  setRegion,
  onOpenChange,
  onSelect,
  variant = 'header',
}: RegionSelectorProps) {
  const styles = variantStyles[variant]

  const handleValueChange = (value: string) => {
    setRegion(value as Region)
    onSelect?.()
  }

  return (
    <Select
      value={region}
      onValueChange={handleValueChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        className={`${styles.width} ${styles.trigger}`}
        aria-label="Select region"
      >
        <SelectValue placeholder="Region" />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-600" style={{ zIndex: 9999 }}>
        <SelectItem value="World" className="text-white hover:bg-slate-700">World</SelectItem>
        <SelectItem value="Americas" className="text-white hover:bg-slate-700">Americas</SelectItem>
        <SelectItem value="Europe" className="text-white hover:bg-slate-700">Europe</SelectItem>
        <SelectItem value="Asia" className="text-white hover:bg-slate-700">Asia</SelectItem>
        <SelectItem value="Africa" className="text-white hover:bg-slate-700">Africa</SelectItem>
        <SelectItem value="Oceania" className="text-white hover:bg-slate-700">Oceania</SelectItem>
        <SelectItem value="US States" className="text-white hover:bg-slate-700">US States</SelectItem>
      </SelectContent>
    </Select>
  )
}
