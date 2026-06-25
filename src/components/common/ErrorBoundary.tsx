import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

//error 여부 state
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            문제가 발생했습니다
          </p>
          <p className="mt-2 text-sm text-gray-500">
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }
}
