import re

# Matches: "App Name (1h 11m)" or "App Name (1h)" or "App Name (11m)"
LINE_REGEX = re.compile(r"^\s*(?P<app>.*?)\s*\((?P<dur>[^)]+)\)\s*$")

def duration_to_minutes(dur: str) -> int:
    """
    Supports:
      - "55m"
      - "1h"
      - "1h 11m"
      - "2h 0m"
    """
    dur = dur.strip().lower()

    h_match = re.search(r"(\d+)\s*h", dur)
    m_match = re.search(r"(\d+)\s*m", dur)

    hours = int(h_match.group(1)) if h_match else 0
    minutes = int(m_match.group(1)) if m_match else 0

    return hours * 60 + minutes

def parse_usage_blob(blob_text: str, group_id: str, email: str, log_date: str):
    rows = []
    if not blob_text:
        return rows

    for raw_line in blob_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        match = LINE_REGEX.match(line)
        if not match:
            continue

        app = match.group("app").strip()
        dur = match.group("dur").strip()

        minutes = duration_to_minutes(dur)
        if minutes <= 0:
            continue

        source_key = f"{group_id}|{email}|{log_date}|{app}"

        rows.append({
            "group_id": group_id,
            "email": email,
            "log_date": log_date,
            "app": app,
            "minutes": minutes,
            "source_key": source_key,
        })

    return rows
