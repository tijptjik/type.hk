"""Verify upload/receipt ordering without contacting R2."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('publish_assets', Path(__file__).resolve().parents[1] / 'scripts/publish-assets.py')
assets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assets)


class AssetPublicationTests(unittest.TestCase):
    def test_mixed_refresh_keeps_release_objects_immutable(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / 'source'
            for name in ('os-previews/demo.mp4', 'rose-punk-releases/1.0.0/theme.zip'):
                target = source / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(b'asset')
            calls = []

            def run(command, **kwargs):
                calls.append(command)
                if command[2].startswith('r2-tijpdata:'):
                    download = Path(command[3])
                    for name in assets.hashes(source):
                        target = download / name
                        target.parent.mkdir(parents=True, exist_ok=True)
                        target.write_bytes((source / name).read_bytes())
                else:
                    selected = Path(command[command.index('--files-from-raw') + 1]).read_text()
                    self.assertEqual('--immutable' in command, 'rose-punk-releases/' in selected)

            with patch.object(assets, 'ROOT', root), patch.object(assets.subprocess, 'run', side_effect=run):
                assets.upload(source)
            self.assertEqual(len(calls), 3)
            receipt = json.loads(next((root / '.local/r2-receipts').glob('*.json')).read_text())
            self.assertEqual(receipt['sha256'], assets.hashes(source))

    def test_failed_readback_does_not_record_success(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / 'source/os-previews'
            source.mkdir(parents=True)
            (source / 'video.mp4').write_bytes(b'asset')
            with patch.object(assets, 'ROOT', root), patch.object(assets.subprocess, 'run'):
                with self.assertRaisesRegex(ValueError, 'SHA-256'):
                    assets.upload(source.parent)
            self.assertFalse((root / '.local/r2-receipts').exists())

    def test_rejects_paths_outside_public_generated_assets(self):
        for name in ('../secret', '/os-previews/a.mp4', 'rose-punk-releases/registry.json', '.env'):
            self.assertFalse(assets.asset_path(name), name)
