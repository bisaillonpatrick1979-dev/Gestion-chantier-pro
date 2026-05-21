import HideInfernoThemeOption from '@/components/HideInfernoThemeOption'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><HideInfernoThemeOption />{children}</>
}
