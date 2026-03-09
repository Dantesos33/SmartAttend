from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from attendance_system import ClassroomAttendanceSystem
import os
import shutil

app = FastAPI(title="SmartAttend API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the attendance system
attendance_system = ClassroomAttendanceSystem(known_students_dir="known_students")

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartAttend API"}

@app.get("/students")
def get_students():
    return {"status": "success", "students": attendance_system.get_all_students_stats()}

@app.get("/students/{name}/history")
def get_student_history(name: str):
    stats = attendance_system.get_student_stats(name)
    return {"status": "success", "data": stats}

@app.delete("/students/{name}")
def delete_student(name: str):
    success, message = attendance_system.remove_student(name)
    if not success:
        raise HTTPException(status_code=404, detail=message)
    return {"status": "success", "message": message}

@app.post("/register")
async def register_student(name: str = Form(...), roll: str = Form(...), file: UploadFile = File(...)):
    try:
        os.makedirs("known_students", exist_ok=True)
        
        # Save uploaded file
        file_ext = os.path.splitext(file.filename)[1]
        safe_name = name.replace(" ", "_")
        file_path = f"known_students/{safe_name}{file_ext}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # load the image into the system
        success, message = attendance_system.load_student_image(file_path, name, roll=roll)
        
        if success:
            return {"status": "success", "message": message, "student": name}
        else:
            # Clean up the file if face not found
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=400, detail=message)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recognize")
async def recognize_classroom(file: UploadFile = File(...), tolerance: float = Form(0.5)):
    try:
        os.makedirs("temp", exist_ok=True)
        temp_path = f"temp/{file.filename}"
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        attendance_data, message = attendance_system.recognize_classroom(temp_path, tolerance=tolerance)
        
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        if not attendance_data:
            raise HTTPException(status_code=400, detail=message)
        
        # Log the session for persistence
        attendance_system.log_attendance(attendance_data)
            
        return {"status": "success", "message": message, "data": attendance_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
