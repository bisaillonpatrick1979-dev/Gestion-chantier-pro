'use client'
import { useEffect, useRef } from 'react'
import { useVoiceReminderStore } from '@/store/useVoiceReminderStore'
import { useLangStore } from '@/store/useLangStore'

// ── Messages humoristiques FR / EN ─────────────────────────────────────────
const MESSAGES = {
  fr: {
    h4: [
      "Psst ! 4 heures de chantier… T'as pas pensé à souffler un peu, champion ?",
      "Ding ! 4 heures de boulot. Bois de l'eau, mange quelque chose, t'es pas un robot !",
      "4 heures déjà ! Tu travailles comme une machine. Pense à toi aussi, mon ami !",
    ],
    h8: [
      "8 HEURES ! Sérieusement mon chum, c'est une pleine journée. Pense à pointer ta sortie !",
      "Wow, 8 heures sur le chantier ! Le travail va pas se sauver, mais toi tu devrais !",
      "8 heures de boulot ! T'es une bête de chantier, mais ton corps dit merci d'arrêter bientôt !",
    ],
    h9: [
      "9 HEURES ! Hé, y'a encore quelqu'un là-dedans ? Le Punch Out t'attend, champion !",
      "9 heures de travail, c'est impressionnant… mais un peu inquiétant aussi. Pointe !",
      "Neuf heures ! À ce rythme-là tu vas rénover tout le quartier tout seul !",
    ],
    hourly: (h: number) => [
      `${h} heures ! T'es encore là toi ? Le soleil se couche, t'aurais pas oublié quelque chose ?`,
      `Attention ! ${h} heures de travail. La médaille arrive par la poste, promis !`,
      `${h} heures sur le chantier… Sérieusement, ton lit te manque pas ?`,
    ],
    every15: (h: number) => [
      `${h} heures et des poussières… T'as oublié de pointer ou t'es un vrai robot ?`,
      `Encore là après ${h} heures ? Fais-toi une faveur et pointe ta sortie, superhéros !`,
      `${h}h de boulot… À ce rythme-là, t'auras bâti le Colisée avant demain matin !`,
      `Sérieusement, ${h} heures ? Même les chantiers ferment à un moment. Punch Out !`,
    ],
  },
  en: {
    h4: [
      "Hey! 4 hours on the job… Have you thought about taking a breather, champ?",
      "Ding! 4 hours of work. Drink some water, grab a snack — you're not a robot!",
      "4 hours already! You're working like a machine. Take care of yourself too, buddy!",
    ],
    h8: [
      "8 HOURS! Seriously friend, that's a full day. Think about punching out!",
      "Wow, 8 hours on the job site! The work isn't going anywhere, but you should!",
      "8 hours of work! You're a beast, but your body says wrap it up soon!",
    ],
    h9: [
      "9 HOURS! Hey, is anyone still there? The Punch Out button misses you, champ!",
      "9 hours of work, impressive… but a little concerning too. Time to punch!",
      "Nine hours! At this rate you'll renovate the whole neighborhood by yourself!",
    ],
    hourly: (h: number) => [
      `${h} hours! Still there? The sun's going down — didn't you forget something?`,
      `Heads up! ${h} hours of work. Your medal is in the mail, we promise!`,
      `${h} hours on the job site… Don't you miss your couch?`,
    ],
    every15: (h: number) => [
      `${h} hours and counting… Did you forget to punch out or are you a robot?`,
      `Still going after ${h} hours? Do yourself a favor and punch out, superhero!`,
      `${h}h of work… At this rate you'll have built the Colosseum by tomorrow morning!`,
      `Seriously, ${h} hours? Even job sites close at some point. Punch Out!`,
    ],
  },
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function speak(text: string, volume: number, lang: 'fr' | 'en') {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.volume  = Math.max(0, Math.min(1, volume))
  utt.rate    = 0.9
  utt.pitch   = 1.05
  utt.lang    = lang === 'fr' ? 'fr-CA' : 'en-US'
  window.speechSynthesis.speak(utt)
}

// ── Seuils en secondes ───────────────────────────────────────────────────────
const H4   = 4  * 3600   // 14 400 s
const H8   = 8  * 3600   // 28 800 s
const H9   = 9  * 3600   // 32 400 s
const H10  = 10 * 3600   // 36 000 s
const MIN15 = 15 * 60    //    900 s

// ── Hook principal ────────────────────────────────────────────────────────────
export function useVoiceReminder(elapsed: number, isRunning: boolean) {
  const { enabled, volume } = useVoiceReminderStore()
  const { lang }            = useLangStore()
  const firedRef            = useRef<Set<string>>(new Set())

  // Réinitialise les rappels quand la session se termine
  useEffect(() => {
    if (!isRunning) firedRef.current.clear()
  }, [isRunning])

  useEffect(() => {
    if (!enabled || !isRunning || elapsed <= 0) return

    const L = (lang === 'fr' || lang === 'en') ? lang : 'fr'
    const msgs = MESSAGES[L]

    // ── 4 h ────────────────────────────────────────────────────────────────
    if (elapsed >= H4 && !firedRef.current.has('h4')) {
      firedRef.current.add('h4')
      speak(pickRandom(msgs.h4), volume, L)
      return
    }

    // ── 8 h ────────────────────────────────────────────────────────────────
    if (elapsed >= H8 && !firedRef.current.has('h8')) {
      firedRef.current.add('h8')
      speak(pickRandom(msgs.h8), volume, L)
      return
    }

    // ── 9 h (avant 10 h) ───────────────────────────────────────────────────
    if (elapsed >= H9 && elapsed < H10 && !firedRef.current.has('h9')) {
      firedRef.current.add('h9')
      speak(pickRandom(msgs.h9), volume, L)
      return
    }

    // ── 10 h+ → toutes les 15 min ──────────────────────────────────────────
    if (elapsed >= H10) {
      const intervalIdx = Math.floor((elapsed - H10) / MIN15)
      const key = `i${intervalIdx}`
      if (!firedRef.current.has(key)) {
        firedRef.current.add(key)
        const h = Math.floor(elapsed / 3600)
        speak(pickRandom(msgs.every15(h)), volume, L)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, isRunning, enabled, volume, lang])
}
