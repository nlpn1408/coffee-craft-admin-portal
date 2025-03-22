"use client";

import Header from "@/components/Header";
import { Category, NewBrand } from "@/types";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CreateBrandModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: NewBrand) => void;
  isSuccess: boolean;
  categories: Category[];
};

const CreateBrandModal = ({
  isOpen,
  onClose,
  onCreate,
  isSuccess,
  categories,
}: CreateBrandModalProps) => {
  const formDataInitialState: NewBrand = {
    name: "",
    description: null,
  };
  const [formData, setFormData] = useState<NewBrand>(formDataInitialState);

  useEffect(() => {
    if (isSuccess) {
      setFormData(formDataInitialState);
    }
  }, [isSuccess]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "" ? null : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Header name="Create New Brand" />
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
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

          <div className="flex justify-end space-x-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBrandModal; 