from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models  # noqa: F401
from app.routes import auth_routes, shipment_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LogiTrack API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(shipment_routes.router)


@app.get("/")
def root():
    return {"message": "Welcome to LogiTrack API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}