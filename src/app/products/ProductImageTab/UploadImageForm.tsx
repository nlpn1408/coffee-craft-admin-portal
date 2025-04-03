import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {  NewProductImage, ProductImage } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  GetProp,
  message,
  Upload,
  UploadProps,
  Radio,
  Input,
  Switch,
  InputNumber, // Added InputNumber
  Modal, // Added Modal for preview
} from "antd";
import type { UploadFile } from "antd"; // Added UploadFile type for preview
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

const formSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional(),
  isThumbnail: z.boolean().default(false).optional(),
  order: z.number().min(0, "Order must be non-negative").default(0).optional(), // Added validation
});

type ProductImageFormData = z.infer<typeof formSchema>;

type Props = {
  productId: string; // Added productId
  productImage?: ProductImage; // Changed type to ProductImage
  onSave: (productFormData: NewProductImage) => void;
  isLoading: boolean;
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

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

// Function to get base64 for preview modal
const getPreviewBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const UploadImageForm = ({
  productId, // Destructure productId
  onSave,
  isLoading,
  productImage,
}: Props) => {
  const form = useForm<ProductImageFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: productImage?.id || undefined,
      imageUrl: productImage?.url || undefined,
      isThumbnail: productImage?.isThumbnail || false,
      order: productImage?.order || 0, // Added order default value
    },
  });

  // State for upload component UI
  const [loading, setLoading] = useState(false);
  // const [localImageUrl, setLocalImageUrl] = useState<string>(); // No longer needed for internal preview

  // State for file list managed externally
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // State for preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Effect to set initial fileList for editing
  useEffect(() => {
    if (productImage?.url) {
      // Create an UploadFile object for the existing image
      setFileList([
        {
          uid: productImage.id || "-1", // Use existing ID or a placeholder
          name: productImage.url.substring(
            productImage.url.lastIndexOf("/") + 1
          ), // Extract filename
          status: "done",
          url: productImage.url,
          thumbUrl: productImage.url, // Use the same URL for thumbnail
        },
      ]);
    } else {
      setFileList([]); // Clear file list if no initial image
    }
  }, [productImage]); // Re-run when productImage changes

  const onSubmit = (formData: ProductImageFormData) => {
    // Ensure imageUrl has a value before saving
    if (formData.imageUrl) {
      const imageData: NewProductImage = {
        // id: formData.id || "",
        productId: productId,
        url: formData.imageUrl,
        isThumbnail: formData.isThumbnail || false,
        order: formData.order || 0, // Use order from form data
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
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  // State for mode selection
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");

  const handleModeChange = (e: any) => {
    const newMode = e.target.value;
    setUploadMode(newMode);
    form.clearErrors("imageUrl"); // Clear validation errors

    if (newMode === "url") {
      // Switched TO URL mode
      setFileList([]); // Clear the file list from upload mode
      // Clear the form value to force re-entry or re-upload
      form.setValue("imageUrl", undefined);
    } else {
      // Switched TO Upload mode
      // Clear the URL that might have been typed in URL mode
      form.setValue("imageUrl", undefined);
      // Re-initialize fileList and form value based on original productImage
      if (productImage?.url) {
        setFileList([
          {
            uid: productImage.id || "-1",
            name: productImage.url.substring(
              productImage.url.lastIndexOf("/") + 1
            ),
            status: "done",
            url: productImage.url,
            thumbUrl: productImage.url,
          },
        ]);
        // Also restore the imageUrl in the form if it came from the initial productImage
        form.setValue("imageUrl", productImage.url);
      } else {
        // No initial image, ensure fileList is empty
        setFileList([]);
      }
    }
  };

  const handleChange: UploadProps["onChange"] = ({
    file,
    fileList: newFileList,
  }) => {
    // Always update the file list state
    // Limit to 1 file for this avatar-style uploader
    setFileList(newFileList.slice(-1));

    if (file.status === "uploading") {
      setLoading(true);
      form.setValue("imageUrl", undefined); // Clear any previous URL value
    } else if (file.status === "done") {
      setLoading(false);
      // Get URL from Cloudinary response
      const responseUrl = file.response?.secure_url;
      const id = file.response?.public_id; // Get the public ID from the response
      if (responseUrl && id) {
        form.setValue("imageUrl", responseUrl);
        form.clearErrors("imageUrl");
        form.setValue("id", id);

        // Update the file object in the list with the final URL for preview
        setFileList((prevList) =>
          prevList.map((item) =>
            item.uid === file.uid
              ? { ...item, url: responseUrl, thumbUrl: responseUrl }
              : item
          )
        );
      } else {
        message.error(
          "Upload finished but failed to get URL. Please try again."
        );
        form.setValue("imageUrl", undefined);
        // Remove the failed file from the list
        setFileList((prevList) =>
          prevList.filter((item) => item.uid !== file.uid)
        );
      }
    } else if (file.status === "error") {
      setLoading(false);
      message.error(`${file.name} file upload failed.`);
      form.setValue("imageUrl", undefined);
      // Remove the failed file from the list
      setFileList((prevList) =>
        prevList.filter((item) => item.uid !== file.uid)
      );
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-gray-50 p-6 md:p-10 rounded-lg"
      >
        {/* Mode Selector */}
        <FormItem>
          <FormLabel>Image Source</FormLabel>
          <FormControl className="ml-2">
            <Radio.Group onChange={handleModeChange} value={uploadMode}>
              <Radio value="upload">Upload File</Radio>
              <Radio value="url">Use Image URL</Radio>
            </Radio.Group>
          </FormControl>
        </FormItem>

        {/* Conditional Fields */}
        {uploadMode === "upload" && (
          <FormField
            control={form.control}
            name="imageUrl" // Use imageUrl, but the UI is the Upload component
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <Upload
                    name="file" // Important: This should match the expected field name for Cloudinary
                    action={process.env.NEXT_PUBLIC_CLOUDINARY_URL}
                    data={{ upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET }}
                    listType="picture-card"
                    fileList={fileList} // Pass fileList state
                    className="avatar-uploader" // Keep or adjust class as needed
                    // showUploadList={true} // Default is true for picture-card, explicitly set if needed
                    beforeUpload={beforeUpload}
                    onChange={handleChange} // Use the updated handleChange
                    onPreview={handlePreview} // Added preview handler
                    onRemove={() => {
                      // Handle file removal
                      form.setValue("imageUrl", undefined);
                      form.setValue("id", undefined);
                      setFileList([]);
                      return true;
                    }}
                  >
                    {/* Show upload button only if fileList is empty */}
                    {fileList.length === 0 && uploadButton}
                  </Upload>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {uploadMode === "url" && (
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.png"
                    {...field}
                    value={field.value ?? ""} // Handle undefined value for Input
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* isThumbnail Checkbox */}
        <FormField
          control={form.control}
          name="isThumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Is Thumbnail </FormLabel>
              <FormControl>
                <div>
                  <Switch {...field} className="bg-white" id="active" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order InputNumber */}
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  {...field}
                  value={field.value ?? 0} // Handle undefined
                  onChange={(value) => field.onChange(value ?? 0)} // Ensure value is number
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          {/* Consider adding a Cancel button */}
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {" "}
            {/* Disable if form is invalid */}
            {isLoading ? "Saving..." : "Submit"}
          </Button>
        </div>
      </form>
      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </Form>
  );
};
