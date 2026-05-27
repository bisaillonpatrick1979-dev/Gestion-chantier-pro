'use client'

// Legacy compatibility stub kept intentionally empty.
// Theme label is handled directly in settings list.
export default function HideInfernoThemeOption() {
  useEffect(() => {
    const timer = window.setInterval(() => {
      document.querySelectorAll('button span').forEach(span => {
        if ((span.textContent || '').includes('Inferno')) span.textContent = 'Infernal'
      })
    }, 500)

    return () => window.clearInterval(timer)
  }, [])

  return null
}
