'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, Input, Button, message } from 'antd'; // Import Ant Design components
import { MailOutlined, LockOutlined } from '@ant-design/icons'; // Import icons
import { useRouter } from 'next/navigation'; // Keep for potential future use
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Schema remains the same
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const router = useRouter(); // Keep router
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [form] = Form.useForm(); // Use Ant Design's form instance hook

  const {
    control, // Use react-hook-form's control for Controller
    handleSubmit, // Use react-hook-form's handleSubmit
    formState: { errors }, // Get errors from react-hook-form
  } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Use react-hook-form's handleSubmit to wrap the logic
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    message.loading({ content: 'Logging in...', key: 'login' }); // Use Ant Design message
    console.log('Login form submitted with:', values);

    try {
      const user = await login(values.email, values.password);
      message.success({ content: `Welcome back, ${user.name}!`, key: 'login', duration: 2 });
      // AuthContext handles redirection
    } catch (error) {
      console.error('Login failed:', error);
      message.error({
        content: (error as Error).message || 'An unexpected error occurred.',
        key: 'login',
        duration: 3,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use Ant Design Form, connect it with react-hook-form's handleSubmit
    <Form form={form} onFinish={handleSubmit(onSubmit)} layout="vertical" requiredMark={false}>
      {/* Email Field */}
      <Form.Item
        label="Email"
        name="email" // name is used by Ant Design Form
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email?.message}
        hasFeedback // Show feedback icons
      >
        {/* Use Controller to connect react-hook-form with Ant Design Input */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field} // Spread field props (onChange, onBlur, value, ref)
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Enter your email"
              disabled={isLoading}
              size="large"
            />
          )}
        />
      </Form.Item>

      {/* Password Field */}
      <Form.Item
        label="Password"
        name="password" // name is used by Ant Design Form
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password?.message}
        hasFeedback
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input.Password
              {...field}
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Enter your password"
              disabled={isLoading}
              size="large"
            />
          )}
        />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full" loading={isLoading} size="large">
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </Form.Item>
    </Form>
  );
}
