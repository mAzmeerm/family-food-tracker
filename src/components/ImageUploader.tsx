import React, { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { compressImage } from "../services/imageCompression";
import { uploadImageToCloudinary } from "../services/cloudinaryService";

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesUploaded,
  existingImages = [],
  maxImages = 6,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError(null);

    const remainingSlots = maxImages - images.length;

    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} photos allowed.`);
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          continue;
        }

        const compressedFile = await compressImage(file);

        const url = await uploadImageToCloudinary(compressedFile);

        uploadedUrls.push(url);
      }

      const updatedImages = [...images, ...uploadedUrls];

      setImages(updatedImages);
      onImagesUploaded(updatedImages);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);

    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
          Photos
        </label>

        <p className="text-xs text-gray-400 mb-3">
          Add up to {maxImages} photos of this restaurant.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
          >
            <img
              src={url}
              alt={`Restaurant photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              disabled={uploading}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/75 text-white flex items-center justify-center transition-colors disabled:opacity-50"
              aria-label={`Remove photo ${index + 1}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 text-gray-400 hover:text-orange-500 flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs font-medium">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};
