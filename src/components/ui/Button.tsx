"use client";

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-r from-brand-600 to-navy-600 hover:from-brand-500 hover:to-navy-500 text-white shadow-lg shadow-brand-900/40 focus:ring-brand-500',
      secondary: 'bg-white border border-gray-300 text-brand-700 hover:border-brand-500 hover:text-brand-900 shadow-sm focus:ring-brand-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 focus:ring-red-500',
      ghost: 'text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
      outline: 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base'
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && icon && icon}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
