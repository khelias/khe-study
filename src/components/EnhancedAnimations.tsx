// Animations and visual effects
import React, { ReactNode } from 'react';
import { ConfettiPiece } from './shared/Confetti';

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

interface Particle {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

interface EnhancedConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

// Confetti effect
export const EnhancedConfetti: React.FC<EnhancedConfettiProps> = ({ active, onComplete }) => {
  const [particles, setParticles] = React.useState<Particle[]>([]);

  React.useEffect(() => {
    if (!active) return undefined;

    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: 8 + Math.random() * 6,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
    }));

    const showTimer = setTimeout(() => setParticles(newParticles), 0);
    const clearTimer = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(clearTimer);
    };
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-enhanced"
          style={{
            left: `${particle.left}%`,
            top: '-10%',
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          <ConfettiPiece index={particle.id} size={particle.size} />
        </div>
      ))}
      <style>{`
        @keyframes confetti-enhanced {
          0% { 
            transform: translateY(0) rotate(0deg) scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(50vh) rotate(360deg) scale(1.2); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(110vh) rotate(720deg) scale(0.5); 
            opacity: 0; 
          }
        }
        .animate-confetti-enhanced {
          animation: confetti-enhanced 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
