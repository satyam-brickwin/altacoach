'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

  // Fetch conversations with pagination
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Create a query
        let query = supabase
          .from('conversations')
          .select('*, messages(count)')
          .order('created_at', { ascending: false });

        // Apply time range filter
        if (timeRange === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          query = query.gte('created_at', today.toISOString());
        } else if (timeRange === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('created_at', weekAgo.toISOString());
        } else if (timeRange === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          query = query.gte('created_at', monthAgo.toISOString());
        }

        // Apply search filter if provided
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        // Get count for pagination
        const { count } = await query.count();
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));

        // Apply pagination
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        const { data, error } = await query.range(from, to);

        if (error) throw error;

        // Process data to include message count
        const processedData = data.map(conv => ({
          ...conv,
          message_count: conv.messages?.[0]?.count || 0
        }));

        setConversations(processedData);
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
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
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
        // This would be replaced with actual analytics data from your backend
        // For now, we'll use mock data
        const mockAnalytics: ChatAnalyticsData = {
          total_conversations: 0,
          total_messages: 0,
          active_users: 0,
          avg_messages_per_conversation: 0,
          popular_topics: []
        };

        // Get total conversations
        const { count: convCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true });
        
        mockAnalytics.total_conversations = convCount || 0;

        // Get total messages
        const { count: msgCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });
        
        mockAnalytics.total_messages = msgCount || 0;

        // Get unique users
        const { data: uniqueUsers } = await supabase
          .from('conversations')
          .select('user_id')
          .limit(1000);
        
        const uniqueUserIds = new Set(uniqueUsers?.map(u => u.user_id));
        mockAnalytics.active_users = uniqueUserIds.size;

        // Calculate average messages per conversation
        if (mockAnalytics.total_conversations > 0) {
          mockAnalytics.avg_messages_per_conversation = 
            parseFloat((mockAnalytics.total_messages / mockAnalytics.total_conversations).toFixed(2));
        }

        // For popular topics, we would need more sophisticated analysis
        // This is just a placeholder
        mockAnalytics.popular_topics = [
          { topic: 'Training', count: 25 },
          { topic: 'Support', count: 18 },
          { topic: 'Technical Issues', count: 12 },
          { topic: 'Feedback', count: 8 },
          { topic: 'Other', count: 5 }
        ];

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
    return new Date(dateString).toLocaleString();
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