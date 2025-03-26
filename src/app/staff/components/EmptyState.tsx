import React from 'react';
import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
        <MessageSquare className="h-8 w-8 text-secondary-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Start a conversation</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8 text-gray-600 dark:text-gray-400">
        Begin by typing a message to start your chat. Ask questions, get assistance, or explore topics together.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl px-4">
        <div className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer">
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">Tell me about...</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">Complex topics and explanations</p>
        </div>
        <div className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer">
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">Help me with...</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">Problem solving and creative tasks</p>
        </div>
        <div className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer">
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">Write a...</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">Creative writing and formatting</p>
        </div>
        <div className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer">
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">Analyze this...</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">Data analysis and interpretation</p>
        </div>
      </div>
    </div>
  );
}
