"use client";

import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import BrandTab from "./components/BrandTab";
import CategoryTab from "./components/CategoryTab";

const CategoriesPage = () => {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="flex flex-col">
      <Header name="Categories & Brands" />
      <Tabs
        defaultValue="categories"
        className="mt-6"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="mt-6">
          <CategoryTab />
        </TabsContent>
        <TabsContent value="brands" className="mt-6">
          <BrandTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoriesPage;
