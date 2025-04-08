import { useState } from 'react';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive?: string;
  joinDate?: string;
  language?: string;
}

interface UserDataActionsProps {
  users: User[];
  onImportUsers: (importedUsers: User[]) => void;
}

function convertToCSV(data: any[]) {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(',')).join('\n');
  return `${headers}\n${rows}`;
}

function downloadCSV(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UserDataActions({ users, onImportUsers }: UserDataActionsProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    // Filter out role field and only keep necessary fields
    const exportData = users.map(user => ({
      name: user.name,
      email: user.email,
      language: user.language || 'en',
      status: user.status
    }));
    
    const csvString = convertToCSV(exportData);
    downloadCSV(csvString, 'users.csv');
  };

  const handleImportUsers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get first worksheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Transform data to match User interface
      const importedUsers = jsonData.map((row: any, index) => ({
        id: `imported-${Date.now()}-${index}`,
        name: row.Name || row.name,
        email: row.Email || row.email,
        role: row.Role || row.role || 'User',
        status: row.Status || row.status || 'active',
        lastActive: row['Last Active'] || row.lastActive || new Date().toISOString().split('T')[0],
        joinDate: row['Join Date'] || row.joinDate || new Date().toISOString().split('T')[0],
        language: row.Language || row.language || 'en'
      }));

      onImportUsers(importedUsers);
      
      // Show success message
      alert(`Successfully imported ${importedUsers.length} users`);
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Error importing users. Please check the file format.');
    } finally {
      setIsImporting(false);
      // Reset input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex space-x-2">
      <label 
        htmlFor="importUsers" 
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
          ${isImporting 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
          }`}
      >
        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import Users
        <input
          id="importUsers"
          type="file"
          accept=".csv,.xlsx"
          onChange={handleImportUsers}
          disabled={isImporting}
          className="hidden"
        />
      </label>
      
      <button 
        onClick={handleExport}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Users
      </button>
    </div>
  );
}