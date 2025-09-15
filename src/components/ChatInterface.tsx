'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, DesignPrompt, GeneratedDesign } from '@/lib/types';
import { DEPOSIT_AMOUNT } from '@/lib/constants';
import { generateTshirtDesign } from '@/lib/services/openai';
import ChatMessageComponent from './ChatMessage';
import DesignPromptForm from './DesignPromptForm';
import PaymentModal from './PaymentModal';
import DesignEditor from './DesignEditor';
import DesignLoadingState from './DesignLoadingState';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI T-shirt designer. 🎨\n\n**Quick Start:**\n• Describe your design idea\n• Choose an art style and music genre\n• Pay ₹50 deposit to generate your design\n• Customize and order your T-shirt\n\n**Please login first to start designing!**\n\nWhat would you like to design today?',
      timestamp: new Date('2024-01-01T00:00:00Z') // Use stable timestamp
    }
  ]);

  const [currentStep, setCurrentStep] = useState<'chat' | 'payment' | 'design' | 'customization' | 'generating' | 'payment_cancelled' | 'design_completed'>('chat');
  const [designPrompt, setDesignPrompt] = useState<DesignPrompt | null>(null);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [generatedDesignObject, setGeneratedDesignObject] = useState<GeneratedDesign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // const [isGeneratingDesign, setIsGeneratingDesign] = useState(false); // Removed unused variable
  const [showDesignForm, setShowDesignForm] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDesignPrompt = async (prompt: DesignPrompt) => {
    // Check if user is logged in
    if (!user) {
      setDesignPrompt(prompt);
      setShowLoginModal(true);
      return;
    }

    setDesignPrompt(prompt);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `I want a ${prompt.artStyle} style design inspired by ${prompt.musicGenre} music. ${prompt.text}`,
      timestamp: new Date(),
      imageUrl: prompt.imageUrl
    };

    setMessages(prev => [...prev, userMessage]);

    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Great choice! I love the ${prompt.artStyle} style with ${prompt.musicGenre} vibes. Before I generate your design, there's a ₹${DEPOSIT_AMOUNT} deposit fee. This helps cover the AI generation costs. Would you like to proceed with the payment?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setCurrentStep('payment');
    setShowPaymentModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // After login, proceed with the design prompt
    if (designPrompt) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: `I want a ${designPrompt.artStyle} style design inspired by ${designPrompt.musicGenre} music. ${designPrompt.text}`,
        timestamp: new Date(),
        imageUrl: designPrompt.imageUrl
      };

      setMessages(prev => [...prev, userMessage]);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great choice! I love the ${designPrompt.artStyle} style with ${designPrompt.musicGenre} vibes. Before I generate your design, there's a ₹${DEPOSIT_AMOUNT} deposit fee. This helps cover the AI generation costs. Would you like to proceed with the payment?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentStep('payment');
      setShowPaymentModal(true);
    }
  };

  const handlePaymentCancelled = () => {
    setShowPaymentModal(false);
    setCurrentStep('payment_cancelled');
    setShowDesignForm(false);

    // Add a message explaining what happened and offering to try again
    const cancelledMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Payment was cancelled. No worries! You can try again anytime. Click "Start New Design" below to begin again.',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, cancelledMessage]);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    console.log('Payment success, starting design generation...');
    setShowPaymentModal(false);
    setIsLoading(true);
    setCurrentStep('generating');

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Payment received! (Payment ID: ${paymentId.slice(-8)}) I'm now generating your unique design using AI. This may take a few moments...`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, loadingMessage]);
    console.log('Current step set to generating, designPrompt:', designPrompt);

    try {
      if (!designPrompt) {
        throw new Error('No design prompt available');
      }

      // Check if we're in development mode and use mock data if needed
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        console.log('Development mode: Using mock design generation');
        // Simulate AI generation for development
        await new Promise(resolve => setTimeout(resolve, 5000)); // Increased to 5 seconds to see loading state
        const mockDesignUrl = 'https://picsum.photos/400/400?random=1';
        setGeneratedDesign(mockDesignUrl);

        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Perfect! Here\'s your AI-generated design (development mode). You can now customize your T-shirt style, color, size, and print placement. What would you like to do next?',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, successMessage]);
        setCurrentStep('design');
        return;
      }

      // Use real OpenAI service
      const designUrl = await generateTshirtDesign({
        prompt: designPrompt.text,
        artStyle: designPrompt.artStyle,
        musicGenre: designPrompt.musicGenre,
        referenceImage: designPrompt.imageUrl,
      });

      // Create design object
      const designObject: GeneratedDesign = {
        id: `design_${Date.now()}`,
        imageUrl: designUrl,
        prompt: designPrompt,
        userId: user?.id || 'demo-user',
        createdAt: new Date(),
        isPublic: false
      };

      // Use the temporary URL directly - will be saved to FTP after order completion
      setGeneratedDesign(designUrl);
      setGeneratedDesignObject(designObject);

      // Add success message
      const successMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Perfect! Here\'s your design. You can now customize your T-shirt style, color, size, and print placement. What would you like to do next?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);
      setCurrentStep('design');

    } catch (error) {
      console.error('Design generation error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error generating your design. Click "Try Again" to restart the design generation process.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setCurrentStep('chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDesignApproval = () => {
    setCurrentStep('customization');
  };

  const handleCustomizationComplete = () => {
    handleDesignCompleted();
  };

  const handleRestartDesign = () => {
    // Reset to initial state
    setCurrentStep('chat');
    setGeneratedDesign(null);
    setGeneratedDesignObject(null);
    setDesignPrompt(null);
    setIsLoading(false);
    setShowPaymentModal(false);
    setShowDesignForm(false);

    // Clear all messages and reset to initial welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI T-shirt designer. 🎨\n\n**Quick Start:**\n• Describe your design idea\n• Choose an art style and music genre\n• Pay ₹50 deposit to generate your design\n• Customize and order your T-shirt\n\n**Demo Mode Available:** Click the login button to try without registration!\n\nWhat would you like to design today?',
      timestamp: new Date('2024-01-01T00:00:00Z')
    };

    setMessages([welcomeMessage]);
  };

  const handleStartNewDesign = () => {
    setCurrentStep('chat');
    setShowDesignForm(true);
    setDesignPrompt(null);
    setGeneratedDesign(null);
    setGeneratedDesignObject(null);
    setIsLoading(false);
    setShowPaymentModal(false);

    // Add a message about starting new design
    const newDesignMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Great! Let\'s create a new design. Describe your idea below.',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newDesignMessage]);
  };

  const handleDesignCompleted = () => {
    setCurrentStep('design_completed');
    setShowDesignForm(false);

    // Add a message about design completion
    const completedMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Design completed! You can create another design anytime by clicking "Start New Design" below.',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, completedMessage]);
  };

  const handleRegenerateDesign = async () => {
    if (!designPrompt) return;

    setIsLoading(true);
    const loadingMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Generating a new variation of your design...',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Check if we're in development mode and use mock data if needed
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        // Simulate AI generation for development
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockDesignUrl = 'https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 1000);
        setGeneratedDesign(mockDesignUrl);

        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here\'s a new variation of your design (development mode)! How do you like this one?',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, successMessage]);
        return;
      }

      const newDesignUrl = await generateTshirtDesign({
        prompt: designPrompt.text,
        artStyle: designPrompt.artStyle,
        musicGenre: designPrompt.musicGenre,
        referenceImage: designPrompt.imageUrl,
      });

      // Use the temporary URL directly - will be saved to FTP after order completion
      setGeneratedDesign(newDesignUrl);

      const successMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here\'s a new variation of your design! How do you like this one?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Design regeneration error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error generating the new design. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-8 space-y-6">
        {messages.map((message) => (
          <ChatMessageComponent
            key={message.id}
            message={message}
            onRestartDesign={handleRestartDesign}
          />
        ))}

        {currentStep === 'generating' && designPrompt && (
          <div className="mb-6">
            <DesignLoadingState
              prompt={designPrompt.text}
              artStyle={designPrompt.artStyle}
              musicGenre={designPrompt.musicGenre}
            />
          </div>
        )}



        {currentStep === 'design' && generatedDesign && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Generated Design</h3>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={generatedDesign}
                alt="Generated design"
                className="w-64 h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDesignApproval}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Approve & Customize
                </button>
                <button
                  onClick={handleRegenerateDesign}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Regenerate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'customization' && (
          <div>
            <DesignEditor
              design={generatedDesign!}
              designObject={generatedDesignObject!}
              onComplete={handleCustomizationComplete}
            />
          </div>
        )}

        {/* Start New Design Button for payment cancelled and design completed states */}
        {(currentStep === 'payment_cancelled' || currentStep === 'design_completed') && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleStartNewDesign}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Start New Design
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentStep === 'chat' && showDesignForm && (
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md mt-6">
          <DesignPromptForm onSubmit={handleDesignPrompt} />
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancelled}
        onSuccess={handlePaymentSuccess}
        amount={DEPOSIT_AMOUNT}
        description={`AI Design Generation - ${designPrompt?.artStyle} style with ${designPrompt?.musicGenre} theme`}
      />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
