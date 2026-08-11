export type PaletteColor = {
  description: string
  hex: string
  token: string
}

export type ThemeResource = {
  href: string | null
  label: string
}

export const rosePunkPalette: PaletteColor[] = [
  { token: 'base00', hex: '#191724', description: 'Black (Background)' },
  { token: 'base01', hex: '#1F1D2E', description: 'Darkest Gray (Status Bar)' },
  { token: 'base02', hex: '#26233A', description: 'Dark Gray (Selection Background)' },
  {
    token: 'base03',
    hex: '#555169',
    description: 'Bright Black (Comments, Invisibles, Line Highlighting)',
  },
  { token: 'base04', hex: '#6E6A86', description: 'Light Gray (Status bars)' },
  {
    token: 'base05',
    hex: '#E5E5E5',
    description: 'White (Default Foreground, Caret, Delimiters, Operators)',
  },
  { token: 'base06', hex: '#ECEBEF', description: 'Lighter White (Not often used)' },
  { token: 'base07', hex: '#F5F5F7', description: 'Bright White (Not often used)' },
  {
    token: 'base08',
    hex: '#EB6F92',
    description:
      'Red (Variables, Elements, Markup Link Text, Markup Lists, Diff Deleted)',
  },
  {
    token: 'base09',
    hex: '#F6C177',
    description:
      'Orange (Integers, Boolean, Constants, XML Attributes, Markup Link URL)',
  },
  {
    token: 'base0A',
    hex: '#F4B7B5',
    description: 'Yellow (Classes, Markup Bold, Search Text Background)',
  },
  {
    token: 'base0B',
    hex: '#31748F',
    description: 'Green (Strings, Inherited Class, Markup Code, Diff Inserted)',
  },
  {
    token: 'base0C',
    hex: '#9CCFD8',
    description:
      'Cyan (Support, Regular Expressions, Escape Characters, Markup Quotes)',
  },
  {
    token: 'base0D',
    hex: '#7188FF',
    description: 'Blue (Functions, Methods, Attribute IDs, Headings)',
  },
  {
    token: 'base0E',
    hex: '#FF53A6',
    description: 'Magenta (Keywords, Storage, Selector, Markup Italic, Diff Changed)',
  },
  {
    token: 'base0F',
    hex: '#D75959',
    description: 'Dark Red (Deprecated Highlighting)',
  },
  { token: 'base10', hex: '#110F18', description: 'Darker Black (Darker Background)' },
  {
    token: 'base11',
    hex: '#08080C',
    description: 'Darkest Black (The Darkest Background)',
  },
  { token: 'base12', hex: '#FF6B95', description: 'Bright Red' },
  { token: 'base13', hex: '#FACDCC', description: 'Bright Yellow' },
  { token: 'base14', hex: '#2F87AB', description: 'Bright Green' },
  { token: 'base15', hex: '#9BDFEB', description: 'Bright Cyan' },
  { token: 'base16', hex: '#8596ED', description: 'Bright Blue' },
  { token: 'base17', hex: '#E56EA1', description: 'Bright Magenta' },
]

export const rosePunkResources: ThemeResource[] = [
  {
    label: 'Dotfiles',
    href: 'https://github.com/tijptjik/dotfiles',
  },
  {
    label: 'Tinty',
    href: 'https://github.com/tijptjik/dotfiles/blob/main/home/dot_local/share/tinted-theming/tinty/custom-schemes/base24/rose-punk.yaml',
  },
  {
    label: 'Vivid',
    href: 'https://github.com/tijptjik/dotfiles/blob/main/home/dot_config/vivid/themes/rose-punk.yml',
  },
  {
    label: 'Zed',
    href: 'https://zed-themes.com/themes/HUhC0KAbLx8GXji-u0YGk?name=Ros%C3%A9%20Punk%20-%20Dark',
  },
  {
    label: 'Telegram',
    href: 'https://github.com/tijptjik/dotfiles/blob/main/home/dot_local/share/private_TelegramDesktop/tdata/rosepunk.tdesktop-palette',
  },
  { label: 'Obsidian', href: null },
]
