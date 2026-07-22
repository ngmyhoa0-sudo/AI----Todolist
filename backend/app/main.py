from fastapi.security import HTTPBearer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import todo, auth, ai, chat_history, stats, settings

security = HTTPBearer()

app = FastAPI(
    title="AI Todolist API",
    swagger_ui_parameters={"persistAuthorization": True}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "https://ai-todolist-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Todolist API is running!"}

# Gộp các router
app.include_router(todo.router)
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(chat_history.router)
app.include_router(stats.router)
app.include_router(settings.router)