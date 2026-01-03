/**
 * WORKING EDIT PATTERN - Use this as reference
 * This is based on the Freelance module implementation
 * Copy this pattern to add edit to other modules
 */

import React, { useState } from 'react';
import { useLifeOS } from './context/LifeOSContext';
import { Edit2, Trash2, MoreVertical, X, Save, Plus } from 'lucide-react';

/**
 * ============ STEP 1: STATE SETUP ============
 */
const EditPatternExample: React.FC = () => {
  const { data, updateGoal, deleteGoal } = useLifeOS();

  // Track which item is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Form fields - customize these per module
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as const,
    timeframe: 'monthly' as const,
    deadline: null as string | null,
  });

  // Get items from context data
  const items = data.goals;

  /**
   * ============ STEP 2: HELPER FUNCTIONS ============
   */

  // Load item for editing - pre-fills form
  const loadForEdit = (item: any) => {
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      timeframe: item.timeframe,
      deadline: item.deadline,
    });
    setEditingId(item.id);
    setShowForm(true);
    setMenuOpen(null);
  };

  // Save (create) or Update (edit) with same handler
  const handleSave = () => {
    if (!formData.title) {
      alert('Please fill in required fields');
      return;
    }

    if (editingId) {
      // EDIT MODE: Update existing item
      const existing = items.find((i: any) => i.id === editingId);
      if (existing) {
        updateGoal({
          ...existing,
          ...formData,
        });
      }
    } else {
      // CREATE MODE: Add new item
      // Use context's add function
      // const { addGoal } = useLifeOS();
      // addGoal(formData);
    }

    resetForm();
  };

  // Clear form and close
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      timeframe: 'monthly',
      deadline: null,
    });
    setEditingId(null);
    setShowForm(false);
  };

  /**
   * ============ STEP 3: RENDER UI ============
   */

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <button
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Plus size={18} /> New Item
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-lg">
            {editingId ? 'Edit Item' : 'Create New Item'}
          </h3>

          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
          />

          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
          >
            <option value="personal">Personal</option>
            <option value="career">Career</option>
            <option value="health">Health</option>
            <option value="fitness">Fitness</option>
            <option value="learning">Learning</option>
            <option value="finance">Finance</option>
            <option value="other">Other</option>
          </select>

          <select
            value={formData.timeframe}
            onChange={(e) => setFormData({ ...formData, timeframe: e.target.value as any })}
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
            >
              <Save size={18} /> {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition group"
          >
            {/* Content */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="text-sm text-gray-400">{item.description}</p>
                <p className="text-xs text-gray-500 mt-1">{item.category} • {item.timeframe}</p>
                {item.deadline && (
                  <p className="text-sm text-gray-500 mt-1">Due: {item.deadline}</p>
                )}
              </div>

              {/* Menu Button - appears on hover */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                  className="p-2 hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <MoreVertical size={18} />
                </button>

                {/* Dropdown Menu */}
                {menuOpen === item.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => loadForEdit(item)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center gap-2 border-b border-gray-700"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        deleteGoal(item.id);
                        setMenuOpen(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 text-red-400 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditPatternExample;

/**
 * ============ IMPLEMENTATION CHECKLIST ============
 * 
 * To add edit to another module:
 * 
 * [ ] Copy this component structure
 * [ ] Replace 'formData' fields with module-specific fields
 * [ ] Update useState types to match module types
 * [ ] Replace context functions (updateGoal, deleteGoal, etc.)
 * [ ] Customize form inputs for that module's data
 * [ ] Update the list rendering to show module-specific fields
 * [ ] Test: Create, Edit, Update, Delete all work
 * [ ] Test: Menu appears on hover
 * [ ] Test: Form pre-fills when editing
 * [ ] Test: Changes save to Firebase
 */
