"""Refresh the homepage tiles: capture each study's first screen at 2x with
headless Chrome and crop the phone screen to public/assets/studies/<slug>.webp.
Needs the dev server on http://localhost:4173. Run: python3 scripts/capture-study-screens.py
At a 1200 x 1300 window every study renders its phone at 100%; the screen
rectangles below were measured there (x, y, width, height in CSS px)."""
import os, subprocess, tempfile
from PIL import Image

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
RECTS = {
    'loyalty': (525, 244, 390, 888), 'my-space': (525, 263.5, 390, 849), 'transfers': (525, 262, 390, 852),  'automatic-orders': (525, 256, 390, 852),
}
out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'studies')
with tempfile.TemporaryDirectory() as tmp:
    for slug, (x, y, w, h) in RECTS.items():
        shot = os.path.join(tmp, f'{slug}.png')
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1200,1300',
                        '--force-device-scale-factor=2', '--virtual-time-budget=6000', f'--user-data-dir={tmp}/profile',
                        f'--screenshot={shot}', f'http://localhost:4173/studies/{slug}'], check=True, capture_output=True)
        crop = Image.open(shot).convert('RGB').crop((round(x * 2), round(y * 2), round((x + w) * 2), round((y + h) * 2)))
        crop.resize((600, round(600 * crop.height / crop.width)), Image.LANCZOS).save(os.path.join(out_dir, f'{slug}.webp'), quality=88)
        print('saved', slug)
