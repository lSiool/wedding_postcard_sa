from dotenv import load_dotenv
import os

load_dotenv()

class Settings():
    TELEGRAMM_URL = os.environ.get("TELEGRAMM_URL", "https://t.me/+J6HuiDI8IzxhYjIy")

settings = Settings()