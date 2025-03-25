import React, { useState } from 'react';
import { Button } from '@/componentsuper/ui/button';
import PermissionModal from '@/components/PermissionModal';

const Index = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl w-full mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">User Permission Control Hub</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A sophisticated permission management system with elegant UI and smooth transitions
        </p>
        
        <div className="mt-10">
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Open Permission Settings
          </Button>
        </div>
      </div>

      {showModal && <PermissionModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Index;
