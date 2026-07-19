import React, { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";

const ImageUploader = () => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFiles = (files) => {
    const validImages = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = validImages.map((file) => ({
      id: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Handle drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => fileInputRef.current.click();

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="lg:w-1/3 flex flex-col gap-3">
      <label className="text-textDark font-semibold">Insert Images</label>

      <div
        className="w-full min-h-56 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-6 cursor-pointer hover:bg-gray-100 transition"
        onClick={handleClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud className="mb-2 text-grayLight" size={30} />
        <p className="font-medium">Drag & drop or click to upload</p>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Preview Area */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-md overflow-hidden border border-border"
            >
              <img
                src={img.id}
                alt="uploaded"
                className="w-full h-24 object-cover"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
