import asyncio
import csv
import os
import secrets
import shutil
import tempfile
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import FileResponse
from filelock import FileLock
from pydantic import BaseModel
from starlette.background import BackgroundTask

from settings import settings

DB_FILE = 'guests.csv'
LOCK_FILE = DB_FILE + ".lock"

app = FastAPI(title="RSVP API")

# Allow the frontend to call the API (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Guest(BaseModel):
    name: str
    attendance: str
    alcohol: Optional[List[str]] = []
    plus_one_name: Optional[str] = None
    child_1: Optional[str] = None
    child_2: Optional[str] = None
    comment: Optional[str] = None


security = HTTPBasic()


def require_basic_auth(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, settings.BASIC_AUTH_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, settings.BASIC_AUTH_PASSWORD)

    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True


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
        def write_csv():
            with FileLock(LOCK_FILE):
                with open(DB_FILE, "a", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f, delimiter="|")
                    writer.writerow(row)

        await asyncio.to_thread(write_csv)


@app.post('/submit-rsvp')
async def submit_rsvp(guest: Guest):
    alcohol = ", ".join(guest.alcohol or [])
    children = ", ".join(filter(None, [guest.child_1 or "", guest.child_2 or ""]))
    plus_one = guest.plus_one_name or ""
    comment = guest.comment or ""
    row = [guest.name, guest.attendance, alcohol, plus_one, children, comment]
    await append_row(row)
    return {"status": "success", "message": "Guest saved!"}


@app.get("/download-csv")
async def download_csv(_auth: bool = Depends(require_basic_auth)):
    """
    Acquire the file lock and copy CSV to a temp file (atomic snapshot).
    """
    async with app.state.csv_lock:
        def _snapshot_and_copy():
            with FileLock(LOCK_FILE):
                # create a temp file and copy content
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
                tmp.close()
                shutil.copyfile(DB_FILE, tmp.name)
                return tmp.name

        tmp_path = await asyncio.to_thread(_snapshot_and_copy)

    # remove temp file
    background = BackgroundTask(os.remove, tmp_path)
    return FileResponse(tmp_path, media_type="text/csv", filename="rsvp.csv", background=background)


# Serve static files from ./static (index.html + script.js)
# Moved this below the API routes to avoid intercepting POST requests
app.mount("/sa-wedding-post-card", StaticFiles(directory="static", html=True), name="static")

if __name__ == '__main__':
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5000, log_level="info")
