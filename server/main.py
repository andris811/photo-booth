from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove
from io import BytesIO
from starlette.responses import StreamingResponse

app = FastAPI()

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
