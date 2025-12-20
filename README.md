# Snake & Ladder (Python / Pygame)

## What makes the Credits screen look the same
This project is configured to load the credits background from `credits_custom.png` first.

To keep the exact same Credits interface on your PC next time **and** when sending to someone else:
- Keep this file in the project folder: `credits_custom.png`
- Don’t rename it
- Send it together with the `.py` files and the other images/sounds

## Run (Windows)

### Option A — Use the included venv (recommended for this folder)
If you’re running from this same folder that already contains `.venv`:

```powershell
D:\slpython\.venv\Scripts\python.exe "D:\slpython\index.py"
```

### Option B — Fresh setup on another computer
1) Copy/zip the **entire** folder and send it.
2) On the other computer, open the folder in VS Code (or just use PowerShell).
3) Create a venv and install dependencies:

```powershell
cd <your-folder>
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

4) Run:

```powershell
.\.venv\Scripts\python.exe index.py
```

## Notes
- The game runs fullscreen at a fixed size (1366x768). On different monitor resolutions, the overall layout may not look identical.
- If you only want to replace the credits image later, overwrite `credits_custom.png` with your new image (same filename).
