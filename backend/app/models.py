from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="staff")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    shipments = relationship("Shipment", back_populates="owner")


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    status = Column(String(30), default="Pending")
    driver_name = Column(String(100), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="shipments")