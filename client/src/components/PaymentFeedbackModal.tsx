import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  actionButtonText?: string;
  onActionClick?: () => void;
}

export default function PaymentFeedbackModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionButtonText = 'Fechar',
  onActionClick,
}: PaymentFeedbackModalProps) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const titleColor = isSuccess ? 'text-green-600' : 'text-red-600';
  const buttonColor = isSuccess 
    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-border rounded-lg p-8 max-w-md w-full shadow-lg">
        {/* Header com Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-blue-600 font-bold text-sm">Booking</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-6" />

        {/* Icon e Título */}
        <div className="flex items-center gap-3 mb-6">
          <Icon size={32} className={titleColor} />
          <h2 className={`text-xl font-bold ${titleColor}`}>
            {title}
          </h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          {message}
        </p>

        {/* Action Button */}
        <Button
          onClick={() => {
            if (onActionClick) {
              onActionClick();
            }
            onClose();
          }}
          className={`w-full ${buttonColor} font-semibold py-2 rounded transition-colors text-sm`}
        >
          {actionButtonText}
        </Button>
      </div>
    </div>
  );
}
