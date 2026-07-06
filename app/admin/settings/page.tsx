'use client'

import { useState, useEffect } from 'react'
import Field from '../field'

interface Settings {
  id?: string; businessName: string; whatsappNumber: string
  whatsappDefaultMessage: string; heroTitle: string; heroSubtitle: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then(setSettings)
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) return <p className="text-gray-400">Loading...</p>

  const set = (field: keyof Settings, value: string) => setSettings((s) => s ? { ...s, [field]: value } : s)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-4 max-w-lg">
        <Field label="Business Name" value={settings.businessName} onChange={(v) => set('businessName', v)} />
        <Field label="WhatsApp Number" value={settings.whatsappNumber} onChange={(v) => set('whatsappNumber', v)} placeholder="919876543210" />
        <Field label="WhatsApp Default Message" value={settings.whatsappDefaultMessage} onChange={(v) => set('whatsappDefaultMessage', v)} />
        <Field label="Hero Title" value={settings.heroTitle} onChange={(v) => set('heroTitle', v)} />
        <Field label="Hero Subtitle" value={settings.heroSubtitle} onChange={(v) => set('heroSubtitle', v)} />

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-hotwheels-red text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saved && <span className="text-green-400 text-sm">Saved!</span>}
        </div>
      </div>
    </div>
  )
}
