'use client'

import { useRouter } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useStorageSettingsStore, StorageMode } from '@/store/useStorageSettingsStore'

export default function StoragePage() {
  const router = useRouter()
  const { lang } = useLangStore()
  const { storageMode, setStorageMode } = useStorageSettingsStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const choose = (mode: StorageMode) => setStorageMode(mode)

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <button onClick={() => router.back()} className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">← {t('Retour', 'Back')}</button>
        <div className="rounded-3xl p-5 bg-white/5 border border-white/10">
          <h1 className="text-white text-2xl font-black mb-2">💾 {t('Stockage et sauvegarde', 'Storage and backup')}</h1>
          <p className="text-white/60 text-sm">{t('Choisissez le mode qui convient à votre façon de travailler.', 'Choose the mode that fits how you work.')}</p>
        </div>
        <Card active={storageMode === 'local'} icon="📱" title={t('Local seulement', 'Local only')} subtitle={t('Données sur cet appareil', 'Data on this device')} onClick={() => choose('local')} />
        <Card active={storageMode === 'file-backup'} icon="💾" title={t('Sauvegarde fichier', 'File backup')} subtitle={t('Export/import vers votre cloud personnel', 'Export/import to your personal cloud')} onClick={() => choose('file-backup')} />
        <Card active={storageMode === 'supabase'} icon="☁️" title={t('Supabase / Cloud sécurisé', 'Supabase / Secure cloud')} subtitle={t('Multi-appareils, équipe et sauvegarde cloud', 'Multi-device, team, and cloud backup')} onClick={() => choose('supabase')} />
      </div>
    </div>
  )
}

function Card({ active, icon, title, subtitle, onClick }: { active: boolean; icon: string; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full text-left rounded-3xl p-5 border transition-all active:scale-[0.98] ${active ? 'bg-cyan-500/15 border-cyan-300/50' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-white font-black text-lg">{title}</h2>
            {active && <span className="text-cyan-300 text-xs font-black">✓ ACTIF</span>}
          </div>
          <p className="text-white/60 text-sm mt-1">{subtitle}</p>
        </div>
      </div>
    </button>
  )
}
