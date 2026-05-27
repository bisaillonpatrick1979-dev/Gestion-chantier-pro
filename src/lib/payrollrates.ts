// src/lib/payrollRates.ts
// ⚠️ MISE À JOUR REQUISE — vérifier les règles au 1er janvier et au 1er juillet si une nouvelle édition est publiée
// Dernière mise à jour : 1er janvier 2026
// Prochaine vérification : 1er juillet 2026

export const PAYROLL_YEAR = 2026
export const PAYROLL_LAST_UPDATED = '2026-01-01'
export const PAYROLL_NEXT_UPDATE = '2026-07-01'

// ─────────────────────────────────────────────────────────────────────────────
// 🇨🇦 CANADA — FÉDÉRAL 2026
// ─────────────────────────────────────────────────────────────────────────────

export const CANADA_FEDERAL = {
  // RPC / CPP
  cpp: {
    employeeRate: 0.0595,       // 5.95%
    employerRate: 0.0595,       // 5.95% (employeur = même taux)
    maxInsurableEarnings: 74600, // YMPE 2026
    basicExemption: 3500,
    maxEmployeeContribution: 4034.10,
    maxEmployerContribution: 4034.10,
    cpp2Rate: 0.04,
    cpp2MaxEarnings: 81200,
    cpp2MaxContribution: 264.00,
  },
  ei: {
    employeeRate: 0.0163,
    employerMultiplier: 1.4,
    maxInsurableEarnings: 65700,
    maxEmployeePremium: 1070.91,
    maxEmployerPremium: 1499.27,
  },
  incomeTax: {
    basicPersonalAmount: 16129,
    brackets: [
      { upTo: 57375, rate: 0.15 },
      { upTo: 114750, rate: 0.205 },
      { upTo: 177882, rate: 0.26 },
      { upTo: 253414, rate: 0.29 },
      { upTo: Infinity, rate: 0.33 },
    ],
  },
}

export const CANADA_PROVINCES: Record<string, { code: string; name: string; basicPersonalAmount: number; brackets: { upTo: number; rate: number }[] }> = {
  AB: { code: 'AB', name: 'Alberta', basicPersonalAmount: 22323, brackets: [{ upTo: 151234, rate: 0.10 }, { upTo: 181481, rate: 0.12 }, { upTo: 241974, rate: 0.13 }, { upTo: 362961, rate: 0.14 }, { upTo: Infinity, rate: 0.15 }] },
  BC: { code: 'BC', name: 'British Columbia', basicPersonalAmount: 12932, brackets: [{ upTo: 47937, rate: 0.0506 }, { upTo: 95875, rate: 0.077 }, { upTo: 110076, rate: 0.105 }, { upTo: 133664, rate: 0.1229 }, { upTo: 181232, rate: 0.147 }, { upTo: 252752, rate: 0.168 }, { upTo: Infinity, rate: 0.205 }] },
  SK: { code: 'SK', name: 'Saskatchewan', basicPersonalAmount: 18491, brackets: [{ upTo: 52057, rate: 0.105 }, { upTo: 148734, rate: 0.125 }, { upTo: Infinity, rate: 0.145 }] },
  MB: { code: 'MB', name: 'Manitoba', basicPersonalAmount: 15780, brackets: [{ upTo: 47000, rate: 0.108 }, { upTo: 100000, rate: 0.1275 }, { upTo: Infinity, rate: 0.174 }] },
  ON: { code: 'ON', name: 'Ontario', basicPersonalAmount: 12747, brackets: [{ upTo: 52886, rate: 0.0505 }, { upTo: 105775, rate: 0.0915 }, { upTo: 150000, rate: 0.1116 }, { upTo: 220000, rate: 0.1216 }, { upTo: Infinity, rate: 0.1316 }] },
  QC: { code: 'QC', name: 'Québec', basicPersonalAmount: 18571, brackets: [{ upTo: 53255, rate: 0.14 }, { upTo: 106495, rate: 0.19 }, { upTo: 129590, rate: 0.24 }, { upTo: Infinity, rate: 0.2575 }] },
  NB: { code: 'NB', name: 'New Brunswick', basicPersonalAmount: 13579, brackets: [{ upTo: 51306, rate: 0.094 }, { upTo: 102614, rate: 0.14 }, { upTo: 190060, rate: 0.16 }, { upTo: Infinity, rate: 0.195 }] },
  NS: { code: 'NS', name: 'Nova Scotia', basicPersonalAmount: 8481, brackets: [{ upTo: 29590, rate: 0.0879 }, { upTo: 59180, rate: 0.1495 }, { upTo: 93000, rate: 0.1667 }, { upTo: 150000, rate: 0.175 }, { upTo: Infinity, rate: 0.21 }] },
  PE: { code: 'PE', name: 'Prince Edward Island', basicPersonalAmount: 14250, brackets: [{ upTo: 32656, rate: 0.095 }, { upTo: 64313, rate: 0.1347 }, { upTo: 105000, rate: 0.166 }, { upTo: Infinity, rate: 0.1762 }] },
  NL: { code: 'NL', name: 'Newfoundland and Labrador', basicPersonalAmount: 10818, brackets: [{ upTo: 43198, rate: 0.087 }, { upTo: 86395, rate: 0.145 }, { upTo: 154244, rate: 0.158 }, { upTo: 215943, rate: 0.178 }, { upTo: 275870, rate: 0.198 }, { upTo: 551739, rate: 0.208 }, { upTo: 1103478, rate: 0.213 }, { upTo: Infinity, rate: 0.218 }] },
  NT: { code: 'NT', name: 'Northwest Territories', basicPersonalAmount: 17842, brackets: [{ upTo: 50597, rate: 0.059 }, { upTo: 101198, rate: 0.086 }, { upTo: 164525, rate: 0.122 }, { upTo: Infinity, rate: 0.1405 }] },
  NU: { code: 'NU', name: 'Nunavut', basicPersonalAmount: 19437, brackets: [{ upTo: 54707, rate: 0.04 }, { upTo: 109413, rate: 0.07 }, { upTo: 177881, rate: 0.09 }, { upTo: Infinity, rate: 0.115 }] },
  YT: { code: 'YT', name: 'Yukon', basicPersonalAmount: 16129, brackets: [{ upTo: 57375, rate: 0.064 }, { upTo: 114750, rate: 0.09 }, { upTo: 177882, rate: 0.109 }, { upTo: 500000, rate: 0.128 }, { upTo: Infinity, rate: 0.15 }] },
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇺🇸 USA — FÉDÉRAL 2026 / APPROXIMATION PRÉPARATOIRE
// ─────────────────────────────────────────────────────────────────────────────

export const USA_FEDERAL = {
  socialSecurity: { rate: 0.062, wageBase: 168600 },
  medicare: { rate: 0.0145, additionalRate: 0.009, additionalThreshold: 200000 },
  futa: { rate: 0.006, wageBase: 7000 },
  incomeTax: {
    standardDeductionSingle: 15000,
    brackets: [
      { upTo: 11925, rate: 0.10 },
      { upTo: 48475, rate: 0.12 },
      { upTo: 103350, rate: 0.22 },
      { upTo: 197300, rate: 0.24 },
      { upTo: 250525, rate: 0.32 },
      { upTo: 626350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
}

export const USA_STATES: Record<string, { code: string; name: string; incomeTaxRate: number }> = {
  AL: { code: 'AL', name: 'Alabama', incomeTaxRate: 0.05 }, AK: { code: 'AK', name: 'Alaska', incomeTaxRate: 0 }, AZ: { code: 'AZ', name: 'Arizona', incomeTaxRate: 0.025 }, AR: { code: 'AR', name: 'Arkansas', incomeTaxRate: 0.044 }, CA: { code: 'CA', name: 'California', incomeTaxRate: 0.093 }, CO: { code: 'CO', name: 'Colorado', incomeTaxRate: 0.044 }, CT: { code: 'CT', name: 'Connecticut', incomeTaxRate: 0.05 }, DE: { code: 'DE', name: 'Delaware', incomeTaxRate: 0.066 }, FL: { code: 'FL', name: 'Florida', incomeTaxRate: 0 }, GA: { code: 'GA', name: 'Georgia', incomeTaxRate: 0.0549 }, HI: { code: 'HI', name: 'Hawaii', incomeTaxRate: 0.0825 }, ID: { code: 'ID', name: 'Idaho', incomeTaxRate: 0.058 }, IL: { code: 'IL', name: 'Illinois', incomeTaxRate: 0.0495 }, IN: { code: 'IN', name: 'Indiana', incomeTaxRate: 0.0305 }, IA: { code: 'IA', name: 'Iowa', incomeTaxRate: 0.039 }, KS: { code: 'KS', name: 'Kansas', incomeTaxRate: 0.0525 }, KY: { code: 'KY', name: 'Kentucky', incomeTaxRate: 0.04 }, LA: { code: 'LA', name: 'Louisiana', incomeTaxRate: 0.0425 }, ME: { code: 'ME', name: 'Maine', incomeTaxRate: 0.0715 }, MD: { code: 'MD', name: 'Maryland', incomeTaxRate: 0.0575 }, MA: { code: 'MA', name: 'Massachusetts', incomeTaxRate: 0.05 }, MI: { code: 'MI', name: 'Michigan', incomeTaxRate: 0.0425 }, MN: { code: 'MN', name: 'Minnesota', incomeTaxRate: 0.0785 }, MS: { code: 'MS', name: 'Mississippi', incomeTaxRate: 0.047 }, MO: { code: 'MO', name: 'Missouri', incomeTaxRate: 0.048 }, MT: { code: 'MT', name: 'Montana', incomeTaxRate: 0.059 }, NE: { code: 'NE', name: 'Nebraska', incomeTaxRate: 0.0584 }, NV: { code: 'NV', name: 'Nevada', incomeTaxRate: 0 }, NH: { code: 'NH', name: 'New Hampshire', incomeTaxRate: 0 }, NJ: { code: 'NJ', name: 'New Jersey', incomeTaxRate: 0.0637 }, NM: { code: 'NM', name: 'New Mexico', incomeTaxRate: 0.049 }, NY: { code: 'NY', name: 'New York', incomeTaxRate: 0.0685 }, NC: { code: 'NC', name: 'North Carolina', incomeTaxRate: 0.0425 }, ND: { code: 'ND', name: 'North Dakota', incomeTaxRate: 0.025 }, OH: { code: 'OH', name: 'Ohio', incomeTaxRate: 0.0399 }, OK: { code: 'OK', name: 'Oklahoma', incomeTaxRate: 0.0475 }, OR: { code: 'OR', name: 'Oregon', incomeTaxRate: 0.0875 }, PA: { code: 'PA', name: 'Pennsylvania', incomeTaxRate: 0.0307 }, RI: { code: 'RI', name: 'Rhode Island', incomeTaxRate: 0.0475 }, SC: { code: 'SC', name: 'South Carolina', incomeTaxRate: 0.064 }, SD: { code: 'SD', name: 'South Dakota', incomeTaxRate: 0 }, TN: { code: 'TN', name: 'Tennessee', incomeTaxRate: 0 }, TX: { code: 'TX', name: 'Texas', incomeTaxRate: 0 }, UT: { code: 'UT', name: 'Utah', incomeTaxRate: 0.0465 }, VT: { code: 'VT', name: 'Vermont', incomeTaxRate: 0.066 }, VA: { code: 'VA', name: 'Virginia', incomeTaxRate: 0.0575 }, WA: { code: 'WA', name: 'Washington', incomeTaxRate: 0 }, WV: { code: 'WV', name: 'West Virginia', incomeTaxRate: 0.0512 }, WI: { code: 'WI', name: 'Wisconsin', incomeTaxRate: 0.058 }, WY: { code: 'WY', name: 'Wyoming', incomeTaxRate: 0 }, DC: { code: 'DC', name: 'District of Columbia', incomeTaxRate: 0.085 },
}
