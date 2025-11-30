import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UserCog, Music4 } from "lucide-react";
import { TodayStatusDialog } from "@/components/TodayStatusDialog";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Sistema de Gestão da EBD</h1>
          <p className="text-muted-foreground mt-2">Selecione uma das opções abaixo para continuar</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText /> Formulário</CardTitle>
              <CardDescription>Registre as informações da aula da sua classe.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/form">
                <Button className="w-full">Aceder ao Formulário</Button>
              </Link>
            </CardContent>
          </Card>

          {/* NOVO CARD PARA OS CORISTAS */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Music4 /> Hinos (Coristas)</CardTitle>
              <CardDescription>Visualize os hinos sugeridos para o louvor.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/coristas">
                <Button variant="outline" className="w-full">Ver Hinos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCog /> Área Administrativa</CardTitle>
              <CardDescription>Acesso restrito para secretários da EBD.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="secondary" className="w-full">Login</Button>
              </Link>
            </CardContent>
          </Card>

          <TodayStatusDialog />
        </div>
      </div>
    </div>
  );
};

export default Index;
