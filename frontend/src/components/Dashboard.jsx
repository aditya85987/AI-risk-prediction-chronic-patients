import React, { useState, useEffect } from "react";
import { 
  Card, Row, Col, Statistic, Progress, Table, Tag, Alert, 
  Button, Badge, Timeline, List, Avatar, Divider 
} from "antd";
import { 
  UserOutlined, AlertOutlined, RiseOutlined,
  HeartOutlined, SafetyOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  FallOutlined, MinusOutlined,
  BellOutlined, CloudUploadOutlined
} from "@ant-design/icons";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import api from "../api";


const COLORS = ['#ff4d4f', '#faad14', '#52c41a', '#1890ff'];

export default function Dashboard() {
  const [cohortData, setCohortData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    recentAlerts: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/cohort");
      const patients = response.data;
      setCohortData(patients);
      
      // Calculate statistics
      const total = patients.length;
      const high = patients.filter(p => parseFloat(p.probability) > 0.7).length;
      const medium = patients.filter(p => {
        const prob = parseFloat(p.probability);
        return prob >= 0.3 && prob <= 0.7;
      }).length;
      const low = patients.filter(p => parseFloat(p.probability) < 0.3).length;
      
      setStats({
        totalPatients: total,
        highRisk: high,
        mediumRisk: medium,
        lowRisk: low,
        recentAlerts: high + Math.floor(medium * 0.3)
      });
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Risk distribution data for charts
  const riskDistribution = [
    { name: 'High Risk', value: stats.highRisk, color: '#ff4d4f' },
    { name: 'Medium Risk', value: stats.mediumRisk, color: '#faad14' },
    { name: 'Low Risk', value: stats.lowRisk, color: '#52c41a' }
  ];

  // Critical alerts data
  const criticalAlerts = cohortData
    .filter(p => parseFloat(p.probability) > 0.8)
    .slice(0, 5)
    .map(patient => ({
      key: patient.Patient_ID,
      patient: patient.Patient_ID,
      risk: parseFloat(patient.probability),
      age: patient.Age,
      lastUpdate: patient.Date,
      status: 'critical'
    }));

  // Recent trend data (mock)
  const trendData = [
    { date: '2025-09-03', high: 12, medium: 25, low: 48 },
    { date: '2025-09-04', high: 14, medium: 23, low: 46 },
    { date: '2025-09-05', high: 13, medium: 27, low: 44 },
    { date: '2025-09-06', high: 16, medium: 24, low: 43 },
    { date: '2025-09-07', high: 18, medium: 26, low: 41 },
    { date: '2025-09-08', high: 15, medium: 28, low: 45 },
    { date: '2025-09-09', high: stats.highRisk, medium: stats.mediumRisk, low: stats.lowRisk }
  ];

  const alertColumns = [
    {
      title: 'Patient ID',
      dataIndex: 'patient',
      key: 'patient',
      render: (id) => <Badge status="error" text={id} />
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk) => (
        <Tag color="red">{(risk * 100).toFixed(1)}%</Tag>
      )
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" danger>
          Review Now
        </Button>
      )
    }
  ];

  return (
    <div style={{ 
      padding: "24px", 
      backgroundColor: "#f0f2f5",
      minHeight: "100vh",
      marginTop: "64px" // Account for fixed navbar
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0, color: "#1890ff" }}>
          🩺 Diabetes Risk Management Dashboard
        </h1>
        <p style={{ fontSize: "16px", color: "#666", margin: "8px 0 0 0" }}>
          AI-Powered Risk Assessment & Patient Monitoring System
        </p>
      </div>

      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Active Patients"
              value={stats.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="High-Risk Patients"
              value={stats.highRisk}
              prefix={<AlertOutlined />}
              suffix={`/ ${stats.totalPatients}`}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress 
              percent={(stats.highRisk / stats.totalPatients * 100) || 0} 
              strokeColor="#ff4d4f" 
              size="small" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Medium-Risk Patients"
              value={stats.mediumRisk}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress 
              percent={(stats.mediumRisk / stats.totalPatients * 100) || 0} 
              strokeColor="#faad14" 
              size="small" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Recent Alerts (24h)"
              value={stats.recentAlerts}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#ff7a45' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Real-time Status and Visualizations */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <Card title="📈 Risk Trend Analysis (7 Days)" extra={<Tag color="blue">Live Data</Tag>}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="high" stroke="#ff4d4f" name="High Risk" strokeWidth={3} />
                <Line type="monotone" dataKey="medium" stroke="#faad14" name="Medium Risk" strokeWidth={2} />
                <Line type="monotone" dataKey="low" stroke="#52c41a" name="Low Risk" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="🎯 Risk Distribution" style={{ height: "100%" }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Critical Alerts and Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card 
            title={
              <span>
                🚨 Critical Risk Alerts 
                <Badge count={criticalAlerts.length} style={{ marginLeft: 8 }} />
              </span>
            }
            extra={<Button type="primary">View All Alerts</Button>}
          >
            {criticalAlerts.length > 0 ? (
              <Table
                columns={alertColumns}
                dataSource={criticalAlerts}
                pagination={false}
                size="small"
              />
            ) : (
              <Alert
                message="No Critical Alerts"
                description="All patients are currently stable"
                type="success"
                icon={<CheckCircleOutlined />}
              />
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Card title="⚡ Quick Actions" style={{ marginBottom: 16 }}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Button type="primary" block icon={<UserOutlined />}>
                  New Patient
                </Button>
              </Col>
              <Col span={12}>
                <Button block icon={<CloudUploadOutlined />}>
                  Bulk Upload
                </Button>
              </Col>
              <Col span={12}>
                <Button block icon={<RiseOutlined />}>
                  Generate Report
                </Button>
              </Col>
              <Col span={12}>
                <Button block icon={<ClockCircleOutlined />}>
                  Schedule Review
                </Button>
              </Col>
            </Row>
          </Card>

          <Card title="🎯 AI Model Performance">
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={97}
                format={() => "97.26%"}
                strokeColor="#52c41a"
                style={{ marginBottom: 16 }}
              />
              <p style={{ margin: 0, fontWeight: 600 }}>ROC AUC Score</p>
              <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>
                Model accuracy for diabetes prediction
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
