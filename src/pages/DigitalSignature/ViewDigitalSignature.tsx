import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { DigitalSignature } from "../../models/DigitalSignature";
import { digitalSignatureService } from "../../services/digitalSignatureService";
import { userService } from "../../services/userService";
import GenericButton from "../../components/GenericButton";

const ViewDigitalSignature: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [signature, setSignature] = useState<DigitalSignature | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        // Obtener datos del usuario
        const user = await userService.getUserById(Number(userId));
        if (user) {
          setUserName(user.name || "");
          setUserEmail(user.email || "");
        }

        // Obtener firma digital
        const signatureData = await digitalSignatureService.getByUserId(Number(userId));
        console.log("📦 Signature data:", signatureData);
        setSignature(signatureData);

        // Construir URL de la imagen si existe
        if (signatureData?.photo) {
          const url = digitalSignatureService.buildImageUrl(signatureData.photo);
          setImageUrl(url);
          console.log("📸 Signature image URL:", url);
          console.log("🆔 Signature ID:", signatureData.id);
          console.log("👤 User ID from signature:", signatureData.user_id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleDelete = async () => {
    if (!signature?.id) return;

    Swal.fire({
      title: "Delete Digital Signature?",
      text: "Are you sure you want to delete this signature?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await digitalSignatureService.delete(signature.id!);
        if (success) {
          Swal.fire({
            title: "Deleted",
            text: "Digital signature deleted successfully",
            icon: "success",
            timer: 2000,
          });
          setSignature(null);
          setImageUrl(undefined);
        } else {
          Swal.fire({
            title: "Error",
            text: "Could not delete signature",
            icon: "error",
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando firma digital...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {userName} - Signature
            </h2>
            <GenericButton
              label="Back to Users"
              onClick={() => navigate("/users/list")}
              variant="secondary"
            />
          </div>

          {/* User Info */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">User ID:</span>
                <p className="text-base font-medium text-gray-900">#{signature?.user_id || userId}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="text-lg font-semibold text-gray-900">{userName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-base text-gray-900">{userEmail}</p>
              </div>
              {signature?.id && (
                <div>
                  <span className="text-sm text-gray-600">Signature ID:</span>
                  <p className="text-base font-medium text-gray-900">#{signature.id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Signature Display */}
          {signature && imageUrl ? (
            <div className="space-y-6">
              <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                <img
                  src={imageUrl}
                  alt="Digital Signature"
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: "400px" }}
                  onError={(e) => {
                    console.error("Error loading signature image:", imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="flex gap-3">
                <GenericButton
                  label="Update"
                  onClick={() => navigate(`/digital-signatures/update/${signature.id}`)}
                  variant="primary"
                />
                <GenericButton
                  label="Delete"
                  onClick={handleDelete}
                  variant="danger"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg mb-6">
                No digital signature found for this user.
              </p>
              <GenericButton
                label="Create Signature"
                onClick={() => navigate(`/digital-signatures/create/${userId}`)}
                variant="success"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewDigitalSignature;