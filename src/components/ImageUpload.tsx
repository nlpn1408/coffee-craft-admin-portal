import { Upload, message } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  multiple?: boolean;
}

const ImageUpload = ({ value = [], onChange, maxCount = 1, multiple = false }: ImageUploadProps) => {
  const fileList = value.map((url, index) => ({
    uid: `-${index}`,
    name: `image-${index}`,
    status: 'done' as const,
    url,
  }));

  const uploadProps: UploadProps = {
    listType: "picture-card",
    fileList,
    multiple,
    maxCount,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
      }
      return false;
    },
    onChange: (info) => {
      const newFileList = info.fileList.map(file => {
        if (file.originFileObj) {
          return URL.createObjectURL(file.originFileObj);
        }
        return file.url || '';
      });
      onChange?.(newFileList);
    },
    onPreview: async (file) => {
      if (file.url) {
        window.open(file.url);
      }
    },
  };

  return (
    <Upload {...uploadProps}>
      {fileList.length < maxCount && (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      )}
    </Upload>
  );
};

export default ImageUpload;
