'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';

interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: string;
  created_at: string;
}

interface ChatAnalyticsData {
  total_conversations: number;
  total_messages: number;
  active_users: number;
  avg_messages_per_conversation: number;
  popular_topics: { topic: string; count: number }[];
}

export default function ChatAnalysisPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [analyticsData, setAnalyticsData] = useState<ChatAnalyticsData | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const mockConversations = [
    {
      id: '1',
      title: 'Conversation 1',
      user_id: 'user1',
      created_at: '2025-03-23T10:00:00',
      updated_at: '2025-03-23T10:00:00',
      message_count: 5,
    },
    {
      id: '2',
      title: 'Conversation 2',
      user_id: 'user2',
      created_at: '2025-03-20T12:00:00',
      updated_at: '2025-03-20T12:00:00',
      message_count: 3,
    },
    {
      id: '3',
      title: 'Conversation 3',
      user_id: 'user3',
      created_at: '2025-03-15T14:00:00',
      updated_at: '2025-03-15T14:00:00',
      message_count: 7,
    },
    {
      id: '4',
      title: 'Conversation 4',
      user_id: 'user4',
      created_at: '2025-02-23T16:00:00',
      updated_at: '2025-02-23T16:00:00',
      message_count: 2,
    },
  ];

  const mockMessages: { [key: string]: Message[] } = {
    '1': [
      {
        id: '1',
        conversation_id: '1',
        content: 'Hello, how can I help you?',
        role: 'AI',
        created_at: '2025-03-23T10:00:00',
      },
      {
        id: '2',
        conversation_id: '1',
        content: 'I need help with my account.',
        role: 'user',
        created_at: '2025-03-23T10:05:00',
      },
    ],
    '2': [
      {
        id: '3',
        conversation_id: '2',
        content: 'What is your issue?',
        role: 'AI',
        created_at: '2025-03-20T12:00:00',
      },
      {
        id: '4',
        conversation_id: '2',
        content: 'I forgot my password.',
        role: 'user',
        created_at: '2025-03-20T12:10:00',
      },
    ],
    '3': [
      {
        id: '5',
        conversation_id: '3',
        content: 'How can I assist you today?',
        role: 'AI',
        created_at: '2025-03-15T14:00:00',
      },
      {
        id: '6',
        conversation_id: '3',
        content: 'I have a billing question.',
        role: 'user',
        created_at: '2025-03-15T14:15:00',
      },
    ],
    '4': [
      {
        id: '7',
        conversation_id: '4',
        content: 'Can you provide more details?',
        role: 'AI',
        created_at: '2025-02-23T16:00:00',
      },
      {
        id: '8',
        conversation_id: '4',
        content: 'Sure, here are the details...',
        role: 'user',
        created_at: '2025-02-23T16:20:00',
      },
    ],
  };

  // Fetch conversations with pagination
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Filter mock data based on search term and time range
        let filteredConversations = mockConversations.filter((conversation) =>
          conversation.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (timeRange !== 'all') {
          const now = new Date();
          filteredConversations = filteredConversations.filter((conversation) => {
            const createdAt = new Date(conversation.created_at);
            if (timeRange === 'today') {
              return createdAt.toDateString() === now.toDateString();
            } else if (timeRange === 'week') {
              const oneWeekAgo = new Date(now);
              oneWeekAgo.setDate(now.getDate() - 7);
              return createdAt >= oneWeekAgo;
            } else if (timeRange === 'month') {
              const oneMonthAgo = new Date(now);
              oneMonthAgo.setMonth(now.getMonth() - 1);
              return createdAt >= oneMonthAgo;
            }
            return true;
          });
        }

        setConversations(filteredConversations);
        setTotalPages(Math.ceil(filteredConversations.length / itemsPerPage));
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [page, searchTerm, timeRange, toast]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setMessages(mockMessages[selectedConversation] || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversation messages',
          variant: 'destructive',
        });
      }
    };

    fetchMessages();
  }, [selectedConversation, toast]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Mock data for analytics
        const mockAnalytics: ChatAnalyticsData = {
          total_conversations: mockConversations.length,
          total_messages: Object.values(mockMessages).flat().length,
          active_users: new Set(mockConversations.map((c) => c.user_id)).size,
          avg_messages_per_conversation: Object.values(mockMessages).flat().length / mockConversations.length,
          popular_topics: [
            { topic: 'Training', count: 25 },
            { topic: 'Support', count: 18 },
            { topic: 'Technical Issues', count: 12 },
            { topic: 'Feedback', count: 8 },
            { topic: 'Other', count: 5 },
          ],
        };

        setAnalyticsData(mockAnalytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Chat Analysis</h1>
      
      <Tabs defaultValue="conversations">
        <TabsList className="mb-4">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>
                  View and analyze user conversations
                </CardDescription>
                
                <form onSubmit={handleSearch} className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="timeRange">Time Range</Label>
                    <Select
                      value={timeRange}
                      onValueChange={setTimeRange}
                    >
                      <SelectTrigger id="timeRange">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading conversations...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-4">No conversations found</div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          selectedConversation === conversation.id
                            ? 'bg-gray-100 dark:bg-gray-800'
                            : ''
                        }`}
                        onClick={() => handleConversationSelect(conversation.id)}
                      >
                        <div className="font-medium truncate">{conversation.title}</div>
                        <div className="text-sm text-gray-500 flex justify-between">
                          <span>User: {conversation.user_id.substring(0, 8)}...</span>
                          <Badge variant="outline">{conversation.message_count} msgs</Badge>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(conversation.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = page <= 3
                          ? i + 1
                          : page >= totalPages - 2
                            ? totalPages - 4 + i
                            : page - 2 + i;
                        
                        if (pageNum <= 0 || pageNum > totalPages) return null;
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={page === pageNum}
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>
            
            {/* Conversation Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedConversation
                    ? conversations.find(c => c.id === selectedConversation)?.title || 'Conversation'
                    : 'Select a conversation'}
                </CardTitle>
                {selectedConversation && (
                  <CardDescription>
                    User ID: {conversations.find(c => c.id === selectedConversation)?.user_id || 'Unknown'}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                {!selectedConversation ? (
                  <div className="text-center py-12 text-gray-500">
                    Select a conversation from the list to view details
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No messages found in this conversation
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-900/20 ml-auto max-w-[80%]'
                            : 'bg-gray-50 dark:bg-gray-800 mr-auto max-w-[80%]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                            {message.role === 'user' ? 'User' : 'AI'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.total_conversations || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.total_messages || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.active_users || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Messages/Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.avg_messages_per_conversation || 0}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
                <CardDescription>
                  Most discussed topics in conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData?.popular_topics.map((topic) => (
                      <TableRow key={topic.topic}>
                        <TableCell>{topic.topic}</TableCell>
                        <TableCell className="text-right">{topic.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Chat Activity</CardTitle>
                <CardDescription>
                  Conversation activity over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Chart visualization would go here</p>
                  <p className="text-sm mt-2">
                    (Requires integration with a charting library)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}