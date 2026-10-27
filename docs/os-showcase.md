# tjikOS showcase

`/os` uses the Projects grid with one media item per service. The six entries, order,
README links, and displayed months live in `src/lib/content/os.ts`. Dates are the
project dates, not capture dates. Copy lives in all three `messages/*/shared.json`
catalogues. Each entry has a single `media` object; replace its still with a video
when a recording becomes available. The title directly below the media links to
the README. The page has no carousel navigation, media labels or separate README
buttons. Navigation order is Projects, Maps, tjikOS, Writing, Theme. The page header shows
five tool icons, the tjikOS name, then Greetjik; each icon jumps to its service.
Short descriptions sit between each title and date on desktop, wrapping below
on mobile.

## Assets

Media comes from the local `../tjikos` checkout's app `docs/` directories,
plus the existing Bartjik comparison recording listed below. These are rendered tools with synthetic demo data. Still images are
lossless WebP exports without cropping. The page uses `object-contain` so tall
panels and terminal captures remain complete. Videos play on request with native
controls and metadata preloading. The current page uses one recording each for
Notjik, Bartjik and Mailtjik, plus one still each for Runtjik, Tjikup and Greetjik.
Earlier exported screenshots remain available as source assets.

| Tool | Source captures |
| --- | --- |
| Notjik | `~/Videos/tjikos/os/notjik-v8.mp4`; poster from `notjik-v8.review/00-intro.png` |
| Bartjik | Existing `Videos/tooltjik/bartjik-vs-waybar-2026-10-26.mp4`; a frame at 10 seconds is the poster |
| Runtjik | `showcase.png`, `windows.png`, `shortcuts.png` |
| Tjikup | `showcase.png` |
| Mailtjik | `demo.gif`, `search.png`, `read.png`, `archive.png` |
| Greetjik | `showcase.png` (captured under the earlier `pony-rs` name) |

Icons in `public/os-icons/` are the six transparent primary SVGs copied from
Tijpfiles' `home/dot_local/share/icons/rose-punk/scalable/apps/` exports. They
work on both light and dark page backgrounds; no separate light-mode set is
required. App-specific internal details remain part of the artwork, while the
old shared dark rounded-square tile is absent. Refresh them alongside the theme
gallery with `python3 scripts/sync-theme-icons.py /path/to/chezmoi`. The sync
rejects any own-app SVG that reintroduces the shared tile. Greetjik's pony is original fan artwork inspired by
Rainbow Dash; character design rights belong to Hasbro.

To refresh a still, preserving its full frame:

```sh
cwebp -lossless ../tjikos/apps/runtjik/docs/showcase.png -o public/os-previews/runtjik-showcase.webp
```

Notjik uses the shared Rose Punk showcase template from
`../tjikos/scripts/ShowcaseStage.qml`. Its 56-second, 1200 × 720, 60 fps film
shows native progress/status cards, grouped history with keyboard search, and an
inline reply, voice playback and recording, and low/normal/critical urgency.
The native stack stays centred within the feature area as cards expand. It ends with the icon, name, and GitHub app path. Panels are rendered
by Notjik in an isolated Hyprland compositor. Pointer and keyboard interactions
use the private compositor seat; all displayed messages use demo fixtures. Voice recording uses Notjik's production
FFmpeg/Opus recorder with bundled demo audio as input, then discards the draft
through the native reset control. The microphone and Telegram delivery stay unused. The
input receipt, source hashes, and review screenshots are saved alongside the
master recording in `~/Videos/tjikos/os/`. This update preserves the previous site assets
in `~/Videos/tjikos/os/site-before-notjik-v8/`; older backups remain under
`~/Videos/tooltjik/os/`.

Record a new take with an unused filename, then review its actual transitions:

```sh
cd ../tjikos
python3 -B scripts/os_showcase.py notjik "$HOME/Videos/tjikos/os/notjik-next.mp4"
```

The shared frame and proposed feature stories for the other five tools are in
`../tjikos/docs/os-showcase.md`. Only Notjik currently uses this new template.

Mailtjik's GIF is encoded as a smaller, seekable H.264 video:

```sh
ffmpeg -i ../tjikos/apps/mailtjik/docs/demo.gif -an -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart public/os-previews/mailtjik-demo.mp4
```

Runtjik, Tjikup and Greetjik currently use screencaps. Add their recordings by
supplying a `videoSrc` alongside the still poster in each entry's `media` object.
Bartjik's existing comparison recording is copied unchanged; its poster is a
lossless WebP export of an actual frame.

Runtjik's README is currently present in the local Tooltjik checkout but absent
from the checked `origin/main` tree. Its site link points to the intended GitHub
README path; publish that app in Tooltjik before expecting the link to resolve.

The Notjik poster uses the opening identity frame: **Notifications with flair**.
Its feature line is **Live updates. Telegram integration. Replies in place.**
