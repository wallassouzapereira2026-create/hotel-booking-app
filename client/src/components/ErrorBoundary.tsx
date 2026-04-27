import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Se for o erro de removeChild (comum com Google Tradutor), 
    // podemos marcar como erro para exibir a tela, ou customizar aqui.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Verificamos se o erro é o famoso problema de DOM do Google Tradutor
    const isDOMError = 
      error.message.includes("removeChild") || 
      error.message.includes("insertBefore") ||
      error.message.includes("Node");

    if (isDOMError) {
      console.warn("Recuperando de erro de DOM (provavelmente causado por tradutor)...");
      // Opcional: Recarregar automaticamente se for esse erro específico
      // window.location.reload(); 
    }
  }

  render() {
    if (this.state.hasError) {
      // Verificamos se é o erro de tradução para mostrar uma mensagem mais amigável
      const isTranslationError = this.state.error?.message.includes("removeChild");

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4 font-semibold text-center">
              {isTranslationError 
                ? "Conflito com o Tradutor do Navegador" 
                : "Ocorreu um erro inesperado."}
            </h2>
            
            <p className="text-center text-muted-foreground mb-6">
              {isTranslationError 
                ? "Detectamos que o tradutor automático do seu navegador causou um conflito. Por favor, tente desativar a tradução para este site."
                : "Não foi possível carregar esta parte da página."}
            </p>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6 max-h-[200px]">
              <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                {this.state.error?.message}
                {"\n\n"}
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-medium",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer transition-all"
              )}
            >
              <RotateCcw size={18} />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
