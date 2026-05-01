import { Input } from '@/components/ui/input'
import type { CredentialField } from '@/api/trading-accounts'

// ─── Shared CSS class for native <select> elements ────────────────────────────

export const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

// ─── Broker credential schemas ────────────────────────────────────────────────

export const BROKER_OPTIONS = [
  { value: 'upstox',  label: 'Upstox'  },
  { value: 'zerodha', label: 'Zerodha' },
]

export const CREDENTIAL_FIELDS: Record<string, CredentialField[]> = {
  upstox: [
    { name: 'accessKeyId',     label: 'Access Key ID',     type: 'text',     required: true  },
    { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true  },
    { name: 'userId',          label: 'Broker User ID',    type: 'text',     required: true  },
    {
      name: 'sandboxEnabled',
      label: 'Sandbox Mode',
      type: 'select',
      required: true,
      options: { '1': 'Yes', '0': 'No' },
    },
    { name: 'sandboxToken', label: 'Sandbox Token', type: 'password', required: false },
  ],
  zerodha: [
    { name: 'accessKeyId',     label: 'Access Key ID',     type: 'text',     required: true },
    { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'userId',          label: 'Broker User ID',    type: 'text',     required: true },
  ],
}

// ─── Toggle switch ─────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked:   boolean
  onChange:  (value: boolean) => void
  label:     string
  onLabel?:  string
  offLabel?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  onLabel  = 'Active',
  offLabel = 'Inactive',
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{checked ? onLabel : offLabel}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

// ─── Credential field renderer ─────────────────────────────────────────────────

interface CredentialInputProps {
  field:     CredentialField
  value:     string
  onChange:  (value: string) => void
  /** When true shows a placeholder indicating the field has a saved value */
  hasSaved?: boolean
}

export function CredentialInput({ field, value, onChange, hasSaved }: CredentialInputProps) {
  if ((field.type === 'select' || field.type === 'select2') && field.options) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_CLASS}
        required={field.required}
      >
        <option value="">Select…</option>
        {Object.entries(field.options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    )
  }

  return (
    <Input
      type={field.type === 'password' ? 'password' : 'text'}
      required={field.required}
      placeholder={hasSaved ? '••••••••  (leave blank to keep existing)' : `Enter ${field.label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
