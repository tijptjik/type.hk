export type MapShowcase = {
  embedUrl: string | null
  href: string
  imageSrc?: string
  title: string
}

export const mapShowcases: MapShowcase[] = [
  {
    title: 'HK Ghost Signs',
    href: 'https://hype.hk?project=hkghostsigns',
    embedUrl: 'https://hype.hk/screensaver?project=hkghostsigns',
  },
  {
    title: "A Romantic's Atlas of Hong Kong",
    href: 'https://romanticatlas.hype.hk/?noSplash=true&noMusic=true',
    embedUrl:
      'https://romanticatlas.hype.hk?kioskMode=true',
  },
  {
    title: 'Hong Kong Tramways',
    href: 'https://tramways.hype.hk',
    embedUrl: 'https://tramways.hype.hk?initZoom=17.4',
  },
  {
    title: 'Breadline',
    href: 'https://breadline.hk',
    embedUrl: null,
    imageSrc: '/project-previews/breadline.webp',
  },
]
