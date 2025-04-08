export const convertToCSV = (data: any[]) => {
  // Define headers without role
  const headers = ['name', 'email', 'language', 'status'];
  
  // Convert data to CSV format
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const item of data) {
    const values = headers.map(header => {
      const value = item[header] || '';
      // Escape quotes and wrap value in quotes if it contains commas
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

export const downloadCSV = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};