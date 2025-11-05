import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { digitalSignatureService } from "../../services/digitalSignatureService";
import GenericButton from "../../components/GenericButton";
import { Camera, Upload } from "lucide-react";

const CreateDigitalSignature: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: "Maximum file size is 5MB",
          icon: "error",
          timer: 2000,
        });
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          title: "Invalid File",
          text: "Please select an image file",
          icon: "error",
          timer: 2000,
        });
        return;
      }

      setSelectedFile(file);
      
      // Crear preview local
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Limpiar URL cuando el componente se desmonte
  React.useEffect(() => {
    return () => {
      if (previewUrl && selectedFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile || !userId) {
      Swal.fire({
        title: "No File Selected",
        text: "Please select a photo first",
        icon: "warning",
        timer: 2000,
      });
      return;
    }

    setUploading(true);

    try {
      const result = await digitalSignatureService.create(Number(userId), selectedFile);

      if (result) {
        await Swal.fire({
          title: "Success!",
          text: "Digital signature created successfully",
          icon: "success",
          timer: 2000,
        });
        navigate(`/digital-signatures/user/${userId}`);
      } else {
        Swal.fire({
          title: "Error",
          text: "Could not create digital signature",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error uploading signature:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while uploading",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Create Signature
              </h1>
              <p className="text-gray-600">Upload your digital signature</p>
            </div>
            <GenericButton
              label="Back"
              onClick={() => navigate(`/digital-signatures/user/${userId}`)}
              variant="secondary"
            />
          </div>

          <div className="space-y-8">
            {/* File Input Section */}
            <div className="flex flex-col items-center pb-8 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Photo: <span className="text-red-500">*</span>
              </label>

              {/* Preview or Placeholder */}
              <div className="w-full max-w-md">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 min-h-[300px] flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full h-auto"
                      style={{ maxHeight: "300px" }}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload size={60} strokeWidth={1} className="mx-auto mb-3" />
                      <p>No image selected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Input with Browse Button */}
              <div className="mt-6 w-full max-w-md">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg 
                             cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <GenericButton
                      label="Browse"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      variant="secondary"
                      size="sm"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-green-600">✓ {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-red-600 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <p className="mt-3 text-sm text-gray-500 text-center">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-4">
              <GenericButton
                label={uploading ? "Uploading..." : "Upload"}
                onClick={handleUpload}
                variant="success"
                disabled={!selectedFile || uploading}
                size="md"
              />
              <GenericButton
                label="Cancel"
                onClick={() => navigate(`/digital-signatures/user/${userId}`)}
                variant="secondary"
                disabled={uploading}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDigitalSignature;