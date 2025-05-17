from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove
from io import BytesIO
from starlette.responses import StreamingResponse
import os
import uuid
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allow Vite frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/remove-bg")
async def remove_bg(file: UploadFile = File(...)):
    contents = await file.read()
    output = remove(contents)
    return StreamingResponse(BytesIO(output), media_type="image/png")

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # Ensure only images are accepted
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"error": "Invalid file type"})

    # Generate unique filename
    extension = os.path.splitext(file.filename)[1] or ".png"
    filename = f"photo-{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Return full public URL
    url = f"http://localhost:8000/uploads/{filename}"
    return {"success": True, "url": url}

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")