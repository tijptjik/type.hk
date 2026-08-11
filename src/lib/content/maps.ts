export type MapShowcase = {
  dateTime: string
  embedUrl: string | null
  href: string
  imageSrc?: string
  title: string
}

export function formatMapDate(dateTime: string) {
  const date = new Date(`${dateTime}-01T00:00:00Z`)
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
    year: '2-digit',
  }).format(date)

  return formatted.replace(' ', " '")
}

export const mapShowcases: MapShowcase[] = [
  {
    title: "A Romantic's Atlas of Hong Kong",
    dateTime: '2026-08',
    href: 'https://romanticatlas.hype.hk/?noSplash=true&noMusic=true',
    embedUrl: 'https://romanticatlas.hype.hk?kioskMode=true',
  },
  {
    title: 'HK Ghost Signs',
    dateTime: '2025-12',
    href: 'https://hype.hk?project=hkghostsigns',
    embedUrl: 'https://hype.hk/screensaver?project=hkghostsigns',
  },
  {
    title: 'Hong Kong Tramways',
    dateTime: '2025-05',
    href: 'https://tramways.hype.hk',
    embedUrl: 'https://tramways.hype.hk?initZoom=17.4',
  },
  {
    title: 'Breadline',
    dateTime: '2020-04',
    href: 'https://breadline.hk',
    embedUrl: null,
    imageSrc: '/project-previews/breadline.webp',
  },
].sort((first, second) => second.dateTime.localeCompare(first.dateTime))
