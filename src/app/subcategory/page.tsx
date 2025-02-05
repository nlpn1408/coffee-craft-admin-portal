"use client";

import { useGetSubcategoriesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
} from "@mui/x-data-grid";
import { Pencil, Trash2 } from "lucide-react";

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
  {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 100,
    cellClassName: "actions",
    getActions: ({ id }) => {
      // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
      return [
        <GridActionsCellItem
          icon={<Pencil width={16} height={16} />}
          label="Edit"
          className="textPrimary"
          // onClick={handleEditClick(id)}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<Trash2 width={16} height={16} />}
          label="Delete"
          // onClick={handleDeleteClick(id)}
          color="inherit"
        />,
      ];
    },
  },
];

const Subcategory = () => {
  const {
    data: subcategories,
    isError,
    isLoading,
  } = useGetSubcategoriesQuery();

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !subcategories) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch subcategories
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Subcategory" />
      <DataGrid
        rows={subcategories}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Subcategory;
