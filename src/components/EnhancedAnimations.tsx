// Animations and visual effects
import React, { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
}

// Fade in animation for new tasks
export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0 }) => {
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      {children}
      <style>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
