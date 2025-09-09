// PatientDashboard.jsx
import { useParams } from "react-router-dom";
import { Card, Row, Col } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import React, { useEffect, useState } from "react";
import api from "../api";  // axios instance
export default function PatientDashboard() {
  const { id } = useParams();
  const [series, setSeries] = useState([]);
  const [explain, setExplain] = useState([]);



  useEffect(() => {
  api.get(`/patient/${id}/timeline`)
     .then(r => setSeries(r.data))
     .catch(() => setSeries([]));  // handle 404 gracefully
     
  api.get(`/explain/${id}`)
     .then(r => setExplain(r.data))
     .catch(() => setExplain([]));  // handle 404 gracefully
}, [id]);


  return (
    <>
      <h2>Patient {id}</h2>
      <Row gutter={24}>
        <Col span={14}>
          <Card title="Vitals & Labs Trend">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={series}>
                <XAxis dataKey="Date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="FastingGlucose" stroke="#ff7300" />
                <Line type="monotone" dataKey="HbA1c" stroke="#387908" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Top local drivers">
            {explain.map(e => (
              <p key={e.feature}>
                {e.feature}: <b>{(e.value*100).toFixed(1)}%</b>
              </p>
            ))}
          </Card>
        </Col>
      </Row>
    </>
  );
}
