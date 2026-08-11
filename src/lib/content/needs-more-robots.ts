import type { ContactLink } from './site'

// Keep the QR code and download endpoint in sync, without affecting TYPE's
// existing vCard.
const needsMoreRobotsContactCard =
  [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Benjamin Hall',
    'N:Hall;Benjamin;;;',
    'NICKNAME:needsmorerobots',
    'TITLE:Writer & Game Designer',
    'EMAIL:igrowrobots@gmail.com',
    'TEL;TYPE=CELL,VOICE:+447400044944',
    'URL:https://needsmorerobots.com/',
    'END:VCARD',
  ].join('\r\n') + '\r\n'

export const needsMoreRobotsContactCardData = needsMoreRobotsContactCard
export const needsMoreRobotsContactCardQrData = needsMoreRobotsContactCard

export const needsMoreRobotsContactLinks: ContactLink[] = [
  { label: 'Email', href: 'mailto:igrowrobots@gmail.com', icon: 'proicons:mail' },
  { label: 'Phone', href: 'tel:+447400044944', icon: 'proicons:phone' },
  { label: 'Website', href: 'https://needsmorerobots.com/', icon: 'external' },
]
