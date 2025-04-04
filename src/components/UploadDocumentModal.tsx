import React, { useState } from 'react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  translate: (key: string) => string;
}

interface DocumentFormData {
  title: string;
  description: string;
  type: string;
  source: string;
  file: File | null;
}

export default function UploadDocumentModal({ isOpen, onClose, onSuccess, translate }: UploadDocumentModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    type: 'business',
    source: 'business',
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Here you would implement the actual file upload logic
      // For example:
      // const formDataToSend = new FormData();
      // formDataToSend.append('file', formData.file);
      // formDataToSend.append('title', formData.title);
      // await fetch('/api/documents', { method: 'POST', body: formDataToSend });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {translate('Upload Document')}
              </h3>
              <button
                onClick={onClose}
                className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('Document Title')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('Description')}
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('Document Type')}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026]"
                  >
                    <option value="business">{translate('business')}</option>
                    <option value="admin">{translate('admin')}</option>
                    {/* <option value="other">{translate('other')}</option> */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('Upload File')}
                  </label>
                  <div 
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                      dragActive 
                        ? 'border-[#C72026] bg-[#C72026]/5 dark:bg-[#C72026]/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-[#C72026] hover:text-[#C72026]/80">
                          <span>{translate('Upload A File')}</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt"
                          />
                        </label>
                        <p className="pl-1">{translate('orDragAndDrop')}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOC, DOCX up to 10MB
                      </p>
                      {formData.file && (
                        <p className="text-sm text-[#C72026]">{formData.file.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.file}
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#C72026] border border-transparent rounded-md hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] disabled:opacity-50"
                >
                  {isSubmitting ? translate('uploading') : translate('upload')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 sm:mt-0 inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
                >
                  {translate('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}