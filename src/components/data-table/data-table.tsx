import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  PlusCircle,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  total?: number;
  searchField?: string;
  onRowSelectionChange?: (selectedRows: string[]) => void;
  getRowId?: (row: TData) => string;
  onCreate?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onDownloadTemplate?: () => void;
  createButtonLabel?: string;
  selectedRows?: string[];
  onDeleteSelected?: () => void;
  importRef?: React.RefObject<HTMLInputElement>;
  onImportChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSort?: (field: string, order: "asc" | "desc") => void;
  enableClientSort?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  total,
  searchField,
  onRowSelectionChange,
  getRowId,
  onCreate,
  onExport,
  onImport,
  onDownloadTemplate,
  createButtonLabel = "Create",
  selectedRows = [],
  onDeleteSelected,
  importRef,
  onImportChange,
  onSort,
  enableClientSort = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);

      if (!enableClientSort && onSort && newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        onSort(id, desc ? "desc" : "asc");
      }
    },
    getSortedRowModel: enableClientSort ? getSortedRowModel() : undefined,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getRowId: getRowId,
    enableSorting: true,
  });

  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = Object.keys(rowSelection).filter(
        (key) => rowSelection[key]
      );
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange]);

  const renderToolbar = () => (
    <div className="flex items-center justify-between">
      {searchField && (
        <div className="flex items-center">
          <Input
            placeholder="Search..."
            value={
              (table.getColumn(searchField)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchField)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        {onCreate && (
          <Button className="flex items-center" onClick={onCreate}>
            <PlusCircle className="w-5 h-5 mr-2" /> {createButtonLabel}
          </Button>
        )}
        {onExport && (
          <Button
            variant="secondary"
            className="flex items-center"
            onClick={onExport}
          >
            <Download className="w-5 h-5 mr-2" /> Export
          </Button>
        )}
        {onImport && (
          <>
            <Button
              variant="secondary"
              className="flex items-center"
              onClick={onImport}
            >
              <Upload className="w-5 h-5 mr-2" /> Import
            </Button>
            {importRef && onImportChange && (
              <input
                type="file"
                ref={importRef}
                onChange={onImportChange}
                className="hidden"
                accept=".xlsx"
              />
            )}
          </>
        )}
        {onDownloadTemplate && (
          <Button
            variant="secondary"
            className="flex items-center"
            onClick={onDownloadTemplate}
          >
            <Download className="w-5 h-5 mr-2" /> Template
          </Button>
        )}
        {selectedRows.length > 0 && onDeleteSelected && (
          <Button
            variant="destructive"
            className="flex items-center"
            onClick={onDeleteSelected}
          >
            Delete ({selectedRows.length})
          </Button>
        )}
      </div>
    </div>
  );

  const renderSortingIndicator = (isSorted: false | "asc" | "desc") => {
    if (!isSorted) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return isSorted === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      {renderToolbar()}

      <div>
        Total: <b>{total || 0}</b>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(isSortable && "cursor-pointer select-none")}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {isSortable &&
                          renderSortingIndicator(header.column.getIsSorted())}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
