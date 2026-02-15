# models/schemas.py
from pydantic import BaseModel


class JoinGroupRequest(BaseModel):
    invite_code: str
    email: str


class CreateGroupRequest(BaseModel):
    name: str
    daily_limit_minutes: int
    creator_email: str
