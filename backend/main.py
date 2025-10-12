from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, oauth, auth, classes, enrollments, assignments, ocr
from core.auth import fastapi_users, auth_backend
from models.user_model import UserCreate, UserRead
from core.db import create_tables, reset_tables

app = FastAPI(
    title="Auto nilai essay API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom authentication endpoints
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# OAuth endpoints
app.include_router(oauth.router, prefix="/api/auth", tags=["oauth"])

# FastAPI Users endpoints (backup)
app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth-jwt"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth/fastapi-users",
    tags=["auth-fastapi-users"],
)

# User management endpoints
app.include_router(users.router, prefix="/api", tags=["users"])

# Class management endpoints
app.include_router(classes.router, tags=["classes"])
app.include_router(enrollments.router, tags=["enrollments"])
app.include_router(assignments.router, tags=["assignments"])

# OCR processing endpoints
app.include_router(ocr.router, tags=["ocr"])


@app.on_event("startup")
async def on_startup():
    # TEMPORARY: Reset database to fix schema mismatch
    # Remove reset_tables() after first successful run
    await reset_tables()
    print("✅ Database tables reset successfully")


@app.get("/")
async def root():
    return {"message": "Auto Essay Grader API is running"}
