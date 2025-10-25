import React, { useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import GenericTable from "../components/GenericTable";

interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
}

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([
    { id: 1, name: "create_user", description: "Create new users", module: "Users" },
    { id: 2, name: "edit_user", description: "Edit existing users", module: "Users" },
    { id: 3, name: "delete_user", description: "Delete users", module: "Users" },
    { id: 4, name: "view_reports", description: "View system reports", module: "Reports" },
    { id: 5, name: "manage_roles", description: "Manage user roles", module: "Roles" },
  ]);

  const handleAction = (action: string, item: Permission) => {
    if (action === "edit") {
      console.log("Edit permission:", item);
    } else if (action === "delete") {
      console.log("Delete permission:", item);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Permissions" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 flex justify-between items-center">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Permissions Management
          </h4>
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
            onClick={() => console.log("Create new permission")}
          >
            Add Permission
          </button>
        </div>

        <GenericTable
          data={permissions}
          columns={["id", "name", "description", "module"]}
          actions={[
            { name: "edit", label: "Edit" },
            { name: "delete", label: "Delete" },
          ]}
          onAction={handleAction}
        />
      </div>
    </>
  );
};

export default Permissions;