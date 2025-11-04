import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Device } from "../../models/Device";
import { deviceService } from "../../services/deviceService";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";

const ViewDevice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 👇 usamos "any" para aceptar también created_at / updated_at si existen
  const [device, setDevice] = useState<any | null>(null);

  useEffect(() => {
    const fetchDevice = async () => {
      if (!id) return;
      const data = await deviceService.getDeviceById(parseInt(id));
      if (!data) {
        Swal.fire({
          title: "Not Found",
          text: "The device could not be found.",
          icon: "error",
          timer: 2500,
        });
        navigate("/devices/list");
        return;
      }
      setDevice(data);
    };
    fetchDevice();
  }, [id, navigate]);

  if (!device) {
    return <div className="p-4 text-gray-600">Loading device...</div>;
  }

  const deviceData = [device];

  const handleAction = async (action: string, item: Device) => {
    if (action === "back") {
      navigate("/devices/list");
    } else if (action === "edit") {
      navigate(`/devices/update/${item.id}`);
    } else if (action === "delete") {
      Swal.fire({
        title: "Delete Device?",
        text: "Are you sure you want to delete this device?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await deviceService.deleteDevice(item.id!);
          if (success) {
            Swal.fire({
              title: "Deleted",
              text: "The device has been deleted successfully.",
              icon: "success",
              timer: 2500,
            });
            navigate("/devices/list");
          } else {
            Swal.fire({
              title: "Error",
              text: "The device could not be deleted.",
              icon: "error",
            });
          }
        }
      });
    }
  };

  // 👇 formato bonito para las fechas
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleString();
  };

  // 👇 mapeamos los campos incluyendo las fechas si existen
  const displayedData = deviceData.map((d: any) => ({
    id: d.id,
    user_id: d.user_id,
    name: d.name,
    ip: d.ip,
    operating_system: d.operating_system,
    created_at: formatDate(d.created_at),
    updated_at: formatDate(d.updated_at),
  }));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Device Details
        </h2>

        <GenericButton
          label="Back to List"
          onClick={() => handleAction("back", device)}
          variant="secondary"
        />
      </div>

      <GenericTable
        data={displayedData}
        columns={[
          "id",
          "user_id",
          "name",
          "ip",
          "operating_system",
          "created_at",
          "updated_at",
        ]}
        actions={[
          { name: "edit", label: "Edit", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ViewDevice;