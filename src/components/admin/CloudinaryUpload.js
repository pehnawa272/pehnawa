"use client";

import React, { useState, useRef } from "react";
import SymbolIcon from "@/components/SymbolIcon";

export default function CloudinaryUpload({
  label,
  accept = "image/*",
  multiple = false,
  onUploadComplete,
  folder = "pehnawa/products",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError("");
    setIsUploading(true);
    setProgress(10);

    try {
      // Loop through selected files
      for (const file of files) {
        // 1. Get signature and signed upload parameters from our API
        const signResponse = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });

        if (!signResponse.ok) {
          // Show the server's detailed error (e.g. "Cloudinary not configured")
          const errBody = await signResponse.json().catch(() => ({}));
          const errMsg = errBody.error?.message || errBody.error || errBody.message || "Failed to get upload signature";
          throw new Error(errMsg);
        }

        const { data: signData } = await signResponse.json();
        const { signature, timestamp, apiKey, cloudName } = signData;

        // 2. Build FormData for Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        // Determine upload type (image or video)
        const resourceType = file.type.startsWith("video/") ? "video" : "image";
        setProgress(30);

        // 3. Upload directly to Cloudinary
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errData = await uploadResponse.json();
          throw new Error(errData.error?.message || "Cloudinary upload failed");
        }

        const uploadData = await uploadResponse.json();
        setProgress(90);

        // 4. Fire callback with results
        onUploadComplete({
          url: uploadData.secure_url,
          cloudinaryId: uploadData.public_id,
          name: file.name,
        });
      }

      setProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    } catch (err) {
      console.error("[Cloudinary Upload Error]", err);
      setError(err.message || "An error occurred during upload");
      setIsUploading(false);
      setProgress(0);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2 w-full">
      <span className="block font-montserrat text-[10px] text-white/40 tracking-wider uppercase font-semibold">
        {label}
      </span>

      <div
        onClick={!isUploading ? triggerFileInput : undefined}
        className={`relative group border border-dashed rounded-none p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[120px] ${
          isUploading
            ? "border-gold/30 bg-gold/2"
            : "border-white/10 hover:border-gold/60 bg-[#1F1F1F]/20 hover:bg-[#1F1F1F]/40"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-3 w-full max-w-[200px] mx-auto text-center">
            <div className="flex justify-between items-center text-[10px] font-montserrat text-gold tracking-wider font-bold">
              <span>UPLOADING MEDIA Dossier...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/5 h-0.5 rounded-none overflow-hidden">
              <div
                className="bg-gold h-full transition-all duration-300 rounded-none"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <SymbolIcon
              name={accept.includes("video") ? "movie" : "cloud_upload"}
              className="size-7 text-white/30 group-hover:text-gold/80 transition-colors mx-auto"
            />
            <div className="font-montserrat text-[11px] text-white/60 group-hover:text-white transition-colors">
              Drag & drop or <span className="text-gold font-bold underline">browse files</span>
            </div>
            <div className="font-montserrat text-[9px] text-white/30 uppercase tracking-widest">
              {accept.includes("video") ? "MP4 or WebM Video" : "JPG, PNG or WebP Images"}
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="block font-montserrat text-[10px] text-red-500 font-medium tracking-wide">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}
