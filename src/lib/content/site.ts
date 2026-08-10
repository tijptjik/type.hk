export type Link = {
  href: string
  icon: string
  label: string
}

export type EmailLink = {
  /** Base64-encoded local part and domain, decoded only in the browser. */
  email: readonly [string, string]
  icon: string
  label: string
}

export type ContactLink = Link | EmailLink

export type ProjectId = 'hype' | 'saanseoi'
export type ProjectLinkId = 'website' | 'instagram' | 'threads' | 'github' | 'linkedin'

export type ProjectLink = {
  href: string
  icon: string
  id: ProjectLinkId
  label: () => string
}

export type ProjectIdentity = {
  description: () => string
  href: string
  id: ProjectId
  links: ProjectLink[]
  name: () => string
  previews: ProjectPreview[]
  highlights: ProjectHighlight[]
}

export type ProjectPreview = {
  colorScheme: 'dark' | 'light'
  copy: () => ProjectPreviewCopy
  href: string
  id: string
  src: string
}

export type ProjectPreviewCopy = {
  alt: string
  title: string
}

export type ProjectHighlight = {
  comingSoon?: boolean
  description: () => ProjectHighlightDescriptionPart[]
  href?: string
  icon?: string
  id: string
  name: () => string
}

export type ProjectHighlightDescriptionPart =
  | { type: 'text'; value: string }
  | { href: string; type: 'link'; value: string }

function previewCopy(title: () => string, alt: () => string) {
  return (): ProjectPreviewCopy => ({ alt: alt(), title: title() })
}

export const contactLinks: ContactLink[] = [
  {
    label: 'Telegram',
    href: 'https://telegram.type.hk',
    icon: 'simple-icons:telegram',
  },
  {
    label: 'WhatsApp',
    href: 'https://whatsapp.type.hk',
    icon: 'simple-icons:whatsapp',
  },
  { label: 'Signal', href: 'https://signal.type.hk', icon: 'simple-icons:signal' },
  { label: 'Email', email: ['bQ==', 'dHlwZS5oaw=='], icon: 'proicons:mail' },
]

export const socialLinks: Link[] = [
  { label: 'GitHub', href: 'https://github.type.hk', icon: 'simple-icons:github' },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/7ijp7jik/',
    icon: 'simple-icons:instagram',
  },
  {
    label: 'Reddit',
    href: 'https://www.reddit.com/user/tijptjik/',
    icon: 'simple-icons:reddit',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.type.hk',
    icon: 'simple-icons:linkedin',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/tijptjik',
    icon: 'simple-icons:facebook',
  },
]

// Localized project copy stays with each project entry so the view only needs
// to render the data it receives.
export const projectIdentities: ProjectIdentity[] = [
  {
    id: 'hype',
    href: 'https://hype.hk',
    name: m.project_hype_name,
    description: m.project_hype_description,
    links: [
      {
        id: 'website',
        href: 'https://hype.hk',
        icon: 'external',
        label: m.project_link_website,
      },
      {
        id: 'instagram',
        href: 'https://instagram.com/hype.hkg/',
        icon: 'simple-icons:instagram',
        label: m.project_link_instagram,
      },
      {
        id: 'threads',
        href: 'https://threads.com/hype.hkg/',
        icon: 'simple-icons:threads',
        label: m.project_link_threads,
      },
      {
        id: 'github',
        href: 'https://github.com/hypehk',
        icon: 'simple-icons:github',
        label: m.project_link_github,
      },
      {
        id: 'linkedin',
        href: 'https://linkedin.com/company/hypehk/',
        icon: 'simple-icons:linkedin',
        label: m.project_link_linkedin,
      },
    ],
    previews: [
      {
        id: 'ghost-signs',
        colorScheme: 'dark',
        href: 'https://hype.hk?project=ghostsigns',
        src: '/project-previews/hype-hkghostsigns-map.webp',
        copy: previewCopy(
          m.project_hype_preview_ghost_signs_title,
          m.project_hype_preview_ghost_signs_alt,
        ),
      },
      {
        id: 'neon-signs',
        colorScheme: 'dark',
        href: 'https://hype.hk?project=neonsigns',
        src: '/project-previews/hype-neon-signs-map.webp',
        copy: previewCopy(
          m.project_hype_preview_neon_signs_title,
          m.project_hype_preview_neon_signs_alt,
        ),
      },
      {
        id: 'admin',
        colorScheme: 'dark',
        href: 'https://hype.hk/admin',
        src: '/project-previews/hype-admin.webp',
        copy: previewCopy(
          m.project_hype_preview_admin_title,
          m.project_hype_preview_admin_alt,
        ),
      },
      {
        id: 'ghost-signs',
        colorScheme: 'light',
        href: 'https://hype.hk?project=ghostsigns',
        src: '/project-previews/hype-hkghostsigns-map.webp',
        copy: previewCopy(
          m.project_hype_preview_ghost_signs_title,
          m.project_hype_preview_ghost_signs_alt,
        ),
      },
      {
        id: 'neon-signs',
        colorScheme: 'light',
        href: 'https://hype.hk?project=neonsigns',
        src: '/project-previews/hype-neon-signs-map.webp',
        copy: previewCopy(
          m.project_hype_preview_neon_signs_title,
          m.project_hype_preview_neon_signs_alt,
        ),
      },
      {
        id: 'admin',
        colorScheme: 'light',
        href: 'https://hype.hk/admin',
        src: '/project-previews/hype-admin.webp',
        copy: previewCopy(
          m.project_hype_preview_admin_title,
          m.project_hype_preview_admin_alt,
        ),
      },
    ],
    highlights: [
      {
        id: 'ghost-signs',
        href: 'https://hype.hk?project=hkghostsigns',
        icon: 'external',
        name: m.project_hype_subproject_ghost_signs_name,
        description: () => [
          {
            type: 'text',
            value: m.project_hype_subproject_ghost_signs_description_before_billy(),
          },
          {
            type: 'link',
            href: 'https://www.handsomeco.com/',
            value: m.project_hype_subproject_ghost_signs_description_billy(),
          },
          {
            type: 'text',
            value:
              m.project_hype_subproject_ghost_signs_description_between_collaborators(),
          },
          {
            type: 'link',
            href: 'https://www.benmaransphotography.com/',
            value: m.project_hype_subproject_ghost_signs_description_ben(),
          },
          {
            type: 'text',
            value:
              m.project_hype_subproject_ghost_signs_description_after_collaborators(),
          },
        ],
      },
      {
        id: 'neon-signs',
        href: 'https://hype.hk?project=neonsigns',
        icon: 'external',
        name: m.project_hype_subproject_neon_signs_name,
        description: () => [
          {
            type: 'text',
            value: m.project_hype_subproject_neon_signs_description_before_wai(),
          },
          {
            type: 'link',
            href: 'https://www.instagram.com/cityrecorderhk/',
            value: m.project_hype_subproject_neon_signs_description_wai(),
          },
          {
            type: 'text',
            value: m.project_hype_subproject_neon_signs_description_after_wai(),
          },
        ],
      },
      {
        id: 'breadline',
        comingSoon: true,
        name: m.project_hype_subproject_breadline_name,
        description: () => [
          {
            type: 'text',
            value: m.project_hype_subproject_breadline_description_before_daisy(),
          },
          {
            type: 'link',
            href: 'https://hkfoodworks.com/people/daisy-tam/',
            value: m.project_hype_subproject_breadline_description_daisy(),
          },
          {
            type: 'text',
            value:
              m.project_hype_subproject_breadline_description_between_collaborators(),
          },
          {
            type: 'link',
            href: 'https://hkfoodworks.com/',
            value: m.project_hype_subproject_breadline_description_foodworks(),
          },
          {
            type: 'text',
            value:
              m.project_hype_subproject_breadline_description_after_collaborators(),
          },
        ],
      },
      {
        id: 'urban-semiotics',
        comingSoon: true,
        name: m.project_hype_subproject_urban_semiotics_name,
        description: () => [
          {
            type: 'text',
            value: m.project_hype_subproject_urban_semiotics_description_before_diana(),
          },
          {
            type: 'link',
            href: 'https://dianapang.net',
            value: m.project_hype_subproject_urban_semiotics_description_diana(),
          },
          {
            type: 'text',
            value:
              m.project_hype_subproject_urban_semiotics_description_before_research(),
          },
          {
            type: 'link',
            href: 'https://dianapang.net/4p2',
            value: m.project_hype_subproject_urban_semiotics_description_research(),
          },
          {
            type: 'text',
            value:
              m.project_hype_subproject_urban_semiotics_description_after_research(),
          },
        ],
      },
    ],
  },
  {
    id: 'saanseoi',
    href: 'https://saanseoi.hk',
    name: m.project_saanseoi_name,
    description: m.project_saanseoi_description,
    links: [
      {
        id: 'website',
        href: 'https://saanseoi.hk',
        icon: 'external',
        label: m.project_link_website,
      },
      {
        id: 'instagram',
        href: 'https://instagram.com/saanseoi/',
        icon: 'simple-icons:instagram',
        label: m.project_link_instagram,
      },
      {
        id: 'threads',
        href: 'https://threads.com/saanseoi/',
        icon: 'simple-icons:threads',
        label: m.project_link_threads,
      },
      {
        id: 'github',
        href: 'https://github.com/saanseoi/',
        icon: 'simple-icons:github',
        label: m.project_link_github,
      },
      {
        id: 'linkedin',
        href: 'https://linkedin.com/company/saanseoi/',
        icon: 'simple-icons:linkedin',
        label: m.project_link_linkedin,
      },
    ],
    previews: [
      {
        id: 'home-dark',
        colorScheme: 'dark',
        href: 'https://saanseoi.hk',
        src: '/project-previews/saanseoi-dark-1.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_home_title,
          m.project_saanseoi_preview_home_alt,
        ),
      },
      {
        id: 'offering-dark',
        colorScheme: 'dark',
        href: 'https://saanseoi.hk',
        src: '/project-previews/saanseoi-dark-2.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_offering_title,
          m.project_saanseoi_preview_offering_alt,
        ),
      },
      {
        id: 'pipeline-dark',
        colorScheme: 'dark',
        href: 'https://saanseoi.hk',
        src: '/project-previews/saanseoi-dark-4.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_pipeline_title,
          m.project_saanseoi_preview_pipeline_alt,
        ),
      },
      {
        id: 'data-dark',
        colorScheme: 'dark',
        href: 'https://saanseoi.hk/data',
        src: '/project-previews/saanseoi-dark-data.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_data_title,
          m.project_saanseoi_preview_data_alt,
        ),
      },
      {
        id: 'sources-dark',
        colorScheme: 'dark',
        href: 'https://saanseoi.hk/sources',
        src: '/project-previews/saanseoi-dark-sources.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_sources_title,
          m.project_saanseoi_preview_sources_alt,
        ),
      },
      {
        id: 'manifesto-dark',
        colorScheme: 'dark',
        href: 'https://saanseoi.hk/manifesto',
        src: '/project-previews/saanseoi-dark-manifesto.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_manifesto_title,
          m.project_saanseoi_preview_manifesto_alt,
        ),
      },
      {
        id: 'home-light',
        colorScheme: 'light',
        href: 'https://saanseoi.hk',
        src: '/project-previews/saanseoi-light-1.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_home_title,
          m.project_saanseoi_preview_home_alt,
        ),
      },
      {
        id: 'offering-light',
        colorScheme: 'light',
        href: 'https://saanseoi.hk',
        src: '/project-previews/saanseoi-light-2.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_offering_title,
          m.project_saanseoi_preview_offering_alt,
        ),
      },
      {
        id: 'pipeline-light',
        colorScheme: 'light',
        href: 'https://saanseoi.hk',
        src: '/project-previews/saanseoi-light-4.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_pipeline_title,
          m.project_saanseoi_preview_pipeline_alt,
        ),
      },
      {
        id: 'data-light',
        colorScheme: 'light',
        href: 'https://saanseoi.hk/data',
        src: '/project-previews/saanseoi-light-data.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_data_title,
          m.project_saanseoi_preview_data_alt,
        ),
      },
      {
        id: 'sources-light',
        colorScheme: 'light',
        href: 'https://saanseoi.hk/sources',
        src: '/project-previews/saanseoi-light-sources.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_sources_title,
          m.project_saanseoi_preview_sources_alt,
        ),
      },
      {
        id: 'manifesto-light',
        colorScheme: 'light',
        href: 'https://saanseoi.hk/manifesto',
        src: '/project-previews/saanseoi-light-manifesto.webp',
        copy: previewCopy(
          m.project_saanseoi_preview_manifesto_title,
          m.project_saanseoi_preview_manifesto_alt,
        ),
      },
    ],
    highlights: [
      {
        id: 'data',
        href: 'https://saanseoi.hk/data',
        icon: 'external',
        name: m.project_saanseoi_subproject_data_name,
        description: () => [
          { type: 'text', value: m.project_saanseoi_subproject_data_description() },
        ],
      },
      {
        id: 'sources',
        href: 'https://saanseoi.hk/sources',
        icon: 'external',
        name: m.project_saanseoi_subproject_sources_name,
        description: () => [
          { type: 'text', value: m.project_saanseoi_subproject_sources_description() },
        ],
      },
      {
        id: 'basemaps',
        href: 'https://viewer.saanseoi.hk',
        icon: 'external',
        name: m.project_saanseoi_subproject_basemaps_name,
        description: () => [
          { type: 'text', value: m.project_saanseoi_subproject_basemaps_description() },
        ],
      },
      {
        id: 'guides',
        href: 'https://saanseoi.hk/how-to/create-a-map',
        icon: 'external',
        name: m.project_saanseoi_subproject_guides_name,
        description: () => [
          { type: 'text', value: m.project_saanseoi_subproject_guides_description() },
        ],
      },
    ],
  },
]
import * as m from '../../paraglide/messages.js'
