import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalRegistrations: number;
  totalStudents: number;
  totalClasses: number;
  todayRegistrations: number;
  totalPresence: number;
  totalVisitors: number;
  totalOfferings: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalStudents: 0,
    totalClasses: 0,
    todayRegistrations: 0,
    totalPresence: 0,
    totalVisitors: 0,
    totalOfferings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total registrations
      const { count: totalRegistrations } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true });

      // Get total students
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("active", true);

      // Get total classes
      const { count: totalClasses } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true });

      // Get today's registrations
      const today = new Date().toISOString().split('T')[0];
      const { count: todayRegistrations } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .gte("registration_date", today + "T00:00:00")
        .lt("registration_date", today + "T23:59:59");

      // Get aggregated data
      const { data: aggregatedData } = await supabase
        .from("registrations")
        .select("total_present, visitors, offering_cash, offering_pix");

      let totalPresence = 0;
      let totalVisitors = 0;
      let totalOfferings = 0;

      if (aggregatedData) {
        aggregatedData.forEach((record) => {
          totalPresence += record.total_present || 0;
          totalVisitors += record.visitors || 0;
          totalOfferings += (parseFloat(String(record.offering_cash || 0)) + parseFloat(String(record.offering_pix || 0)));
        });
      }

      setStats({
        totalRegistrations: totalRegistrations || 0,
        totalStudents: totalStudents || 0,
        totalClasses: totalClasses || 0,
        todayRegistrations: todayRegistrations || 0,
        totalPresence,
        totalVisitors,
        totalOfferings,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.totalClasses}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Registros Totais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.totalRegistrations}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Registros Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">{stats.todayRegistrations}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Presenças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">{stats.totalPresence}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Visitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{stats.totalVisitors}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Ofertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">
            R$ {stats.totalOfferings.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};