import { ProductImage, Product } from './index'; // Import both from index.ts

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  brandId: string;
  stock: number;
  active: boolean;
  images: ProductImage[];
}

export interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}
