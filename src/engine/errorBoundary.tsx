// Error boundary component for React
import { Component, ErrorInfo, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { getTranslations } from '../i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Game error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const t = getTranslations();
      return (
        <div className="theme-shell flex min-h-screen flex-col items-center justify-center bg-paper p-4 text-center">
          <CircleAlert size={40} className="mb-4 text-muted" aria-hidden />
          <h2 className="fam-title mb-2">{t.errors.somethingWentWrong}</h2>
          <p className="mb-6 max-w-md text-[15px] text-ink-2">{t.errors.gameError}</p>
          <button onClick={() => window.location.reload()} className="fam-btn fam-btn-primary">
            {t.errors.refreshPage}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
