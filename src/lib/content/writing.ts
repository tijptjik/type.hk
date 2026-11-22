export type WritingEntry = {
  excerpt: string
  href?: string
  publishedAt: string
  source?: 'third-party'
  slug?: string
  tags: string[]
  title: string
}

export const grandHotelEuropaEntry: WritingEntry = {
  title: 'Grand Hotel Europa',
  publishedAt: '2026-02-27',
  slug: 'grand-hotel-europa',
  tags: ['Literature', 'Performance'],
  excerpt:
    "A literary promenade brought Europe's contemporary literary landscape to life through ten performances across Hong Kong. I read from Ilja Leonard Pfeijffer's <i>Grand Hotel Europa</i>, a meditation on the continent's promise and disillusionment.",
}

export const writingEntries: WritingEntry[] = [
  grandHotelEuropaEntry,
  {
    title:
      '‘Game of cat and mouse’: Digital Policy Office urges immediate patching as AI-discovered PHP flaws threaten global web',
    href: 'https://hongkongfp.com/2026/10/23/game-of-cat-and-mouse-digital-policy-office-urges-immediate-patching-as-ai-discovered-php-flaws-threaten-global-web/',
    publishedAt: '2026-10-23',
    source: 'third-party',
    tags: ['HKFP', 'Security'],
    excerpt:
      'Hong Kong Free Press quotes technologist Mart van de Ven on the race between patching AI-discovered PHP vulnerabilities and attackers exploiting them, as the Digital Policy Office urges public organisations to review and secure affected systems.',
  },
  {
    title:
      'Hong Kong Ghost Signs project launches interactive map, invites public to contribute',
    href: 'https://hongkongfp.com/2025/08/09/hong-kong-ghost-signs-project-launches-interactive-map-invites-public-to-contribute/',
    publishedAt: '2025-08-09',
    source: 'third-party',
    tags: ['HKFP'],
    excerpt:
      'The Ghost Signs project has launched an interactive map where the public can add fading signs to a growing photographic record of Hong Kong’s vanishing streetscape. Created by data scientist Mart van de Ven with project founders Billy Potts and Ben Marans, the map aims to help people document signs before redevelopment erases them.',
  },
  {
    title:
      'Facebook user data and phone numbers leaked, including 3 million users in Hong Kong',
    href: 'https://hongkongfp.com/2021/04/04/facebook-user-data-and-phone-numbers-leaked-including-3-million-users-in-hong-kong/',
    publishedAt: '2021-04-04',
    source: 'third-party',
    tags: ['Security', 'HKFP'],
    excerpt:
      'Hong Kong Free Press reports on a leak of Facebook user data that included the phone numbers and personal information of nearly three million people in Hong Kong.',
  },
  {
    title: 'Mart van de Ven',
    href: 'https://chingmia.blogspot.com/2015/07/mart-van-de-ven.html',
    publishedAt: '2015-07-01',
    source: 'third-party',
    tags: ['Ching Mia'],
    excerpt: 'A profile of Mart van de Ven published by Ching Mia in July 2015.',
  },
  {
    title: 'Artist Statement for the Romantic’s Atlas',
    href: 'https://romanticatlas.hype.hk/#artist-statement',
    publishedAt: '2026-08-03',
    tags: ['Art', 'Cartography'],
    excerpt:
      'An atlas can hold more than what is measurable. By placing impossible sites within familiar Hong Kong settings, this project reintroduces uncertainty into a world rendered in exhaustive detail, and asks how imagination can keep the mapped city open to surprise and possibility.',
  },
  {
    title: 'Map Making Guide',
    href: 'https://saanseoi.hk/guides/create-a-map/',
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
    title:
      'Data scientist asks fans to help archive content from soon-to-be-axed HK Magazine',
    href: 'https://hongkongfp.com/2016/10/03/data-scientist-asks-fans-to-help-archive-content-from-soon-to-be-axed-hk-magazine/',
    publishedAt: '2016-10-03',
    source: 'third-party',
    tags: ['Archiving', 'HKFP'],
    excerpt:
      "Hong Kong Free Press covers Mart van de Ven's public appeal for fans to help archive HK Magazine back issues before the magazine's website is taken offline.",
  },
  {
    title: 'Preserving Our Collective Memory: The Case of HK Magazine',
    href: 'https://slub.qucosa.de/id/qucosa%3A16647',
    publishedAt: '2017-10-28',
    source: 'third-party',
    tags: ['Archiving', 'Digital humanities'],
    excerpt:
      "A conference paper on preserving HK Magazine's digital archive as part of Hong Kong's collective memory, including the response to its closure and libraries' role in long-term access.",
  },
  {
    title: 'How to survive and even thrive in Hong Kong hotel quarantine',
    href: 'https://hongkongfp.com/2021/01/31/hkfp-guide-how-to-survive-and-even-thrive-in-hong-kong-hotel-quarantine/',
    publishedAt: '2021-01-31',
    tags: ['Guides', 'HKFP'],
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
