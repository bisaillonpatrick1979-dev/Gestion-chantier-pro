// src/lib/infernoGlobalSkin.ts
// Safe Inferno skin.
// Goal: transparent cards with a subtle static background texture, no global lag.
// Heavy flame visuals stay local inside src/components/ui/InfernoEffects.tsx only.

export const infernoGlobalSkin = String.raw`
  body[data-theme='inferno'] {
    --inferno-coal: #050302;
    --inferno-panel: #0d0503;
    --inferno-card: rgba(16, 7, 4, 0.52);
    --inferno-line: rgba(205, 92, 34, 0.26);
    --inferno-line-soft: rgba(205, 92, 34, 0.15);
    --inferno-core: #d89b4a;
    --inferno-amber: #c87932;
    --inferno-orange: #a84d20;
    --inferno-text: #f3dfcc;
    --inferno-muted: #a77a62;
    background:
      radial-gradient(circle at 50% 110%, rgba(120, 42, 16, 0.14), transparent 44%),
      radial-gradient(circle at 12% 28%, rgba(168, 72, 18, 0.08), transparent 30%),
      radial-gradient(circle at 88% 34%, rgba(132, 36, 12, 0.07), transparent 32%),
      linear-gradient(180deg, #050302 0%, #080403 52%, #0d0503 100%) !important;
    color: var(--inferno-text) !important;
  }

  body[data-theme='inferno']::before,
  body[data-theme='inferno']::after {
    content: none !important;
    animation: none !important;
  }

  body[data-theme='inferno'] main,
  body[data-theme='inferno'] nav,
  body[data-theme='inferno'] header,
  body[data-theme='inferno'] [role='dialog'] {
    position: relative;
    z-index: 1;
  }

  /* Transparent Inferno cards: static only, no moving glow, no blur-heavy effects. */
  body[data-theme='inferno'] .inferno-card-glow {
    background:
      linear-gradient(135deg, rgba(255, 124, 32, 0.055), transparent 28%, rgba(255, 68, 12, 0.045) 68%, transparent 100%),
      radial-gradient(circle at 16% 20%, rgba(255, 150, 48, 0.075), transparent 30%),
      radial-gradient(circle at 84% 80%, rgba(180, 42, 10, 0.10), transparent 32%),
      repeating-linear-gradient(120deg, rgba(255, 140, 44, 0.028) 0px, rgba(255, 140, 44, 0.028) 1px, transparent 1px, transparent 18px),
      rgba(12, 4, 2, 0.42) !important;
    border: 1px solid rgba(205, 92, 34, 0.24) !important;
    box-shadow:
      0 10px 26px rgba(0, 0, 0, 0.30),
      inset 0 1px 0 rgba(255, 176, 82, 0.055) !important;
    animation: none !important;
    filter: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  body[data-theme='inferno'] .inferno-card-glow::before,
  body[data-theme='inferno'] .inferno-card-glow::after {
    content: none !important;
    display: none !important;
    animation: none !important;
    background: none !important;
    box-shadow: none !important;
    filter: none !important;
  }

  /* Regular buttons inside cards stay calm. The punch button has its own local override in InfernoEffects.tsx. */
  body[data-theme='inferno'] .inferno-card-glow button {
    background:
      linear-gradient(135deg, rgba(255, 124, 32, 0.10), rgba(20, 7, 4, 0.54)) !important;
    border: 1px solid rgba(205, 92, 34, 0.28) !important;
    box-shadow: none !important;
    animation: none !important;
    filter: none !important;
    overflow: hidden !important;
  }

  body[data-theme='inferno'] .inferno-card-glow button::before,
  body[data-theme='inferno'] .inferno-card-glow button::after {
    content: none !important;
    display: none !important;
    animation: none !important;
    background: none !important;
    box-shadow: none !important;
    filter: none !important;
  }

  body[data-theme='inferno'] .metal-text {
    background: linear-gradient(90deg, #b46b35 0%, #d89b4a 50%, #b46b35 100%) !important;
    background-size: 100% auto !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    animation: none !important;
  }

  body[data-theme='inferno'] .inferno-engraving,
  body[data-theme='inferno'] .deco-divider,
  body[data-theme='inferno'] .deco-engraving {
    height: 1px !important;
    margin: 12px 0 !important;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent 0%, rgba(200, 113, 50, 0.32) 50%, transparent 100%) !important;
    box-shadow: none !important;
    animation: none !important;
  }

  body[data-theme='inferno'] .inferno-engraving::before,
  body[data-theme='inferno'] .deco-divider::before,
  body[data-theme='inferno'] .deco-engraving::before,
  body[data-theme='inferno'] .inferno-engraving::after,
  body[data-theme='inferno'] .deco-divider::after,
  body[data-theme='inferno'] .deco-engraving::after {
    content: none !important;
    display: none !important;
  }

  body[data-theme='inferno'] button {
    transition: transform 120ms ease, border-color 120ms ease, filter 120ms ease !important;
    animation: none !important;
  }

  body[data-theme='inferno'] button:hover,
  body[data-theme='inferno'] button:focus-visible {
    filter: brightness(1.03) !important;
  }

  body[data-theme='inferno'] button:active {
    transform: scale(0.99) !important;
  }

  body[data-theme='inferno'] input,
  body[data-theme='inferno'] textarea,
  body[data-theme='inferno'] select {
    background:
      linear-gradient(135deg, rgba(255, 124, 32, 0.06), rgba(12, 4, 2, 0.52)) !important;
    border-color: rgba(205, 92, 34, 0.22) !important;
    color: var(--text) !important;
    box-shadow: none !important;
    animation: none !important;
  }

  body[data-theme='inferno'] nav,
  body[data-theme='inferno'] footer {
    background: linear-gradient(180deg, rgba(12, 5, 3, 0.90), rgba(5, 2, 1, 0.96)) !important;
    border-color: rgba(196, 111, 50, 0.16) !important;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.34) !important;
    animation: none !important;
  }

  body[data-theme='inferno'] .inferno-nav-active,
  body[data-theme='inferno'] [aria-current='page'] {
    color: var(--inferno-core) !important;
    filter: none !important;
    animation: none !important;
  }

  body[data-theme='inferno'] .sd,
  body[data-theme='inferno'] .deco-status-dot {
    animation: none !important;
    box-shadow: none !important;
  }
`
