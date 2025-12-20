"""Project launcher.

Usage:
    python run.py            # GUI version (pygame)
  python run.py --console  # Console version

If you're using the workspace venv, prefer:
  D:/slpython/.venv/Scripts/python.exe run.py
"""

from __future__ import annotations

import argparse
import runpy


def _run(script_name: str) -> None:
    runpy.run_path(script_name, run_name="__main__")


def main() -> None:
    parser = argparse.ArgumentParser(add_help=True)
    parser.add_argument(
        "--console",
        action="store_true",
        help="Run the console version (index(Console Ver).py)",
    )
    args = parser.parse_args()

    if args.console:
        _run("index(Console Ver).py")
    else:
        _run("Snake_ladder.py")


if __name__ == "__main__":
    main()
