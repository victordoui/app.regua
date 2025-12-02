
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                    <div className="bg-card border border-destructive/20 p-8 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <AlertTriangle className="h-10 w-10 text-destructive" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Algo deu errado</h1>
                        <p className="text-muted-foreground mb-6">
                            Ocorreu um erro inesperado. Nossa equipe foi notificada.
                        </p>
                        {this.state.error && (
                            <div className="bg-muted p-4 rounded-md text-left mb-6 overflow-auto max-h-40 text-xs font-mono">
                                {this.state.error.toString()}
                            </div>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Recarregar Página
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
