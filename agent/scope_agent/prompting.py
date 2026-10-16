"""Loads the prompt templates from scope_agent/prompts/ and fills in the blanks."""

from __future__ import annotations

import re
from functools import lru_cache

from . import config
from .models import ReleaseContext

BLANK = re.compile(r"\{([a-z_]+)\}")


@lru_cache(maxsize=None)
def template(name: str) -> str:
    return (config.PROMPTS_DIR / f"{name}.md").read_text(encoding="utf-8")


def fill(name: str, **values: object) -> str:
    """Put the values into {blanks}. Blanks we don't know are left alone."""
    return BLANK.sub(lambda m: str(values.get(m.group(1), m.group(0))), template(name))


def instructions(ctx: ReleaseContext) -> str:
    return fill("system", project=ctx.project, release_context=ctx.as_text())
