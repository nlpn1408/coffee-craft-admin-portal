"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Tabs, Breadcrumb } from "antd"; // Import Breadcrumb
import { HomeOutlined } from "@ant-design/icons"; // Import Home icon
import type { TabsProps } from "antd";
import { Product } from "@/types";
import ProductCreateDrawer from "./ProductTab/ProductCreateDrawer";
import ProductListTab from "./ProductTab/ProductListTab";
import GlobalTagManager from "./TagTab/GlobalTagManager"; 

const Products = () => {
  // State for managing the drawer
  // State only for the create drawer
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Handlers to open the drawer in different modes
  const router = useRouter(); // Initialize router

  // Handler to open the create drawer
  const handleOpenCreateDrawer = () => {
    setIsCreateDrawerOpen(true);
  };

  // Handler to navigate to the detail page for edit/view
  // Accepts the Product object to match the expected prop type
  const handleNavigateToDetail = (product: Product) => {
    if (product?.id) { // Ensure product and id exist
        router.push(`/products/${product.id}`);
    } else {
        console.error("Cannot navigate: Product or Product ID is missing.");
        // Optionally show a user notification here
    }
  };

  // Handler to close the detail view drawer
  // Handler to close the create drawer
  const handleCloseCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
  };

  // Define Tabs items
  const items: TabsProps["items"] = [
    {
      key: "products",
      label: "Products",
      // Pass handlers for create and navigation to ProductListTab
      children: (
        <ProductListTab
          onCreate={handleOpenCreateDrawer}
          onEdit={handleNavigateToDetail} // Use navigation handler for edit action
          onViewDetails={handleNavigateToDetail} // Use navigation handler for view action
        />
      ),
    },
    {
      key: "tags",
      label: "Manage Tags", // Label for the global tag management tab
      children: <GlobalTagManager />, // Render the new component here
    },
  ];

  return (
    <div className="space-y-6 pb-5 w-full"> {/* Add space-y-6 */}
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: 'Products' }, // Current page
        ]}
      />
      {/* Render top-level Tabs */}
      <Tabs
        defaultActiveKey="products"
        // activeKey={activeTabKey} // Optional: control active tab if needed
        // onChange={setActiveTabKey}
        items={items}
      />

      {/* Detail View Drawer - controlled by drawerState */}
      {/* Create Drawer - only renders when isCreateDrawerOpen is true */}
      {isCreateDrawerOpen && (
        <ProductCreateDrawer
          isOpen={isCreateDrawerOpen} // Pass state directly
          onClose={handleCloseCreateDrawer}
          onSaveSuccess={() => {
             handleCloseCreateDrawer();
             // TODO: Add refetch logic for the product list if needed
             // This might need to be triggered from ProductListTab or via state management
          }}
        />
      )}
    </div>
  );
};

export default Products;
