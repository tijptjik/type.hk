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

Media comes from the local `../tooltjik` checkout's app `docs/` directories,
plus the existing Bartjik comparison recording listed below. These are rendered tools with synthetic demo data. Still images are
lossless WebP exports without cropping. The page uses `object-contain` so tall
panels and terminal captures remain complete. Videos play on request with native
controls and metadata preloading. The current page uses one recording each for
Notjik, Bartjik and Mailtjik, plus one still each for Runtjik, Tjikup and Greetjik.
Earlier exported screenshots remain available as source assets.

| Tool | Source captures |
| --- | --- |
| Notjik | `showcase.png`, `showcase.mp4`, `rose-punk.png`, `history.png` |
| Bartjik | Existing `Videos/tooltjik/bartjik-vs-waybar-2026-10-26.mp4`; a frame at 10 seconds is the poster |
| Runtjik | `showcase.png`, `windows.png`, `shortcuts.png` |
| Tjikup | `showcase.png` |
| Mailtjik | `demo.gif`, `search.png`, `read.png`, `archive.png` |
| Greetjik | `showcase.png` (captured under the earlier `pony-rs` name) |

Icons in `public/os-icons/` are the six self-contained custom SVGs copied from
`../tooltjik/docs/icons/`. Their canonical artwork and attribution are documented
in that directory's README. Greetjik's pony is original fan artwork inspired by
Rainbow Dash; character design rights belong to Hasbro.

To refresh a still, preserving its full frame:

```sh
cwebp -lossless ../tooltjik/apps/runtjik/docs/showcase.png -o public/os-previews/runtjik-showcase.webp
```

Notjik uses its existing MP4 unchanged. Mailtjik's GIF is encoded as a smaller,
seekable H.264 video:

```sh
ffmpeg -i ../tooltjik/apps/mailtjik/docs/demo.gif -an -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart public/os-previews/mailtjik-demo.mp4
```

Runtjik, Tjikup and Greetjik currently use screencaps. Add their recordings by
supplying a `videoSrc` alongside the still poster in each entry's `media` object.
Bartjik's existing comparison recording is copied unchanged; its poster is a
lossless WebP export of an actual frame.

Runtjik's README is currently present in the local Tooltjik checkout but absent
from the checked `origin/main` tree. Its site link points to the intended GitHub
README path; publish that app in Tooltjik before expecting the link to resolve.
