"use client";

import { Upload, Modal } from "antd";
import type { UploadFile, UploadProps, RcFile } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import { generateSignature } from "@/lib/cloudinary";
import axios from "axios";

interface ImageUploadProps {
  onChange: (value: string | string[]) => void;
  value?: string | string[];
  disabled?: boolean;
  multiple?: boolean;
  maxImages?: number;
}

interface CustomRequestOptions {
  file: RcFile;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

export const ImageUpload = ({
  onChange,
  value = [],
  disabled,
  multiple = false,
  maxImages = multiple ? 5 : 1,
}: ImageUploadProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert string URLs to UploadFile objects
  const fileList = (Array.isArray(value) ? value : value ? [value] : []).map(
    (url, index) => ({
      uid: `-${index}`,
      name: url.split("/").pop() || "image",
      status: "done" as const,
      url: url,
    })
  );

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || "");
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.split("/").pop() || "Image");
  };

  const handleChange: UploadProps["onChange"] = useCallback(
    ({
      fileList: newFileList,
      file,
    }: {
      fileList: UploadFile[];
      file: UploadFile;
    }) => {
      // Only update when file is fully uploaded
      if (file.status === "done" && file.response) {
        const urls = newFileList
          .filter((f: UploadFile) => f.status === "done")
          .map((f: UploadFile) => f.url || f.response?.secure_url)
          .filter(Boolean);

        onChange(multiple ? urls : urls[0] || "");
      }
    },
    [multiple, onChange]
  );

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        "coffee-craft"
      );

      // formData.append(
      //   "api_key",
      //   process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
      // );

      // const timestamp = Math.round(new Date().getTime() / 1000);
      // formData.append("timestamp", String(timestamp));

      // const signature = generateSignature(timestamp);
      // formData.append("signature", signature);
      // formData.append(
      //   "upload_preset",
      //   process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      // );

      // const response = await fetch(
      //   `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      //   {
      //     method: "POST",
      //     body: formData,
      //   }
      // );

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      if (!response.data.secure_url) {
        throw response;
      }
      
      console.log("🚀 ~ customRequest ~ response.data:", response.data)
      onSuccess(response.data.secure_url);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest}
        multiple={multiple}
        disabled={disabled || loading}
        maxCount={maxImages}
        accept="image/*"
      >
        {fileList.length >= maxImages ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};
