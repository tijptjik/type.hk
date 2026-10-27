#!/usr/bin/env python3
"""Prevent generated R2 assets from being bundled back into site deployments."""
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('publish_assets', ROOT / 'scripts/publish-assets.py')
assets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assets)
found = [str(path.relative_to(ROOT)) for path in (ROOT / 'public').rglob('*')
         if path.is_file() and (assets.asset_path(path.relative_to(ROOT / 'public').as_posix())
                               or path.suffix.lower() in ('.zip', '.mp4', '.webm', '.mov', '.gif'))]
if found:
    raise SystemExit('Generated assets belong in .local/site-assets and R2, not public/:\n' + '\n'.join(found))
