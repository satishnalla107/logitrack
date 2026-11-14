from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=6, max_length=100)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ShipmentCreate(BaseModel):
    tracking_number: str = Field(min_length=3, max_length=50)
    origin: str = Field(min_length=2, max_length=100)
    destination: str = Field(min_length=2, max_length=100)
    driver_name: Optional[str] = None


class ShipmentUpdate(BaseModel):
    status: Optional[Literal["Pending", "In Transit", "Delivered"]] = None
    driver_name: Optional[str] = None
    destination: Optional[str] = None


class ShipmentOut(BaseModel):
    id: int
    tracking_number: str
    origin: str
    destination: str
    status: str
    driver_name: Optional[str]
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)