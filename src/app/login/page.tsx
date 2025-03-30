'use client'; // Required because we are using Ant Design components which might use client-side features

import LoginForm from '@/components/LoginForm';
import { Layout, Card, Typography } from 'antd'; // Import Ant Design components

const { Content } = Layout;
const { Title } = Typography;

export default function LoginPage() {
  return (
    // Use Ant Design Layout for the page structure
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' /* Ant Design default background */ }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Use Ant Design Card for the form container */}
        <Card style={{ width: '100%', maxWidth: 400 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
            Admin Portal Login
          </Title>
          <LoginForm />
        </Card>
      </Content>
    </Layout>
  );
}
