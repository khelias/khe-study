/**
 * Lapsevanemale: a four-digit PIN in front of
 * the focus a parent picks for the active learner's path. A forgotten PIN
 * clears only the PIN and the focus, never a learner's progress.
 */

import React, { useState } from 'react';
import { Delete, ShieldCheck } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { focusSubjectsFor, subjectOfSkill } from '../../games/pathCandidates';
import { sameFocus } from '../../meta/path';
import { checkPin, createPin, PIN_LENGTH } from '../../meta/pin';
import type { ParentFocus } from '../../meta/types';
import { AppModal, AppModalHeader } from '../../components/shared';
import { gameTitle } from '../menu/gameTitle';
import { focusTopic, skillName, subjectName } from '../menu/focusTopic';

type Stage = 'set' | 'repeat' | 'enter' | 'forgot' | 'focus';

interface View {
  stage: Stage;
  message?: string;
  /** The PIN typed first, while it is asked again. */
  firstPin?: string;
}

const subjectOfFocus = (focus: ParentFocus | null): string | null =>
  !focus ? null : focus.kind === 'subject' ? focus.subject : subjectOfSkill(focus.skillId);

interface PinPadProps {
  title: string;
  message: string | null;
  onComplete: (pin: string) => void;
  footer?: React.ReactNode;
}

const PinPad: React.FC<PinPadProps> = ({ title, message, onComplete, footer }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const [digits, setDigits] = useState('');

  const press = (digit: string) => {
    const next = digits + digit;
    if (next.length < PIN_LENGTH) {
      setDigits(next);
      return;
    }
    setDigits('');
    onComplete(next);
  };

  return (
    <div className="flex flex-col items-center gap-5 px-5 pb-6 pt-2">
      <p className="text-lg font-semibold">{formatText(title)}</p>
      <div
        className="flex gap-3"
        role="status"
        aria-label={formatText(
          (digits.length === 1 ? t.parent.pinEntered_one : t.parent.pinEntered_other).replace(
            '{count}',
            String(digits.length),
          ),
        )}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={`h-4 w-4 rounded-full border-2 border-ink ${i < digits.length ? 'bg-ink' : ''}`}
          />
        ))}
      </div>
      <p className="min-h-5 text-sm font-semibold text-bad" aria-live="polite">
        {message && formatText(message)}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => press(digit)}
            className="fam-btn h-16 w-16 rounded-full text-2xl tabular-nums"
          >
            {digit}
          </button>
        ))}
        <span aria-hidden />
        <button
          type="button"
          onClick={() => press('0')}
          className="fam-btn h-16 w-16 rounded-full text-2xl tabular-nums"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => setDigits(digits.slice(0, -1))}
          disabled={digits.length === 0}
          aria-label={formatText(t.parent.pinErase)}
          className="fam-icon-btn h-16 w-16 justify-self-center"
        >
          <Delete size={22} aria-hidden />
        </button>
      </div>
      {footer}
    </div>
  );
};

const FocusChooser: React.FC = () => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const learnerName = useGameStore((state) => state.activeLearnerProfile.displayName);
  const focus = useGameStore((state) => state.activeLearnerProfile.meta.focus);
  const ageHint = useGameStore((state) => state.activeLearnerProfile.ageHint);
  const path = useGameStore((state) => state.activeLearnerProfile.meta.path);
  const setParentFocus = useGameStore((state) => state.setParentFocus);
  const openSubject = subjectOfFocus(focus);

  const option = (label: string, value: ParentFocus | null, hint?: string, indent = false) => (
    <label
      key={label}
      className={`fam-row flex min-h-11 cursor-pointer items-center gap-3 py-2.5 ${indent ? 'pl-8' : ''}`}
    >
      <input
        type="radio"
        name="parent-focus"
        checked={sameFocus(focus, value)}
        onChange={() => setParentFocus(value)}
        className="h-5 w-5 shrink-0 accent-[var(--study)]"
      />
      <span className="flex flex-col">
        <span className={indent ? 'text-[15px]' : 'font-semibold'}>{formatText(label)}</span>
        {hint && <span className="text-sm text-muted">{formatText(hint)}</span>}
      </span>
    </label>
  );

  return (
    <div className="px-5 pb-6">
      <p className="mb-3 text-[15px] text-ink-2">{formatText(t.parent.intro)}</p>
      <fieldset>
        <legend className="sr-only">
          {formatText(t.parent.title.replace('{name}', learnerName))}
        </legend>
        {option(t.parent.auto, null, t.parent.autoHint)}
        {focusSubjectsFor(ageHint).map(({ subject, skillIds }) => (
          <React.Fragment key={subject}>
            {option(subjectName(t, subject), {
              kind: 'subject',
              subject,
            })}
            {openSubject === subject &&
              skillIds.map((skillId) =>
                option(skillName(skillId), { kind: 'skill', skillId }, undefined, true),
              )}
          </React.Fragment>
        ))}
      </fieldset>
      {path && (
        <div className="mt-5 rounded-xl bg-sunken p-4" data-testid="parent-preview">
          <p className="fam-label mb-1">
            {formatText(t.parent.preview.replace('{name}', learnerName))}
          </p>
          {focus && (
            <p className="font-semibold">
              {formatText(t.path.focusLine.replace('{topic}', focusTopic(t, focus)))}
            </p>
          )}
          <p className="text-[15px] text-ink-2">
            {path.slots.map((slot) => formatText(gameTitle(t, slot.gameId))).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

interface ParentModalProps {
  onClose: () => void;
}

export const ParentModal: React.FC<ParentModalProps> = ({ onClose }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const learnerName = useGameStore((state) => state.activeLearnerProfile.displayName);
  const parentPin = useGameStore((state) => state.parentPin);
  const setParentPin = useGameStore((state) => state.setParentPin);
  const clearParentPin = useGameStore((state) => state.clearParentPin);
  const ensureTodayPath = useGameStore((state) => state.ensureTodayPath);

  const [view, go] = useState<View>({ stage: parentPin ? 'enter' : 'set' });
  const { stage } = view;

  const open = () => {
    ensureTodayPath();
    go({ stage: 'focus' });
  };

  const pad: Record<'set' | 'repeat' | 'enter', Omit<PinPadProps, 'message'>> = {
    set: { title: t.parent.pinSet, onComplete: (pin) => go({ stage: 'repeat', firstPin: pin }) },
    repeat: {
      title: t.parent.pinRepeat,
      onComplete: (pin) => {
        if (pin !== view.firstPin) {
          go({ stage: 'set', message: t.parent.pinMismatch });
          return;
        }
        void createPin(pin).then((created) => {
          setParentPin(created);
          open();
        });
      },
    },
    enter: {
      title: t.parent.pinEnter,
      onComplete: (pin) => {
        if (!parentPin) return;
        void checkPin(parentPin, pin).then((ok) =>
          ok ? open() : go({ stage: 'enter', message: t.parent.pinWrong }),
        );
      },
      footer: (
        <button
          type="button"
          onClick={() => go({ stage: 'forgot' })}
          className="fam-btn-quiet text-[15px] font-semibold text-ink"
        >
          {formatText(t.parent.forgot)}
        </button>
      ),
    },
  };

  const title =
    stage === 'focus'
      ? t.parent.title.replace('{name}', learnerName)
      : stage === 'forgot'
        ? t.parent.forgot
        : t.parent.entry;

  return (
    <AppModal labelledBy="parent-modal-title" onClose={onClose} size="sm" testId="parent-modal">
      <AppModalHeader
        title={formatText(title)}
        titleId="parent-modal-title"
        icon={<ShieldCheck size={20} aria-hidden />}
        onClose={onClose}
        closeLabel={formatText(t.parent.close)}
      />
      {(stage === 'set' || stage === 'repeat' || stage === 'enter') && (
        <PinPad key={stage} message={view.message ?? null} {...pad[stage]} />
      )}
      {stage === 'forgot' && (
        <div className="flex flex-col gap-4 px-5 pb-6 pt-1">
          <p className="text-[15px] text-ink-2">{formatText(t.parent.forgotBody)}</p>
          <button
            type="button"
            onClick={() => {
              clearParentPin();
              go({ stage: 'set' });
            }}
            className="fam-btn fam-btn-primary w-full"
          >
            {formatText(t.parent.forgotConfirm)}
          </button>
          <button type="button" onClick={() => go({ stage: 'enter' })} className="fam-btn w-full">
            {formatText(t.parent.forgotCancel)}
          </button>
        </div>
      )}
      {stage === 'focus' && <FocusChooser />}
    </AppModal>
  );
};
