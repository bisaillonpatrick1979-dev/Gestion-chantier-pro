export interface RegionInfo {
  code: string
  nameFr: string
  nameEn: string
  taxRate: number
  taxLabel: string
  flag: string
}

export const CANADA_PROVINCES: RegionInfo[] = [
  { code: 'AB', nameFr: 'Alberta',                      nameEn: 'Alberta',                    taxRate: 0.05,    taxLabel: 'GST 5%',          flag: '🏔️' },
  { code: 'BC', nameFr: 'Colombie-Britannique',          nameEn: 'British Columbia',            taxRate: 0.12,    taxLabel: 'GST+PST 12%',     flag: '🌲' },
  { code: 'MB', nameFr: 'Manitoba',                     nameEn: 'Manitoba',                   taxRate: 0.12,    taxLabel: 'GST+PST 12%',     flag: '🌾' },
  { code: 'NB', nameFr: 'Nouveau-Brunswick',             nameEn: 'New Brunswick',               taxRate: 0.15,    taxLabel: 'HST 15%',         flag: '🦞' },
  { code: 'NL', nameFr: 'Terre-Neuve-et-Labrador',       nameEn: 'Newfoundland & Labrador',     taxRate: 0.15,    taxLabel: 'HST 15%',         flag: '🐟' },
  { code: 'NS', nameFr: 'Nouvelle-Écosse',               nameEn: 'Nova Scotia',                 taxRate: 0.15,    taxLabel: 'HST 15%',         flag: '⚓' },
  { code: 'NT', nameFr: 'Territoires du Nord-Ouest',     nameEn: 'Northwest Territories',       taxRate: 0.05,    taxLabel: 'GST 5%',          flag: '🐻' },
  { code: 'NU', nameFr: 'Nunavut',                      nameEn: 'Nunavut',                    taxRate: 0.05,    taxLabel: 'GST 5%',          flag: '🦭' },
  { code: 'ON', nameFr: 'Ontario',                      nameEn: 'Ontario',                    taxRate: 0.13,    taxLabel: 'HST 13%',         flag: '🍁' },
  { code: 'PE', nameFr: 'Île-du-Prince-Édouard',         nameEn: 'Prince Edward Island',        taxRate: 0.15,    taxLabel: 'HST 15%',         flag: '🥔' },
  { code: 'QC', nameFr: 'Québec',                       nameEn: 'Quebec',                     taxRate: 0.14975, taxLabel: 'TPS+TVQ 14.975%', flag: '⚜️' },
  { code: 'SK', nameFr: 'Saskatchewan',                 nameEn: 'Saskatchewan',               taxRate: 0.11,    taxLabel: 'GST+PST 11%',     flag: '🌻' },
  { code: 'YT', nameFr: 'Yukon',                        nameEn: 'Yukon',                      taxRate: 0.05,    taxLabel: 'GST 5%',          flag: '🐺' },
]

export const US_STATES: RegionInfo[] = [
  { code: 'AL', nameFr: 'Alabama',           nameEn: 'Alabama',           taxRate: 0.04,    taxLabel: '4%',     flag: '🌺' },
  { code: 'AK', nameFr: 'Alaska',            nameEn: 'Alaska',            taxRate: 0,       taxLabel: 'No tax', flag: '🐻' },
  { code: 'AZ', nameFr: 'Arizona',           nameEn: 'Arizona',           taxRate: 0.056,   taxLabel: '5.6%',   flag: '🌵' },
  { code: 'AR', nameFr: 'Arkansas',          nameEn: 'Arkansas',          taxRate: 0.065,   taxLabel: '6.5%',   flag: '💎' },
  { code: 'CA', nameFr: 'Californie',        nameEn: 'California',        taxRate: 0.0725,  taxLabel: '7.25%',  flag: '🌴' },
  { code: 'CO', nameFr: 'Colorado',          nameEn: 'Colorado',          taxRate: 0.029,   taxLabel: '2.9%',   flag: '🏔️' },
  { code: 'CT', nameFr: 'Connecticut',       nameEn: 'Connecticut',       taxRate: 0.0635,  taxLabel: '6.35%',  flag: '🪙' },
  { code: 'DE', nameFr: 'Delaware',          nameEn: 'Delaware',          taxRate: 0,       taxLabel: 'No tax', flag: '🔵' },
  { code: 'FL', nameFr: 'Floride',           nameEn: 'Florida',           taxRate: 0.06,    taxLabel: '6%',     flag: '🌊' },
  { code: 'GA', nameFr: 'Géorgie',           nameEn: 'Georgia',           taxRate: 0.04,    taxLabel: '4%',     flag: '🍑' },
  { code: 'HI', nameFr: 'Hawaï',             nameEn: 'Hawaii',            taxRate: 0.04,    taxLabel: '4%',     flag: '🌺' },
  { code: 'ID', nameFr: 'Idaho',             nameEn: 'Idaho',             taxRate: 0.06,    taxLabel: '6%',     flag: '🥔' },
  { code: 'IL', nameFr: 'Illinois',          nameEn: 'Illinois',          taxRate: 0.0625,  taxLabel: '6.25%',  flag: '🌽' },
  { code: 'IN', nameFr: 'Indiana',           nameEn: 'Indiana',           taxRate: 0.07,    taxLabel: '7%',     flag: '🏁' },
  { code: 'IA', nameFr: 'Iowa',              nameEn: 'Iowa',              taxRate: 0.06,    taxLabel: '6%',     flag: '🌾' },
  { code: 'KS', nameFr: 'Kansas',            nameEn: 'Kansas',            taxRate: 0.065,   taxLabel: '6.5%',   flag: '🌻' },
  { code: 'KY', nameFr: 'Kentucky',          nameEn: 'Kentucky',          taxRate: 0.06,    taxLabel: '6%',     flag: '🐎' },
  { code: 'LA', nameFr: 'Louisiane',         nameEn: 'Louisiana',         taxRate: 0.0445,  taxLabel: '4.45%',  flag: '🎷' },
  { code: 'ME', nameFr: 'Maine',             nameEn: 'Maine',             taxRate: 0.055,   taxLabel: '5.5%',   flag: '🦞' },
  { code: 'MD', nameFr: 'Maryland',          nameEn: 'Maryland',          taxRate: 0.06,    taxLabel: '6%',     flag: '🦀' },
  { code: 'MA', nameFr: 'Massachusetts',     nameEn: 'Massachusetts',     taxRate: 0.0625,  taxLabel: '6.25%',  flag: '🎓' },
  { code: 'MI', nameFr: 'Michigan',          nameEn: 'Michigan',          taxRate: 0.06,    taxLabel: '6%',     flag: '🚗' },
  { code: 'MN', nameFr: 'Minnesota',         nameEn: 'Minnesota',         taxRate: 0.06875, taxLabel: '6.875%', flag: '🌲' },
  { code: 'MS', nameFr: 'Mississippi',       nameEn: 'Mississippi',       taxRate: 0.07,    taxLabel: '7%',     flag: '🎵' },
  { code: 'MO', nameFr: 'Missouri',          nameEn: 'Missouri',          taxRate: 0.04225, taxLabel: '4.225%', flag: '⚡' },
  { code: 'MT', nameFr: 'Montana',           nameEn: 'Montana',           taxRate: 0,       taxLabel: 'No tax', flag: '🦌' },
  { code: 'NE', nameFr: 'Nebraska',          nameEn: 'Nebraska',          taxRate: 0.055,   taxLabel: '5.5%',   flag: '🌽' },
  { code: 'NV', nameFr: 'Nevada',            nameEn: 'Nevada',            taxRate: 0.0685,  taxLabel: '6.85%',  flag: '🎰' },
  { code: 'NH', nameFr: 'New Hampshire',     nameEn: 'New Hampshire',     taxRate: 0,       taxLabel: 'No tax', flag: '🍂' },
  { code: 'NJ', nameFr: 'New Jersey',        nameEn: 'New Jersey',        taxRate: 0.06625, taxLabel: '6.625%', flag: '🌃' },
  { code: 'NM', nameFr: 'Nouveau-Mexique',   nameEn: 'New Mexico',        taxRate: 0.05125, taxLabel: '5.125%', flag: '🌵' },
  { code: 'NY', nameFr: 'New York',          nameEn: 'New York',          taxRate: 0.04,    taxLabel: '4%+',    flag: '🗽' },
  { code: 'NC', nameFr: 'Caroline du Nord',  nameEn: 'North Carolina',    taxRate: 0.0475,  taxLabel: '4.75%',  flag: '🏖️' },
  { code: 'ND', nameFr: 'Dakota du Nord',    nameEn: 'North Dakota',      taxRate: 0.05,    taxLabel: '5%',     flag: '🌾' },
  { code: 'OH', nameFr: 'Ohio',              nameEn: 'Ohio',              taxRate: 0.0575,  taxLabel: '5.75%',  flag: '🏈' },
  { code: 'OK', nameFr: 'Oklahoma',          nameEn: 'Oklahoma',          taxRate: 0.045,   taxLabel: '4.5%',   flag: '🌪️' },
  { code: 'OR', nameFr: 'Oregon',            nameEn: 'Oregon',            taxRate: 0,       taxLabel: 'No tax', flag: '🌲' },
  { code: 'PA', nameFr: 'Pennsylvanie',      nameEn: 'Pennsylvania',      taxRate: 0.06,    taxLabel: '6%',     flag: '🔔' },
  { code: 'RI', nameFr: 'Rhode Island',      nameEn: 'Rhode Island',      taxRate: 0.07,    taxLabel: '7%',     flag: '⚓' },
  { code: 'SC', nameFr: 'Caroline du Sud',   nameEn: 'South Carolina',    taxRate: 0.06,    taxLabel: '6%',     flag: '🌴' },
  { code: 'SD', nameFr: 'Dakota du Sud',     nameEn: 'South Dakota',      taxRate: 0.045,   taxLabel: '4.5%',   flag: '🦅' },
  { code: 'TN', nameFr: 'Tennessee',         nameEn: 'Tennessee',         taxRate: 0.07,    taxLabel: '7%',     flag: '🎸' },
  { code: 'TX', nameFr: 'Texas',             nameEn: 'Texas',             taxRate: 0.0625,  taxLabel: '6.25%',  flag: '🤠' },
  { code: 'UT', nameFr: 'Utah',              nameEn: 'Utah',              taxRate: 0.0485,  taxLabel: '4.85%',  flag: '🏜️' },
  { code: 'VT', nameFr: 'Vermont',           nameEn: 'Vermont',           taxRate: 0.06,    taxLabel: '6%',     flag: '🍁' },
  { code: 'VA', nameFr: 'Virginie',          nameEn: 'Virginia',          taxRate: 0.053,   taxLabel: '5.3%',   flag: '🌿' },
  { code: 'WA', nameFr: 'Washington',        nameEn: 'Washington',        taxRate: 0.065,   taxLabel: '6.5%',   flag: '🌲' },
  { code: 'WV', nameFr: 'Virginie-Occ.',     nameEn: 'West Virginia',     taxRate: 0.06,    taxLabel: '6%',     flag: '⛰️' },
  { code: 'WI', nameFr: 'Wisconsin',         nameEn: 'Wisconsin',         taxRate: 0.05,    taxLabel: '5%',     flag: '🧀' },
  { code: 'WY', nameFr: 'Wyoming',           nameEn: 'Wyoming',           taxRate: 0.04,    taxLabel: '4%',     flag: '🦌' },
  { code: 'DC', nameFr: 'Washington D.C.',   nameEn: 'Washington D.C.',   taxRate: 0.06,    taxLabel: '6%',     flag: '🏛️' },
]

export function getTaxRate(country: 'CA' | 'US', code: string): number {
  const list = country === 'CA' ? CANADA_PROVINCES : US_STATES
  return list.find(r => r.code === code)?.taxRate ?? 0.05
}

export function getTaxLabel(country: 'CA' | 'US', code: string): string {
  const list = country === 'CA' ? CANADA_PROVINCES : US_STATES
  return list.find(r => r.code === code)?.taxLabel ?? 'GST 5%'
}

export function getRegionName(country: 'CA' | 'US', code: string, lang: 'fr' | 'en'): string {
  const list = country === 'CA' ? CANADA_PROVINCES : US_STATES
  const region = list.find(r => r.code === code)
  return region ? (lang === 'fr' ? region.nameFr : region.nameEn) : code
}

