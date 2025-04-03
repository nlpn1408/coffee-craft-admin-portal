"use client";

import React, { useState } from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import ProductListTab from "./product-list/ProductListTab";
import { Product } from "@/types";
import GlobalTagManager from "./tag-management/GlobalTagManager";
import ProductDetailView from "./ProductDetailView";

// Define type for drawer state
type DrawerState = {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  product: Product | null;
};

const Products = () => {
  // State for managing the drawer
  const [drawerState, setDrawerState] = useState<DrawerState>({
    isOpen: false,
    mode: 'view', // Default mode doesn't matter much when closed
    product: null,
  });

  // Handlers to open the drawer in different modes
  const handleOpenCreateDrawer = () => {
    setDrawerState({ isOpen: true, mode: 'create', product: null });
  };

  const handleOpenEditDrawer = (product: Product) => {
    setDrawerState({ isOpen: true, mode: 'edit', product: product });
  };

  const handleOpenViewDrawer = (product: Product) => {
    setDrawerState({ isOpen: true, mode: 'view', product: product });
  };

  // Handler to close the detail view drawer
  const handleCloseDetailView = () => {
    setDrawerState({ isOpen: false, mode: 'view', product: null });
  };

  // Define Tabs items
  const items: TabsProps["items"] = [
    {
      key: "products",
      label: "Products",
      // Pass handlers for create, edit, and view to ProductListTab
      children: (
        <ProductListTab
          onCreate={handleOpenCreateDrawer}
          onEdit={handleOpenEditDrawer}
          onViewDetails={handleOpenViewDrawer}
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
    <div className="mx-auto pb-5 w-full">
      {/* Render top-level Tabs */}
      <Tabs
        defaultActiveKey="products"
        // activeKey={activeTabKey} // Optional: control active tab if needed
        // onChange={setActiveTabKey}
        items={items}
        className="mt-6"
      />

      {/* Detail View Drawer - controlled by drawerState */}
      {drawerState.isOpen && (
        <ProductDetailView
          product={drawerState.product}
          mode={drawerState.mode}
          onClose={handleCloseDetailView}
          onSaveSuccess={() => {
             handleCloseDetailView();
             // TODO: Add refetch logic for the product list if needed
             // refetchProducts(); // Assuming refetchProducts is available here or passed down
          }}
        />
      )}
    </div>
  );
};

export default Products;
