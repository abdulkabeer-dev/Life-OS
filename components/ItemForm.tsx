import * as React from 'react';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { ValidationError } from '../lib/validation';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  className?: string;
}

interface ItemFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose: () => void;
  initialData?: Record<string, any>;
  isLoading?: boolean;
  submitLabel?: string;
}

/**
 * Reusable form component for adding/editing items
 * Reduces form boilerplate across modules
 */
export const ItemForm: React.FC<ItemFormProps> = ({
  title,
  fields,
  onSubmit,
  onClose,
  initialData = {},
  isLoading = false,
  submitLabel = 'Save'
}) => {
  const [formData, setFormData] = React.useState<Record<string, any>>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate required fields
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'An error occurred. Please try again.' });
      }
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in border border-accent/50 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-2">{field.label}</label>
              
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg bg-bg-tertiary border ${
                    errors[field.name] ? 'border-red-500' : 'border-border'
                  } focus:border-accent outline-none transition-colors ${field.className}`}
                >
                  <option value="">{`Select ${field.label}`}</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full p-3 rounded-lg bg-bg-tertiary border ${
                    errors[field.name] ? 'border-red-500' : 'border-border'
                  } focus:border-accent outline-none transition-colors h-24 resize-none ${field.className}`}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full p-3 rounded-lg bg-bg-tertiary border ${
                    errors[field.name] ? 'border-red-500' : 'border-border'
                  } focus:border-accent outline-none transition-colors ${field.className}`}
                />
              )}
              
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={16} /> {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
