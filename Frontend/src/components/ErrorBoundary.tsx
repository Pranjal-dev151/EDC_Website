import React from 'react';

interface Props {
  name: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`ErrorBoundary [${this.props.name}]:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert" style={{ padding: 24, border: '1px solid #e63946' }}>
          <p>Section {this.props.name} failed to render.</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error?.message}</pre>
        </section>
      );
    }
    return this.props.children;
  }
}
