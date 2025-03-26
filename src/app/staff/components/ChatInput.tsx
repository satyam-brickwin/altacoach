
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  Smile, 
  RotateCcw, 
  StopCircle,
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onRegenerateResponse?: () => void;
  onStopGenerating?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  onRegenerateResponse, 
  onStopGenerating,
  disabled = false,
  isGenerating = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm py-4 px-4 sticky bottom-0 left-0 right-0">
      <div className="container max-w-3xl mx-auto">
        <div className="relative">
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2 mt-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onStopGenerating}
                className="rounded-full transition-all duration-200 animate-fade-in shadow-soft hover:shadow-purple"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Stop generating
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateResponse}
                className="rounded-full transition-all duration-200 animate-fade-in hover:text-purple-500"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Regenerate response
              </Button>
            </div>
          ) : null}
          
          <div className={cn(
            "flex items-end gap-2 bg-background rounded-2xl border border-input p-2 transition-all duration-300 shadow-soft",
            isGenerating ? "opacity-60 pointer-events-none" : "opacity-100",
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full text-muted-foreground hover:text-purple-500 transition-colors duration-200 h-9 w-9"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                rows={1}
                placeholder="Send a message..."
                className="w-full bg-transparent px-2 py-1.5 resize-none max-h-[200px] focus:outline-none text-base"
                style={{ minHeight: '44px' }}
              />
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-muted-foreground hover:text-purple-500 transition-colors duration-200 h-9 w-9"
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5" />
                <span className="sr-only">Add emoji</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-muted-foreground hover:text-purple-500 transition-colors duration-200 h-9 w-9"
                aria-label="Voice input"
              >
                <Mic className="h-5 w-5" />
                <span className="sr-only">Voice input</span>
              </Button>
              
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || disabled}
                variant="ghost"
                size="icon"
                className={cn(
                  "shrink-0 rounded-full transition-colors duration-200 h-9 w-9",
                  message.trim() ? "text-purple-500 bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30" : "text-muted-foreground"
                )}
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
