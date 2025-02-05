"use client";

import { useGetBrandsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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

const Brand = () => {
  const { data: brands, isError, isLoading } = useGetBrandsQuery();

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !brands) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch categories
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Brand" />
      <DataGrid
        rows={brands}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Brand;
