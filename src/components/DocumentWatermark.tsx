'use client'
import React from 'react'

export interface DocumentWatermarkProps {
  // ✅ COMMANDE ajouté — fix erreur TypeScript commandes/page.tsx
  type: 'FACTURE' | 'DEVIS' | 'CONTRAT' | 'BON DE COMMANDE' | 'COMMANDE'
  logoUrl?: string
  companyName?: string
  employeeName?: string   // Si défini → filigrane employé (nom + type)
  opacity?: number
  fullPage?: boolean      // true = position fixed (pleine page), false = position absolute (dans une carte)
}

const DocumentWatermark: React.FC<DocumentWatermarkProps> = ({
  type,
  logoUrl,
  companyName,
  employeeName,
  opacity = 0.13,
  fullPage = false,
}) => {
  const isEmployee = !!employeeName

  return (
    <div
      aria-hidden="true"
      style={{
        position: fullPage ? 'fixed' : 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: fullPage ? '16px' : '8px',
          opacity,
          transform: 'rotate(-22deg)',
          userSelect: 'none',
          textAlign: 'center',
          background: 'transparent',
        }}
      >
        {/* Logo — compagnie seulement, pas employé */}
        {!isEmployee && logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            style={{
              width: fullPage ? '200px' : '110px',
              height: fullPage ? '200px' : '110px',
              objectFit: 'contain',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderRadius: 0,
              // Fond blanc PNG → transparent
              mixBlendMode: 'multiply',
            }}
          />
        ) : null}

        {/* Nom compagnie ou employé */}
        <div
          style={{
            fontSize: fullPage
              ? (isEmployee ? '56px' : '42px')
              : (isEmployee ? '24px' : '22px'),
            fontWeight: 900,
            color: fullPage ? '#000' : 'var(--text)',
            letterSpacing: '2px',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            background: 'transparent',
          }}
        >
          {isEmployee ? employeeName : companyName}
        </div>

        {/* Type de document */}
        <div
          style={{
            fontSize: fullPage
              ? (isEmployee ? '36px' : '28px')
              : (isEmployee ? '16px' : '15px'),
            fontWeight: 800,
            color: fullPage ? '#000' : 'var(--text)',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            background: 'transparent',
          }}
        >
          {type}
        </div>
      </div>
    </div>
  )
}

export default DocumentWatermark
