import React, { useEffect, useState, useRef } from "react"; // Added useRef
import {
  Form,
  Input,
  Switch,
  InputNumber,
  Upload,
  Radio,
  Button,
  message,
  Modal,
  Space,
  Divider, // Added Divider
  InputRef, // Added InputRef
} from "antd";
import type { GetProp, UploadProps, UploadFile } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { NewProductImage, ProductImage } from "@/types";

// Define form data structure
interface ProductImageFormData {
  id?: string;
  imageUrl?: string;
  isThumbnail?: boolean;
  order?: number;
}

// Define component props
interface Props {
  productId: string;
  productImage?: ProductImage;
  onSave: (productFormData: NewProductImage) => void;
  isLoading: boolean;
  onCancel: () => void;
  isViewMode?: boolean;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// --- Upload Helper Functions ---
const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

const getPreviewBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
// --- End Upload Helper Functions ---

export const UploadImageForm: React.FC<Props> = ({
  productId,
  onSave,
  isLoading,
  productImage,
  onCancel,
  isViewMode = false,
}) => {
  const [form] = Form.useForm<ProductImageFormData>();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");

  useEffect(() => {
    if (productImage) {
      form.setFieldsValue({
        id: productImage.id,
        imageUrl: productImage.url,
        isThumbnail: productImage.isThumbnail || false,
        order: productImage.order || 0,
      });
      if (productImage.url) {
        setFileList([
          {
            uid: productImage.id || "-1",
            name: productImage.url.substring(productImage.url.lastIndexOf("/") + 1),
            status: "done",
            url: productImage.url,
            thumbUrl: productImage.url,
          },
        ]);
        if (!productImage.url.includes('cloudinary')) {
             setUploadMode('url');
        } else {
             setUploadMode('upload');
        }
      } else {
        setFileList([]);
        setUploadMode('upload');
      }
    } else {
      form.resetFields();
      setFileList([]);
      setUploadMode('upload');
    }
  }, [productImage, form]);

  const handleFinish = (values: ProductImageFormData) => {
    const currentImageUrl = form.getFieldValue('imageUrl');
    if (currentImageUrl) {
      const imageData: NewProductImage = {
        productId: productId,
        url: currentImageUrl,
        isThumbnail: values.isThumbnail || false,
        order: values.order || 0,
      };
      onSave(imageData);
    } else {
      message.error("Please upload an image or provide a valid URL.");
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getPreviewBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1));
  };

  const handleModeChange = (e: any) => {
    const newMode = e.target.value;
    setUploadMode(newMode);
    form.setFieldsValue({ imageUrl: undefined });
    form.validateFields(['imageUrl']);

    if (newMode === "url") {
      setFileList([]);
    } else {
       if (productImage?.url && productImage.url.includes('cloudinary')) {
         setFileList([
           {
             uid: productImage.id || "-1",
             name: productImage.url.substring(productImage.url.lastIndexOf("/") + 1),
             status: "done",
             url: productImage.url,
             thumbUrl: productImage.url,
           },
         ]);
         form.setFieldsValue({ imageUrl: productImage.url });
       } else {
         setFileList([]);
       }
    }
  };

  const handleChange: UploadProps["onChange"] = ({ file, fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));

    if (file.status === "uploading") {
      setUploadLoading(true);
      form.setFieldsValue({ imageUrl: undefined });
    } else if (file.status === "done") {
      setUploadLoading(false);
      const responseUrl = file.response?.secure_url;

      if (responseUrl) {
        form.setFieldsValue({ imageUrl: responseUrl });
        form.validateFields(['imageUrl']);
        setFileList((prevList) =>
          prevList.map((item) =>
            item.uid === file.uid ? { ...item, url: responseUrl, thumbUrl: responseUrl } : item
          )
        );
      } else {
        message.error("Upload finished but failed to get URL.");
        form.setFieldsValue({ imageUrl: undefined });
        setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
      }
    } else if (file.status === "error") {
      setUploadLoading(false);
      message.error(`${file.name} file upload failed.`);
      form.setFieldsValue({ imageUrl: undefined });
      setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
            isThumbnail: productImage?.isThumbnail || false,
            order: productImage?.order || 0,
        }}
      >
        <Form.Item label="Image Source">
          <Radio.Group onChange={handleModeChange} value={uploadMode} disabled={isViewMode}>
            <Radio value="upload">Upload File</Radio>
            <Radio value="url">Use Image URL</Radio>
          </Radio.Group>
        </Form.Item>

        {uploadMode === "upload" && (
          <Form.Item
            label="Upload Image"
            name="imageUrl"
            rules={[{ required: true, message: "Please upload an image." }]}
          >
            <Upload
              name="file"
              action={process.env.NEXT_PUBLIC_CLOUDINARY_URL}
              data={{ upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET }}
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              onPreview={handlePreview}
              onRemove={isViewMode ? undefined : () => {
                form.setFieldsValue({ imageUrl: undefined });
                setFileList([]);
                return true;
              }}
              disabled={isViewMode}
            >
              {fileList.length === 0 && !isViewMode && uploadButton}
            </Upload>
          </Form.Item>
        )}

        {uploadMode === "url" && (
          <Form.Item
            label="Image URL"
            name="imageUrl"
            rules={[
              { required: true, message: "Please enter an image URL." },
              { type: "url", message: "Please enter a valid URL." },
            ]}
          >
            <Input placeholder="https://example.com/image.png" disabled={isViewMode} />
          </Form.Item>
        )}

        <Form.Item name="isThumbnail" label="Is Thumbnail?" valuePropName="checked">
          <Switch disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          label="Display Order"
          name="order"
          rules={[
            { type: 'integer', message: 'Order must be an integer.' },
            { type: 'number', min: 0, message: 'Order must be non-negative.' }
          ]}
        >
          <InputNumber min={0} style={{ width: "100%" }} disabled={isViewMode} />
        </Form.Item>

        {!isViewMode && (
            <Form.Item>
               <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                 <Button onClick={onCancel} disabled={isLoading}>
                   Cancel
                 </Button>
                 <Button type="primary" htmlType="submit" loading={isLoading}>
                   {productImage ? "Update" : "Upload"} Image
                 </Button>
               </Space>
            </Form.Item>
        )}
      </Form>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};