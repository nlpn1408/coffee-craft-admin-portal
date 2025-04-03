"use client";

"use client";

"use client";

import React, { useState } from "react";
import { Blog } from "@/types";
import BlogList from "@/app/blogs/components/BlogList"; // Use absolute path alias
import BlogDetailDrawer from "@/app/blogs/components/BlogDetailDrawer"; // Use absolute path alias
import { useGetBlogsQuery } from "@/state/services/blogService";

const BlogsPage = () => {
  // State for managing the drawer (similar to products page)
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    blog: Blog | null;
  }>({
    isOpen: false,
    mode: 'view',
    blog: null,
  });

  // Refetch function from the query hook to refresh the list after save
  const { refetch: refetchBlogs } = useGetBlogsQuery({}); // Basic query call to get refetch

  // Handlers to open the drawer
  const handleOpenCreateDrawer = () => {
    setDrawerState({ isOpen: true, mode: 'create', blog: null });
  };

  const handleOpenEditDrawer = (blog: Blog) => {
    setDrawerState({ isOpen: true, mode: 'edit', blog: blog });
  };

  const handleOpenViewDrawer = (blog: Blog) => {
    setDrawerState({ isOpen: true, mode: 'view', blog: blog });
  };

  // Handler to close the drawer
  const handleCloseDrawer = () => {
    setDrawerState({ isOpen: false, mode: 'view', blog: null });
  };

  // Handler for successful save (create/update)
  const handleSaveSuccess = () => {
    handleCloseDrawer();
    refetchBlogs(); // Refetch the blog list
  };

  return (
    <div className="mx-auto pb-5 w-full">
      {/* Render the main blog list component */}
      <BlogList
        onCreate={handleOpenCreateDrawer}
        onEdit={handleOpenEditDrawer}
        onViewDetails={handleOpenViewDrawer}
      />

      {/* Conditionally render the Detail/Edit/Create Drawer */}
      {drawerState.isOpen && (
        <BlogDetailDrawer
          blog={drawerState.blog}
          mode={drawerState.mode}
          onClose={handleCloseDrawer}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default BlogsPage;
