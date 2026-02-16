from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    TELEGRAMM_URL = os.environ.get("TELEGRAMM_URL", "https://t.me/+J6HuiDI8IzxhYjIy")
    BASIC_AUTH_USERNAME = os.environ.get("BASIC_AUTH_USERNAME", "admin")
    BASIC_AUTH_PASSWORD = os.environ.get("BASIC_AUTH_PASSWORD", "863021")

settings = Settings()