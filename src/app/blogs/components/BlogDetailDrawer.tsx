'use client';

import React, { useEffect } from 'react';
import { Drawer, Button, Form, Spin, notification, Space } from 'antd';
import { Blog, NewBlog, UpdateBlog } from '@/types';
import { BlogFormFields } from './BlogFormFields'; // Import the form fields
import { useCreateBlogMutation, useUpdateBlogMutation } from '@/state/services/blogService';
import { handleApiError } from '@/lib/api-utils';
import moment from 'moment';


type DrawerMode = 'create' | 'edit' | 'view';

interface BlogDetailDrawerProps {
    blog: Blog | null; // Null when creating
    mode: DrawerMode;
    onClose: () => void;
    onSaveSuccess: () => void; // Callback after successful save
}

const BlogDetailDrawer: React.FC<BlogDetailDrawerProps> = ({
    blog,
    mode,
    onClose,
    onSaveSuccess,
}) => {
    const [form] = Form.useForm();
    const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
    const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
    const isLoading = isCreating || isUpdating;
    const isViewMode = mode === 'view';

    // Set form values when blog or mode changes
    useEffect(() => {
        if (mode === 'create') {
            form.resetFields();
            // Set default values for create mode if needed
            form.setFieldsValue({ active: true });
        } else if (blog) {
            form.setFieldsValue({
                ...blog,
                // Convert publicationDate string/Date from API/type to Moment object for DatePicker
                publicationDate: blog.publicationDate ? moment(blog.publicationDate) : null,
            });
        }
    }, [blog, mode, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Convert Moment object back to ISO string for API, handle null/undefined
            let publicationDateISO: string | null = null;
            if (values.publicationDate && moment.isMoment(values.publicationDate)) {
                 // Check if it's a valid moment object before converting
                 if (values.publicationDate.isValid()) {
                    publicationDateISO = (values.publicationDate as moment.Moment).toISOString();
                 } else {
                    // Handle invalid date selected in picker if necessary, maybe clear it?
                    console.warn("Invalid date selected in DatePicker");
                    // publicationDateISO = null; // Or keep it null
                 }
            }
            // If it's null/undefined or not a moment object, publicationDateISO remains null

            // Construct payload based on mode
            if (mode === 'edit' && blog) {
                 const payload: UpdateBlog = {
                    title: values.title,
                    content: values.content,
                    thumbnail: values.thumbnail,
                    // Ensure type is string | undefined
                    publicationDate: publicationDateISO ?? undefined,
                    active: values.active,
                 };
                await updateBlog({ id: blog.id, ...payload }).unwrap();
                notification.success({ message: "Success", description: "Blog post updated successfully." });
            } else if (mode === 'create') {
                 const payload: NewBlog = {
                    title: values.title,
                    content: values.content,
                    thumbnail: values.thumbnail,
                     // Ensure type is string | undefined
                    publicationDate: publicationDateISO ?? undefined,
                    active: values.active,
                    // userId is likely set on the backend based on logged-in user
                    userId: 'temp-user-id', // Placeholder if needed, REMOVE if backend handles it
                 };
                await createBlog(payload).unwrap();
                notification.success({ message: "Success", description: "Blog post created successfully." });
            }
            onSaveSuccess(); // Call success callback
        } catch (err: any) {
             if (err?.errorFields) {
                 console.error('Validation Failed:', err);
                 notification.error({ message: "Validation Error", description: "Please check the form fields." });
            } else {
                 console.error('API Error:', err);
                 handleApiError(err);
            }
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Create New Blog Post';
            case 'edit': return `Edit Blog Post: ${blog?.title ?? ''}`;
            case 'view': return `View Blog Post: ${blog?.title ?? ''}`;
            default: return 'Blog Post Details';
        }
    };

    return (
        <Drawer
            title={getTitle()}
            placement="right"
            onClose={onClose}
            open={true}
            width={720} // Adjust width as needed
            destroyOnClose
            extra={ // Footer buttons
                !isViewMode && (
                    <Space>
                        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="primary" onClick={handleSave} loading={isLoading}>
                            Save Post
                        </Button>
                    </Space>
                )
            }
        >
            <Spin spinning={isLoading && mode !== 'create'}>
                <Form form={form} layout="vertical" disabled={isViewMode}>
                    <BlogFormFields isViewMode={isViewMode} />
                </Form>
            </Spin>
        </Drawer>
    );
};

export default BlogDetailDrawer;
