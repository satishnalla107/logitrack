from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.database import get_db
from app.models import Shipment, User
from app.schemas import ShipmentCreate, ShipmentOut, ShipmentUpdate

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])


@router.post("/", response_model=ShipmentOut, status_code=status.HTTP_201_CREATED)
def create_shipment(
    shipment_in: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Shipment)
        .filter(Shipment.tracking_number == shipment_in.tracking_number)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Tracking number already exists")

    shipment = Shipment(
        tracking_number=shipment_in.tracking_number,
        origin=shipment_in.origin,
        destination=shipment_in.destination,
        driver_name=shipment_in.driver_name,
        created_by=current_user.id,
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment


@router.get("/", response_model=List[ShipmentOut])
def list_shipments(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Shipment).filter(Shipment.created_by == current_user.id)
    if status_filter:
        query = query.filter(Shipment.status == status_filter)
    return query.order_by(Shipment.id.desc()).all()


@router.patch("/{shipment_id}", response_model=ShipmentOut)
def update_shipment(
    shipment_id: int,
    shipment_in: ShipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = (
        db.query(Shipment)
        .filter(Shipment.id == shipment_id, Shipment.created_by == current_user.id)
        .first()
    )
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    if shipment_in.status is not None:
        shipment.status = shipment_in.status
    if shipment_in.driver_name is not None:
        shipment.driver_name = shipment_in.driver_name
    if shipment_in.destination is not None:
        shipment.destination = shipment_in.destination

    db.commit()
    db.refresh(shipment)
    return shipment


@router.delete("/{shipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = (
        db.query(Shipment)
        .filter(Shipment.id == shipment_id, Shipment.created_by == current_user.id)
        .first()
    )
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    db.delete(shipment)
    db.commit()
    return None