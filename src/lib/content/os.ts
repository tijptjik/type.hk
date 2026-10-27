import * as m from '../../paraglide/messages.js'

export type OsTool = {
  id: string
  name: string
  dateTime: string
  description: () => string
  media: {
    src: string
    title: () => string
    videoSrc?: string
  }
}

export function osReadme(id: string) {
  return `https://github.com/tijptjik/tooltjik/blob/main/apps/${id}/README.md`
}

// One media item per tool. Keep stills until a recording is available.
// Captures use synthetic demo data; see docs/os-showcase.md.
export const osTools: OsTool[] = [
  {
    id: 'notjik',
    name: 'Notjik',
    dateTime: '2026-10',
    description: m.os_notjik_description,
    media: {
      src: '/os-previews/notjik-showcase.webp?v=8',
      videoSrc: '/os-previews/notjik-showcase.mp4?v=8',
      title: m.os_preview_notifications,
    },
  },
  {
    id: 'bartjik',
    name: 'Bartjik',
    dateTime: '2026-10',
    description: m.os_bartjik_description,
    media: {
      src: '/os-previews/bartjik-showcase.webp',
      videoSrc: '/os-previews/bartjik-showcase.mp4',
      title: m.os_preview_status,
    },
  },
  {
    id: 'runtjik',
    name: 'Runtjik',
    dateTime: '2026-10',
    description: m.os_runtjik_description,
    media: {
      src: '/os-previews/runtjik-showcase.webp',
      title: m.os_preview_launcher,
    },
  },
  {
    id: 'tjikup',
    name: 'Tjikup',
    dateTime: '2026-05',
    description: m.os_tjikup_description,
    media: {
      src: '/os-previews/tjikup-showcase.webp',
      title: m.os_preview_workflow,
    },
  },
  {
    id: 'mailtjik',
    name: 'Mailtjik',
    dateTime: '2026-10',
    description: m.os_mailtjik_description,
    media: {
      src: '/os-previews/mailtjik-search.webp',
      videoSrc: '/os-previews/mailtjik-demo.mp4',
      title: m.os_preview_mail,
    },
  },
  {
    id: 'greetjik',
    name: 'Greetjik',
    dateTime: '2026-10',
    description: m.os_greetjik_description,
    media: {
      src: '/os-previews/greetjik-showcase.webp',
      title: m.os_preview_greeting,
    },
  },
]
