import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[APEXiq ErrorBoundary]", error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-sm border border-[#1e1e1e] bg-[#0a0a0a] p-8 text-center"
          role="alert"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#e10600]/10 border border-[#e10600]/20">
            <span className="text-xl font-bold text-[#e10600]">!</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Something went wrong
            </p>
            <p className="mt-1 text-xs text-[#666]">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-sm bg-[#e10600] px-4 py-2 text-xs font-medium text-white hover:bg-[#e10600]/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
