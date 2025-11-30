import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, description, variant = 'default', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    const toast = { id, title, description, variant, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const variants = {
    default: {
      bg: 'bg-white border-gray-200',
      icon: Info,
      iconColor: 'text-blue-500'
    },
    success: {
      bg: 'bg-white border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    error: {
      bg: 'bg-white border-red-200',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-white border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-500'
    }
  };

  const variant = variants[toast.variant] || variants.default;
  const IconComponent = variant.icon;

  return (
    <div className={`${variant.bg} border rounded-lg shadow-lg p-4 min-w-80 max-w-md animate-in slide-in-from-right`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 ${variant.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return { toast: context.addToast };
}

export { ToastProvider as default };