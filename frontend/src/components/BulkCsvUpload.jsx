import { Upload, Button, message, Table, Card, Tag } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import api from "../api";
import Papa from "papaparse";

export default function BulkCsvUpload() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadProps = {
    accept: ".csv",
    beforeUpload: async file => {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);
      
      try {
        const { data } = await api.post("/predict-csv", form);
        setRows(data);
        message.success(`✅ Processed ${data.length} patients`);
      } catch (error) {
        message.error("❌ Upload failed: " + error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
      return false;
    }
  };

  const columns = [
    { title: "Patient ID", dataIndex: "Patient_ID", width: 120 },
    { title: "Age", dataIndex: "Age", width: 80 },
    { title: "BMI", dataIndex: "BMI", width: 80 },
    { title: "HbA1c", dataIndex: "HbA1c", width: 80 },
    { 
      title: "Risk Probability", 
      dataIndex: "DiabetesProb",
      width: 130,
      render: prob => `${(parseFloat(prob) * 100).toFixed(1)}%`
    },
    { 
      title: "Prediction", 
      dataIndex: "Prediction",
      width: 100,
      render: pred => (
        <Tag color={pred === 1 ? "red" : "green"}>
          {pred === 1 ? "Diabetes" : "No Diabetes"}
        </Tag>
      )
    },
    {
      title: "Risk Category",
      dataIndex: "RiskCategory",
      render: risk => {
        const color = risk === 'Low Risk' ? 'green' :
                     risk === 'Medium Risk' ? 'orange' :
                     risk === 'High Risk' ? 'red' : 'purple';
        return <Tag color={color}>{risk}</Tag>;
      }
    }
  ];

  const downloadCSV = () => {
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diabetes_predictions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card 
        title="🩺 AI Diabetes Risk Prediction" 
        extra={
          rows.length > 0 && (
            <Button icon={<DownloadOutlined />} onClick={downloadCSV}>
              Download Results
            </Button>
          )
        }
      >
        <p>
          Upload a CSV file with patient data to get diabetes risk predictions using our 
          trained Random Forest model (97.26% ROC AUC).
        </p>
        
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            loading={loading}
            size="large"
            type="primary"
          >
            {loading ? "Processing..." : "Upload Patient CSV"}
          </Button>
        </Upload>

        {rows.length > 0 && (
          <Table 
            style={{ marginTop: 24 }}
            columns={columns}
            dataSource={rows}
            rowKey="Patient_ID"
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3}>
                    <strong>Summary</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <strong>High Risk: {rows.filter(r => r.RiskCategory === 'High Risk' || r.RiskCategory === 'Very High Risk').length}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <strong>Diabetes Cases: {rows.filter(r => r.Prediction === 1).length}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Card>
    </div>
  );
}
