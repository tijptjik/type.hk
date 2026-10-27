#!/usr/bin/env python3
"""Refresh the public icon gallery from a local Tijpfiles source checkout."""

import argparse
import hashlib
import json
import shutil
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
# These application identities belong on /os, rather than in the theme gallery.
OWN_APP_IDS = ("notjik", "bartjik", "runtjik", "tjikup", "mailtjik", "greetjik")
EXCLUDED = set(OWN_APP_IDS)


def read_svg(path):
    data = path.read_bytes()
    svg = ET.fromstring(data)
    if svg.tag != "{http://www.w3.org/2000/svg}svg":
        raise ValueError(f"Not an SVG: {path}")
    for node in svg.iter():
        if node.tag.rsplit("}", 1)[-1] in {"script", "foreignObject"}:
            raise ValueError(f"Unexpected active content in {path}")
        for attr, value in node.attrib.items():
            if attr.rsplit("}", 1)[-1] == "href" and not value.startswith("#"):
                raise ValueError(f"External SVG reference in {path}")
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Local Tijpfiles / Chezmoi source checkout")
    source = parser.parse_args().source.resolve()
    icon_sources = source / "scripts/icons"
    desktop = json.loads((icon_sources / "catalog.json").read_text())
    companions = json.loads((icon_sources / "command-icons.json").read_text())
    shells = {key: entry for key, entry in companions.items() if entry.get("role") == "shell"}
    servers = json.loads((icon_sources / "homepage.json").read_text())
    provenance = json.loads((icon_sources / "provenance.json").read_text())
    desktop_dir = Path("home/dot_local/share/icons/rose-punk/scalable/apps")
    server_dir = Path("home/dockers/homepage/images/rose-punk")
    entries = {}
    for catalogue, directory in ((desktop, desktop_dir), (shells, desktop_dir), (servers, server_dir)):
        for key, entry in catalogue.items():
            if key in EXCLUDED or key in entries:
                continue
            path = directory / f"{key}.svg"
            data = read_svg(source / path)
            attribution = provenance.get(key, entry.get("attribution", entry))
            entries[key] = {
                "id": key,
                "name": entry["name"],
                "src": f"/rose-punk-icons/{key}.svg",
                "source": path.as_posix(),
                "sha256": hashlib.sha256(data).hexdigest(),
                "license": attribution.get("license", "App identities remain with their owners"),
            }
    # The site's own app icons use the same transparent primary exports.
    # Never reintroduce the older shared dark tile from the README snapshots.
    os_icons = {}
    for key in OWN_APP_IDS:
        path = source / desktop_dir / f"{key}.svg"
        data = read_svg(path)
        if any(node.get("id") == "tile" for node in ET.fromstring(data).iter()):
            raise ValueError(f"Expected transparent primary icon without a shared tile: {path}")
        os_icons[key] = data
    # Read and validate the full collection before updating the exported files.
    icons = sorted(entries.values(), key=lambda entry: (entry["name"].casefold(), entry["id"]))
    destination = ROOT / ".local/site-assets/rose-punk-icons"
    destination.mkdir(parents=True, exist_ok=True)
    for icon in icons:
        shutil.copyfile(source / icon["source"], destination / f"{icon['id']}.svg")
    for stale in destination.glob("*.svg"):
        if stale.stem not in entries:
            stale.unlink()
    (destination / "manifest.json").write_text(json.dumps(icons, ensure_ascii=False, indent=2) + "\n")
    content = [{key: icon[key] for key in ("id", "name", "src")} for icon in icons]
    (ROOT / "src/lib/content/rose-punk-icons.json").write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n")
    os_destination = ROOT / ".local/site-assets/os-icons"
    os_destination.mkdir(parents=True, exist_ok=True)
    for key, data in os_icons.items():
        (os_destination / f"{key}.svg").write_bytes(data)
    print(f"Prepared for R2: {len(icons)} gallery icons and {len(os_icons)} transparent tjikOS icons")


if __name__ == "__main__":
    main()
