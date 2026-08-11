// These are broadly supported vCard 3.0 fields, which Android's contact
// importer recognises reliably.
const contactCardLines = (formattedName: string, familyName: string) => [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `FN:${formattedName}`,
  `N:${familyName};Mart;;;`,
  'TITLE:Technologist & Mapper',
  'EMAIL:m@type.hk',
  'TEL;TYPE=CELL,VOICE:+85291491764',
  'URL:https://type.hk',
  'URL:https://ig.type.hk',
  'END:VCARD',
]

const toVCard = (lines: string[]) => `${lines.join('\r\n')}\r\n`

const contactCard = toVCard(contactCardLines('Mart van de Ven', 'van de Ven'))

// The Android QR contact flow flattens FN and guesses the name fields. A
// non-breaking space keeps the compound surname together in that heuristic,
// while the downloadable card above retains the standards-compliant spelling.
const contactCardQr = toVCard(
  contactCardLines('Mart van\u00a0de\u00a0Ven', 'van\u00a0de\u00a0Ven'),
)

export const contactCardData = contactCard
export const contactCardQrData = contactCardQr
