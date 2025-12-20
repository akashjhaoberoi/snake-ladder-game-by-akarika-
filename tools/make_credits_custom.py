import os

# Headless-friendly pygame init
os.environ.setdefault("SDL_VIDEODRIVER", "dummy")

import pygame  # noqa: E402


def main() -> None:
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(project_root)

    pygame.init()

    w, h = 1366, 768
    surface = pygame.Surface((w, h))
    surface.fill((30, 30, 30))

    font_big = pygame.font.Font(None, 96)
    font_mid = pygame.font.Font(None, 64)
    font_small = pygame.font.Font(None, 44)

    def blit_center(text: str, y: int, font: pygame.font.Font, color=(240, 240, 240)) -> None:
        rendered = font.render(text, True, color)
        rect = rendered.get_rect(center=(w // 2, y))
        surface.blit(rendered, rect)

    blit_center("SNAKE AND LADDER GAME", 120, font_big)
    blit_center("DEVELOPED USING PYTHON", 220, font_mid)
    blit_center("THANKS FOR PLAYING", 300, font_mid)
    blit_center("CREATED BY:", 440, font_big)
    blit_center("MADE BY AJO", 540, font_mid)
    blit_center("(replace this file with your image anytime)", 650, font_small, (200, 200, 200))

    out_path = os.path.join(project_root, "credits_custom.png")
    pygame.image.save(surface, out_path)

    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
