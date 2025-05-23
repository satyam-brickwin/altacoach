import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  businessId: string;  // Added businessId
  lastActive?: string;
  joinDate?: string;
  language?: string;
}

interface NewUser {
  name: string;
  email: string;
  role?: string;
  language?: string;
}

interface ImportedUser {
  name: string;
  email: string;
  role?: string;  // Add this property
  language?: string;
  status?: string;
}

interface UserDataActionsProps {
  users: User[];
  onImportUsers: (importedUsers: User[]) => void;
  businessId: string;  // Added businessId prop
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

function isDuplicateUser(newUser: ImportedUser, existingUsers: User[]) {
  return existingUsers.some(user => user.email === newUser.email);
}

export default function UserDataActions({ users, onImportUsers, businessId }: UserDataActionsProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [usersState, setUsers] = useState(users);

  // Add useEffect to keep local state in sync with props
  useEffect(() => {
    setUsers(users);
  }, [users]);

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
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
      
      // Add before the mapping
      if (jsonData.length === 0) {
        alert('No data found in the imported file.');
        return;
      }

      // Validate required fields
      const missingFields = jsonData.some((row: Record<string, any>) => 
        !(row.Name || row.name) || !(row.Email || row.email)
      );

      if (missingFields) {
        alert('Some rows are missing required fields (Name or Email). Please check your file.');
        return;
      }

      // Transform data to match user interface more accurately
      const importedUsers = jsonData.map((row: Record<string, any>) => ({
        name: row.Name || row.name || '',
        email: row.Email || row.email || '',
        role: row.Role || row.role || 'User',
        language: row.Language || row.language || 'en',
        status: row.Status || row.status || 'active'
      }));

      handleImportUsersLogic(importedUsers);
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

  const handleImportUsersLogic = (importedUsers: ImportedUser[]) => {
    // Filter out duplicates
    const uniqueUsers = importedUsers.filter(newUser => 
      !isDuplicateUser(newUser, usersState)
    );

    // If some users were filtered out, show warning
    if (uniqueUsers.length < importedUsers.length) {
      const duplicateCount = importedUsers.length - uniqueUsers.length;
      alert(`${duplicateCount} duplicate user(s) were found and skipped.`);
    }

    // Process only unique users
    const usersToAdd = uniqueUsers.map((user, index) => ({
      id: Date.now().toString() + index,
      name: user.name,
      email: user.email,
      role: user.role || 'User', // Preserve the role if provided
      status: user.status || 'active',
      businessId: businessId,
      lastActive: new Date().toISOString().split('T')[0],
      joinDate: new Date().toISOString().split('T')[0],
      language: user.language || 'en'
    }));

    if (usersToAdd.length > 0) {
      // Update local state
      setUsers(prevUsers => [...prevUsers, ...usersToAdd]);
      
      // IMPORTANT: Call the parent component's handler
      onImportUsers(usersToAdd);
      
      // Don't show this alert since the parent component will handle success messages
      // alert(`Successfully added ${usersToAdd.length} new user(s).`);
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