import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, CSSProperties, ReactNode } from 'react'
import clsx from 'clsx'
import { toPng } from 'html-to-image'

type BackgroundType = 'gradient' | 'solid'

interface Settings {
  borderRadius: number
  padding: number
  dropShadow: number
  backgroundType: BackgroundType
  gradientFrom: string
  gradientTo: string
  gradientAngle: number
  backgroundColor: string
  showWindowChrome: boolean
  windowAccent: string
  noise: number
  vignette: number
}

const backgroundModes: { id: BackgroundType; label: string; description: string }[] = [
  {
    id: 'gradient',
    label: 'Gradient',
    description: 'Soft two-tone glow for hero shots.',
  },
  {
    id: 'solid',
    label: 'Solid',
    description: 'Minimal backdrop for focused visuals.',
  },
]

const gradientPresets = [
  { id: 'aurora', label: 'Aurora', from: '#60a5fa', to: '#a855f7', angle: 130 },
  { id: 'sunset', label: 'Sunset', from: '#fb7185', to: '#f97316', angle: 140 },
  { id: 'mint', label: 'Mint', from: '#22d3ee', to: '#34d399', angle: 125 },
  { id: 'midnight', label: 'Midnight', from: '#1d4ed8', to: '#0f172a', angle: 150 },
]

const solidPresets = [
  { id: 'obsidian', label: 'Obsidian', color: '#0f172a' },
  { id: 'slate', label: 'Slate', color: '#1f2937' },
  { id: 'ocean', label: 'Ocean', color: '#082f49' },
  { id: 'ice', label: 'Ice', color: '#e0f2fe' },
]

const exportScaleOptions = [1, 2, 3] as const

interface SectionCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

const SectionCard = ({ title, description, action, children }: SectionCardProps) => (
  <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
    <div className="space-y-4">{children}</div>
  </section>
)

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  helper?: string
  suffix?: string
}

const SliderControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  helper,
  suffix,
}: SliderControlProps) => (
  <label className="block space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
    <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-200">
      <span>{label}</span>
      <span className="text-xs font-semibold text-slate-400">
        {Math.round(value)}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-600 accent-primary-400"
    />
    {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
  </label>
)

interface ColorControlProps {
  label: string
  value: string
  onChange: (value: string) => void
  helper?: string
}

const ColorControl = ({ label, value, onChange, helper }: ColorControlProps) => (
  <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
    <div className="space-y-1">
      <span className="block text-sm font-medium text-slate-200">{label}</span>
      {helper ? <span className="block text-xs text-slate-400">{helper}</span> : null}
    </div>
    <input
      type="color"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-14 cursor-pointer rounded-md border border-white/20 bg-transparent p-0"
    />
  </label>
)

interface ToggleControlProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const ToggleControl = ({ label, description, checked, onChange }: ToggleControlProps) => (
  <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
    <div className="space-y-1">
      <span className="block text-sm font-medium text-slate-200">{label}</span>
      {description ? <span className="block text-xs text-slate-400">{description}</span> : null}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative flex h-6 w-11 items-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300',
        checked
          ? 'border-primary-300 bg-primary-500/80'
          : 'border-white/15 bg-slate-700/60',
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition',
          checked && 'translate-x-[22px]',
        )}
      />
    </button>
  </label>
)

interface SegmentedControlOption<T extends string> {
  id: T
  label: string
  description: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
}

function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={clsx(
            'rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400',
            value === option.id
              ? 'border-primary-400/75 bg-primary-400/10 text-white shadow-glow-xl'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
          )}
        >
          <span className="block text-sm font-semibold">{option.label}</span>
          <span className="mt-1 block text-xs text-slate-400">{option.description}</span>
        </button>
      ))}
    </div>
  )
}

interface PresetSwatchProps {
  label: string
  active: boolean
  style: CSSProperties
  onClick: () => void
}

const PresetSwatch = ({ label, active, style, onClick }: PresetSwatchProps) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      'group flex flex-col gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400',
      active
        ? 'border-primary-400/75 bg-primary-400/10 text-white shadow-glow-xl'
        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
    )}
  >
    <span className="block h-16 w-full rounded-xl border border-white/5" style={style} />
    <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
      {label}
    </span>
  </button>
)

const DEFAULT_SETTINGS: Settings = {
  borderRadius: 36,
  padding: 72,
  dropShadow: 65,
  backgroundType: 'gradient',
  gradientFrom: '#60a5fa',
  gradientTo: '#a855f7',
  gradientAngle: 135,
  backgroundColor: '#0f172a',
  showWindowChrome: true,
  windowAccent: '#22d3ee',
  noise: 12,
  vignette: 40,
}

function App() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageName, setImageName] = useState('Screenshot')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isDragging, setIsDragging] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportScale, setExportScale] = useState<1 | 2 | 3>(2)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((previous) => ({ ...previous, [key]: value }))
  }

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      setImageDataUrl(reader.result as string)
      const friendlyName = file.name.replace(/\.[^/.]+$/, '')
      setImageName(friendlyName || 'Screenshot')
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      readFile(file)
    }
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      readFile(file)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClearImage = () => {
    setImageDataUrl(null)
    setImageName('Screenshot')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetSettings = () => {
    setSettings({ ...DEFAULT_SETTINGS })
  }

  const handleExport = async () => {
    if (!previewRef.current || !imageDataUrl) {
      window.alert('Upload a screenshot before exporting.')
      return
    }
    try {
      setIsExporting(true)
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: exportScale,
      })
      const safeName = imageName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const link = document.createElement('a')
      link.download = `${safeName || 'screenshot'}-${exportScale}x-${timestamp}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed', error)
      window.alert('Export failed. Please try again or lower the export size.')
    } finally {
      setIsExporting(false)
    }
  }

  const canvasBackground = useMemo(() => {
    if (settings.backgroundType === 'solid') {
      return settings.backgroundColor
    }
    return `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientFrom}, ${settings.gradientTo})`
  }, [settings.backgroundType, settings.backgroundColor, settings.gradientAngle, settings.gradientFrom, settings.gradientTo])

  const dropShadowCss = useMemo(() => {
    if (settings.dropShadow <= 1) {
      return 'none'
    }
    const intensity = settings.dropShadow / 100
    const blur = 40 + intensity * 140
    const spread = -40 - intensity * 25
    const offsetY = 24 + intensity * 48
    const opacity = Math.min(0.25 + intensity * 0.4, 0.6)
    return `0 ${Math.round(offsetY)}px ${Math.round(blur)}px ${Math.round(spread)}px rgba(8, 15, 35, ${opacity})`
  }, [settings.dropShadow])

  const noiseOpacity = useMemo(() => Math.min(settings.noise / 100 * 0.35, 0.3), [settings.noise])
  const vignetteOpacity = useMemo(
    () => Math.min(settings.vignette / 100 * 0.9, 0.85),
    [settings.vignette],
  )

  const showPlaceholder = !imageDataUrl

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/90 text-slate-100">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 lg:gap-14 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Canvas Studio
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Screenshot Beautifier
              </h1>
              <p className="max-w-2xl text-base text-slate-300 md:text-lg">
                Transform raw captures into polished hero images with gradient-backed canvases,
                soft shadows, and customizable framing.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-400/50 bg-primary-400/15 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(14,165,233,0.8)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-400/25 hover:shadow-[0_14px_40px_-18px_rgba(14,165,233,0.8)]"
            >
              Upload Screenshot
            </button>
            <button
              type="button"
              onClick={handleClearImage}
              disabled={!imageDataUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/70 backdrop-blur-md transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        </header>

        <main className="grid gap-8 lg:gap-12 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-6">
            <div
              ref={previewRef}
              role="button"
              tabIndex={showPlaceholder ? 0 : -1}
              onKeyDown={(event) => {
                if (!showPlaceholder) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onClick={() => {
                if (showPlaceholder) {
                  fileInputRef.current?.click()
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={clsx(
                'group relative flex min-h-[520px] flex-col justify-center overflow-hidden rounded-[40px] border bg-slate-950/70 p-8 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70',
                isDragging
                  ? 'border-primary-400/70 ring-4 ring-primary-400/40'
                  : 'border-white/10 ring-0',
                showPlaceholder ? 'cursor-pointer' : 'cursor-default',
              )}
              style={{ background: canvasBackground }}
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-noise-soft"
                style={{ opacity: noiseOpacity }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, transparent 0%, rgba(5, 8, 21, 0.7) 90%)',
                  opacity: vignetteOpacity,
                }}
                aria-hidden="true"
              />

              <div className="relative z-10 mx-auto flex w-full max-w-3xl justify-center">
                {imageDataUrl ? (
                  <div
                    className="relative w-full overflow-visible border border-white/10 bg-white/5 backdrop-blur-3xl transition-all duration-500"
                    style={{
                      padding: `${settings.padding}px`,
                      borderRadius: `${settings.borderRadius + 36}px`,
                      boxShadow: dropShadowCss,
                    }}
                  >
                    <div
                      className={clsx(
                        'relative overflow-hidden border border-white/10 bg-slate-950/75',
                        settings.showWindowChrome ? 'pt-14' : '',
                      )}
                      style={{
                        borderRadius: `${settings.borderRadius}px`,
                      }}
                    >
                      {settings.showWindowChrome ? (
                        <div className="absolute inset-x-0 top-0 flex h-12 items-center justify-between border-b border-white/10 bg-white/10 px-6 backdrop-blur-xl">
                          <div className="flex items-center gap-2">
                            {['#ff5f56', '#ffbd2e', '#27c93f'].map((color) => (
                              <span
                                key={color}
                                className="h-3.5 w-3.5 rounded-full border border-white/20"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-slate-200">{imageName}</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-8 rounded-full"
                              style={{ backgroundColor: settings.windowAccent }}
                            />
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: settings.windowAccent, opacity: 0.75 }}
                            />
                          </div>
                        </div>
                      ) : null}
                      <div
                        className={clsx(
                          'relative flex w-full items-center justify-center bg-slate-950/40',
                          settings.showWindowChrome ? 'pt-0' : '',
                        )}
                      >
                        <img
                          src={imageDataUrl}
                          alt={imageName}
                          className="h-full max-h-[65vh] w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      'flex w-full flex-col items-center justify-center gap-4 rounded-[30px] border-2 border-dashed border-white/20 bg-slate-950/80 px-10 py-16 text-center transition',
                      isDragging && 'border-primary-300/80 bg-primary-400/10',
                    )}
                  >
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Drop or Upload
                    </span>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-white">
                        Drag your screenshot here
                      </p>
                      <p className="text-sm text-slate-400">
                        PNG, JPG, WEBP • up to 10MB • We&apos;ll frame it for you
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/15"
                    >
                      Browse files
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Pro tip: Keep padding around your screenshot so shadows and glow have room to breathe
              when you export.
            </p>
          </section>

          <aside className="flex flex-col gap-6">
            <SectionCard
              title="Screenshot"
              description="Upload your capture and toggle the frame chrome."
              action={
                <div className="flex items-center gap-3">
                  {imageDataUrl ? (
                    <span className="text-xs font-medium text-slate-400">
                      {Math.round(settings.padding)}px padding
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={resetSettings}
                    className="text-xs font-semibold text-primary-200 transition hover:text-primary-100"
                  >
                    Reset styling
                  </button>
                </div>
              }
            >
              <ToggleControl
                label="Window chrome"
                description="Add a subtle browser bar for presentation shots."
                checked={settings.showWindowChrome}
                onChange={(next) => updateSetting('showWindowChrome', next)}
              />
              <ColorControl
                label="Accent"
                helper="Adjusts the right-side chrome indicator."
                value={settings.windowAccent}
                onChange={(color) => updateSetting('windowAccent', color)}
              />
            </SectionCard>

            <SectionCard
              title="Layout"
              description="Tweak spacing, corners, and the canvas shadow."
            >
              <SliderControl
                label="Padding"
                value={settings.padding}
                min={36}
                max={140}
                onChange={(value) => updateSetting('padding', value)}
                helper="Space between the frame and canvas edge."
                suffix="px"
              />
              <SliderControl
                label="Corner radius"
                value={settings.borderRadius}
                min={0}
                max={72}
                onChange={(value) => updateSetting('borderRadius', value)}
                helper="Higher values create softer, modern frames."
                suffix="px"
              />
              <SliderControl
                label="Shadow intensity"
                value={settings.dropShadow}
                min={0}
                max={100}
                onChange={(value) => updateSetting('dropShadow', value)}
                helper="Adds depth so your screenshot floats off the background."
              />
            </SectionCard>

            <SectionCard
              title="Background"
              description="Style the atmosphere behind your frame."
            >
              <SegmentedControl
                options={backgroundModes}
                value={settings.backgroundType}
                onChange={(mode) => updateSetting('backgroundType', mode)}
              />
              {settings.backgroundType === 'gradient' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorControl
                      label="Gradient start"
                      value={settings.gradientFrom}
                      onChange={(color) => updateSetting('gradientFrom', color)}
                    />
                    <ColorControl
                      label="Gradient end"
                      value={settings.gradientTo}
                      onChange={(color) => updateSetting('gradientTo', color)}
                    />
                  </div>
                  <SliderControl
                    label="Angle"
                    value={settings.gradientAngle}
                    min={0}
                    max={360}
                    onChange={(value) => updateSetting('gradientAngle', value)}
                    helper="Rotates the gradient flow to match your layout."
                    suffix="°"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {gradientPresets.map((preset) => (
                      <PresetSwatch
                        key={preset.id}
                        label={preset.label}
                        active={
                          settings.gradientFrom === preset.from &&
                          settings.gradientTo === preset.to &&
                          settings.backgroundType === 'gradient'
                        }
                        style={{
                          background: `linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})`,
                        }}
                        onClick={() =>
                          setSettings((previous) => ({
                            ...previous,
                            backgroundType: 'gradient',
                            gradientFrom: preset.from,
                            gradientTo: preset.to,
                            gradientAngle: preset.angle,
                          }))
                        }
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <ColorControl
                    label="Backdrop color"
                    value={settings.backgroundColor}
                    onChange={(color) => updateSetting('backgroundColor', color)}
                    helper="Pick any solid hue or a soft neutral."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {solidPresets.map((preset) => (
                      <PresetSwatch
                        key={preset.id}
                        label={preset.label}
                        active={
                          settings.backgroundColor === preset.color &&
                          settings.backgroundType === 'solid'
                        }
                        style={{ background: preset.color }}
                        onClick={() =>
                          setSettings((previous) => ({
                            ...previous,
                            backgroundType: 'solid',
                            backgroundColor: preset.color,
                          }))
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard title="Atmosphere" description="Fine-tune texture and glow.">
              <SliderControl
                label="Texture"
                value={settings.noise}
                min={0}
                max={100}
                onChange={(value) => updateSetting('noise', value)}
                helper="Adds a subtle grain for premium finish."
              />
              <SliderControl
                label="Vignette"
                value={settings.vignette}
                min={0}
                max={100}
                onChange={(value) => updateSetting('vignette', value)}
                helper="Darkens the edges so the canvas stays in focus."
              />
            </SectionCard>

            <SectionCard title="Export" description="Download a polished PNG ready to share.">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {exportScaleOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setExportScale(option)}
                      className={clsx(
                        'flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400',
                        exportScale === option
                          ? 'border-primary-400/80 bg-primary-400/15 text-white shadow-glow-xl'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
                      )}
                    >
                      {option}x
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={!imageDataUrl || isExporting}
                  className={clsx(
                    'flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300',
                    imageDataUrl
                      ? 'border-primary-400/60 bg-primary-500/20 text-white shadow-[0_18px_45px_-32px_rgba(14,165,233,0.9)] hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-500/30'
                      : 'border-white/10 bg-white/5 text-white/50',
                    isExporting && 'cursor-progress',
                  )}
                >
                  {isExporting ? 'Preparing…' : `Export PNG (${exportScale}x)`}
                </button>
                <p className="text-xs text-slate-400">
                  Use 3x for retina-quality slides, or 1x for quick sharing in docs and chat.
                </p>
              </div>
            </SectionCard>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default App
