import { useEffect, useState } from 'preact/hooks'
import { RefreshCw, Save } from 'lucide-preact'
import { PageHeader, Panel, Toast } from '../components/ui'
import { useData } from '../data/DataContext'
import { DEMO_MODE } from '../lib/mode'
import { money } from '../lib/format'
import type { Settings as SettingsType } from '../types'

export function Settings() {
  const { settings, saveSettings, resetDemo } = useData()
  const [form, setForm] = useState({
    storeName: settings.storeName,
    ownerName: settings.ownerName,
    email: settings.email,
    dailyGoal: String(settings.dailyGoal),
    weeklyGoal: String(settings.weeklyGoal),
    monthlyGoal: String(settings.monthlyGoal),
    lowStockAlerts: settings.lowStockAlerts,
    emailSummary: settings.emailSummary,
  })
  const [toast, setToast] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      storeName: settings.storeName,
      ownerName: settings.ownerName,
      email: settings.email,
      dailyGoal: String(settings.dailyGoal),
      weeklyGoal: String(settings.weeklyGoal),
      monthlyGoal: String(settings.monthlyGoal),
      lowStockAlerts: settings.lowStockAlerts,
      emailSummary: settings.emailSummary,
    })
  }, [settings])

  const submit = async (event: Event) => {
    event.preventDefault()
    const updated: SettingsType = {
      storeName: form.storeName.trim() || settings.storeName,
      ownerName: form.ownerName.trim() || settings.ownerName,
      email: form.email.trim() || settings.email,
      dailyGoal: Number(form.dailyGoal) || 0,
      weeklyGoal: Number(form.weeklyGoal) || 0,
      monthlyGoal: Number(form.monthlyGoal) || 0,
      lowStockAlerts: form.lowStockAlerts,
      emailSummary: form.emailSummary,
    }
    setSaving(true)
    setError('')
    try {
      await saveSettings(updated)
      setToast('Ajustes guardados.')
      window.setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los ajustes.')
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    setResetting(true)
    setError('')
    try {
      await resetDemo()
      setConfirmReset(false)
      setToast('Datos de demostración restaurados.')
      window.setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron restaurar los datos.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Cuenta"
        title="Ajustes"
        subtitle={`Preferencias de la tienda y metas del período. Todo se guarda ${DEMO_MODE ? "en este navegador" : "en la base de datos"}.`}
      />

      <form class="settings-grid" onSubmit={submit}>
        <Panel title="Perfil de la tienda" subtitle="Cómo aparece en el panel y en los correos.">
          <div class="form-grid">
            <label class="field field--full">
              <span class="field__label">Nombre de la tienda</span>
              <input
                value={form.storeName}
                onInput={(event) =>
                  setForm({ ...form, storeName: (event.currentTarget as HTMLInputElement).value })
                }
              />
            </label>
            <label class="field">
              <span class="field__label">Propietaria</span>
              <input
                value={form.ownerName}
                onInput={(event) =>
                  setForm({ ...form, ownerName: (event.currentTarget as HTMLInputElement).value })
                }
              />
            </label>
            <label class="field">
              <span class="field__label">Correo</span>
              <input
                type="email"
                value={form.email}
                onInput={(event) =>
                  setForm({ ...form, email: (event.currentTarget as HTMLInputElement).value })
                }
              />
            </label>
          </div>
        </Panel>

        <Panel title="Metas" subtitle="Se usan como referencia en los resúmenes de ventas.">
          <div class="form-grid">
            <label class="field">
              <span class="field__label">Meta diaria</span>
              <div class="field__currency">
                <span>RD$</span>
                <input
                  inputMode="decimal"
                  value={form.dailyGoal}
                  onInput={(event) =>
                    setForm({ ...form, dailyGoal: (event.currentTarget as HTMLInputElement).value })
                  }
                />
              </div>
              <span class="field__hint">{money(Number(form.dailyGoal) || 0)}</span>
            </label>
            <label class="field">
              <span class="field__label">Meta semanal</span>
              <div class="field__currency">
                <span>RD$</span>
                <input
                  inputMode="decimal"
                  value={form.weeklyGoal}
                  onInput={(event) =>
                    setForm({ ...form, weeklyGoal: (event.currentTarget as HTMLInputElement).value })
                  }
                />
              </div>
              <span class="field__hint">{money(Number(form.weeklyGoal) || 0)}</span>
            </label>
            <label class="field field--full">
              <span class="field__label">Meta mensual</span>
              <div class="field__currency">
                <span>RD$</span>
                <input
                  inputMode="decimal"
                  value={form.monthlyGoal}
                  onInput={(event) =>
                    setForm({ ...form, monthlyGoal: (event.currentTarget as HTMLInputElement).value })
                  }
                />
              </div>
              <span class="field__hint">{money(Number(form.monthlyGoal) || 0)}</span>
            </label>
          </div>
        </Panel>

        <Panel title="Notificaciones" subtitle="Se guardan con el resto de la configuración.">
          <div class="toggle-list">
            <label class="toggle">
              <span>
                <strong>Alertas de stock bajo</strong>
                <small>Muestra el aviso en la barra superior.</small>
              </span>
              <input
                type="checkbox"
                checked={form.lowStockAlerts}
                onChange={(event) =>
                  setForm({ ...form, lowStockAlerts: (event.currentTarget as HTMLInputElement).checked })
                }
              />
            </label>
            <label class="toggle">
              <span>
                <strong>Resumen por correo</strong>
                <small>Un resumen semanal de ventas y márgenes.</small>
              </span>
              <input
                type="checkbox"
                checked={form.emailSummary}
                onChange={(event) =>
                  setForm({ ...form, emailSummary: (event.currentTarget as HTMLInputElement).checked })
                }
              />
            </label>
          </div>
        </Panel>

        <Panel title="Datos de demostración" subtitle={DEMO_MODE ? "El catálogo, las ventas y las tareas viven en este navegador." : "El catálogo, las ventas y las tareas viven en la base de datos SQLite."}>
          <p class="panel__text">
            {DEMO_MODE
              ? 'Restaurar vuelve a los 24 productos, las 4 categorías, las ventas de ejemplo y las tareas originales en este navegador. Los cambios que hayas hecho se pierden.'
              : 'Restaurar vuelve a los 24 productos, las 4 categorías, las ventas de ejemplo y las tareas originales en la base de datos. Los cambios que hayas hecho se pierden.'}
          </p>
          <button
            type="button"
            class="button button--danger"
            onClick={() => void reset()}
            disabled={resetting}
          >
            <RefreshCw size={16} />
            {resetting
              ? 'Restaurando…'
              : confirmReset
                ? 'Confirmar restauración'
                : 'Restaurar datos de ejemplo'}
          </button>
          {confirmReset && (
            <button type="button" class="link-button" onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
          )}
        </Panel>

        {error && <p class="form-error">{error}</p>}
        <div class="settings-actions">
          <button type="submit" class="button button--primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Guardando…' : 'Guardar ajustes'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  )
}
