# tasks.py
from uuid import uuid4

TASKS = {}  # task_id -> {"status": "...", "progress": 0-100, "message": ""}

def create_task():
    task_id = str(uuid4())
    TASKS[task_id] = {"status": "queued", "progress": 0, "message": ""}
    return task_id

def update_task(task_id, status=None, progress=None, message=None):
    if task_id in TASKS:
        if status: TASKS[task_id]["status"] = status
        if progress is not None: TASKS[task_id]["progress"] = progress
        if message: TASKS[task_id]["message"] = message

def get_task(task_id):
    return TASKS.get(task_id, {"status": "not_found"})
