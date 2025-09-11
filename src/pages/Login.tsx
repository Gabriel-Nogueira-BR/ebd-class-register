import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserCog, ArrowLeft } from "lucide-react";

const Login = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se já existe uma sessão ativa ao carregar a página
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "ebd.secretaria@adcampos.com", // Email fixo, conforme o seu projeto
        password: password,
      });

      if (error) {
        // Trata erros comuns de forma mais amigável
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Senha incorreta. Por favor, tente novamente.");
        }
        throw error;
      }

      // Verificação crucial para garantir que a sessão foi estabelecida
      if (!data.session) {
        throw new Error("Não foi possível estabelecer uma sessão. Tente novamente.");
      }
      
      toast({
        title: "Login bem-sucedido!",
        description: "A redirecionar para o painel de administrador.",
      });
      navigate("/admin");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de Login",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-blue-500/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <UserCog className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl font-bold">Acesso Administrativo</CardTitle>
            <CardDescription>
              Digite a senha para aceder ao painel de controlo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="h-12 text-center text-lg tracking-widest"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg">
                {isLoading ? "A entrar..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
