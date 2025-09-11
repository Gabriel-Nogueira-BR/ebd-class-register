import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [userType, setUserType] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "123") {
      sessionStorage.setItem("ebd-admin-access", "true");
      navigate("/admin");
    } else {
      toast({
        variant: "destructive",
        title: "Senha incorreta",
        description: "Por favor, verifique a senha e tente novamente.",
      });
      setPassword("");
    }
  };

  const handleBack = () => {
    setShowPasswordForm(false);
    setUserType("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl text-primary">Sistema EBD 2.0</CardTitle>
          <CardDescription>
            {!showPasswordForm 
              ? "Bem-vindo! Selecione seu tipo de acesso:" 
              : "Digite a senha para acessar a área administrativa"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordForm ? (
            <>
              <Button
                onClick={() => handleUserTypeSelection("class")}
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                size="lg"
              >
                Secretário(a) de Classe
              </Button>
              <Button
                onClick={() => handleUserTypeSelection("ebd")}
                variant="outline"
                className="w-full h-14 text-lg border-primary text-primary hover:bg-primary/10"
                size="lg"
              >
                Secretário(a) da EBD
              </Button>
            </>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  Entrar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
