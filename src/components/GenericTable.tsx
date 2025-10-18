import React from 'react';

interface Action {
  name: string;
  label: string;
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
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {(Array.isArray(data) ? data : []).map((item, index) => (
          <tr key={index}>
            {columns.map((col) => (
              <td key={col}>{item[col]}</td>
            ))}
            <td>
              {actions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => onAction(action.name, item)}
                >
                  {action.label}
                </button>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default GenericTable;
