import { Table, Tag, Button, Card, Statistic, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { EyeOutlined, AlertOutlined } from "@ant-design/icons";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function CohortTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/cohort").then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { 
      title: "Patient ID", 
      dataIndex: "Patient_ID",
      sorter: (a, b) => a.Patient_ID.localeCompare(b.Patient_ID)
    },
    { 
      title: "Age", 
      dataIndex: "Age",
      sorter: (a, b) => parseInt(a.Age) - parseInt(b.Age)
    },
    {
      title: "BMI",
      dataIndex: "BMI",
      render: (bmi) => bmi ? parseFloat(bmi).toFixed(1) : "N/A"
    },
    {
      title: "HbA1c",
      dataIndex: "HbA1c",
      render: (hba1c) => hba1c ? `${parseFloat(hba1c).toFixed(1)}%` : "N/A"
    },
    {
      title: "Risk Score",
      dataIndex: "probability",
      render: (p) => {
        const prob = parseFloat(p);
        let color = "green";
        if (prob > 0.7) color = "red";
        else if (prob > 0.3) color = "orange";
        
        return (
          <Tag color={color}>
            {(prob * 100).toFixed(1)}%
          </Tag>
        );
      },
      sorter: (a, b) => parseFloat(a.probability) - parseFloat(b.probability),
    },
    {
      title: "Risk Category",
      dataIndex: "risk_category",
      render: (category) => {
        const colorMap = {
          "Low Risk": "green",
          "Medium Risk": "orange", 
          "High Risk": "red",
          "Very High Risk": "purple"
        };
        return <Tag color={colorMap[category] || "blue"}>{category}</Tag>;
      }
    },
    {
      title: "Last Updated",
      dataIndex: "Date",
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => nav(`/patient/${record.Patient_ID}`)}
        >
          View Details
        </Button>
      )
    }
  ];

  // Calculate summary stats
  const totalPatients = data.length;
  const highRisk = data.filter(p => parseFloat(p.probability) > 0.7).length;
  const mediumRisk = data.filter(p => {
    const prob = parseFloat(p.probability);
    return prob >= 0.3 && prob <= 0.7;
  }).length;

  return (
    <div style={{ padding: "24px", marginTop: "64px" }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Patients"
              value={totalPatients}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="High Risk"
              value={highRisk}
              suffix={`(${totalPatients ? ((highRisk/totalPatients)*100).toFixed(1) : 0}%)`}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Medium Risk"
              value={mediumRisk}
              suffix={`(${totalPatients ? ((mediumRisk/totalPatients)*100).toFixed(1) : 0}%)`}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Patient Table */}
      <Card title="📋 Patient Cohort Overview" extra={`${totalPatients} patients`}>
        <Table 
          rowKey="Patient_ID" 
          columns={columns} 
          dataSource={data}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} patients`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
