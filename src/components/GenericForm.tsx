import React, { useState, useEffect } from "react";
import { useUILibrary } from "../contexts/UILibraryContext";
import GenericInput from "./GenericInput";
import GenericTextarea from "./GenericTextarea";
import GenericSelect from "./GenericSelect";
import GenericButton from "./GenericButton";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "date" | "tel" | "url" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[]; // Para select
  validation?: (value: any) => string | undefined; // Función de validación personalizada
}

interface GenericFormProps {
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  mode?: "create" | "edit";
}

const GenericForm: React.FC<GenericFormProps> = ({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  mode = "create",
}) => {
  const { currentLibrary } = useUILibrary();
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar formData cuando cambie initialData (útil para modo edición)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      // Validación de campo requerido
      if (field.required && (!value || value.toString().trim() === "")) {
        newErrors[field.name] = `${field.label} es requerido`;
        return;
      }

      // Validación de email
      if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = "Email inválido";
          return;
        }
      }

      // Validación personalizada
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  // ============================
  // 🔵 TAILWIND DESIGN
  // ============================
  if (currentLibrary === "tailwind") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <GenericTextarea
                      label={field.label}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      error={errors[field.name]}
                      required={field.required}
                    />
                  </div>
                );
              }

              if (field.type === "select" && field.options) {
                return (
                  <GenericSelect
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    options={field.options}
                    error={errors[field.name]}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                );
              }

              return (
                <GenericInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type as any}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  error={errors[field.name]}
                  required={field.required}
                />
              );
            })}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
            <GenericButton
              label={submitLabel}
              onClick={() => {}}
              variant="primary"
              size="md"
            />
            {onCancel && (
              <GenericButton
                label={cancelLabel}
                onClick={onCancel}
                variant="secondary"
                size="md"
              />
            )}
          </div>
        </div>
      </form>
    );
  }

  // ============================
  // 🟡 MATERIAL DESIGN
  // ============================
  if (currentLibrary === "material") {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((field) => {
              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <GenericTextarea
                      label={field.label}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      error={errors[field.name]}
                      required={field.required}
                    />
                  </div>
                );
              }

              if (field.type === "select" && field.options) {
                return (
                  <GenericSelect
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    options={field.options}
                    error={errors[field.name]}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                );
              }

              return (
                <GenericInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type as any}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  error={errors[field.name]}
                  required={field.required}
                />
              );
            })}
          </div>

          <div className="flex gap-4 mt-8 pt-5 border-t-2 border-yellow-200 dark:border-yellow-800">
            <GenericButton
              label={submitLabel}
              onClick={() => {}}
              variant="success"
              size="md"
            />
            {onCancel && (
              <GenericButton
                label={cancelLabel}
                onClick={onCancel}
                variant="secondary"
                size="md"
              />
            )}
          </div>
        </div>
      </form>
    );
  }

  // ============================
  // 🟢 BOOTSTRAP DESIGN
  // ============================
  if (currentLibrary === "bootstrap") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-boxdark rounded-md shadow-md p-5 border-4 border-green-500 dark:border-green-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <GenericTextarea
                      label={field.label}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      error={errors[field.name]}
                      required={field.required}
                    />
                  </div>
                );
              }

              if (field.type === "select" && field.options) {
                return (
                  <GenericSelect
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    options={field.options}
                    error={errors[field.name]}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                );
              }

              return (
                <GenericInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type as any}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  error={errors[field.name]}
                  required={field.required}
                />
              );
            })}
          </div>

          <div className="flex gap-2 mt-5 pt-4 border-t-2 border-green-300 dark:border-green-800">
            <GenericButton
              label={submitLabel}
              onClick={() => {}}
              variant="success"
              size="md"
            />
            {onCancel && (
              <GenericButton
                label={cancelLabel}
                onClick={onCancel}
                variant="secondary"
                size="md"
              />
            )}
          </div>
        </div>
      </form>
    );
  }

  // ============================
  // ⚪ Fallback genérico
  // ============================
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            if (field.type === "textarea") {
              return (
                <div key={field.name} className="md:col-span-2">
                  <GenericTextarea
                    label={field.label}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    error={errors[field.name]}
                    required={field.required}
                  />
                </div>
              );
            }

            if (field.type === "select" && field.options) {
              return (
                <GenericSelect
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  options={field.options}
                  error={errors[field.name]}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              );
            }

            return (
              <GenericInput
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type as any}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                error={errors[field.name]}
                required={field.required}
              />
            );
          })}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <GenericButton
            label={submitLabel}
            onClick={() => {}}
            variant="primary"
            size="md"
          />
          {onCancel && (
            <GenericButton
              label={cancelLabel}
              onClick={onCancel}
              variant="secondary"
              size="md"
            />
          )}
        </div>
      </div>
    </form>
  );
};

export default GenericForm;