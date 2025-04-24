import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Edit, Check, X, Trash2, Lightbulb } from 'lucide-react';
import { NewSuggestionModal } from './NewSuggestionModal';
import { v4 as uuidv4 } from 'uuid';

// Update submitSuggestionAPI to include better context about the chat
const submitSuggestionAPI = async (suggestion: string, messageId: string, userId: string, message: { text: string; role: 'user' | 'assistant'; id: string }, previousMessage?: { text: string; role: 'user' | 'assistant'; id: string }) => {
  // For debugging purposes, log the message we're sending a suggestion for
  console.log('Submitting suggestion for message:', message);
  console.log('Previous message context:', previousMessage); // Log previous message for context

  // Determine the user's question text and ID
  let userQuestionText: string | undefined;
  let userQuestionId: string | undefined;

  if (message.role === 'assistant' && previousMessage?.role === 'user') {
    // If suggesting on an assistant message, the previous user message is the question
    userQuestionText = previousMessage.text;
    userQuestionId = previousMessage.id;
  } else if (message.role === 'user') {
    // If suggesting on a user message, that message itself is the question
    userQuestionText = message.text;
    userQuestionId = message.id;
  }
  // If suggesting on an assistant message with no preceding user message, both remain undefined

  // Create an object with all the information we want to send
  const payload = {
    userId,
    suggestionText: suggestion,
    relatedMessageId: messageId, // ID of the message the suggestion button was clicked on
    messageText: message.text,   // Text of the message the suggestion is for
    messageRole: message.role,   // Role of the message the suggestion is for
    questionText: userQuestionText, // Text of the user's question input
    userQuestionId: userQuestionId, // ID of the user's question message
    answerText: message.role === 'assistant' ? message.text : undefined, // Assistant's answer text
    timestamp: new Date().toISOString() // Timestamp of the suggestion submission
  };

  console.log('Starting API call with payload:', payload);

  try {
    const response = await fetch('/api/newsuggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API error response:', errorData);
      throw new Error(`Failed to submit suggestion: ${response.status} ${errorData?.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('API success response:', data);
    return data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Update the saveMessageToDatabase function to correctly work with your schema
const saveMessageToDatabase = async (message: {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  userId: string;
  chatId?: string;
}) => {
  try {
    console.log('Saving message to database:', message);
    
    // For the PUT request to save messages
    const response = await fetch('/api/newsuggestion', {
      method: 'PUT', // Using PUT method for the message-saving endpoint
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: message.id,
        role: message.role,
        text: message.text,
        timestamp: message.timestamp,
        userId: message.userId,
        chatId: message.chatId || uuidv4(), // Use provided chatId or generate a new one
        // Store the user's input as questionText when the role is user
        questionText: message.role === 'user' ? message.text : undefined,
        // Store the assistant's response as answerText when the role is assistant
        answerText: message.role === 'assistant' ? message.text : undefined
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to save message:', errorData);
      throw new Error(`Failed to save message: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Message saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Update the ChatMessageProps interface to include a properly typed translations prop
interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
  };
  previousMessage?: {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
  };
  userId: string;
  isLast: boolean;
  onEditMessage?: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onSubmitSuggestion?: (suggestion: string) => void;
  language?: string;
  translations?: {
    [key: string]: {
      modals?: {
        suggestions?: {
          title?: string;
          description?: string;
          placeholder?: string;
          submit?: string;
          cancel?: string;
        };
      };
      ui?: {
        clickToCopy?: string;
        you?: string; // Add the 'you' property to the type definition
      };
    };
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  previousMessage, // Add this parameter
  isLast,
  userId,
  onEditMessage,
  onDeleteMessage,
  language = 'en', // Add default value
  translations = {}, 
  // onSubmitSuggestion // This prop might become redundant if only used internally now
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.role === 'user';
  
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [suggestionInput, setSuggestionInput] = useState('');

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
    // When suggesting in a different language, we can add language-specific default text
    const defaultSuggestionPlaceholders = {
      en: "I have a suggestion about this response...",
      fr: "J'ai une suggestion à propos de cette réponse...",
      de: "Ich habe einen Vorschlag zu dieser Antwort...",
      it: "Ho un suggerimento riguardo questa risposta...",
      es: "Tengo una sugerencia sobre esta respuesta..."
    };
    
    // Set initial placeholder text based on language
    const placeholderText = defaultSuggestionPlaceholders[language as keyof typeof defaultSuggestionPlaceholders] || 
                            defaultSuggestionPlaceholders.en;
    
    setSuggestionInput(placeholderText);
    setIsSuggestionModalOpen(true); 
  };

  // Update handleSubmitSuggestion to pass previousMessage with ID
  const handleSubmitSuggestion = async (suggestion: string) => {
    try {
      console.log('Submitting suggestion with userId:', userId);

      if (!userId) {
        console.error('Missing userId for suggestion');
        alert('User ID is required to submit suggestions');
        return;
      }

      // Make sure the message object includes the required properties
      if (!message || !message.text || !message.id) { // Ensure message has id
        console.error('Invalid message object:', message);
        alert('Message content and ID are required for suggestions');
        return;
      }

      // Ensure previousMessage has id if it exists
      if (previousMessage && !previousMessage.id) {
        console.error('Invalid previousMessage object (missing id):', previousMessage);
        // Decide how to handle this - maybe proceed without previous message context?
        // For now, let's log and proceed cautiously.
      }

      // Log the message that will be sent
      console.log('Sending message with suggestion:', message);
      console.log('Previous message context:', previousMessage);

      // Make sure to pass userId here
      await submitSuggestionAPI(
        suggestion,
        message.id,
        userId, // Explicitly pass userId
        {
          id: message.id,
          text: message.text,
          role: message.role
        },
        previousMessage ? {
          id: previousMessage.id,
          text: previousMessage.text,
          role: previousMessage.role
        } : undefined
      );

      setIsSuggestionModalOpen(false);
      setSuggestionInput('');

      console.log('Suggestion submitted successfully');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsSuggestionModalOpen(false);
    setSuggestionInput('');
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
            <div className={cn(
              "flex items-center mb-1 text-xs text-gray-600 dark:text-white",
              isUser ? "justify-end" : "justify-start"
            )}>
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div
              className={cn(
                "px-4 py-3 rounded-2xl",
                isUser
                  ? "bg-[#C72026] text-white rounded-br-none" 
                  : "bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-bl-none text-gray-900 dark:text-gray-100" 
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
            
            {!isUser && !isEditing && (
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 right-0 transform translate-x-8 translate-y-1/2 transition-opacity duration-200">
                <button
                  onClick={handleInsight}
                  className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors duration-200"
                  aria-label="Submit suggestion"
                  title="Submit a suggestion"
                >
                  <Lightbulb className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                </button>
              </div>
            )}
            
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
              <span className="text-xs font-medium">
                {translations?.[language]?.ui?.you || "You"}
              </span>
            </div>
          )}
        </div>
      </div>

      <NewSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={handleCloseModal}
        onSubmit={(suggestion) => handleSubmitSuggestion(suggestion)} // Make sure suggestion is properly passed
        suggestionInput={suggestionInput}
        setSuggestionInput={setSuggestionInput}
        userId={userId} // Make sure userId is properly passed
        language={language || 'en'} // Ensure language has a fallback
        // translations={translations} // Pass the translations object
      />
    </div>
  );
};
