import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { NewProduct, NewProductImage, Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormItem from "antd/es/form/FormItem";
import { GetProp, message, Upload, UploadProps } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

const formSchema = z.object({
  // file: z.
});

type ProductImageFormData = z.infer<typeof formSchema>;

type Props = {
  productImage?: NewProductImage;
  onSave: (productFormData: NewProductImage) => void;
  isLoading: boolean;
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

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

export const UploadImageForm = ({ onSave, isLoading, productImage }: Props) => {
  const form = useForm<ProductImageFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // useEffect(() => {
  //   if (!productImage) {
  //     return;
  //   }
  //   form.reset(productImage);
  // }, [form, productImage]);
  // const { control = null } = useFormContext();

  const onSubmit = (formDataJson: ProductImageFormData) => {
    // onSave(formDataJson);
  };
  const [imageUrl, setImageUrl] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
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
        // onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-gray-50 p-10 rounded-lg"
      >
        {true ? (
          <div className="space-y-4">
            <FormField
              // control={control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Upload Image</FormLabel> */}
                  <FormControl>
                    <Upload
                      action="https://api.cloudinary.com/v1_1/dkf6noze7/image/upload"
                      data={{ upload_preset: "coffee-craft" }}
                      className="avatar-uploader"
                      showUploadList={false}
                      onChange={handleChange}
                      beforeUpload={beforeUpload}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="avatar"
                          style={{ width: "100%" }}
                        />
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <div className="col-span-2"></div>
              <div className="col-span-2"></div>
              <div className="col-span-2"></div>
              <div className="col-span-2"></div>
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};
