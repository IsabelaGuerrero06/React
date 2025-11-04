import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Device } from "../../models/Device";
import { deviceService } from "../../services/deviceService";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";

const ListDevice: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const data = await deviceService.getDevices();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action: string, item: Device) => {
    if (action === "view") {
      navigate(`/devices/${item.id}`);
    } else if (action === "edit") {
      navigate(`/devices/update/${item.id}`);
    } else if (action === "delete") {
      Swal.fire({
        title: "Delete Device?",
        text: "Are you sure you want to delete this device?",
        icon: "warning",
        showCancelButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deviceService.deleteDevice(item.id!);
          Swal.fire("Deleted!", "Device removed", "success");
          fetchData();
        }
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-semibold">Devices List</h2>
        <div className="flex gap-2">
          <GenericButton
            label="+ Add Device"
            onClick={() => navigate("/devices/create")}
            variant="success"
          />
          <GenericButton
            label="Back to Users"
            onClick={() => navigate("/users/list")}
            variant="secondary"
          />
        </div>
      </div>

      <GenericTable
        data={devices}
        columns={["id", "user_id", "name", "ip", "operating_system"]}
        actions={[
          { name: "view", label: "View", variant: "info" },
          { name: "edit", label: "Edit", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ListDevice;
