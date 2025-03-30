"use client";
import LoginForm from "@/components/LoginForm";
import { Layout, Card, Typography } from "antd";

const { Content } = Layout;
const { Title } = Typography;

export default function LoginPage() {
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Use Ant Design Card for the form container */}
        <Card style={{ width: "100%", maxWidth: 400 }}>
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            Admin Portal Login
          </Title>
          <LoginForm />
        </Card>
      </Content>
    </Layout>
  );
}
