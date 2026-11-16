interface VisibilityValue {
  is_active: boolean;
  active_from: string;
  active_until: string;
}

interface VisibilityFieldsProps {
  value: VisibilityValue;
  onChange: (changes: Partial<VisibilityValue>) => void;
  /** Texto do interruptor, ex.: "Produto ativo no catálogo". */
  activeLabel: string;
  idPrefix: string;
}

/** Interruptor de ativo e agendamento opcional, usados em produtos e categorias. */
export function VisibilityFields({ value, onChange, activeLabel, idPrefix }: VisibilityFieldsProps) {
  return (
    <div className="space-y-5">
      <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
        <span className="font-medium">{activeLabel}</span>
        <input
          type="checkbox"
          role="switch"
          checked={value.is_active}
          onChange={(e) => onChange({ is_active: e.target.checked })}
          className="peer sr-only"
        />
        <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-secondary peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-from`} className="label-caps">Mostrar a partir de</label>
          <input
            id={`${idPrefix}-from`}
            type="datetime-local"
            value={value.active_from}
            onChange={(e) => onChange({ active_from: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-until`} className="label-caps">Mostrar até</label>
          <input
            id={`${idPrefix}-until`}
            type="datetime-local"
            value={value.active_until}
            min={value.active_from || undefined}
            onChange={(e) => onChange({ active_until: e.target.value })}
            className="input"
          />
        </div>
      </div>
      <p className="text-[13px] text-outline">As datas são opcionais. Em branco, vale só o interruptor acima.</p>
    </div>
  );
}
