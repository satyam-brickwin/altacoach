import React from 'react';
import { MessageSquare } from 'lucide-react';

// Define props interface with translation properties and click handler
interface EmptyStateProps {
  title?: string;
  description?: string;
  onSuggestionClick?: (text: string) => void;
  suggestions?: {
    tellMeAbout: {
      title: string;
      description: string;
    };
    helpMeWith: {
      title: string;
      description: string;
    };
    writeA: {
      title: string;
      description: string;
    };
    analyzeThis: {
      title: string;
      description: string;
    };
  };
}

export function EmptyState({
  title = "Start a conversation",
  description = "Begin by typing a message to start your chat. Ask questions, get assistance, or explore topics together.",
  onSuggestionClick,
  suggestions = {
    tellMeAbout: {
      title: "Tell me about...",
      description: "Complex topics and explanations"
    },
    helpMeWith: {
      title: "Help me with...",
      description: "Problem solving and creative tasks"
    },
    writeA: {
      title: "Write a...",
      description: "Creative writing and formatting"
    },
    analyzeThis: {
      title: "Analyze this...",
      description: "Data analysis and interpretation"
    }
  }
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
        <MessageSquare className="h-8 w-8 text-secondary-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8 text-gray-600 dark:text-gray-400">
        {description}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl px-4">
        <div 
          className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
          onClick={() => onSuggestionClick?.(`${suggestions.tellMeAbout.title} ${suggestions.tellMeAbout.description}`)}
        >
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">{suggestions.tellMeAbout.title}</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">{suggestions.tellMeAbout.description}</p>
        </div>
        <div 
          className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
          onClick={() => onSuggestionClick?.(`${suggestions.helpMeWith.title} ${suggestions.helpMeWith.description}`)}
        >
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">{suggestions.helpMeWith.title}</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">{suggestions.helpMeWith.description}</p>
        </div>
        <div 
          className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
          onClick={() => onSuggestionClick?.(`${suggestions.writeA.title} ${suggestions.writeA.description}`)}
        >
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">{suggestions.writeA.title}</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">{suggestions.writeA.description}</p>
        </div>
        <div 
          className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
          onClick={() => onSuggestionClick?.(`${suggestions.analyzeThis.title} ${suggestions.analyzeThis.description}`)}
        >
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">{suggestions.analyzeThis.title}</h3>
          <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">{suggestions.analyzeThis.description}</p>
        </div>
      </div>
    </div>
  );
}
