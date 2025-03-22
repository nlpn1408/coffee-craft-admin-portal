import { Download, PlusCircle, Upload } from "lucide-react";
import { Button } from "../ui/button";

interface DataTableProps {
  onCreate?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onDownloadTemplate?: () => void;
  createButtonLabel?: string;
  selectedRows?: string[];
  onDeleteSelected?: () => void;
  importRef?: React.RefObject<HTMLInputElement>;
  onImportChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TableToolbar = ({
  onCreate,
  onExport,
  onImport,
  onDownloadTemplate,
  createButtonLabel = "Create",
  selectedRows = [],
  onDeleteSelected,
  importRef,
  onImportChange,
}: DataTableProps) => {
  return (
    <div className="flex items-center justify-end">
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
};
