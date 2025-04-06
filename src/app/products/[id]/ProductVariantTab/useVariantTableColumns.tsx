'use client';

import { TableProps } from 'antd';
import { ProductVariant } from '@/types';
import { ActionColumn } from '@/components/TableActionRow/ActionColumn'; // Adjust path if needed
import { formatCurrency } from '@/utils/utils';

interface UseVariantTableColumnsProps {
    onEdit: (variant: ProductVariant) => void;
    onDelete: (variantId: string) => void;
    isViewMode?: boolean;
}

export const useVariantTableColumns = ({ onEdit, onDelete, isViewMode = false }: UseVariantTableColumnsProps): TableProps<ProductVariant>['columns'] => {
    return [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (sku) => sku || 'N/A',
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
            render: (price) => formatCurrency(Number(price)),
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
            render: (_, variant: ProductVariant) => ( // Added explicit type for variant
                <ActionColumn
                    onEdit={() => onEdit(variant)}
                    onDelete={() => onDelete(variant.id)}
                    isEditDisabled={isViewMode}
                    isDeleteDisabled={isViewMode}
                />
            ),
        },
    ];
};