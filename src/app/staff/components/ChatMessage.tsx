import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Edit, Check, X, Trash2, Lightbulb } from 'lucide-react'; // Add Lightbulb import

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
  };
  isLast: boolean;
  onEditMessage?: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isLast, 
  onEditMessage,
  onDeleteMessage 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.role === 'user';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEditMessage) {
      onEditMessage(message.id, editedContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    }
  };

  const handleInsight = () => {
    // You can enhance this function later with more sophisticated analysis
    alert("Key insights from this response:\n\n1. Main points\n2. Action items\n3. Follow-up questions");
  };

  return (
    <div
      ref={messageRef}
      className={cn(
        "py-4 relative group message-transition w-full",
        isLast && "animate-slide-up"
      )}
    >
      <div className="container max-w-3xl mx-auto">
        <div className={cn(
          "flex",
          isUser ? "justify-end" : "justify-start"
        )}>
          {!isUser && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] mt-1">
              <span className="text-xs font-medium">AC</span>
            </div>
          )}
          
          <div className={cn(
            "mx-2 max-w-[80%] relative",
          )}>
            {/* Timestamp shown above the message */}
            <div className={cn(
              "flex items-center mb-1 text-xs text-gray-600 dark:text-white",
              isUser ? "justify-end" : "justify-start"
            )}>
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {/* The actual message bubble */}
            <div
              className={cn(
                "px-4 py-3 rounded-2xl",
                isUser
                  ? "bg-[#C72026] text-white rounded-br-none" // User messages in red with white text
                  : "bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-bl-none text-gray-900 dark:text-gray-100" // Assistant messages with light red bg
              )}
            >
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 rounded-md border border-input bg-background text-gray-800 dark:chat-text-dark input-focus-ring min-h-[100px] resize-none"
                  placeholder="Edit your message..."
                />
              ) : (
                <div
                  className={cn(
                    "prose prose-sm max-w-none break-words",
                    isUser ? "text-white dark:text-white" : "text-gray-900 dark:chat-text-dark"
                  )}
                >
                  {message.text}
                </div>
              )}
            </div>
            
            {/* Edit controls shown below the message when editing */}
            {isEditing && (
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="p-1 rounded-full hover:bg-[#C72026]/10 dark:hover:bg-[#C72026]/20 transition-colors duration-200"
                  aria-label="Cancel edit"
                >
                  <X className="h-4 w-4 text-[#C72026] dark:text-[#C72026]" />
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="p-1 rounded-full hover:bg-[#C72026]/10 dark:hover:bg-[#C72026]/20 transition-colors duration-200"
                  aria-label="Save edit"
                >
                  <Check className="h-4 w-4 text-[#C72026] dark:text-[#C72026]" />
                </button>
              </div>
            )}
            
            {/* Add bulb icon for assistant messages */}
            {!isUser && !isEditing && (
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 right-0 transform translate-x-8 translate-y-1/2 transition-opacity duration-200">
                <button
                  onClick={handleInsight}
                  className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors duration-200"
                  aria-label="Show insights"
                >
                  <Lightbulb className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                </button>
              </div>
            )}
            
            {/* Action buttons that appear on hover */}
            {isUser && !isEditing && (
              <div className="opacity-0 group-hover:opacity-100 absolute top-6 -left-10 flex flex-col gap-1 transition-opacity duration-200">
                <button
                  onClick={handleEdit}
                  className="p-1 rounded-full hover:bg-[#C72026]/10 dark:hover:bg-[#C72026]/20 transition-colors duration-200"
                  aria-label="Edit message"
                >
                  <Edit className="h-4 w-4 text-[#C72026] dark:text-[#C72026]" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-full hover:bg-[#C72026]/10 dark:hover:bg-[#C72026]/20 transition-colors duration-200"
                  aria-label="Delete message"
                >
                  <Trash2 className="h-4 w-4 text-[#C72026] dark:text-[#C72026]" />
                </button>
              </div>
            )}
          </div>
          
          {isUser && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#C72026] text-white mt-1">
              <span className="text-xs font-medium">You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
