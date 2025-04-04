'use client';

import React from 'react';
import { Product, Review } from '@/types';
import { List, Avatar, Rate, Empty, Spin } from 'antd';
import { format } from 'date-fns';

interface ProductReviewsTabProps {
  selectedProduct: Product | null;
  // We might need to fetch reviews separately if not included in product details
  // isLoading?: boolean;
}

const ProductReviewsTab: React.FC<ProductReviewsTabProps> = ({ selectedProduct }) => {
  // TODO: Fetch reviews if not part of the selectedProduct data
  // const { data: reviews, isLoading, isError } = useGetProductReviewsQuery(selectedProduct?.id, { skip: !selectedProduct });

  const reviews = selectedProduct?.reviews ?? []; // Assuming reviews are nested in product data for now
  const isLoading = false; // Placeholder

  if (isLoading) {
    return <div className="p-4 text-center"><Spin /></div>;
  }

  // TODO: Add error handling if fetching reviews separately

  if (!selectedProduct) {
    return <div className="p-4 text-center text-gray-500">No product selected.</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <div className="p-4"><Empty description="No reviews yet for this product." /></div>;
  }

  return (
    <div className="p-4">
      <List
        itemLayout="horizontal"
        dataSource={reviews}
        renderItem={(item: Review) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.user?.imgUrl}>{item.user?.name?.[0]}</Avatar>}
              title={
                <div>
                  <span>{item.user?.name ?? 'Anonymous'}</span>
                  <span className="text-gray-500 text-xs ml-2">
                    {item.createdAt ? format(new Date(item.createdAt), 'dd MMM yyyy') : ''}
                  </span>
                </div>
              }
              description={
                <>
                  <Rate disabled defaultValue={item.rating} style={{ fontSize: 14, marginBottom: 4 }}/>
                  <p>{item.comment}</p>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ProductReviewsTab;
