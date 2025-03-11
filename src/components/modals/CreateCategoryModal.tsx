import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, NewCategory } from "@/types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewCategory) => void;
  isSuccess: boolean;
  parentCategories: Category[];
  initialData?: Category | null;
}

const CreateCategoryModal = ({
  isOpen,
  onClose,
  onCreate,
  isSuccess,
  parentCategories,
  initialData,
}: CreateCategoryModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewCategory>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      parentId: initialData?.parentId || "",
    },
  });

  useEffect(() => {
    if (isSuccess) {
      reset();
      onClose();
    }
  }, [isSuccess, onClose, reset]);

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("description", initialData.description || "");
      setValue("parentId", initialData.parentId || "");
    } else {
      reset();
    }
  }, [initialData, setValue, reset]);

  const handleParentChange = (value: string) => {
    setValue("parentId", value);
  };

  const parentId = watch("parentId");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Edit your category here. Click save when you're done."
              : "Add a new category to your store."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onCreate)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                {...register("name", { required: true })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">Name is required</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                {...register("description")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parentId" className="text-right">
                Parent Category
              </Label>
              <Select
                value={parentId || ""}
                onValueChange={handleParentChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {parentCategories
                    .filter((category) => category.id !== initialData?.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {initialData ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal; 