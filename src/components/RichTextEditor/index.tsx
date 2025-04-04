"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill styles

// Dynamically import ReactQuill to ensure it only runs on the client-side
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // Add other props as needed, e.g., modules, formats
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  // Basic modules configuration (you can customize this)
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [
        "link" /* 'image' - Add image button if needed, requires custom handler */,
      ],
      ["clean"],
    ],
  };

  // Basic formats allowed
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link" /* 'image' */,
  ];

  // Handle change event from ReactQuill
  // Note: ReactQuill's onChange provides (content, delta, source, editor)
  // We only need the content (HTML string) for the form value
  const handleChange = (content: string) => {
    // Prevent updating with the initial empty state '<p><br></p>' if desired
    if (onChange && content !== "<p><br></p>") {
      onChange(content);
    } else if (onChange && !value) {
      // Allow clearing the field
      onChange("");
    }
  };

  return (
    <ReactQuill
      theme="snow"
      value={value || ""} // Ensure value is not null/undefined
      onChange={handleChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      readOnly={disabled}
      // Add minHeight style for the editor container
      style={{ backgroundColor: disabled ? "#f5f5f5" : "white" }}
    />
  );
};

export default RichTextEditor;
