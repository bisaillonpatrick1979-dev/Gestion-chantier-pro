// src/lib/infernoGlobalSkin.ts
// UI-only overlay for the Inferno theme. No business logic, routes, Supabase, or stores are changed.

export const infernoGlobalSkin = String.raw`
  body[data-theme='inferno'] {
    --inferno-coal: #050201;
    --inferno-panel: #100604;
    --inferno-card: rgba(19, 7, 4, 0.94);
    --inferno-card-hot: rgba(34, 12, 7, 0.96);
    --inferno-line: rgba(255, 111, 28, 0.58);
    --inferno-line-soft: rgba(255, 111, 28, 0.24);
    --inferno-core: #ffe17a;
    --inferno-amber: #ffb13b;
    --inferno-orange: #ff6418;
    --inferno-red: #e63b12;
    --inferno-deep-red: #5b0902;
    --inferno-text: #fff1df;
    --inferno-muted: #d89c75;
    background:
      radial-gradient(circle at 50% 19%, rgba(255, 89, 19, 0.15), transparent 30%),
      radial-gradient(circle at 11% 36%, rgba(255, 122, 32, 0.10), transparent 28%),
      radial-gradient(circle at 92% 28%, rgba(225, 38, 12, 0.10), transparent 30%),
      radial-gradient(ellipse at 50% 100%, rgba(255, 62, 11, 0.22), transparent 58%),
      linear-gradient(180deg, #050201 0%, #080201 42%, #120402 100%) !important;
    color: var(--inferno-text) !important;
  }

  body[data-theme='inferno']::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255, 122, 31, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 122, 31, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 18% 82%, rgba(255, 86, 17, 0.16), transparent 20%),
      radial-gradient(circle at 75% 74%, rgba(255, 48, 0, 0.10), transparent 25%);
    background-size: 38px 38px, 38px 38px, 100% 100%, 100% 100%;
    opacity: 0.72;
    mix-blend-mode: screen;
  }

  body[data-theme='inferno']::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.018) 0 1px, transparent 1px 9px),
      radial-gradient(circle at 50% 120%, rgba(255, 80, 12, 0.20), transparent 42%);
    opacity: 0.32;
    animation: infernoHeatDrift 16s ease-in-out infinite alternate;
  }

  body[data-theme='inferno'] main,
  body[data-theme='inferno'] nav,
  body[data-theme='inferno'] header,
  body[data-theme='inferno'] [role='dialog'] {
    position: relative;
    z-index: 1;
  }

  @keyframes infernoHeatDrift {
    0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.24; }
    100% { transform: translate3d(0, -12px, 0) scale(1.03); opacity: 0.38; }
  }

  @keyframes infernoMoltenBorder { to { --inferno-angle: 360deg; } }

  @keyframes infernoMoltenShimmer {
    0% { background-position: -180% 0; }
    100% { background-position: 220% 0; }
  }

  @keyframes infernoBreath {
    0%, 100% { filter: saturate(1) brightness(1); box-shadow: 0 0 18px rgba(255, 88, 18, 0.22), inset 0 0 18px rgba(255, 111, 28, 0.04); }
    50% { filter: saturate(1.18) brightness(1.08); box-shadow: 0 0 34px rgba(255, 111, 28, 0.38), inset 0 0 26px rgba(255, 149, 42, 0.08); }
  }

  @keyframes infernoButtonCore {
    0%, 100% {
      box-shadow:
        0 0 0 7px rgba(255, 79, 13, 0.30),
        0 0 0 18px rgba(255, 111, 28, 0.10),
        0 0 42px rgba(255, 91, 16, 0.75),
        0 0 110px rgba(255, 37, 0, 0.36),
        inset 0 5px 14px rgba(255, 232, 135, 0.48),
        inset 0 -10px 20px rgba(80, 8, 0, 0.55);
      transform: translateZ(0) scale(1);
    }
    50% {
      box-shadow:
        0 0 0 9px rgba(255, 119, 30, 0.42),
        0 0 0 23px rgba(255, 92, 13, 0.16),
        0 0 66px rgba(255, 156, 44, 0.90),
        0 0 145px rgba(255, 48, 0, 0.50),
        inset 0 6px 18px rgba(255, 244, 171, 0.60),
        inset 0 -12px 24px rgba(101, 9, 0, 0.62);
      transform: translateZ(0) scale(1.018);
    }
  }

  @keyframes infernoFlameCrown {
    0%, 100% { transform: translateX(-50%) rotate(-2deg) scaleY(0.88); opacity: 0.72; filter: blur(10px) brightness(1); }
    22% { transform: translateX(-51%) rotate(2deg) scaleY(1.05); opacity: 0.92; filter: blur(9px) brightness(1.18); }
    48% { transform: translateX(-49%) rotate(-3deg) scaleY(0.96); opacity: 0.80; filter: blur(11px) brightness(1.08); }
    73% { transform: translateX(-50%) rotate(3deg) scaleY(1.14); opacity: 0.95; filter: blur(8px) brightness(1.28); }
  }

  @keyframes infernoSparkRise {
    0% { transform: translate3d(0, 8px, 0) scale(0.35); opacity: 0; }
    18% { opacity: 1; }
    100% { transform: translate3d(var(--spark-drift, 18px), -94px, 0) scale(0.05); opacity: 0; }
  }

  @keyframes infernoSeparatorFlow {
    0% { background-position: -220% 50%; opacity: 0.65; }
    50% { opacity: 1; }
    100% { background-position: 220% 50%; opacity: 0.65; }
  }

  @keyframes infernoCellPulse {
    0%, 100% { box-shadow: inset 0 0 0 1px rgba(255, 111, 28, 0.14), 0 0 0 rgba(255, 111, 28, 0); }
    50% { box-shadow: inset 0 0 0 1px rgba(255, 152, 45, 0.35), 0 0 16px rgba(255, 79, 13, 0.22); }
  }

  body[data-theme='inferno'] .inferno-card-glow {
    background:
      radial-gradient(circle at 50% 85%, rgba(255, 88, 18, 0.18), transparent 45%),
      linear-gradient(180deg, rgba(30, 10, 6, 0.96), rgba(10, 3, 2, 0.98)) !important;
    border: 1px solid var(--inferno-line-soft) !important;
    box-shadow:
      0 0 0 1px rgba(255, 131, 35, 0.06),
      0 18px 48px rgba(0, 0, 0, 0.68),
      0 0 40px rgba(255, 66, 8, 0.13),
      inset 0 0 42px rgba(255, 91, 16, 0.045) !important;
    animation: infernoBreath 4.8s ease-in-out infinite !important;
  }

  body[data-theme='inferno'] .inferno-card-glow::before {
    background: conic-gradient(
      from var(--inferno-angle, 0deg),
      transparent 0deg,
      rgba(255, 70, 10, 0.18) 42deg,
      rgba(255, 177, 59, 0.95) 76deg,
      rgba(255, 225, 122, 1) 92deg,
      rgba(255, 96, 24, 0.78) 118deg,
      transparent 156deg,
      transparent 360deg
    ) !important;
    animation: infernoMoltenBorder 3.4s linear infinite !important;
  }

  body[data-theme='inferno'] .inferno-card-glow::after {
    height: 3px !important;
    background: linear-gradient(90deg, transparent, rgba(255, 80, 12, 0.2), rgba(255, 191, 72, 1), rgba(255, 68, 7, 0.65), transparent) !important;
    background-size: 230% 100% !important;
    filter: drop-shadow(0 0 8px rgba(255, 111, 28, 0.85));
    animation: infernoMoltenShimmer 2.35s linear infinite !important;
  }

  body[data-theme='inferno'] .inferno-card-glow button {
    position: relative !important;
    isolation: isolate !important;
    background:
      radial-gradient(circle at 42% 33%, #fff3a8 0%, #ffd45b 15%, #ff8b24 36%, #ff4b0c 58%, #b51b05 79%, #4d0501 100%) !important;
    border: 2px solid rgba(255, 190, 72, 0.78) !important;
    overflow: visible !important;
    animation: infernoButtonCore 2.2s ease-in-out infinite !important;
  }

  body[data-theme='inferno'] .inferno-card-glow button::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -18px;
    width: 142%;
    height: 84%;
    border-radius: 50% 50% 18% 18%;
    background:
      radial-gradient(ellipse at 50% 100%, rgba(255, 236, 110, 0.86) 0%, rgba(255, 140, 26, 0.62) 25%, rgba(255, 51, 0, 0.44) 52%, transparent 75%),
      conic-gradient(from 210deg at 50% 100%, transparent 0deg, rgba(255, 87, 12, 0.75) 42deg, rgba(255, 206, 76, 0.95) 56deg, rgba(255, 54, 0, 0.72) 72deg, transparent 106deg, transparent 360deg);
    opacity: 0.88;
    transform-origin: 50% 100%;
    pointer-events: none;
    z-index: -1;
    animation: infernoFlameCrown 0.95s ease-in-out infinite;
  }

  body[data-theme='inferno'] .inferno-card-glow button::after {
    content: '';
    position: absolute;
    inset: -18px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 28% 78%, rgba(255, 225, 122, 0.98) 0 2px, transparent 3px),
      radial-gradient(circle at 58% 84%, rgba(255, 102, 24, 0.95) 0 2px, transparent 3px),
      radial-gradient(circle at 76% 68%, rgba(255, 184, 55, 0.95) 0 1.8px, transparent 3px),
      radial-gradient(circle at 42% 58%, rgba(255, 54, 0, 0.90) 0 1.5px, transparent 3px);
    pointer-events: none;
    z-index: -1;
    filter: drop-shadow(0 0 8px rgba(255, 111, 28, 0.7));
    animation: infernoSparkRise 1.65s ease-out infinite;
  }

  body[data-theme='inferno'] button:hover,
  body[data-theme='inferno'] button:focus-visible {
    filter: brightness(1.08) saturate(1.18) drop-shadow(0 0 12px rgba(255, 111, 28, 0.38));
  }

  body[data-theme='inferno'] button:active { transform: scale(0.985); }

  body[data-theme='inferno'] input,
  body[data-theme='inferno'] textarea,
  body[data-theme='inferno'] select {
    background: linear-gradient(180deg, rgba(14, 4, 2, 0.94), rgba(7, 2, 1, 0.96)) !important;
    border-color: rgba(255, 111, 28, 0.25) !important;
    color: var(--inferno-text) !important;
    box-shadow: inset 0 0 18px rgba(255, 88, 18, 0.035) !important;
  }

  body[data-theme='inferno'] input:focus,
  body[data-theme='inferno'] textarea:focus,
  body[data-theme='inferno'] select:focus {
    border-color: rgba(255, 177, 59, 0.86) !important;
    box-shadow: 0 0 0 1px rgba(255, 177, 59, 0.35), 0 0 24px rgba(255, 111, 28, 0.22), inset 0 0 18px rgba(255, 88, 18, 0.06) !important;
  }

  body[data-theme='inferno'] .inferno-engraving,
  body[data-theme='inferno'] .deco-divider,
  body[data-theme='inferno'] .deco-engraving {
    height: 5px !important;
    margin: 14px 0 !important;
    border-radius: 999px;
    background:
      linear-gradient(90deg, transparent 0%, rgba(255, 67, 8, 0.34) 18%, rgba(255, 205, 90, 1) 50%, rgba(255, 67, 8, 0.34) 82%, transparent 100%) !important;
    background-size: 220% 100% !important;
    box-shadow: 0 0 18px rgba(255, 91, 16, 0.42), 0 0 34px rgba(255, 45, 0, 0.16);
    animation: infernoSeparatorFlow 3.3s linear infinite !important;
  }

  body[data-theme='inferno'] .inferno-engraving::before,
  body[data-theme='inferno'] .deco-divider::before,
  body[data-theme='inferno'] .deco-engraving::before {
    content: '◆';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 30px;
    height: 30px;
    transform: translate(-50%, -50%);
    display: grid;
    place-items: center;
    color: #ffe17a;
    background: radial-gradient(circle, #5b0902 0%, #120301 66%, transparent 67%);
    text-shadow: 0 0 10px #ff6418;
    font-size: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255, 177, 59, 0.55);
    box-shadow: 0 0 18px rgba(255, 111, 28, 0.55);
  }

  body[data-theme='inferno'] [style*='var(--card)'],
  body[data-theme='inferno'] [style*='var(--surface)'],
  body[data-theme='inferno'] [style*='var(--border)'] {
    border-color: rgba(255, 111, 28, 0.22) !important;
  }

  body[data-theme='inferno'] main button:not(.inferno-card-glow button) {
    border-color: rgba(255, 111, 28, 0.32) !important;
    transition: filter 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  }

  body[data-theme='inferno'] main button:not(.inferno-card-glow button):focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 177, 59, 0.42), 0 0 20px rgba(255, 111, 28, 0.20) !important;
  }

  body[data-theme='inferno'] nav,
  body[data-theme='inferno'] footer {
    background:
      linear-gradient(180deg, rgba(14, 4, 2, 0.82), rgba(3, 1, 1, 0.98)) !important;
    border-color: rgba(255, 111, 28, 0.20) !important;
    box-shadow: 0 -8px 34px rgba(255, 65, 8, 0.10), inset 0 1px 0 rgba(255, 177, 59, 0.10) !important;
  }

  body[data-theme='inferno'] .inferno-nav-active,
  body[data-theme='inferno'] [aria-current='page'] {
    color: var(--inferno-amber) !important;
    filter: drop-shadow(0 0 10px rgba(255, 111, 28, 0.85));
  }

  body[data-theme='inferno'] .sd,
  body[data-theme='inferno'] .deco-status-dot {
    animation: infernoCellPulse 2.2s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    body[data-theme='inferno'] *,
    body[data-theme='inferno'] *::before,
    body[data-theme='inferno'] *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`
