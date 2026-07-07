'use client'

import { useState, useEffect } from 'react'

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
        <div>
          <label className="block text-sm text-gray-400 mb-1">Business Name</label>
          <input type="text" value={settings.businessName} onChange={(e) => set('businessName', e.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">WhatsApp Number</label>
          <input type="text" value={settings.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="919876543210"
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">WhatsApp Default Message</label>
          <input type="text" value={settings.whatsappDefaultMessage} onChange={(e) => set('whatsappDefaultMessage', e.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Hero Title</label>
          <input type="text" value={settings.heroTitle} onChange={(e) => set('heroTitle', e.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Hero Subtitle</label>
          <input type="text" value={settings.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>

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
