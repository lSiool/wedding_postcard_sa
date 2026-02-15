
FROM python:3.11-slim

#FROM ubuntu:latest
LABEL authors="stasn"

ENTRYPOINT ["top", "-b"]


COPY requirements.txt /tmp
RUN pip3 install --upgrade pip && pip3 install -r /tmp/requirements.txt && rm /tmp/requirements.txt

WORKDIR /app
COPY . /app

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# Use a single uvicorn worker so file writes remain process-local.
# If you need multiple processes, switch to a proper DB (sqlite/postgres)
# or external locking (Redis) to avoid CSV corruption.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "1"]