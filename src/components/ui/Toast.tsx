"use client";

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1a1a1a',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff'
          },
          style: {
            borderLeft: '4px solid #10b981'
          }
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff'
          },
          style: {
            borderLeft: '4px solid #ef4444'
          }
        },
        loading: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fff'
          },
          style: {
            borderLeft: '4px solid #dc2626'
          }
        }
      }}
    />
  );
}
