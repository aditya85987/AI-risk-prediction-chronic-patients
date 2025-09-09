import { Layout, Menu, Badge, Avatar } from "antd";
import { UserAddOutlined, TableOutlined, CloudUploadOutlined, HomeOutlined, BellOutlined, SettingOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: "/new-entry", icon: <UserAddOutlined />, label: <Link to="/new-entry">New Entry</Link> },
    { key: "/cohort", icon: <TableOutlined />, label: <Link to="/cohort">Cohort View</Link> },
    { key: "/bulk", icon: <CloudUploadOutlined />, label: <Link to="/bulk">Bulk Upload</Link> }
  ];

  return (
    <Layout.Header style={{
      background: "linear-gradient(90deg, #4f46e5 0%, #0ea5e9 100%)",
      display: "flex", 
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "fixed",
      width: "100%",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ 
          color: "#fff", 
          fontWeight: 700, 
          fontSize: "18px",
          marginRight: 40,
          display: "flex",
          alignItems: "center"
        }}>
          🩺 DiabRisk AI
        </div>
        
        <Menu 
          theme="dark" 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            backgroundColor: "transparent",
            border: "none",
            minWidth: "400px"
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Badge count={3}>
          <BellOutlined style={{ color: "#fff", fontSize: "18px" }} />
        </Badge>
        <SettingOutlined style={{ color: "#fff", fontSize: "18px" }} />
        <Avatar style={{ backgroundColor: "#fff", color: "#4f46e5" }}>Dr</Avatar>
      </div>
    </Layout.Header>
  );
}
