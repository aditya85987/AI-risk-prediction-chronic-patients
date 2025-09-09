import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    Droplets,
    FlaskConical,
    HeartPulse,
    Stethoscope,
    Pill,
    Save,
    Calculator,
    Sparkles,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    User,
    Clock,
    Award,
    Settings,
    Copy
} from "lucide-react";
import { message } from "antd";
import api from "../api";          // path is from components/ folder



const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PatientDataEntry() {
    const [profile, setProfile] = useState({
        Patient_ID: generateId(),
        Date: new Date().toISOString().slice(0, 10),
        Age: "",
        Gender: "",
        Ethnicity: "",
        FamilyHistoryDiabetes: "No",
        Height: "",
    });

    const [daily, setDaily] = useState({
        SystolicBP: "",
        DiastolicBP: "",
        HeartRate: "",
        Weight: "",
        BMI: "",
        ExerciseMinutes: 0,
        DietAdherence: "Moderate",
        SleepHours: "",
        SmokingStatus: "No",
        AlcoholStatus: "None",
    });

    const [weekly, setWeekly] = useState({
        InsulinDosage: "",
        OralHypoglycemic: "No",
        MedicationAdherence: "Medium",
        PrescriptionChange: "No",
    });

    const [labs, setLabs] = useState({
        HbA1c: "",
        FastingGlucose: "",
        PostprandialGlucose: "",
        LDL: "",
        HDL: "",
        Triglycerides: "",
        TotalCholesterol: "",
        SerumCreatinine: "",
        eGFR: "",
        UACR: "",
        ALT: "",
        AST: "",
    });

    const [events, setEvents] = useState({
        Hypertension: false,
        CardiovascularDisease: false,
        CKD: false,
        Neuropathy: false,
        Retinopathy: false,
        Hospitalization6M: "None",
    });

    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        const h = num(profile.Height);
        const w = num(daily.Weight);
        if (h && w) {
            const meters = h / 100;
            const bmi = w / (meters * meters);
            setDaily((d) => ({ ...d, BMI: bmi ? bmi.toFixed(1) : "" }));
        } else {
            setDaily((d) => ({ ...d, BMI: "" }));
        }
    }, [profile.Height, daily.Weight]);

    const derived = useMemo(() => {
        const sbp = num(daily.SystolicBP) || 0;
        const dbp = num(daily.DiastolicBP) || 0;
        const hr = num(daily.HeartRate) || 0;
        const sleep = num(daily.SleepHours) || 0;
        const exercise = Number(daily.ExerciseMinutes || 0);
        const bmi = num(daily.BMI) || 0;
        const fasting = num(labs.FastingGlucose) || 0;
        const a1c = num(labs.HbA1c) || 0;

        const vitalsCompleteness = [
            daily.SystolicBP,
            daily.DiastolicBP,
            daily.HeartRate,
            daily.Weight,
            daily.BMI,
            daily.SleepHours,
        ].filter((v) => v !== "" && v !== undefined).length;

        const flags = {
            bpHigh: sbp >= 140 || dbp >= 90,
            hrHigh: hr >= 100,
            bmiHigh: bmi >= 30,
            glucoseHigh: fasting >= 126,
            a1cHigh: a1c >= 7,
            sleepLow: sleep < 6,
            exerciseLow: exercise < 30,
        };

        return { vitalsCompleteness, flags };
    }, [daily, labs]);

    const payload = useMemo(() => ({
        ...profile,
        ...daily,
        ...weekly,
        ...labs,
        Hypertension: events.Hypertension ? "Yes" : "No",
        CardiovascularDisease: events.CardiovascularDisease ? "Yes" : "No",
        CKD: events.CKD ? "Yes" : "No",
        Neuropathy: events.Neuropathy ? "Yes" : "No",
        Retinopathy: events.Retinopathy ? "Yes" : "No",
        Hospitalization6M: events.Hospitalization6M,
    }), [profile, daily, weekly, labs, events]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post("/add", payload);   // FastAPI endpoint
            message.success("Saved!");
            resetForm();
        } catch (e) {
            message.error("Error saving data");
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setProfile({
            Patient_ID: generateId(),
            Date: new Date().toISOString().slice(0, 10),
            Age: "",
            Gender: "",
            Ethnicity: "",
            FamilyHistoryDiabetes: "No",
            Height: "",
        });
        setDaily({
            SystolicBP: "",
            DiastolicBP: "",
            HeartRate: "",
            Weight: "",
            BMI: "",
            ExerciseMinutes: 0,
            DietAdherence: "Moderate",
            SleepHours: "",
            SmokingStatus: "No",
            AlcoholStatus: "None",
        });
        setWeekly({
            InsulinDosage: "",
            OralHypoglycemic: "No",
            MedicationAdherence: "Medium",
            PrescriptionChange: "No",
        });
        setLabs({
            HbA1c: "",
            FastingGlucose: "",
            PostprandialGlucose: "",
            LDL: "",
            HDL: "",
            Triglycerides: "",
            TotalCholesterol: "",
            SerumCreatinine: "",
            eGFR: "",
            UACR: "",
            ALT: "",
            AST: "",
        });
        setEvents({
            Hypertension: false,
            CardiovascularDisease: false,
            CKD: false,
            Neuropathy: false,
            Retinopathy: false,
            Hospitalization6M: "None",
        });
    };

    return (
        <div className="app-container">
            <style jsx>{`
        .app-container {
          display: flex;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 40px;
          height: 40px;
          background: #4f46e5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .header-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #4f46e5;
        }

        .header-subtitle {
          margin: 0;
          font-size: 14px;
          color: #64748b;
          margin-top: 2px;
        }

        .header-buttons {
          display: flex;
          gap: 12px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .reset-btn {
          background: #f1f5f9;
          color: #64748b;
        }

        .reset-btn:hover {
          background: #e2e8f0;
        }

        .save-btn {
          background: #4f46e5;
          color: white;
        }

        .save-btn:hover {
          background: #4338ca;
        }

        /* Sidebar */
        .sidebar {
          width: 320px;
          background: white;
          padding: 24px 0;
          margin-top: 80px;
          border-right: 1px solid #e2e8f0;
          height: calc(100vh - 80px);
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          margin: 0 16px 4px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
        }

        .nav-item:hover {
          background: #f8fafc;
        }

        .nav-item.active {
          background: #4f46e5;
          color: white;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          margin-top: 80px;
        }

        .form-area {
          flex: 1;
          padding: 24px;
          max-width: calc(100% - 320px);
        }

        .form-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .form-header {
          padding: 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .form-header-icon {
          width: 40px;
          height: 40px;
          background: #e0e7ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
        }

        .form-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .form-subtitle {
          margin: 2px 0 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .form-body {
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input, .form-select {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
          background: white;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-input.disabled {
          background: #f9fafb;
          color: #6b7280;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .copy-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          cursor: pointer;
        }

        .input-with-icon {
          position: relative;
        }

        /* Range Slider */
        .range-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .range-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          outline: none;
          appearance: none;
        }

        .range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }

        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #64748b;
        }

        .range-value {
          font-size: 14px;
          font-weight: 600;
          color: #4f46e5;
          text-align: center;
          margin-top: 4px;
        }

        /* Toggle Switch */
        .toggle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
        }

        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .toggle-switch {
          width: 44px;
          height: 24px;
          background: #e2e8f0;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }

        .toggle-switch.active {
          background: #4f46e5;
        }

        .toggle-knob {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.active .toggle-knob {
          transform: translateX(20px);
        }

        /* Patient Summary Sidebar */
        .summary-sidebar {
          width: 320px;
          background: white;
          border-left: 1px solid #e2e8f0;
          height: calc(100vh - 80px);
          overflow-y: auto;
        }

        .summary-card {
          padding: 24px;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .summary-icon {
          width: 20px;
          height: 20px;
          color: #10b981;
        }

        .summary-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-size: 14px;
          color: #64748b;
        }

        .summary-value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        /* Metric Cards */
        .metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 20px 0;
        }

        .metric-card {
          padding: 16px;
          border-radius: 12px;
          text-align: center;
        }

        .metric-card.bmi {
          background: #dbeafe;
        }

        .metric-card.exercise {
          background: #e0e7ff;
        }

        .metric-card.hba1c {
          background: #d1fae5;
        }

        .metric-card.glucose {
          background: #fef3c7;
        }

        .metric-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        /* Progress Bar */
        .progress-container {
          margin: 20px 0;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          transition: width 0.3s ease;
        }

        /* Risk Indicators */
        .risk-section {
          margin-top: 24px;
        }

        .risk-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .risk-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .risk-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 13px;
        }

        .risk-label {
          color: #64748b;
        }

        .risk-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }

        .risk-normal {
          color: #10b981;
        }

        .risk-high {
          color: #ef4444;
        }

        /* Save Button */
        .save-continue-btn {
          width: 100%;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }

        .save-continue-btn:hover {
          background: #4338ca;
        }

        .save-continue-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 1200px) {
          .summary-sidebar {
            display: none;
          }
          
          .form-area {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            position: fixed;
            z-index: 50;
          }
          
          .form-grid, .toggle-grid {
            grid-template-columns: 1fr;
          }
          
          .header {
            padding: 0 16px;
          }
          
          .form-area {
            padding: 16px;
          }
        }
      `}</style>

            {/* Header */}
            <div className="header">
                <div className="header-left">
                    <div className="logo">
                        <Stethoscope size={20} />
                    </div>
                    <div>
                        <h1 className="header-title">Patient Data Entry</h1>
                        <p className="header-subtitle">AI-powered diabetes risk assessment platform</p>
                    </div>
                </div>
                <div className="header-buttons">
                    <button className="header-btn reset-btn" onClick={resetForm}>
                        <Settings size={16} />
                        Reset
                    </button>
                    <button className="header-btn save-btn" onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Entry"}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
                <div className={`nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
                    <User className="nav-icon" />
                    Profile
                </div>
                <div className={`nav-item ${activeTab === "daily" ? "active" : ""}`} onClick={() => setActiveTab("daily")}>
                    <HeartPulse className="nav-icon" />
                    Daily Entry
                </div>
                <div className={`nav-item ${activeTab === "medications" ? "active" : ""}`} onClick={() => setActiveTab("medications")}>
                    <Pill className="nav-icon" />
                    Medications
                </div>
                <div className={`nav-item ${activeTab === "labs" ? "active" : ""}`} onClick={() => setActiveTab("labs")}>
                    <FlaskConical className="nav-icon" />
                    Lab Results
                </div>
                <div className={`nav-item ${activeTab === "complications" ? "active" : ""}`} onClick={() => setActiveTab("complications")}>
                    <AlertCircle className="nav-icon" />
                    Complications
                </div>
            </div>

            <div className="main-content">
                <div className="form-area">
                    {activeTab === "profile" && (
                        <div className="form-card">
                            <div className="form-header">
                                <div className="form-header-icon">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h2 className="form-title">Patient Profile</h2>
                                    <p className="form-subtitle">One-time entry • Auto-filled after first use</p>
                                </div>
                            </div>
                            <div className="form-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Patient ID</label>
                                        <div className="input-with-icon">
                                            <input
                                                className="form-input disabled"
                                                type="text"
                                                value={profile.Patient_ID}
                                                disabled
                                            />
                                            <Copy size={16} className="copy-icon" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date</label>
                                        <input
                                            className="form-input"
                                            type="date"
                                            value={profile.Date}
                                            onChange={(e) => setProfile({ ...profile, Date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Age (years)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={profile.Age}
                                            onChange={(e) => setProfile({ ...profile, Age: e.target.value })}
                                            placeholder="e.g. 45"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            className="form-select"
                                            value={profile.Gender}
                                            onChange={(e) => setProfile({ ...profile, Gender: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ethnicity</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            value={profile.Ethnicity}
                                            onChange={(e) => setProfile({ ...profile, Ethnicity: e.target.value })}
                                            placeholder="e.g. Hispanic, Asian, African American"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Family History of Diabetes</label>
                                        <select
                                            className="form-select"
                                            value={profile.FamilyHistoryDiabetes}
                                            onChange={(e) => setProfile({ ...profile, FamilyHistoryDiabetes: e.target.value })}
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Height (cm)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={profile.Height}
                                            onChange={(e) => setProfile({ ...profile, Height: e.target.value })}
                                            placeholder="e.g. 175"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "daily" && (
                        <div className="form-card">
                            <div className="form-header">
                                <div className="form-header-icon">
                                    <HeartPulse size={20} />
                                </div>
                                <div>
                                    <h2 className="form-title">Daily Entry</h2>
                                    <p className="form-subtitle">Takes less than 1 minute • Updated regularly</p>
                                </div>
                            </div>
                            <div className="form-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Systolic BP (mmHg)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={daily.SystolicBP}
                                            onChange={(e) => setDaily({ ...daily, SystolicBP: e.target.value })}
                                            placeholder="e.g. 120"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Diastolic BP (mmHg)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={daily.DiastolicBP}
                                            onChange={(e) => setDaily({ ...daily, DiastolicBP: e.target.value })}
                                            placeholder="e.g. 80"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Heart Rate (bpm)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={daily.HeartRate}
                                            onChange={(e) => setDaily({ ...daily, HeartRate: e.target.value })}
                                            placeholder="e.g. 72"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Weight (kg)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.1"
                                            value={daily.Weight}
                                            onChange={(e) => setDaily({ ...daily, Weight: e.target.value })}
                                            placeholder="e.g. 70.5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">BMI (auto-calculated)</label>
                                        <div className="input-with-icon">
                                            <input
                                                className="form-input disabled"
                                                type="text"
                                                value={daily.BMI}
                                                disabled
                                                placeholder="Will calculate automatically"
                                            />
                                            <Calculator size={16} className="copy-icon" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sleep Hours</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.5"
                                            value={daily.SleepHours}
                                            onChange={(e) => setDaily({ ...daily, SleepHours: e.target.value })}
                                            placeholder="e.g. 7.5"
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '24px' }}>
                                    <label className="form-label">Exercise Minutes</label>
                                    <div className="range-container">
                                        <input
                                            className="range-slider"
                                            type="range"
                                            min="0"
                                            max="120"
                                            value={daily.ExerciseMinutes}
                                            onChange={(e) => setDaily({ ...daily, ExerciseMinutes: Number(e.target.value) })}
                                        />
                                        <div className="range-labels">
                                            <span>0 min</span>
                                            <span className="range-value">{daily.ExerciseMinutes} min</span>
                                            <span>120 min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-grid" style={{ marginTop: '24px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Diet Adherence</label>
                                        <select
                                            className="form-select"
                                            value={daily.DietAdherence}
                                            onChange={(e) => setDaily({ ...daily, DietAdherence: e.target.value })}
                                        >
                                            <option value="Poor">Poor</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="Good">Good</option>
                                            <option value="Excellent">Excellent</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Smoking Status</label>
                                        <select
                                            className="form-select"
                                            value={daily.SmokingStatus}
                                            onChange={(e) => setDaily({ ...daily, SmokingStatus: e.target.value })}
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                            <option value="Former">Former</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Alcohol Status</label>
                                        <select
                                            className="form-select"
                                            value={daily.AlcoholStatus}
                                            onChange={(e) => setDaily({ ...daily, AlcoholStatus: e.target.value })}
                                        >
                                            <option value="None">None</option>
                                            <option value="Light">Light</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="Heavy">Heavy</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "medications" && (
                        <div className="form-card">
                            <div className="form-header">
                                <div className="form-header-icon">
                                    <Pill size={20} />
                                </div>
                                <div>
                                    <h2 className="form-title">Medications</h2>
                                    <p className="form-subtitle">Weekly updates • Adherence tracking</p>
                                </div>
                            </div>
                            <div className="form-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Insulin Dosage (units/day)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={weekly.InsulinDosage}
                                            onChange={(e) => setWeekly({ ...weekly, InsulinDosage: e.target.value })}
                                            placeholder="0 if not taking insulin"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Oral Hypoglycemic Medication</label>
                                        <select
                                            className="form-select"
                                            value={weekly.OralHypoglycemic}
                                            onChange={(e) => setWeekly({ ...weekly, OralHypoglycemic: e.target.value })}
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Medication Adherence</label>
                                        <select
                                            className="form-select"
                                            value={weekly.MedicationAdherence}
                                            onChange={(e) => setWeekly({ ...weekly, MedicationAdherence: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Recent Prescription Change</label>
                                        <select
                                            className="form-select"
                                            value={weekly.PrescriptionChange}
                                            onChange={(e) => setWeekly({ ...weekly, PrescriptionChange: e.target.value })}
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "labs" && (
                        <div className="form-card">
                            <div className="form-header">
                                <div className="form-header-icon">
                                    <FlaskConical size={20} />
                                </div>
                                <div>
                                    <h2 className="form-title">Lab Results</h2>
                                    <p className="form-subtitle">Monthly/Quarterly • Update as reports arrive</p>
                                </div>
                            </div>
                            <div className="form-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">HbA1c (%)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.1"
                                            value={labs.HbA1c}
                                            onChange={(e) => setLabs({ ...labs, HbA1c: e.target.value })}
                                            placeholder="6.5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fasting Glucose (mg/dL)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={labs.FastingGlucose}
                                            onChange={(e) => setLabs({ ...labs, FastingGlucose: e.target.value })}
                                            placeholder="100"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">LDL Cholesterol (mg/dL)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={labs.LDL}
                                            onChange={(e) => setLabs({ ...labs, LDL: e.target.value })}
                                            placeholder="100"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">HDL Cholesterol (mg/dL)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={labs.HDL}
                                            onChange={(e) => setLabs({ ...labs, HDL: e.target.value })}
                                            placeholder="50"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Triglycerides (mg/dL)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={labs.Triglycerides}
                                            onChange={(e) => setLabs({ ...labs, Triglycerides: e.target.value })}
                                            placeholder="150"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">eGFR (mL/min/1.73m²)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={labs.eGFR}
                                            onChange={(e) => setLabs({ ...labs, eGFR: e.target.value })}
                                            placeholder="90"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "complications" && (
                        <div className="form-card">
                            <div className="form-header">
                                <div className="form-header-icon">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h2 className="form-title">Complications & Events</h2>
                                    <p className="form-subtitle">Update when applicable • Risk factors</p>
                                </div>
                            </div>
                            <div className="form-body">
                                <div className="toggle-grid">
                                    <div className="toggle-item">
                                        <span className="toggle-label">Hypertension</span>
                                        <div
                                            className={`toggle-switch ${events.Hypertension ? 'active' : ''}`}
                                            onClick={() => setEvents({ ...events, Hypertension: !events.Hypertension })}
                                        >
                                            <div className="toggle-knob"></div>
                                        </div>
                                    </div>
                                    <div className="toggle-item">
                                        <span className="toggle-label">Cardiovascular Disease</span>
                                        <div
                                            className={`toggle-switch ${events.CardiovascularDisease ? 'active' : ''}`}
                                            onClick={() => setEvents({ ...events, CardiovascularDisease: !events.CardiovascularDisease })}
                                        >
                                            <div className="toggle-knob"></div>
                                        </div>
                                    </div>
                                    <div className="toggle-item">
                                        <span className="toggle-label">Chronic Kidney Disease</span>
                                        <div
                                            className={`toggle-switch ${events.CKD ? 'active' : ''}`}
                                            onClick={() => setEvents({ ...events, CKD: !events.CKD })}
                                        >
                                            <div className="toggle-knob"></div>
                                        </div>
                                    </div>
                                    <div className="toggle-item">
                                        <span className="toggle-label">Diabetic Neuropathy</span>
                                        <div
                                            className={`toggle-switch ${events.Neuropathy ? 'active' : ''}`}
                                            onClick={() => setEvents({ ...events, Neuropathy: !events.Neuropathy })}
                                        >
                                            <div className="toggle-knob"></div>
                                        </div>
                                    </div>
                                    <div className="toggle-item">
                                        <span className="toggle-label">Diabetic Retinopathy</span>
                                        <div
                                            className={`toggle-switch ${events.Retinopathy ? 'active' : ''}`}
                                            onClick={() => setEvents({ ...events, Retinopathy: !events.Retinopathy })}
                                        >
                                            <div className="toggle-knob"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '24px' }}>
                                    <label className="form-label">Hospitalizations (past 6 months)</label>
                                    <select
                                        className="form-select"
                                        value={events.Hospitalization6M}
                                        onChange={(e) => setEvents({ ...events, Hospitalization6M: e.target.value })}
                                    >
                                        <option value="None">None</option>
                                        <option value="One">One</option>
                                        <option value="Multiple">Multiple</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Patient Summary Sidebar */}
                <div className="summary-sidebar">
                    <div className="summary-card">
                        <div className="summary-header">
                            <TrendingUp className="summary-icon" />
                            <h3 className="summary-title">Patient Summary</h3>
                        </div>

                        <div className="summary-item">
                            <span className="summary-label">Patient ID</span>
                            <span className="summary-value">{profile.Patient_ID.substring(0, 8)}...</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Entry Date</span>
                            <span className="summary-value">{profile.Date.split('-').reverse().join('-')}</span>
                        </div>

                        <div className="metric-grid">
                            <div className="metric-card bmi">
                                <div className="metric-label">BMI</div>
                                <div className="metric-value">{daily.BMI || "—"}</div>
                            </div>
                            <div className="metric-card exercise">
                                <div className="metric-label">Exercise</div>
                                <div className="metric-value">{daily.ExerciseMinutes}m</div>
                            </div>
                            <div className="metric-card hba1c">
                                <div className="metric-label">HbA1c</div>
                                <div className="metric-value">{labs.HbA1c || "—"}</div>
                            </div>
                            <div className="metric-card glucose">
                                <div className="metric-label">Glucose</div>
                                <div className="metric-value">{labs.FastingGlucose || "—"}</div>
                            </div>
                        </div>

                        <div className="progress-container">
                            <div className="progress-header">
                                <span className="summary-label">Data Completeness</span>
                                <span className="summary-value">{derived.vitalsCompleteness}/6</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(derived.vitalsCompleteness / 6) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="risk-section">
                            <div className="risk-header">
                                <AlertCircle size={16} color="#f59e0b" />
                                <h4 className="risk-title">Risk Indicators</h4>
                            </div>

                            <div className="risk-item">
                                <span className="risk-label">Bp High</span>
                                <span className={`risk-status ${derived.flags.bpHigh ? 'risk-high' : 'risk-normal'}`}>
                                    {derived.flags.bpHigh ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                            <div className="risk-item">
                                <span className="risk-label">Hr High</span>
                                <span className={`risk-status ${derived.flags.hrHigh ? 'risk-high' : 'risk-normal'}`}>
                                    {derived.flags.hrHigh ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                            <div className="risk-item">
                                <span className="risk-label">Bmi High</span>
                                <span className={`risk-status ${derived.flags.bmiHigh ? 'risk-high' : 'risk-normal'}`}>
                                    {derived.flags.bmiHigh ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                            <div className="risk-item">
                                <span className="risk-label">Glucose High</span>
                                <span className={`risk-status ${derived.flags.glucoseHigh ? 'risk-high' : 'risk-normal'}`}>
                                    {derived.flags.glucoseHigh ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                            <div className="risk-item">
                                <span className="risk-label">A1c High</span>
                                <span className={`risk-status ${derived.flags.a1cHigh ? 'risk-high' : 'risk-normal'}`}>
                                    {derived.flags.a1cHigh ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                            <div className="risk-item">
                                <span className="risk-label">Sleep Low</span>
                                <span className={`risk-status ${derived.flags.sleepLow ? 'risk-high' : 'risk-normal'}`}>
                                    {derived.flags.sleepLow ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                            <div className="risk-item">
                                <span className="risk-label">Exercise Low</span>
                                <span className={`risk-status ${derived.flags.exerciseLow ? 'risk-high' : 'risk-normal'}`}>
                                    {derived.flags.exerciseLow ? '⚠ High' : '✓ Normal'}
                                </span>
                            </div>
                        </div>

                        <button
                            className="save-continue-btn"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : "Save & Continue"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
