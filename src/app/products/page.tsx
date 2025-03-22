"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTab from "./components/ProductTab";
import ProductImageTab from "./components/ProductImageTab";

const Products = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="mx-auto pb-5 w-full">
      {/* <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
      </div> */}

      <Tabs
        defaultValue="products"
        className="mt-6"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="productsImages">Product Images</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <ProductTab />
        </TabsContent>
        <TabsContent value="productsImages" className="mt-6">
          <ProductImageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
