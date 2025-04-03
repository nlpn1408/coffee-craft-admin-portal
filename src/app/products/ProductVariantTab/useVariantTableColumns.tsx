'use client';

import { TableProps } from 'antd'; // Import Ant Design TableProps
import { ProductVariant } from '@/types';
import { ActionColumn } from '@/components/TableActionRow/ActionColumn';
import { formatCurrency } from '@/utils/utils';

interface UseVariantTableColumnsProps {
    onEdit: (variant: ProductVariant) => void;
    onDelete: (variantId: string) => void;
    isViewMode?: boolean; // Add isViewMode prop
}

// Return type changed to TableProps<ProductVariant>['columns']
export const useVariantTableColumns = ({ onEdit, onDelete, isViewMode = false }: UseVariantTableColumnsProps): TableProps<ProductVariant>['columns'] => { // Destructure isViewMode
    return [
        {
            title: 'SKU', // Use 'title' instead of 'header'
            dataIndex: 'sku', // Use 'dataIndex' instead of 'accessorKey'
            key: 'sku', // Add 'key' for Ant Design
            render: (sku) => sku || 'N/A', // Use 'render' instead of 'cell'
        },
        {
            title: 'Variant Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => formatCurrency(Number(price)), // Pass value directly to render
        },
        {
            title: 'Discount Price',
            dataIndex: 'discountPrice',
            key: 'discountPrice',
            render: (discountPrice) => {
                return discountPrice ? formatCurrency(Number(discountPrice)) : '-';
            },
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Color',
            dataIndex: 'color',
            key: 'color',
            render: (color) => color || '-',
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
            render: (weight) => weight || '-',
        },
        {
            title: 'Material',
            dataIndex: 'material',
            key: 'material',
            render: (material) => material || '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, variant) => (
                <ActionColumn
                    onEdit={() => onEdit(variant)}
                    onDelete={() => onDelete(variant.id)}
                    // Disable actions in view mode
                    // Note: ActionColumn needs to accept and use isActionDisabled prop or similar
                    // For now, we assume ActionColumn handles disabling internally based on a prop
                    // Let's pass isViewMode to a hypothetical 'disabled' prop for ActionColumn
                    // We might need to modify ActionColumn later if it doesn't support this
                    isEditDisabled={isViewMode} // Hypothetical prop for edit button
                    isDeleteDisabled={isViewMode} // Hypothetical prop for delete button/popconfirm
                />
            ),
            // width: 150,
        },
    ];
};
