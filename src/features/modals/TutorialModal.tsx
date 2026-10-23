import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Gamepad2,
  Target,
  Heart,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { AppModal } from '../../components/shared';

interface TutorialStep {
  title: string;
  content: string;
  Icon: LucideIcon;
}

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const t = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const TUTORIAL_STEPS: TutorialStep[] = useMemo(
    () => [
      {
        title: t.tutorial.welcome.title,
        content: t.tutorial.welcome.content,
        Icon: BookOpen,
      },
      {
        title: t.tutorial.selectAge.title,
        content: t.tutorial.selectAge.content,
        Icon: Target,
      },
      {
        title: t.tutorial.selectGame.title,
        content: t.tutorial.selectGame.content,
        Icon: Gamepad2,
      },
      {
        title: t.tutorial.answerCorrectly.title,
        content: t.tutorial.answerCorrectly.content,
        Icon: Target,
      },
      {
        title: t.tutorial.beCareful.title,
        content: t.tutorial.beCareful.content,
        Icon: Heart,
      },
      {
        title: t.tutorial.collectAchievements.title,
        content: t.tutorial.collectAchievements.content,
        Icon: Trophy,
      },
    ],
    [t],
  );

  const nextStep = (): void => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step: TutorialStep = TUTORIAL_STEPS[currentStep] ?? TUTORIAL_STEPS[0]!;
  const isLast: boolean = currentStep === TUTORIAL_STEPS.length - 1;
  const StepIcon = step.Icon;

  return (
    <AppModal
      labelledBy="tutorial-modal-title"
      onClose={onClose}
      size="md"
      panelClassName="relative"
      contentClassName="p-6 text-center sm:p-8"
    >
      <button
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          onClose();
        }}
        className="fam-icon-btn absolute right-3 top-3 z-10"
        aria-label={t.tutorial.close}
        type="button"
      >
        <X size={18} aria-hidden />
      </button>
      <div className="mx-auto mb-4 flex items-center justify-center text-muted">
        <StepIcon size={36} aria-hidden />
      </div>
      <h2 id="tutorial-modal-title" className="fam-heading mb-3 px-8">
        {step.title}
      </h2>
      <p className="mb-6 text-base leading-relaxed text-ink-2">{step.content}</p>

      <div className="mb-6 flex items-center justify-center gap-2">
        {TUTORIAL_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === currentStep ? 'w-6 bg-ink' : 'w-2 bg-rule-strong'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {currentStep > 0 && (
          <button onClick={prevStep} className="fam-btn flex-1">
            <ArrowLeft size={18} aria-hidden />
            {t.tutorial.back}
          </button>
        )}
        <button onClick={nextStep} className="fam-btn fam-btn-primary flex-1">
          {isLast ? t.tutorial.startGame : t.tutorial.next}
          {!isLast && <ArrowRight size={18} aria-hidden />}
        </button>
      </div>
    </AppModal>
  );
};
