"""Talks to the AI. Everything that leaves this computer goes through this file."""

from __future__ import annotations

import re
import time
from dataclasses import dataclass
from typing import Generic, Type, TypeVar

import openai
from pydantic import BaseModel

from . import config

T = TypeVar("T", bound=BaseModel)

EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE = re.compile(r"(?<![\w-])\+?\(?\d[\d\s()-]{7,}\d(?![\w-])")
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def hide_personal_data(text: str) -> str:
    """Replace e-mails and phone numbers. Ticket keys like DHS-101 and dates stay as they are."""
    text = EMAIL.sub("[email]", text)

    def phone_or_not(match: re.Match) -> str:
        found = match.group(0)
        if sum(c.isdigit() for c in found) < 9 or ISO_DATE.match(found.strip()):
            return found
        return "[phone]"

    return PHONE.sub(phone_or_not, text)


class AIError(RuntimeError):
    """A problem we can show to the user as it is."""


@dataclass
class Answer(Generic[T]):
    content: T
    seconds: float
    tokens: int


class AIClient:
    def __init__(self):
        if not config.api_key():
            raise AIError("The AI key is missing. Add it to agent/.env as OPENAIKEY=... and restart the app.")
        self._client = openai.OpenAI(api_key=config.api_key())

    def ask(self, instructions: str, question: str, answer_format: Type[T]) -> Answer[T]:
        started = time.perf_counter()
        try:
            response = self._client.responses.parse(
                model=config.AI_MODEL,
                reasoning={"effort": config.AI_EFFORT},
                instructions=hide_personal_data(instructions),
                input=hide_personal_data(question),
                text_format=answer_format,
                max_output_tokens=16000,
                store=False,
            )
        except openai.AuthenticationError as e:
            raise AIError("The AI key was not accepted. Check OPENAIKEY in agent/.env.") from e
        except openai.RateLimitError as e:
            raise AIError("The AI service is busy or the account limit is reached. Please try again in a minute.") from e
        except openai.APIConnectionError as e:
            raise AIError("No connection to the AI service. Please check the internet connection.") from e
        except openai.APIStatusError as e:
            raise AIError(f"The AI service returned an error ({e.status_code}). Please try again.") from e

        if response.status == "incomplete":
            raise AIError("The answer was too long and was cut off. Try again with fewer tasks.")
        content = response.output_parsed
        if content is None:
            raise AIError("The AI did not return an answer. Please try again.")

        usage = response.usage
        tokens = (usage.input_tokens + usage.output_tokens) if usage else 0
        return Answer(content=content, seconds=time.perf_counter() - started, tokens=tokens)
