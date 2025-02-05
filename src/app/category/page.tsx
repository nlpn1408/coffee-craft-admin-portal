"use client";

import { useCreateCategoryMutation, useGetCategoriesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import CreateCategoryModal from "./CreateCategoryModal";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "name", headerName: "Name", width: 200 },
  {
    field: "description",
    headerName: "Description",
    width: 400,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 110,
    valueGetter: (value, row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

type CategoryFormData = {
  name: string;
  description: string;
};

const Category = () => {
  const { data: categories, isError, isLoading } = useGetCategoriesQuery();
  const [createCategory, status] = useCreateCategoryMutation();
  console.log("🚀 ~ Category ~ status:", status);

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !categories) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch categories
      </div>
    );
  }

  const handleCreateCategory = async (categoryData: CategoryFormData) => {
    await createCategory(categoryData);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center ">
        <Header name="Category" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create
          Category
        </button>
      </div>
      <DataGrid
        rows={categories}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />

      {/* MODAL */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCategory}
        isSuccess={status.isSuccess}
      />
    </div>
  );
};

export default Category;
