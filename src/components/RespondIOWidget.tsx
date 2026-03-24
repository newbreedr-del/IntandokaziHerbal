"use client";

import { useEffect } from 'react';

/**
 * Respond.io Chat Widget Component
 * Embeds the Respond.io chat widget on your site
 */

interface RespondIOWidgetProps {
  workspaceId?: string;
  hideOnMobile?: boolean;
}

export default function RespondIOWidget({ 
  workspaceId, 
  hideOnMobile = false 
}: RespondIOWidgetProps) {
  useEffect(() => {
    // Get workspace ID from env or props
    const wsId = workspaceId || process.env.NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID;
    
    if (!wsId) {
      console.warn('Respond.io workspace ID not configured');
      return;
    }

    // Load Respond.io widget script
    const script = document.createElement('script');
    script.src = `https://cdn.respond.io/webchat/widget/${wsId}.js`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Respond.io widget loaded');
      
      // Configure widget
      if (typeof window !== 'undefined' && (window as any).RespondIO) {
        (window as any).RespondIO.init({
          workspaceId: wsId,
          // Customization options
          position: 'bottom-right',
          color: '#dc2626', // Brand red
          greeting: 'Hi! 👋 How can we help you today?',
          placeholder: 'Type your message...',
          hideOnMobile: hideOnMobile,
          // Pre-fill user data if available
          user: {
            // These can be populated from your auth system
            // name: user?.name,
            // email: user?.email,
            // phone: user?.phone
          }
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [workspaceId, hideOnMobile]);

  // The widget is injected by the script, no visual component needed
  return null;
}
