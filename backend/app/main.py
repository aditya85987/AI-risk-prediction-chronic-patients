# backend/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd, joblib, io
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaIoBaseUpload
from .utils import preprocess

# ------------------- CONFIG -------------------
SERVICE_ACCOUNT_FILE = "app/service_account.json"
FILE_ID = "1Hjm-qWyk8_jVm1F3hZV2nQjthdy-p_R-"  # your Google Drive file ID
SCOPES = ["https://www.googleapis.com/auth/drive"]  # read/write

# Load ML model
MODEL = joblib.load("app/model.pkl")  # tuned RF or TFT

# Initialize FastAPI
app = FastAPI(title="Risk Prediction API")

# ------------------- DRIVE UTILS -------------------
def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return build("drive", "v3", credentials=creds)

def fetch_csv_from_drive():
    drive_service = get_drive_service()
    request = drive_service.files().get_media(fileId=FILE_ID)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.seek(0)
    df = pd.read_csv(fh)
    return df

def upload_csv_to_drive(df: pd.DataFrame):
    drive_service = get_drive_service()
    # Convert DataFrame to CSV in-memory
    fh = io.BytesIO()
    df.to_csv(fh, index=False)
    fh.seek(0)
    media_body = MediaIoBaseUpload(fh, mimetype="text/csv", resumable=True)
    # Update the existing file
    drive_service.files().update(
        fileId=FILE_ID,
        media_body=media_body
    ).execute()

# ------------------- Pydantic MODEL -------------------
class PatientPayload(BaseModel):
    Patient_ID: str
    Date: str
    Age: int | None = None
    # Add all other 40+ fields here exactly like your original payload

# ------------------- API ENDPOINTS -------------------
@app.post("/add")
def add_patient(payload: PatientPayload):
    try:
        df = fetch_csv_from_drive()
        # Append new row
        df = pd.concat([df, pd.DataFrame([payload.dict()])], ignore_index=True)
        upload_csv_to_drive(df)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(400, str(e))

@app.get("/predict/{patient_id}")
def predict(patient_id: str):
    try:
        df = fetch_csv_from_drive()
        patient = df[df.Patient_ID == patient_id].tail(1)
        if patient.empty:
            raise HTTPException(404, "Patient not found")
        X = preprocess(patient)
        prob = MODEL.predict_proba(X)[0, 1]
        pred = int(prob >= 0.5)
        return {"probability": prob, "prediction": pred}
    except Exception as e:
        raise HTTPException(400, str(e))
