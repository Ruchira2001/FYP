import { useEffect, useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

let toastId = 0;
let addToastFn: ((text: string, type: 'success' | 'error') => void) | null = null;

export function showToast(text: string, type: 'success' | 'error' = 'success') {
  addToastFn?.(text, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (text, type) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    return () => { addToastFn = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white animate-slide-in ${
            t.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <span className="inline-flex items-center gap-1.5">
            {t.type === 'success' ? <CircleCheck size={16} /> : <CircleX size={16} />}
            {t.text}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
