/**
 * EDIT FUNCTIONALITY TEMPLATE
 * Copy this pattern to add edit/update features to any module
 * 
 * Example: Applying to Career Module
 * 
 * NOTE: This is a REFERENCE template file. To use it:
 * 1. Copy the pattern/structure
 * 2. Apply to your module file in modules/ directory
 * 3. Adjust imports based on your module's location
 */

import React, { useState } from 'react';
import { useLifeOS } from './context/LifeOSContext';
import { JobApplication } from './types';
import { Edit2, Trash2, MoreVertical, X, Save, Plus } from 'lucide-react';

export const EditableCareersExample: React.FC = () => {
  const { data, updateApplicationStatus, deleteApplication } = useLifeOS();
  
  // ============ STATE MANAGEMENT ============
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  // Form fields (customize per module)
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    date: '',
    link: '',
    status: 'applied' as const,
  });

  const applications = data.career.applications;

  // ============ HELPER FUNCTIONS ============

  /**
   * Step 1: Load item into form for editing
   */
  const startEditing = (app: JobApplication) => {
    setFormData({
      role: app.role,
      company: app.company,
      date: app.date,
      link: app.link || '',
      status: app.status as any,
    });
    setEditingId(app.id);
    setShowForm(true);
    setMenuOpen(null);
  };

  /**
   * Step 2: Save or Update
   */
  const handleSave = () => {
    if (!formData.company || !formData.role) {
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
      role: '',
      company: '',
      date: '',
      link: '',
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
            placeholder="Role / Position"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-3 rounded-lg bg-bg-tertiary border border-border mb-3"
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 rounded-lg bg-bg-tertiary border border-border mb-3"
          />

          <input
            type="url"
            placeholder="Application Link (optional)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
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
              <h4 className="font-bold">{app.role}</h4>
              <p className="text-gray-400 text-sm">{app.company}</p>
              <p className="text-gray-500 text-xs mt-1">{app.date}</p>
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
