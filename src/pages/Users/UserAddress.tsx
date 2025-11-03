// src/pages/Users/UserAddress.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addressService, Address } from "../../services/addressService";
import { userService } from "../../services/userService";
import { User } from "../../models/User";
import GenericForm, { FormField } from "../../components/GenericForm";
import GenericButton from "../../components/GenericButton";
import Breadcrumb from "../../components/Breadcrumb";
import MapPicker from "../../components/MapPicker";
import Swal from "sweetalert2";

const UserAddress: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [pickedLat, setPickedLat] = useState<number | undefined>(undefined);
  const [pickedLng, setPickedLng] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const userData = await userService.getUserById(Number(userId));
      setUser(userData);

      const addressData = await addressService.getAddressByUserId(Number(userId));
      setAddress(addressData);
      if (addressData) {
        setPickedLat(addressData.latitude ?? undefined);
        setPickedLng(addressData.longitude ?? undefined);
      }
      
      // Si no tiene dirección, activar modo edición automáticamente
      if (!addressData) {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar la información del usuario",
        icon: "error",
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formFields: FormField[] = [
    {
      name: "street",
      label: "Street",
      type: "text",
      required: true,
      placeholder: "Enter street name",
    },
    {
      name: "number",
      label: "Number",
      type: "text",
      required: true,
      placeholder: "Enter street number",
    },
    // latitude/longitude will be picked using the map below
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    if (!userId) return;

    try {
      const addressData: Omit<Address, 'id' | 'userId'> = {
        street: data.street,
        number: data.number,
        // use picked coordinates from the map if available
        latitude: typeof pickedLat === 'number' ? pickedLat : undefined,
        longitude: typeof pickedLng === 'number' ? pickedLng : undefined,
      };

      if (address?.id) {
        // Actualizar dirección existente
        const updated = await addressService.updateAddress(address.id, addressData);
        if (updated) {
          setAddress(updated);
          Swal.fire({
            title: "Success",
            text: "Address updated successfully",
            icon: "success",
            timer: 2000,
          });
          setIsEditing(false);
        }
      } else {
        // Crear nueva dirección
        const created = await addressService.createAddress(Number(userId), addressData);
        if (created) {
          setAddress(created);
          Swal.fire({
            title: "Success",
            text: "Address created successfully",
            icon: "success",
            timer: 2000,
          });
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      Swal.fire({
        title: "Error",
        text: "There was a problem saving the address",
        icon: "error",
        timer: 2000,
      });
    }
  };

  const handleDelete = async () => {
    if (!address?.id) return;

    Swal.fire({
      title: "Delete Address",
      text: "Are you sure you want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await addressService.deleteAddress(address.id!);
        if (success) {
          Swal.fire({
            title: "Deleted",
            text: "Address has been deleted",
            icon: "success",
            timer: 2000,
          });
          setAddress(null);
          setIsEditing(true);
        } else {
          Swal.fire({
            title: "Error",
            text: "Could not delete address",
            icon: "error",
            timer: 2000,
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb pageName="User Address" />
      
      {/* Header con información del usuario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Address Management
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                <strong>User:</strong> {user?.name}
              </span>
              <span>
                <strong>Email:</strong> {user?.email}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <GenericButton
              label="Back to Users"
              onClick={() => navigate("/users/list")}
              variant="secondary"
              size="md"
            />
            {address && !isEditing && (
              <>
                <GenericButton
                  label="Edit Address"
                  onClick={() => setIsEditing(true)}
                  variant="primary"
                  size="md"
                />
                <GenericButton
                  label="Delete Address"
                  onClick={handleDelete}
                  variant="danger"
                  size="md"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Formulario o vista de dirección */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {isEditing ? (
          <>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {address ? "Edit Address" : "Create New Address"}
            </h3>

            {/* Two-column layout: map on the left, form on the right (stack on small screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location (pick on map)</h4>
                <div className="mb-2 text-sm text-gray-600">
                  {typeof pickedLat === 'number' && typeof pickedLng === 'number' ? (
                    <span>Lat: {pickedLat.toFixed(6)}, Lng: {pickedLng.toFixed(6)}</span>
                  ) : (
                    <span className="text-gray-500">No coordinates selected yet.</span>
                  )}
                </div>
                <div className="rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <MapPicker
                    initialLat={address?.latitude}
                    initialLng={address?.longitude}
                    onSelect={(lat, lng) => {
                      setPickedLat(lat);
                      setPickedLng(lng);
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                  <GenericForm
                    fields={formFields}
                    initialData={address || {}}
                    onSubmit={handleSubmit}
                    submitLabel={address ? "Update Address" : "Create Address"}
                    cancelLabel="Cancel"
                    onCancel={() => {
                      if (address) {
                        setIsEditing(false);
                      } else {
                        navigate("/users/list");
                      }
                    }}
                    mode={address ? "edit" : "create"}
                  />
                </div>
              </div>
            </div>
          </>
        ) : address ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
              📍 Current Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Street
                </label>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {address.street}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Number
                </label>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {address.number}
                </p>
              </div>
              {address.latitude && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Latitude
                  </label>
                  <p className="text-lg text-gray-900 dark:text-gray-100">
                    {address.latitude}
                  </p>
                </div>
              )}
              {address.longitude && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Longitude
                  </label>
                  <p className="text-lg text-gray-900 dark:text-gray-100">
                    {address.longitude}
                  </p>
                </div>
              )}
            </div>

            {/* Mapa visual simple (opcional) */}
            {address.latitude && address.longitude && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🗺️ Location Coordinates
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lat: {address.latitude}, Lng: {address.longitude}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No address registered
            </p>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              This user doesn't have an address yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAddress;