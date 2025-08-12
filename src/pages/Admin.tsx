import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from "@/components/AdminDashboard";
import { RegistrationsList } from "@/components/RegistrationsList";
import { StudentsManagement } from "@/components/StudentsManagement";
import { ReportsTab } from "@/components/ReportsTab";

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user came from correct login path
    const hasAccess = sessionStorage.getItem("ebd-admin-access");
    if (!hasAccess) {
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("ebd-admin-access");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Área Administrativa - EBD</h1>
            <p className="text-muted-foreground">Gerencie registros, alunos e relatórios</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="registrations">Registros</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="registrations">
            <RegistrationsList />
          </TabsContent>

          <TabsContent value="students">
            <StudentsManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;