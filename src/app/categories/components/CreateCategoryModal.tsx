"use client";

import Header from "@/components/Header";
import { Category, NewCategory } from "@/types";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: NewCategory) => void;
  isSuccess: boolean;
  parentCategories?: Category[];
  initialData?: Category | null;
};

const CreateCategoryModal = ({
  isOpen,
  onClose,
  onCreate,
  isSuccess,
  parentCategories = [],
  initialData,
}: CreateCategoryModalProps) => {
  const formDataInitialState: NewCategory = {
    name: "",
    description: null,
    parentId: null,
  };
  const [formData, setFormData] = useState<NewCategory>(formDataInitialState);

  useEffect(() => {
    if (isSuccess) {
      setFormData(formDataInitialState);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        parentId: initialData.parentId,
      });
    } else {
      setFormData(formDataInitialState);
    }
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "" ? null : value,
    });
  };

  const handleParentChange = (value: string) => {
    setFormData({
      ...formData,
      parentId: value === "none" ? null : value,
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
        <Header name={initialData ? "Edit Category" : "Create New Category"} />
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
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

          {parentCategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={handleParentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentCategories
                    .filter(category => !initialData || category.id !== initialData.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="submit">{initialData ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal;
