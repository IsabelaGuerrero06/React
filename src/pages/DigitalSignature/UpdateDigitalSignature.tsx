import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { digitalSignatureService } from "../../services/digitalSignatureService";
import GenericButton from "../../components/GenericButton";
import { Upload } from "lucide-react";

const UpdateDigitalSignature: React.FC = () => {
  const { id } = useParams(); // Este es el signatureId
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignature = async () => {
      if (!id) {
        console.error("❌ No signature ID provided");
        setLoading(false);
        return;
      }

      console.log("🔍 Fetching signature with ID:", id);

      try {
        const signature = await digitalSignatureService.getById(Number(id));
        console.log("📦 Signature data:", signature);

        if (signature) {
          setUserId(signature.user_id || null);
          console.log("👤 User ID from signature:", signature.user_id);

          if (signature.photo) {
            const url = digitalSignatureService.buildImageUrl(signature.photo);
            setCurrentSignatureUrl(url || null);
            setPreviewUrl(url || null);
            console.log("📸 Current signature URL:", url);
          }
        } else {
          console.warn("⚠️ No signature found");
          Swal.fire({
            title: "Error",
            text: "Signature not found",
            icon: "error",
            timer: 2000,
          }).then(() => navigate('/users/list'));
        }
      } catch (error) {
        console.error("❌ Error fetching signature:", error);
        Swal.fire({
          title: "Error",
          text: "Could not load signature",
          icon: "error",
        }).then(() => navigate('/users/list'));
      } finally {
        setLoading(false);
      }
    };

    fetchSignature();
  }, [id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    console.log("📁 File selected:", file);

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
      console.log("✅ File set in state:", file.name);
      
      // Crear preview local del nuevo archivo
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      console.log("🖼️ Preview URL created:", objectUrl);
    }
  };

  const handleRemovePhoto = () => {
    console.log("🗑️ Removing selected file");
    setSelectedFile(null);
    // Restaurar la foto original
    setPreviewUrl(currentSignatureUrl);
  };

  // Limpiar URL del objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (previewUrl && selectedFile && previewUrl !== currentSignatureUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile, currentSignatureUrl]);

  const handleUpdate = async () => {
    console.log("🔄 Update clicked");
    console.log("📋 State check:");
    console.log("  - selectedFile:", selectedFile);
    console.log("  - signatureId (id):", id);
    console.log("  - userId:", userId);

    if (!selectedFile) {
      console.error("❌ No file selected");
      Swal.fire({
        title: "No File Selected",
        text: "Please select a new photo",
        icon: "warning",
        timer: 2000,
      });
      return;
    }

    if (!id) {
      console.error("❌ No signature ID");
      Swal.fire({
        title: "Error",
        text: "Signature ID not found",
        icon: "error",
        timer: 2000,
      });
      return;
    }

    setUploading(true);
    console.log("⏳ Starting upload...");

    try {
      const result = await digitalSignatureService.update(Number(id), selectedFile);
      console.log("📤 Update result:", result);

      if (result) {
        console.log("✅ Update successful");
        await Swal.fire({
          title: "Success!",
          text: "Digital signature updated successfully",
          icon: "success",
          timer: 2000,
        });
        navigate(`/digital-signatures/user/${userId}`);
      } else {
        console.error("❌ Update returned null");
        Swal.fire({
          title: "Error",
          text: "Could not update digital signature",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error updating signature:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while updating",
        icon: "error",
      });
    } finally {
      setUploading(false);
      console.log("✅ Upload finished");
    }
  };

  const handleBack = () => {
    console.log("⬅️ Back clicked, userId:", userId);
    if (userId) {
      navigate(`/digital-signatures/user/${userId}`);
    } else {
      navigate('/users/list');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading signature...</p>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-red-600">Error: Signature ID not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Update Signature
              </h1>
              <p className="text-gray-600">Update your digital signature</p>
              {userId && (
                <p className="text-sm text-gray-500 mt-1">User ID: #{userId}</p>
              )}
            </div>
            <GenericButton
              label="Back"
              onClick={handleBack}
              variant="secondary"
            />
          </div>

          <div className="space-y-8">
            {/* Current Signature */}
            {currentSignatureUrl && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Signature:
                </p>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img
                    src={currentSignatureUrl}
                    alt="Current Signature"
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: "250px" }}
                    onError={(e) => {
                      console.error("Error loading current signature:", currentSignatureUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* File Input Section */}
            <div className="pb-8 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Photo: <span className="text-red-500">*</span>
              </label>

              {/* Preview Section */}
              <div className="w-full mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {selectedFile ? "New Signature Preview:" : "Current Preview:"}
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 min-h-[250px] flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full h-auto"
                      style={{ maxHeight: "250px" }}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload size={60} strokeWidth={1} className="mx-auto mb-3" />
                      <p>No image available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Input with Browse Button */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg 
                           cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
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

              <p className="mt-3 text-sm text-gray-500">
                JPG, PNG or GIF (max. 5MB)
              </p>
            </div>

            {/* Update Button */}
            <div className="flex gap-4">
              <GenericButton
                label={uploading ? "Updating..." : "Update"}
                onClick={handleUpdate}
                variant="success"
                disabled={!selectedFile || uploading}
                size="md"
              />
              <GenericButton
                label="Cancel"
                onClick={handleBack}
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

export default UpdateDigitalSignature;