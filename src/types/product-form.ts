import { ProductImage, Product, Tag, ProductVariant } from './index'; // Import necessary types

// Represents the data structure expected by the product form component
export interface ProductFormData {
  sku: string;
  name: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  categoryId: string;
  brandId?: string | null; // Can be null if no brand is selected
  stock: number;
  active: boolean;
  images: ProductImage[]; // Array to hold image information for the form
  tags?: Tag[]; // Optional: Array of associated tags
  variants?: ProductVariant[]; // Optional: Array of product variants
}

// Props for the ProductForm component
export interface ProductFormProps {
  initialData?: Product | null; // Existing product data for editing, or null for creation
  onSubmit: (formData: FormData) => void; // Function to handle form submission (using FormData for potential file uploads)
  onCancel: () => void; // Function to handle cancellation
}
