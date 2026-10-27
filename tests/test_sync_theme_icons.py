"""Verify shell discovery and canonical SVG paths in the local theme export."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/sync-theme-icons.py'
spec = importlib.util.spec_from_file_location('sync_theme_icons', SCRIPT)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class ThemeIconSyncTests(unittest.TestCase):
    def test_shells_use_primary_artwork_and_custom_controls_stay_out(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source, site = root / 'source', root / 'site'
            inputs = source / 'scripts/icons'
            inputs.mkdir(parents=True)
            (inputs / 'catalog.json').write_text(json.dumps({
                'app': {'name': 'Application'}, 'notjik': {'name': 'Notjik'}}))
            (inputs / 'command-icons.json').write_text(json.dumps({
                'fish': {'name': 'Fish shell', 'role': 'shell', 'license': 'Original artwork'},
                'runtjik-refresh': {'name': 'Refresh', 'role': 'control'}}))
            (inputs / 'homepage.json').write_text(json.dumps({
                'app': {'name': 'Shared service'}, 'shelfmark': {'name': 'Shelfmark'}}))
            (inputs / 'provenance.json').write_text('{}')
            desktop = source / 'home/dot_local/share/icons/rose-punk/scalable/apps'
            servers = source / 'home/dockers/homepage/images/rose-punk'
            desktop.mkdir(parents=True)
            servers.mkdir(parents=True)
            svg = b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"/>'
            for name in ('app', 'fish', *sync.OWN_APP_IDS):
                (desktop / (name + '.svg')).write_bytes(svg)
            (servers / 'shelfmark.svg').write_bytes(svg)
            (site / 'src/lib/content').mkdir(parents=True)
            with patch.object(sync, 'ROOT', site), patch('sys.argv', ['sync-theme-icons.py', str(source)]):
                sync.main()
            icons = json.loads((site / 'src/lib/content/rose-punk-icons.json').read_text())
            self.assertEqual({icon['id'] for icon in icons}, {'app', 'fish', 'shelfmark'})
            for icon in icons:
                self.assertEqual((site / 'public' / icon['src'].lstrip('/')).read_bytes(), svg)
            manifest = json.loads((site / 'public/rose-punk-icons/manifest.json').read_text())
            fish = next(icon for icon in manifest if icon['id'] == 'fish')
            self.assertEqual(fish['license'], 'Original artwork')
            self.assertIn('/rose-punk/', fish['source'])

            os_icons = site / 'public/os-icons'
            self.assertEqual({path.stem for path in os_icons.glob('*.svg')}, set(sync.OWN_APP_IDS))
            for name in sync.OWN_APP_IDS:
                self.assertEqual((os_icons / f'{name}.svg').read_bytes(), (desktop / f'{name}.svg').read_bytes())

    def test_shared_dark_tile_is_rejected_before_exports_change(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source, site = root / 'source', root / 'site'
            inputs = source / 'scripts/icons'
            inputs.mkdir(parents=True)
            for name in ('catalog', 'command-icons', 'homepage', 'provenance'):
                (inputs / f'{name}.json').write_text('{}')
            desktop = source / 'home/dot_local/share/icons/rose-punk/scalable/apps'
            desktop.mkdir(parents=True)
            svg = b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"/>'
            for name in sync.OWN_APP_IDS:
                (desktop / f'{name}.svg').write_bytes(svg)
            (desktop / 'notjik.svg').write_bytes(b'<svg xmlns="http://www.w3.org/2000/svg"><rect id="tile" fill="#26233a"/></svg>')
            destination = site / 'public/os-icons'
            destination.mkdir(parents=True)
            existing = destination / 'notjik.svg'
            existing.write_bytes(svg)
            with patch.object(sync, 'ROOT', site), patch('sys.argv', ['sync-theme-icons.py', str(source)]):
                with self.assertRaisesRegex(ValueError, 'without a shared tile'):
                    sync.main()
            self.assertEqual(existing.read_bytes(), svg)
            self.assertFalse((site / 'public/rose-punk-icons').exists())
