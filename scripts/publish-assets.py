#!/usr/bin/env python3
"""Upload generated site assets to R2 and verify their downloaded bytes."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
REMOTE = 'r2-tijpdata:tjikos-assets/typehk'
DIRECTORIES = ('os-previews', 'project-previews', 'os-icons', 'rose-punk-icons')


def asset_path(name):
    path = PurePosixPath(name)
    if path.is_absolute() or '..' in path.parts or not path.parts:
        return False
    if path.parts[0] in DIRECTORIES:
        return len(path.parts) > 1
    if path.parts[0] == 'rose-punk-releases':
        # Keep the small registry and download index in Git.
        return len(path.parts) > 2
    return name in ('run-particles.gif', 'run-particles.webp')


def hashes(folder):
    result = {}
    for path in sorted(folder.rglob('*')):
        if path.is_file():
            with path.open('rb') as stream:
                result[str(path.relative_to(folder))] = hashlib.file_digest(stream, 'sha256').hexdigest()
    return result


def upload(source, path='', immutable=False):
    before = hashes(source)
    if not before:
        raise ValueError(f'No assets in {source}')
    for name in before:
        key = f'{path}/{name}' if path else name
        if not asset_path(key):
            raise ValueError(f'Not a generated asset path: {key}')
    destination = REMOTE + ('/' + path if path else '')
    # Download and SHA-256 every object, including objects skipped on retries.
    with tempfile.TemporaryDirectory(prefix='typehk-r2-verify-') as temporary:
        # Even a mixed asset refresh must never replace release-version objects.
        for locked in (False, True):
            selected = [name for name in before if (immutable or
                        (f'{path}/{name}' if path else name).startswith('rose-punk-releases/')) == locked]
            if not selected:
                continue
            upload_list = Path(temporary) / f'upload-{locked}.txt'
            upload_list.write_text('\n'.join(selected) + '\n')
            cache = 'public, max-age=31536000, immutable' if locked else 'public, max-age=300'
            flags = ['--checksum', '--metadata', '--metadata-set', 'cache-control=' + cache,
                     '--transfers', '4', '--checkers', '8', '--retries', '2',
                     '--files-from-raw', str(upload_list)]
            if locked:
                flags.append('--immutable')
            subprocess.run(['rclone', 'copy', str(source), destination, *flags], check=True)
        listing = Path(temporary) / 'files.txt'
        listing.write_text('\n'.join(before) + '\n')
        downloaded = Path(temporary) / 'objects'
        subprocess.run(['rclone', 'copy', destination, str(downloaded),
                        '--files-from-raw', str(listing), '--retries', '2'], check=True)
        if hashes(downloaded) != before:
            raise ValueError('Downloaded R2 assets do not match source SHA-256 hashes')
    if hashes(source) != before:
        raise ValueError('Asset sources changed during upload; retry before publishing')
    receipt = {'destination': destination, 'verified_at': datetime.now(timezone.utc).isoformat(),
               'immutable': immutable, 'sha256': before}
    receipt_dir = ROOT / '.local/r2-receipts'
    receipt_dir.mkdir(parents=True, exist_ok=True)
    receipt_path = receipt_dir / (hashlib.sha256(destination.encode()).hexdigest()[:16] + '.json')
    receipt_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + '\n')
    print(f'Uploaded and verified {len(before)} assets at {destination}; receipt: {receipt_path}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=ROOT / '.local/site-assets')
    parser.add_argument('--path', default='', help='Destination path within typehk/')
    parser.add_argument('--immutable', action='store_true', help='Reject changes to existing objects')
    args = parser.parse_args()
    upload(args.source.resolve(), args.path, args.immutable)


if __name__ == '__main__':
    main()
