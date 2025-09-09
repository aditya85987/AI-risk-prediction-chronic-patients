# backend/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd, datetime, joblib, os
from .utils import append_row, preprocess

app = FastAPI(title="Risk Prediction API")

MODEL = joblib.load("app/model.pkl")      # tuned RF or TFT
CSV_PATH = "app/data/patients.csv"

class PatientPayload(BaseModel):
    # all 40+ fields as in PatientDataEntry payload ...
    Patient_ID: str
    Date: str
    Age: int | None = None
    # etc.

@app.post("/add")
def add_patient(payload: PatientPayload):
    try:
        append_row(CSV_PATH, payload.dict())
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(400, str(e))

@app.get("/predict/{patient_id}")
def predict(patient_id: str):
    df = pd.read_csv(CSV_PATH)
    patient = df[df.Patient_ID == patient_id].tail(1)
    if patient.empty:
        raise HTTPException(404, "Patient not found")
    X = preprocess(patient)
    prob = MODEL.predict_proba(X)[0, 1]
    pred = int(prob >= 0.5)
    return {"probability": prob, "prediction": pred}
