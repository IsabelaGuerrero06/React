import React from 'react';
import GenericButton from "./GenericButton";

interface Action {
  name: string;
  label: string;
  variant?: "primary" | "secondary" | "danger" | "info" | "success";
}

interface GenericTableProps {
  data: Record<string, any>[];
  columns: string[];
  actions: Action[];
  onAction: (name: string, item: Record<string, any>) => void;
}

const GenericTable: React.FC<GenericTableProps> = ({
  data,
  columns,
  actions,
  onAction,
}) => {
  return (
    <table className="min-w-full border-collapse border border-gray-300 rounded-md shadow-md">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((col) => (
            <th key={col} className="border px-4 py-2 text-left font-semibold text-gray-700">
              {col.toUpperCase()}
            </th>
          ))}
          <th className="border px-4 py-2 text-left font-semibold text-gray-700">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(data) &&
          data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col} className="border px-4 py-2 text-gray-800">
                  {item[col]}
                </td>
              ))}
              <td className="border px-4 py-2 space-x-2">
                {actions.map((action) => (
                  <GenericButton
                    key={action.name}
                    label={action.label}
                    onClick={() => onAction(action.name, item)}
                    variant={action.variant || "secondary"}
                    size="sm"
                  />
                ))}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default GenericTable;
