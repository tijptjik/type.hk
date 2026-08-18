export type WritingEntry = {
  excerpt: string
  href?: string
  publishedAt: string
  slug?: string
  tags: string[]
  title: string
}

export const grandHotelEuropaEntry: WritingEntry = {
  title: 'Grand Hotel Europa',
  publishedAt: '2026-02-27',
  slug: 'grand-hotel-europa',
  tags: ['Performance', 'Literature'],
  excerpt:
    "A literary promenade brought Europe's contemporary literary landscape to life through ten performances across Hong Kong. I read from Ilja Leonard Pfeijffer's <i>Grand Hotel Europa</i>, a meditation on the continent's promise and disillusionment.",
}

export const writingEntries: WritingEntry[] = [
  grandHotelEuropaEntry,
  {
    title: 'Map Making Guide',
    href: 'https://saanseoi.hk/how-to/create-a-map/',
    publishedAt: '2026-08-08',
    tags: ['Guides'],
    excerpt:
      'A practical route from an idea to an interactive map: choose a renderer, basemap, style, and the data or story you want to show. The guide favours free, flexible tools and walks through a local MapLibre setup.',
  },
  {
    title: 'SaanSeoi Manifesto',
    href: 'https://saanseoi.hk/manifesto',
    publishedAt: '2026-06-15',
    tags: ['Digital humanities'],
    excerpt:
      'Thirteen principles for a Hong Kong digital commons built around memory, care, and the social fabric. It argues that maps carry values, open systems should be accessible and interoperable, and technology should strengthen collective capacity.',
  },
  {
    title: 'Digital Humanities Video Series',
    href: 'https://dh.type.hk',
    publishedAt: '2021-05-23',
    tags: ['Digital humanities'],
    excerpt:
      'A short-form series in which a humanist and a technologist unpack society and culture in the digital age. Its first season explores China’s social credit system, conspiracy, cryptography, trust on the dark web, and more.',
  },
  {
    title: 'The Trial',
    href: 'https://github.com/tijptjik/TheTrial',
    publishedAt: '2021-02-08',
    tags: ['SciFi', 'LARP'],
    excerpt:
      'A narrative birthday-party LARP in which the birthday girl testifies before a galactic court deciding whether humanity should be cancelled. Players embody Earth artefacts, gathering the evidence that will decide our fate.',
  },
  {
    title: 'How to survive and even thrive in Hong Kong hotel quarantine',
    href: 'https://hongkongfp.com/2021/01/31/hkfp-guide-how-to-survive-and-even-thrive-in-hong-kong-hotel-quarantine/',
    publishedAt: '2021-01-31',
    tags: ['guide', 'hkfp'],
    excerpt:
      'A practical guide to making Hong Kong hotel quarantine more bearable, covering preparation, food, exercise, entertainment, staying connected, and keeping a healthy routine during a three-week stay.',
  },
  {
    title: 'Narrow Eclipse',
    href: 'https://github.com/tijptjik/NarrowEclipse',
    publishedAt: '2016-01-11',
    tags: ['SciFi', 'LARP'],
    excerpt:
      'Participatory birthday-party theater piece set as an alternate reality sequel to <i>The Force Awakens</i>: not your average alien dive bar.',
  },
  {
    title: 'Synthetic Synthesis',
    href: 'https://github.com/tijptjik/SyntheticSynthesis',
    publishedAt: '2013-02-04',
    tags: ['SciFi', 'LARP'],
    excerpt:
      'A Battlestar Galactica-inspired surprise-party role-playing adventure, staged across a neighbourhood map. Its stranded survivors must choose between a human future, a Cylon future, or a risky synthesis of both.',
  },
  {
    title: 'Digital Security Checklist',
    href: 'https://security.type.hk/',
    publishedAt: '2022-06-04',
    tags: ['Guides'],
    excerpt:
      'An action-oriented checklist for strengthening digital security habits. It covers passwords and multi-factor authentication, device and file protection, private browsing, secure communication, and organisational safeguards.',
  },
]
