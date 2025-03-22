import crypto from "crypto";

export const generateSHA1 = (data: string) => {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("hex");
};

export const generateSignature = (timestamp: number): string => {
  const params = {
    timestamp,
    // upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  const paramString = Object.entries(params)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha256")
    .update(paramString + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");
};

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.secure_url;
}

export const deleteFromCloudinary = async (asset_id: string) => {
  console.log("🚀 ~ deleteFromCloudinary ~ asset_id:", asset_id);
  const formData = new FormData();
  formData.append("asset_id", asset_id);
  formData.append("api_key", `${process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY}`);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/asset/destroy`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete image");
  }
};
