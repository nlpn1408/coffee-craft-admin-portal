import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NewProduct, Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ProductFormFields } from "../ProductTab/ProductFormFields";

const formSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  price: z.coerce.number({
    required_error: " Price is required",
    invalid_type_error: "Price must be a number",
  }),
  categoryId: z.string({
    required_error: "Category is required",
  }),
  brandId: z.string({
    required_error: "Brand is required",
  }),
  stock: z.coerce.number({
    required_error: "Stock is required",
    invalid_type_error: "Stock must be a number",
  }),
  active: z.boolean(),
});

type ProductFormData = z.infer<typeof formSchema>;

type Props = {
  product?: Product;
  onSave: (productFormData: NewProduct) => void;
  isLoading: boolean;
};

export const ProductForm = ({ onSave, isLoading, product }: Props) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      categoryId: product?.categoryId || "",
      brandId: product?.brandId || "",
      stock: product?.stock || 0,
      active: product?.active || false,
    },
  });

  useEffect(() => {
    if (!product) {
      return;
    }
    form.reset(product);
  }, [form, product]);

  const onSubmit = (formDataJson: ProductFormData) => {
    onSave(formDataJson);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-gray-50 p-10 rounded-lg"
      >
        <ProductFormFields />
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};
