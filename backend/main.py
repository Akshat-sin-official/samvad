from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import generate
from .services.vertex_client import init_vertex

app = FastAPI(title="Autonomous BRD-to-Data Intelligence Agent")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon MVP, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vertex AI
@app.on_event("startup")
async def startup_event():
    init_vertex()

# Include routes
app.include_router(generate.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Autonomous BRD Agent API is running"}
