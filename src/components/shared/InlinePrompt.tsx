import React, { useEffect, useRef, useState } from 'react';
import { AppModal, AppModalHeader } from './AppModal';

interface InlineConfirmProps {
  variant: 'confirm';
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Style the confirm button as a destructive action. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface InlineInputProps {
  variant: 'input';
  title: string;
  message?: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

type InlinePromptProps = InlineConfirmProps | InlineInputProps;

export const InlinePrompt: React.FC<InlinePromptProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>(
    props.variant === 'input' ? (props.initialValue ?? '') : '',
  );

  useEffect(() => {
    if (props.variant === 'input') inputRef.current?.focus();
  }, [props.variant]);

  const titleId = 'inline-prompt-title';

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (props.variant === 'input') {
      const trimmed = value.trim();
      if (!trimmed) return;
      props.onConfirm(trimmed);
    } else {
      props.onConfirm();
    }
  };

  const confirmClasses =
    props.variant === 'confirm' && props.destructive
      ? 'border-bad bg-bad text-paper hover:bg-bad/90'
      : 'fam-btn-primary';

  const disabled = props.variant === 'input' && !value.trim();

  return (
    <AppModal labelledBy={titleId} onClose={props.onCancel} size="sm" scrollable={false}>
      <AppModalHeader
        title={props.title}
        titleId={titleId}
        onClose={props.onCancel}
        closeLabel={props.cancelLabel}
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        {props.message && <p className="text-[15px] text-ink-2">{props.message}</p>}
        {props.variant === 'input' && (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={props.placeholder}
            className="min-h-11 w-full rounded-lg border border-rule-strong bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-muted"
            maxLength={40}
            autoComplete="off"
          />
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={props.onCancel} className="fam-btn">
            {props.cancelLabel}
          </button>
          <button type="submit" disabled={disabled} className={`fam-btn ${confirmClasses}`}>
            {props.confirmLabel}
          </button>
        </div>
      </form>
    </AppModal>
  );
};
