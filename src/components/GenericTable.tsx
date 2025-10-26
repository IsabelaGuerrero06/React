import React from 'react';
import { useUILibrary } from '../contexts/UILibraryContext';
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
  // 🔥 OBTENER LA LIBRERÍA ACTUAL DEL CONTEXTO
  const { currentLibrary } = useUILibrary();
  
  // ========== RENDERIZADO SEGÚN LIBRERÍA ==========
  
  if (currentLibrary === 'tailwind') {
    // 🔵 TAILWIND - Diseño minimalista, limpio, compacto
    return (
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500">
        {/* Header Tailwind */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 px-4 py-2.5 border-b border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">
            📊 Tabla de Datos
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-500 dark:bg-blue-700">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 dark:divide-blue-900">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((item, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors duration-150"
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100">
                        {item[col] ?? '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {actions.map((action) => (
                          <GenericButton
                            key={action.name}
                            label={action.label}
                            onClick={() => onAction(action.name, item)}
                            variant={action.variant || "secondary"}
                            size="sm"
                            
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                    💭 No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Tailwind */}
        <div className="bg-blue-50 dark:bg-blue-950 px-4 py-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Total: {data.length} registros
          </p>
        </div>
      </div>
    );
  }
  
  if (currentLibrary === 'material') {
    // 🟡 MATERIAL - Elevación, sombras fuertes, compacto
    return (
      <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl overflow-hidden">
        {/* Header Material con elevación */}
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 dark:from-yellow-600 dark:via-yellow-700 dark:to-amber-700 px-5 py-3 shadow-md">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-50 uppercase tracking-wide">
            ⚡ DATA TABLE
          </h3>
          <p className="text-xs text-gray-800 dark:text-gray-200 mt-0.5">
            Material Design
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-yellow-100 dark:bg-yellow-900 border-b-2 border-yellow-500">
                {columns.map((col) => (
                  <th key={col} className="px-5 py-2.5 text-left text-xs font-bold text-yellow-900 dark:text-yellow-100 uppercase">
                    {col}
                  </th>
                ))}
                <th className="px-5 py-2.5 text-left text-xs font-bold text-yellow-900 dark:text-yellow-100 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-950 transition-all duration-200"
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-5 py-2.5 text-xs text-gray-900 dark:text-gray-100 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                          {item[col] ?? '-'}
                        </div>
                      </td>
                    ))}
                    <td className="px-5 py-2.5">
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                          <GenericButton
                            key={action.name}
                            label={action.label}
                            onClick={() => onAction(action.name, item)}
                            variant={action.variant || "secondary"}
                            size="sm"
                          
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-10 text-center">
                    <div className="text-yellow-700 dark:text-yellow-400 font-bold text-sm">
                      📭 NO DATA FOUND
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Material con chip */}
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 px-5 py-2.5 flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 text-xs font-bold uppercase shadow-sm">
            📊 {data.length} Records
          </span>
          <span className="text-xs text-yellow-800 dark:text-yellow-300 font-semibold">
            Material UI
          </span>
        </div>
      </div>
    );
  }
  
  if (currentLibrary === 'bootstrap') {
    // 🟢 BOOTSTRAP - Clásico, estructurado, compacto
    return (
      <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border-4 border-green-500 dark:border-green-700">
        {/* Header Bootstrap clásico */}
        <div className="bg-green-600 dark:bg-green-800 px-4 py-2.5 border-b-4 border-green-800 dark:border-green-950">
          <h3 className="text-sm font-black text-white uppercase">
            📋 TABLA DE REGISTROS
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-200 dark:bg-green-900 border-b-2 border-green-600 dark:border-green-700">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-black text-green-900 dark:text-green-100 uppercase border-r border-green-400 dark:border-green-700 last:border-r-0">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-2 text-left text-xs font-black text-green-900 dark:text-green-100 uppercase">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-green-300 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950 ${
                      index % 2 === 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-white dark:bg-boxdark'
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100 font-semibold border-r border-green-200 dark:border-green-800 last:border-r-0">
                        {item[col] ?? '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {actions.map((action) => (
                          <GenericButton
                            key={action.name}
                            label={action.label}
                            onClick={() => onAction(action.name, item)}
                            variant={action.variant || "secondary"}
                            size="sm"
                            
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center border border-green-300 dark:border-green-700">
                    <div className="text-green-800 dark:text-green-400 font-black uppercase text-xs">
                      ⚠️ SIN DATOS
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Bootstrap con badge */}
        <div className="bg-green-100 dark:bg-green-900 px-4 py-2 border-t-2 border-green-500 dark:border-green-700 flex items-center justify-between">
          <span className="inline-block px-3 py-0.5 bg-green-600 dark:bg-green-700 text-white text-xs font-black uppercase rounded border-2 border-green-800 dark:border-green-900">
            Total: {data.length}
          </span>
          <span className="text-xs text-green-800 dark:text-green-300 font-bold uppercase">
            Bootstrap
          </span>
        </div>
      </div>
    );
  }
  
  // Fallback por si acaso
  return null;
};

export default GenericTable;