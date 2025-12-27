import React, { useRef, useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { User, Moon, Sun, Download, Upload, Trash2, Save, Monitor, AlertTriangle } from 'lucide-react';

const Settings: React.FC = () => {
  const { data, toggleTheme, updateProfile, importData, clearData } = useLifeOS();
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for profile inputs to avoid excessive re-renders/saves
  const [name, setName] = useState(data.profile?.name || 'User');
  const [title, setTitle] = useState(data.profile?.title || 'LifeOS User');
  const [hasChanges, setHasChanges] = useState(false);

  const handleProfileSave = () => {
      updateProfile({ name, title });
      setHasChanges(false);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
      setter(value);
      setHasChanges(true);
  };

  const handleExport = () => {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const result = event.target?.result as string;
          if (importData(result)) {
              setImportStatus('success');
              setTimeout(() => setImportStatus(''), 3000);
          } else {
              setImportStatus('error');
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset
  };

  const handleClearData = () => {
      if(confirm("DANGER: This will wipe all your tasks, goals, and history. Are you absolutely sure?")) {
          clearData();
          window.location.reload();
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
        <h2 className="text-3xl font-bold mb-6">Settings</h2>

        {/* Profile Section */}
        <section className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-500">
                    <User size={24} />
                </div>
                <h3 className="text-xl font-semibold">Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Display Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => handleInputChange(setName, e.target.value)}
                        className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Title / Role</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => handleInputChange(setTitle, e.target.value)}
                        className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none transition-all"
                    />
                </div>
            </div>
            
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleProfileSave}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${hasChanges ? 'bg-accent text-white hover:bg-accent/80' : 'bg-bg-tertiary text-gray-500 cursor-not-allowed'}`}
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </section>

        {/* Appearance Section */}
        <section className="glass-card rounded-xl p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
                    <Monitor size={24} />
                </div>
                <h3 className="text-xl font-semibold">Appearance</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => toggleTheme('dark')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${data.settings.theme === 'dark' ? 'bg-bg-tertiary border-accent text-accent' : 'border-border hover:bg-bg-tertiary/50'}`}
                >
                    <Moon size={32} />
                    <span className="font-medium">Dark Mode</span>
                </button>
                <button 
                    onClick={() => toggleTheme('light')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${data.settings.theme === 'light' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-border hover:bg-bg-tertiary/50'}`}
                >
                    <Sun size={32} />
                    <span className="font-medium">Light Mode</span>
                </button>
            </div>
        </section>

        {/* Data Management Section */}
        <section className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                    <Save size={24} />
                </div>
                <h3 className="text-xl font-semibold">Data Management</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-bg-tertiary/30 rounded-lg border border-border">
                    <div>
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-gray-400">Download a JSON backup of all your data.</p>
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-bg-secondary border border-border rounded-lg transition-colors">
                        <Download size={18} /> Export
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-bg-tertiary/30 rounded-lg border border-border">
                    <div>
                        <h4 className="font-medium">Import Data</h4>
                        <p className="text-sm text-gray-400">Restore from a backup JSON file.</p>
                        {importStatus === 'success' && <span className="text-green-500 text-xs">Successfully imported!</span>}
                        {importStatus === 'error' && <span className="text-red-500 text-xs">Invalid file format.</span>}
                    </div>
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-bg-secondary border border-border rounded-lg transition-colors">
                            <Upload size={18} /> Import
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-red-500/20">
                     <div className="flex items-center gap-2 mb-4 text-red-500">
                        <AlertTriangle size={20} />
                        <h4 className="font-bold">Danger Zone</h4>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div>
                            <h4 className="font-medium text-red-500">Reset Application</h4>
                            <p className="text-sm text-red-400/70">Permanently delete all data and reset to defaults.</p>
                        </div>
                        <button onClick={handleClearData} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20">
                            <Trash2 size={18} /> Clear Data
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
};

export default Settings;