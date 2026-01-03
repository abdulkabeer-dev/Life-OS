/**
 * EDIT FUNCTIONALITY TEMPLATE
 * Copy this pattern to add edit/update features to any module
 * 
 * Example: Applying to Career Module
 */

import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { JobApplication } from '../types';
import { Edit2, Trash2, MoreVertical, X, Save, Plus } from 'lucide-react';

export const EditableCareersExample: React.FC = () => {
  const { data, updateApplicationStatus, deleteApplication } = useLifeOS();
  
  // ============ STATE MANAGEMENT ============
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  // Form fields (customize per module)
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    appliedDate: '',
    salary: '',
    status: 'applied' as const,
  });

  const applications = data.career.applications;

  // ============ HELPER FUNCTIONS ============

  /**
   * Step 1: Load item into form for editing
   */
  const startEditing = (app: JobApplication) => {
    setFormData({
      company: app.company,
      position: app.position,
      appliedDate: app.appliedDate,
      salary: String(app.salary || ''),
      status: app.status,
    });
    setEditingId(app.id);
    setShowForm(true);
    setMenuOpen(null);
  };

  /**
   * Step 2: Save or Update
   */
  const handleSave = () => {
    if (!formData.company || !formData.position) {
      alert('Please fill in required fields');
      return;
    }

    if (editingId) {
      // UPDATE EXISTING
      const existingApp = applications.find(a => a.id === editingId);
      if (existingApp) {
        updateApplicationStatus(editingId, formData.status);
        // If more fields need updating, ensure context has update function
      }
    } else {
      // CREATE NEW
      // Use context's addApplication function
      // const { addApplication } = useLifeOS();
      // addApplication(formData);
    }

    resetForm();
  };

  /**
   * Step 3: Reset form
   */
  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      appliedDate: '',
      salary: '',
      status: 'applied',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ============ RENDER ============

  return (
    <div className="space-y-4">
      {/* Form Toggle */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-accent px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Plus size={18} /> New Application
      </button>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card rounded-xl p-6 border border-accent/50">
          <h3 className="font-bold mb-4">
            {editingId ? 'Edit Application' : 'New Application'}
          </h3>

          <input
            type="text"
            placeholder="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full p-3 rounded-lg bg-bg-tertiary border border-border mb-3"
          />

          <input
            type="text"
            placeholder="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full p-3 rounded-lg bg-bg-tertiary border border-border mb-3"
          />

          <input
            type="date"
            value={formData.appliedDate}
            onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
            className="w-full p-3 rounded-lg bg-bg-tertiary border border-border mb-3"
          />

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
            className="w-full p-3 rounded-lg bg-bg-tertiary border border-border mb-4"
          >
            <option value="applied">Applied</option>
            <option value="interviewed">Interviewed</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg hover:bg-bg-tertiary flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-accent flex items-center gap-2"
            >
              <Save size={16} /> {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Items List with Edit/Delete Menu */}
      <div className="space-y-2">
        {applications.map((app) => (
          <div
            key={app.id}
            className="glass-card p-4 rounded-lg flex justify-between items-start group"
          >
            <div>
              <h4 className="font-bold">{app.position}</h4>
              <p className="text-gray-400 text-sm">{app.company}</p>
            </div>

            {/* Menu Button */}
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() =>
                  setMenuOpen(menuOpen === app.id ? null : app.id)
                }
                className="p-2 hover:bg-bg-tertiary rounded"
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {menuOpen === app.id && (
                <div className="absolute right-0 top-full mt-1 bg-bg-tertiary border border-border rounded-lg shadow-xl z-10 min-w-[150px]">
                  <button
                    onClick={() => startEditing(app)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:bg-opacity-20 flex items-center gap-2 text-blue-400"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <div className="border-t border-border"></div>
                  <button
                    onClick={() => {
                      deleteApplication(app.id);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-500 hover:bg-opacity-20 flex items-center gap-2 text-red-400"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No applications yet
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ============================================
 * IMPLEMENTATION CHECKLIST FOR OTHER MODULES
 * ============================================
 * 
 * For Each Module (Goals, Finance, Tasks, etc.):
 * 
 * 1. [ ] Add state variables:
 *        - editingId: string | null
 *        - showForm: boolean
 *        - menuOpen: string | null
 *        - formData: your fields
 * 
 * 2. [ ] Create startEditing function:
 *        - Populate form with item data
 *        - Set editingId
 *        - Show form
 * 
 * 3. [ ] Create handleSave function:
 *        - Check required fields
 *        - Call update function if editingId exists
 *        - Call add function if new
 *        - Reset form
 * 
 * 4. [ ] Create resetForm function:
 *        - Clear all fields
 *        - Clear editingId
 *        - Hide form
 * 
 * 5. [ ] Add form UI:
 *        - Inputs for each field
 *        - Save/Cancel buttons
 *        - Toggle button to show/hide
 * 
 * 6. [ ] Add item cards:
 *        - Display item data
 *        - Add MoreVertical menu button
 *        - Show edit/delete options on hover
 * 
 * 7. [ ] Update context if needed:
 *        - Ensure updateXXX functions exist
 *        - Add any missing context functions
 * 
 * 8. [ ] Test thoroughly:
 *        - Create new item
 *        - Edit existing item
 *        - Delete item
 *        - Verify Firebase sync
 */
