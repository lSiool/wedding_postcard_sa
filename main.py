import asyncio
import csv
import os
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DB_FILE = 'guests.csv'

app = FastAPI(title="RSVP API")

# Allow the frontend to call the API (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from ./static (index.html + script.js)
# Moved this below the API routes to avoid intercepting POST requests


class Guest(BaseModel):
    name: str
    attendance: str
    alcohol: Optional[List[str]] = []
    plus_one_name: Optional[str] = None
    child_1: Optional[str] = None
    child_2: Optional[str] = None
    comment: Optional[str] = None


@app.on_event("startup")
async def startup_event():
    # single Lock for coordinating concurrent async handlers
    app.state.csv_lock = asyncio.Lock()
    # init CSV file
    if not os.path.exists(DB_FILE):
        def init():
            with open(DB_FILE, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f, delimiter="|")
                writer.writerow(["name", "attendance", "alcohol", "plus_one", "children", "comment"])
        await asyncio.to_thread(init)


async def append_row(row: list):
    """
    Append a CSV row safely from async context. Uses an asyncio.Lock to
    avoid concurrent writes from multiple coroutines within the same process,
    and offloads actual file I/O to a thread with asyncio.to_thread().

    """
    async with app.state.csv_lock:
        def write():
            with open(DB_FILE, "a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f, delimiter="|")
                writer.writerow(row)
        await asyncio.to_thread(write)


@app.post('/submit-rsvp')
async def submit_rsvp(guest: Guest):
    alcohol = ", ".join(guest.alcohol or [])
    children = ", ".join(filter(None, [guest.child_1 or "", guest.child_2 or ""]))
    plus_one = guest.plus_one_name or ""
    comment = guest.comment or ""
    row = [guest.name, guest.attendance, alcohol, plus_one, children, comment]
    await append_row(row)
    return {"status": "success", "message": "Guest saved!"}

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, log_level="info")
