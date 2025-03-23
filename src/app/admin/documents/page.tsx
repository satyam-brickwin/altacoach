'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  useToast, 
  Flex, 
  Input, 
  Select, 
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Tag,
  TagLabel,
  Spinner,
  Link
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  DownloadIcon, 
  EditIcon, 
  SearchIcon, 
  ViewIcon 
} from '@chakra-ui/icons';
import NextLink from 'next/link';

// Document status badge colors
const statusColors = {
  PENDING: 'yellow',
  PROCESSING: 'blue',
  PROCESSED: 'green',
  FAILED: 'red'
};

// Document type for TypeScript
interface Document {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  content: string | null;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  language: string;
  tags: string[];
  metadata: any;
  uploadedById: string;
  clientId: string | null;
  trainingContentId: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  client?: {
    id: string;
    name: string;
  } | null;
}

export default function DocumentsPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // State variables
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0
  });
  
  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    file: null as File | null
  });
  
  // Form state for edit
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: '',
    status: ''
  });
  
  // Fetch documents on component mount and when filters change
  useEffect(() => {
    fetchDocuments();
  }, [statusFilter, tagFilter, pagination.offset, pagination.limit]);
  
  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = `/api/documents?limit=${pagination.limit}&offset=${pagination.offset}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      if (tagFilter) {
        url += `&tag=${tagFilter}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents);
      setPagination({
        ...pagination,
        total: data.pagination.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch documents',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadForm({
        ...uploadForm,
        file: e.target.files[0]
      });
    }
  };
  
  // Handle upload form input changes
  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value
    });
  };
  
  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };
  
  // Submit document upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (!uploadForm.title) {
      toast({
        title: 'Error',
        description: 'Please enter a title for the document',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('tags', uploadForm.tags);
      formData.append('uploadedById', 'user123'); // Replace with actual user ID from auth
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Reset form and close modal
      setUploadForm({
        title: '',
        description: '',
        tags: '',
        file: null
      });
      onUploadClose();
      
      // Refresh document list
      fetchDocuments();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to upload document',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // Submit document edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocument) return;
    
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          status: editForm.status
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update document');
      }
      
      toast({
        title: 'Success',
        description: 'Document updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onEditClose();
      fetchDocuments();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update document',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // Delete document
  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;
    
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }
      
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onDeleteClose();
      fetchDocuments();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete document',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // Process document
  const handleProcessDocument = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/process`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }
      
      toast({
        title: 'Success',
        description: 'Document processing started',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Refresh document list after a short delay
      setTimeout(() => {
        fetchDocuments();
      }, 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to process document',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // View document details
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    onViewOpen();
  };
  
  // Edit document
  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setEditForm({
      title: document.title,
      description: document.description || '',
      tags: document.tags.join(', '),
      status: document.status
    });
    onEditOpen();
  };
  
  // Delete document
  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document);
    onDeleteOpen();
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Handle pagination
  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit
      });
    }
  };
  
  const handlePrevPage = () => {
    if (pagination.offset - pagination.limit >= 0) {
      setPagination({
        ...pagination,
        offset: pagination.offset - pagination.limit
      });
    }
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h1" size="xl">Document Repository</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={onUploadOpen}
          >
            Upload Document
          </Button>
        </Flex>
        
        <Text mb={6}>
          Manage your knowledge base documents. Upload, organize, and process documents to make them searchable.
        </Text>
        
        {/* Filters */}
        <Flex mb={6} gap={4} flexWrap="wrap">
          <FormControl maxW="300px">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<SearchIcon />}
            />
          </FormControl>
          
          <FormControl maxW="200px">
            <Select 
              placeholder="Filter by status" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="PROCESSED">Processed</option>
              <option value="FAILED">Failed</option>
            </Select>
          </FormControl>
          
          <FormControl maxW="200px">
            <Input
              placeholder="Filter by tag"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            />
          </FormControl>
        </Flex>
      </Box>
      
      {/* Documents Table */}
      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Box textAlign="center" p={8}>
          <Text color="red.500">{error}</Text>
          <Button mt={4} onClick={fetchDocuments}>Try Again</Button>
        </Box>
      ) : documents.length === 0 ? (
        <Box textAlign="center" p={8} borderWidth={1} borderRadius="lg">
          <Text mb={4}>No documents found</Text>
          <Button colorScheme="blue" onClick={onUploadOpen}>Upload Your First Document</Button>
        </Box>
      ) : (
        <>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>File</Th>
                  <Th>Size</Th>
                  <Th>Status</Th>
                  <Th>Uploaded By</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {documents.map((doc) => (
                  <Tr key={doc.id}>
                    <Td>
                      <Text fontWeight="bold">{doc.title}</Text>
                      {doc.tags.length > 0 && (
                        <Flex mt={2} gap={2} flexWrap="wrap">
                          {doc.tags.slice(0, 3).map((tag, index) => (
                            <Tag size="sm" key={index} colorScheme="blue" variant="subtle">
                              <TagLabel>{tag}</TagLabel>
                            </Tag>
                          ))}
                          {doc.tags.length > 3 && (
                            <Tag size="sm" colorScheme="gray">
                              <TagLabel>+{doc.tags.length - 3}</TagLabel>
                            </Tag>
                          )}
                        </Flex>
                      )}
                    </Td>
                    <Td>{doc.fileName}</Td>
                    <Td>{formatFileSize(doc.fileSize)}</Td>
                    <Td>
                      <Badge colorScheme={statusColors[doc.status]}>
                        {doc.status}
                      </Badge>
                    </Td>
                    <Td>{doc.uploadedBy.name}</Td>
                    <Td>{formatDate(doc.createdAt)}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View document"
                          icon={<ViewIcon />}
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                        />
                        <IconButton
                          aria-label="Edit document"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => handleEditDocument(doc)}
                        />
                        <IconButton
                          aria-label="Download document"
                          icon={<DownloadIcon />}
                          size="sm"
                          as="a"
                          href={`/api/documents/${doc.id}/download`}
                          target="_blank"
                        />
                        <IconButton
                          aria-label="Delete document"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteDocument(doc)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          
          {/* Pagination */}
          <Flex justify="space-between" mt={6}>
            <Text>
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} documents
            </Text>
            <HStack>
              <Button 
                onClick={handlePrevPage} 
                isDisabled={pagination.offset === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={handleNextPage} 
                isDisabled={pagination.offset + pagination.limit >= pagination.total}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}
      
      {/* Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Document</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleUploadSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input 
                    name="title"
                    value={uploadForm.title}
                    onChange={handleUploadInputChange}
                    placeholder="Enter document title"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    name="description"
                    value={uploadForm.description}
                    onChange={handleUploadInputChange}
                    placeholder="Enter document description"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <Input 
                    name="tags"
                    value={uploadForm.tags}
                    onChange={handleUploadInputChange}
                    placeholder="Enter tags separated by commas"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>File</FormLabel>
                  <Input 
                    type="file"
                    onChange={handleFileChange}
                    p={1}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Supported formats: PDF, DOCX, TXT, XLSX
                  </Text>
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onUploadClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Upload
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* View Document Modal */}
      {selectedDocument && (
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedDocument.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Description:</Text>
                  <Text>{selectedDocument.description || 'No description'}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">File Information:</Text>
                  <Text>Name: {selectedDocument.fileName}</Text>
                  <Text>Type: {selectedDocument.fileType}</Text>
                  <Text>Size: {formatFileSize(selectedDocument.fileSize)}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Status:</Text>
                  <Badge colorScheme={statusColors[selectedDocument.status]}>
                    {selectedDocument.status}
                  </Badge>
                  
                  {selectedDocument.status === 'PENDING' && (
                    <Button 
                      size="sm" 
                      ml={2} 
                      onClick={() => handleProcessDocument(selectedDocument)}
                    >
                      Process Now
                    </Button>
                  )}
                </Box>
                
                {selectedDocument.tags.length > 0 && (
                  <Box>
                    <Text fontWeight="bold">Tags:</Text>
                    <Flex mt={1} gap={2} flexWrap="wrap">
                      {selectedDocument.tags.map((tag, index) => (
                        <Tag key={index} colorScheme="blue">
                          <TagLabel>{tag}</TagLabel>
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
                
                <Box>
                  <Text fontWeight="bold">Uploaded By:</Text>
                  <Text>{selectedDocument.uploadedBy.name} ({selectedDocument.uploadedBy.email})</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Dates:</Text>
                  <Text>Created: {formatDate(selectedDocument.createdAt)}</Text>
                  <Text>Updated: {formatDate(selectedDocument.updatedAt)}</Text>
                </Box>
                
                {selectedDocument.content && (
                  <Box>
                    <Text fontWeight="bold">Content Preview:</Text>
                    <Box 
                      mt={2} 
                      p={3} 
                      borderWidth={1} 
                      borderRadius="md" 
                      maxH="200px" 
                      overflowY="auto"
                    >
                      <Text whiteSpace="pre-wrap">
                        {selectedDocument.content.substring(0, 500)}
                        {selectedDocument.content.length > 500 && '...'}
                      </Text>
                    </Box>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                as="a" 
                href={`/api/documents/${selectedDocument.id}/download`} 
                target="_blank"
                leftIcon={<DownloadIcon />} 
                colorScheme="blue" 
                mr={3}
              >
                Download
              </Button>
              <Button variant="ghost" onClick={onViewClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      
      {/* Edit Document Modal */}
      {selectedDocument && (
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Document</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleEditSubmit}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input 
                      name="title"
                      value={editForm.title}
                      onChange={handleEditInputChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea 
                      name="description"
                      value={editForm.description}
                      onChange={handleEditInputChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Tags</FormLabel>
                    <Input 
                      name="tags"
                      value={editForm.tags}
                      onChange={handleEditInputChange}
                      placeholder="Enter tags separated by commas"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      name="status"
                      value={editForm.status}
                      onChange={handleEditInputChange}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="PROCESSED">Processed</option>
                      <option value="FAILED">Failed</option>
                    </Select>
                  </FormControl>
                </VStack>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onEditClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit">
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
      
      {/* Delete Confirmation Modal */}
      {selectedDocument && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete the document "{selectedDocument.title}"? 
                This action cannot be undone.
              </Text>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
} 