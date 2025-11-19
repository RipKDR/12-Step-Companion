import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useLocation } from "wouter";

interface Props {
  children: ReactNode;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Route-specific error boundary
 * Provides route-aware error handling with recovery actions
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging (could send to error tracking service)
    console.error(`RouteErrorBoundary caught an error in ${this.props.routeName || "unknown route"}:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Something went wrong
                {this.props.routeName && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({this.props.routeName})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred on this page. Don't worry, your data is safe.
              </p>
              {this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground mb-2">
                    Error details
                  </summary>
                  <pre className="bg-muted p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <HomeButton />
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Home button component (needs to be outside class component to use hooks)
 */
function HomeButton() {
  const [, setLocation] = useLocation();
  
  return (
    <Button
      variant="outline"
      onClick={() => setLocation("/")}
      className="flex-1"
    >
      <Home className="h-4 w-4 mr-2" />
      Go Home
    </Button>
  );
}

