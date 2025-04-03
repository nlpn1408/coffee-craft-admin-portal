'use client';

import { TableProps } from 'antd'; // Import Ant Design TableProps
import { ProductVariant } from '@/types';
import { ActionColumn } from '@/components/TableActionRow/ActionColumn';
import { formatCurrency } from '@/utils/utils';

interface UseVariantTableColumnsProps {
    onEdit: (variant: ProductVariant) => void;
    onDelete: (variantId: string) => void;
}

// Return type changed to TableProps<ProductVariant>['columns']
export const useVariantTableColumns = ({ onEdit, onDelete }: UseVariantTableColumnsProps): TableProps<ProductVariant>['columns'] => {
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
            key: 'actions', // Use 'key' instead of 'id'
            // The third argument in render is the record (the variant object)
            render: (_, variant) => (
                <ActionColumn
                    onEdit={() => onEdit(variant)}
                    onDelete={() => onDelete(variant.id)}
                    // Add other actions if needed
                />
            ),
            // Ant Design specific props if needed, e.g., width
            // width: 150,
        },
    ];
};
