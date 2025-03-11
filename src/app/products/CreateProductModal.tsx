"use client";

import Header from "@/components/Header";
import { NewProduct, Product } from "@/types";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBrandsQuery, useGetCategoriesQuery } from "@/state/api";

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: NewProduct) => void;
  initialData?: Product | null;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
  initialData,
}: CreateProductModalProps) => {
  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();

  const [formData, setFormData] = useState<NewProduct>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    brandId: "",
    stock: 0,
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price,
        categoryId: initialData.categoryId,
        brandId: initialData.brandId,
        stock: initialData.stock,
        active: initialData.active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        brandId: "",
        stock: 0,
        active: true,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]:
        type === "number"
          ? parseFloat(value)
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Header name={initialData ? "Edit Product" : "Create New Product"} />
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              value={formData.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Description"
              onChange={handleChange}
              value={formData.description || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              name="price"
              placeholder="Price"
              onChange={handleChange}
              value={formData.price}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandId">Brand</Label>
            <Select
              value={formData.brandId}
              onValueChange={(value) =>
                setFormData({ ...formData, brandId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands?.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              name="stock"
              placeholder="Stock"
              onChange={handleChange}
              value={formData.stock}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              name="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked as boolean })
              }
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit">
              {initialData ? "Save changes" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal;
