import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PatientDataEntry from "./components/PatientDataEntry";
import CohortTable from "./components/CohortTable";
import PatientDashboard from "./components/PatientDashboard";
import BulkCsvUpload from "./components/BulkCsvUpload";

export default function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar />
        <Layout style={{ marginTop: "64px" }}> {/* Account for fixed navbar */}
          <Layout.Content style={{ 
            padding: 0, 
            backgroundColor: "#f0f2f5",
            minHeight: "calc(100vh - 64px)"
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-entry" element={<PatientDataEntry />} />
              <Route path="/cohort" element={<CohortTable />} />
              <Route path="/patient/:id" element={<PatientDashboard />} />
              <Route path="/bulk" element={<BulkCsvUpload />} />
            </Routes>
          </Layout.Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}
