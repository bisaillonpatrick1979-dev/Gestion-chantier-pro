'use client'
import React from 'react'

export interface DocumentWatermarkProps {
  type: 'FACTURE' | 'DEVIS' | 'CONTRAT' | 'BON DE COMMANDE' | 'COMMANDE'
  logoUrl?: string
  companyName?: string
  employeeName?: string   // Si défini → filigrane employé (nom + FACTURE)
  opacity?: number
  fullPage?: boolean      // true = position fixed (pleine page), false = position absolute (dans une carte)
}

const DocumentWatermark: React.FC<DocumentWatermarkProps> = ({
  type,
  logoUrl,
  companyName,
  employeeName,
  opacity = 0.06,
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
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: fullPage ? '12px' : '6px',
          opacity,
          transform: 'rotate(-22deg)',
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        {/* Logo — compagnie seulement, pas employé */}
        {!isEmployee && logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            style={{
              width: fullPage ? '140px' : '72px',
              height: fullPage ? '140px' : '72px',
              objectFit: 'contain',
            }}
          />
        ) : null}

        {/* Nom */}
        <div
          style={{
            fontSize: fullPage
              ? (isEmployee ? '52px' : '38px')
              : (isEmployee ? '20px' : '18px'),
            fontWeight: 900,
            color: fullPage ? '#000' : 'var(--text)',
            letterSpacing: '2px',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
          {isEmployee ? employeeName : companyName}
        </div>

        {/* Type de document */}
        <div
          style={{
            fontSize: fullPage
              ? (isEmployee ? '32px' : '24px')
              : (isEmployee ? '14px' : '13px'),
            fontWeight: 800,
            color: fullPage ? '#000' : 'var(--text)',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {type}
        </div>
      </div>
    </div>
  )
}

export default DocumentWatermark
