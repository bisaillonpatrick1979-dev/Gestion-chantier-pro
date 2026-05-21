// src/lib/infernoGlobalSkin.ts
// Emergency safe Inferno skin.
// Purpose: stop global orange flashing/lag on employee lists, cards, calendar and buttons.
// Heavy flame visuals must stay local inside src/components/ui/InfernoEffects.tsx only.

export const infernoGlobalSkin = String.raw`
  body[data-theme='inferno'] {
    --inferno-coal: #050302;
    --inferno-panel: #0d0503;
    --inferno-card: rgba(16, 7, 4, 0.96);
    --inferno-line: rgba(205, 92, 34, 0.26);
    --inferno-line-soft: rgba(205, 92, 34, 0.13);
    --inferno-core: #d89b4a;
    --inferno-amber: #c87932;
    --inferno-orange: #a84d20;
    --inferno-text: #f3dfcc;
    --inferno-muted: #a77a62;
    background:
      radial-gradient(circle at 50% 110%, rgba(120, 42, 16, 0.12), transparent 44%),
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

  /* Critical: stop the old global Inferno effect from turning every card/list into animated fire. */
  body[data-theme='inferno'] .inferno-card-glow {
    background: var(--card) !important;
    border: 1px solid var(--border) !important;
    box-shadow: none !important;
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

  body[data-theme='inferno'] .inferno-card-glow button {
    background: var(--surface) !important;
    border: 1px solid var(--border) !important;
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
    background: var(--surface) !important;
    border-color: var(--border) !important;
    color: var(--text) !important;
    box-shadow: none !important;
    animation: none !important;
  }

  body[data-theme='inferno'] nav,
  body[data-theme='inferno'] footer {
    background: linear-gradient(180deg, rgba(12, 5, 3, 0.94), rgba(5, 2, 1, 0.98)) !important;
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
