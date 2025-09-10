const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createObjectCsvWriter } = require("csv-writer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const app = express();
const PORT = 5000;
app.use(cors({
  origin: ["http://localhost:3000", https://ai-risk-prediction-chronic-patients.onrender.com],
  credentials: true
}));
app.use(bodyParser.json());

// ───────────────────────── CSV Setup with ALL headers
const DATA_DIR = path.join(__dirname, "data");
const CSV_PATH = path.join(DATA_DIR, "patients.csv");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Define ALL expected columns upfront 
//"PostprandialGlucose" "TotalCholesterol", "SerumCreatinine", "UACR", "ALT", "AST",
const ALL_COLUMNS = [
  "Patient_ID", "Date", "Age", "Gender", "Ethnicity", "FamilyHistoryDiabetes", "Height",
  "SystolicBP", "DiastolicBP", "HeartRate", "Weight", "BMI", "ExerciseMinutes", 
  "DietAdherence", "SleepHours", "SmokingStatus", "AlcoholStatus",
  "InsulinDosage", "OralHypoglycemic", "MedicationAdherence", "PrescriptionChange",
  "HbA1c", "FastingGlucose", "LDL", "HDL", "Triglycerides",
   "eGFR", 
  "Hypertension", "CardiovascularDisease", "CKD", "Neuropathy", "Retinopathy", "Hospitalization6M"
];

const csvWriter = createObjectCsvWriter({
  path: CSV_PATH,
  header: ALL_COLUMNS.map(col => ({ id: col, title: col })),
  append: fs.existsSync(CSV_PATH)
});

// Function to ensure ALL fields are present with default values
function ensureAllFields(data) {
  const completeData = {};
  
  // Initialize all fields with empty string
  ALL_COLUMNS.forEach(column => {
    completeData[column] = "";
  });
  
  // Override with actual data where available
  Object.keys(data).forEach(key => {
    if (ALL_COLUMNS.includes(key)) {
      completeData[key] = data[key] !== null && data[key] !== undefined ? data[key] : "";
    }
  });
  
  return completeData;
}

// ───────────────────────── DIABETES RISK PREDICTION
function predictDiabetesRisk(patientData) {
  // [Keep your existing prediction logic here - same as before]
  const age = parseFloat(patientData.Age) || 40;
  const bmi = parseFloat(patientData.BMI) || 25;
  const hba1c = parseFloat(patientData.HbA1c) || 5.5;
  const fastingGlucose = parseFloat(patientData.FastingGlucose) || 90;
  const systolicBP = parseFloat(patientData.SystolicBP) || 120;
  const diastolicBP = parseFloat(patientData.DiastolicBP) || 80;
  const serumCreatinine = parseFloat(patientData.SerumCreatinine) || 1.0;
  const triglycerides = parseFloat(patientData.Triglycerides) || 150;
  
  const familyHistory = (patientData.FamilyHistoryDiabetes === "Yes") ? 1 : 0;
  const hypertension = (patientData.Hypertension === "Yes") ? 1 : 0;
  const ethnicity = parseInt(patientData.Ethnicity) || 0;
  const smoking = (patientData.SmokingStatus === "Yes") ? 1 : 0;
  
  let riskScore = 0;
  
  if (fastingGlucose >= 126) riskScore += 0.45;
  else if (fastingGlucose >= 110) riskScore += 0.25;
  else if (fastingGlucose >= 100) riskScore += 0.12;
  
  if (hba1c >= 7.0) riskScore += 0.40;
  else if (hba1c >= 6.5) riskScore += 0.28;
  else if (hba1c >= 5.7) riskScore += 0.15;
  
  const dietAdherence = patientData.DietAdherence || "Moderate";
  if (dietAdherence === "Poor") riskScore += 0.08;
  else if (dietAdherence === "Moderate") riskScore += 0.04;
  
  const alcoholStatus = patientData.AlcoholStatus || "None";
  if (alcoholStatus === "Heavy") riskScore += 0.06;
  else if (alcoholStatus === "Moderate") riskScore += 0.03;
  
  if (triglycerides >= 200) riskScore += 0.06;
  else if (triglycerides >= 150) riskScore += 0.03;
  
  if (serumCreatinine >= 1.5) riskScore += 0.06;
  else if (serumCreatinine >= 1.2) riskScore += 0.03;
  
  if (bmi >= 35) riskScore += 0.08;
  else if (bmi >= 30) riskScore += 0.05;
  else if (bmi >= 25) riskScore += 0.02;
  
  if (age >= 65) riskScore += 0.08;
  else if (age >= 45) riskScore += 0.04;
  
  if (familyHistory) riskScore += 0.06;
  if (hypertension) riskScore += 0.05;
  if (systolicBP >= 140 || diastolicBP >= 90) riskScore += 0.04;
  if (smoking) riskScore += 0.03;
  
  if (ethnicity === 1) riskScore += 0.02;
  
  const exerciseMinutes = parseFloat(patientData.ExerciseMinutes) || 0;
  if (exerciseMinutes < 30) riskScore += 0.03;
  
  const sleepHours = parseFloat(patientData.SleepHours) || 7;
  if (sleepHours < 6 || sleepHours > 9) riskScore += 0.02;
  
  const probability = Math.min(Math.max(riskScore, 0.01), 0.99);
  
  function categorizeRisk(prob) {
    if (prob < 0.3) return 'Low Risk';
    else if (prob < 0.5) return 'Medium Risk';
    else if (prob < 0.8) return 'High Risk';
    else return 'Very High Risk';
  }
  
  return {
    probability: probability,
    prediction: probability >= 0.5 ? 1 : 0,
    risk_category: categorizeRisk(probability)
  };
}

// ───────────────────────── ROUTES
app.post("/add", async (req, res) => {
  try {
    console.log("✅ Received patient data for:", req.body.Patient_ID);
    console.log("📝 Raw fields received:", Object.keys(req.body).length);
    
    // Ensure ALL fields are present
    const completeData = ensureAllFields(req.body);
    
    console.log("🔍 Complete data fields:", Object.keys(completeData).length);
    console.log("📋 Sample data:", {
      Patient_ID: completeData.Patient_ID,
      Age: completeData.Age,
      Gender: completeData.Gender,
      BMI: completeData.BMI,
      HbA1c: completeData.HbA1c,
      FastingGlucose: completeData.FastingGlucose,
      SmokingStatus: completeData.SmokingStatus,
      AlcoholStatus: completeData.AlcoholStatus
    });
    
    await csvWriter.writeRecords([completeData]);
    console.log(`✅ Data written with ALL ${ALL_COLUMNS.length} columns`);
    res.json({ status: "saved", columns: ALL_COLUMNS.length });
    
  } catch (err) {
    console.error("❌ CSV write error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/cohort", (req, res) => {
  if (!fs.existsSync(CSV_PATH)) return res.json([]);
  const raw = fs.readFileSync(CSV_PATH, "utf8").trim();
  const rows = Papa.parse(raw, { header: true }).data;
  
  const map = {};
  rows.forEach(r => { 
    if (r.Patient_ID) {
      const prediction = predictDiabetesRisk(r);
      map[r.Patient_ID] = {
        ...r,
        probability: prediction.probability.toFixed(3),
        risk_category: prediction.risk_category
      };
    }
  });
  res.json(Object.values(map));
});

app.get("/patient/:id/timeline", (req, res) => {
  if (!fs.existsSync(CSV_PATH)) return res.json([]);
  const raw = fs.readFileSync(CSV_PATH, "utf8").trim();
  const rows = Papa.parse(raw, { header: true }).data;
  
  const timeline = rows
    .filter(r => r.Patient_ID === req.params.id)
    .sort((a,b) => new Date(a.Date) - new Date(b.Date))
    .map(r => ({
      Date: r.Date,
      FastingGlucose: parseFloat(r.FastingGlucose) || 0,
      HbA1c: parseFloat(r.HbA1c) || 0,
      SystolicBP: parseFloat(r.SystolicBP) || 0,
      BMI: parseFloat(r.BMI) || 0,
      RiskProbability: predictDiabetesRisk(r).probability
    }));
  
  res.json(timeline);
});

app.get("/explain/:id", (req, res) => {
  const explanations = [
    { feature: "Fasting Blood Sugar", value: 0.258011 },
    { feature: "HbA1c", value: 0.231817 },
    { feature: "Diet Quality", value: 0.042217 },
    { feature: "Quality of Life Score", value: 0.041506 },
    { feature: "Alcohol Consumption", value: 0.040558 },
    { feature: "Cholesterol/Triglycerides", value: 0.038956 },
    { feature: "BUN Levels", value: 0.038808 },
    { feature: "Serum Creatinine", value: 0.037903 },
    { feature: "BMI", value: 0.033236 },
    { feature: "Frequent Urination", value: 0.033080 }
  ];
  res.json(explanations);
});

const upload = multer({ dest: "uploads/" });
app.post("/predict-csv", upload.single("file"), (req, res) => {
  try {
    const raw = fs.readFileSync(req.file.path, "utf8");
    const rows = Papa.parse(raw, { header: true }).data;

    const predictions = rows.map(row => {
      const result = predictDiabetesRisk(row);
      return {
        ...row,
        DiabetesProb: result.probability.toFixed(3),
        Prediction: result.prediction,
        RiskCategory: result.risk_category
      };
    });

    console.log(`✅ Processed ${predictions.length} patients for bulk prediction`);
    res.json(predictions);
  } catch (e) {
    console.error("❌ Bulk prediction error:", e);
    res.status(500).json({ error: "prediction-failure" });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path);
  }
});

// Debug route
app.post("/debug-data", (req, res) => {
  console.log("=== COMPLETE FRONTEND PAYLOAD ===");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("=== FIELD COUNT ===", Object.keys(req.body).length);
  res.json({ 
    received: Object.keys(req.body),
    count: Object.keys(req.body).length,
    expectedColumns: ALL_COLUMNS.length
  });
});

app.listen(PORT, () => console.log(`🚀 Diabetes AI API running on :${PORT}`));
