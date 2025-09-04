from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
import shutil

router = APIRouter()

@router.post("/login")
async def login_user():
    return {"user": {"username": "Placeholder", "password": "Placeholder"}}

@router.post("/register")
async def create_user():
    return {"user": {"username": "Placeholder", "password": "Placeholder"}}
