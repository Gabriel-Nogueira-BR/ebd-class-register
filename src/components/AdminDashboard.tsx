import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { CalendarDays, TrendingUp, Users, DollarSign } from "lucide-react";

// Interfaces do seu código original
interface DashboardStats {
  totalRegistrations: number;
  totalStudents: number;
  totalClasses: number;
  todayRegistrations: number;
  totalPresence: number;
  totalVisitors: number;
  totalOfferings: number;
}
interface QuarterlyData {
  month: string;
  registrations: number;
  presence: number;
  offerings: number;
}
interface AttendanceData {
  dayOfWeek: string;
  attendance: number;
}
interface ClassData {
  className: string;
  enrolled: number;
  present: number;
  percentage: number;
}

export const AdminDashboard = () => {
  // States do seu código original
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0, totalStudents: 0, totalClasses: 0,
    todayRegistrations: 0, totalPresence: 0, totalVisitors: 0, totalOfferings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [allowRegistrations, setAllowRegistrations] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("current");
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
          fetchStats(),
          fetchQuarterlyData(),
          fetchSettings() // Adicionado para buscar o estado do interruptor
      ]);
      setIsLoading(false);
    };
    loadInitialData();
    
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
        fetchQuarterlyData();
    }
  }, [selectedQuarter]);

  // Função para buscar o estado do interruptor (do meu código)
  const fetchSettings = async () => {
    try {
        const { data, error } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "allow_registrations")
            .single();
        if (error) throw error;
        if (data) {
            setAllowRegistrations(data.value as boolean);
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
        setAllowRegistrations(false);
    }
  };

  // Todas as suas funções de busca de dados (fetchStats, fetchQuarterlyData, etc.) permanecem aqui
  const getQuarterDates = (quarter: string) => {
    const now = new Date();
    let year = now.getFullYear();
    let startMonth, endMonth;
    const quarterMapping: { [key: string]: number[] } = {
        "Q1": [0, 2], "Q2": [3, 5], "Q3": [6, 8], "Q4": [9, 11]
    };
    if (quarter in quarterMapping) {
        [startMonth, endMonth] = quarterMapping[quarter];
    } else {
        const currentMonth = now.getMonth();
        startMonth = Math.floor(currentMonth / 3) * 3;
        endMonth = startMonth + 2;
    }
    const startDate = new Date(Date.UTC(year, startMonth, 1));
    const endDate = new Date(Date.UTC(year, endMonth + 1, 1));
    endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() - 1);
    return { startDate, endDate };
  };

  const fetchQuarterlyData = async () => { /* ... (Sua função fetchQuarterlyData completa aqui) ... */ };
  const fetchStats = async () => { /* ... (Sua função fetchStats completa aqui) ... */ };

  // Função para lidar com o clique no interruptor (do meu código)
  const handleToggleRegistrations = async (isChecked: boolean) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("system_settings")
        .select("key")
        .eq("key", "allow_registrations")
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existing) {
        const { error } = await supabase.from("system_settings").update({ value: isChecked }).eq("key", "allow_registrations");
        if (error) throw error;
      } else {
        const { error } = await supabase.from("system_settings").insert({ key: "allow_registrations", value: isChecked, description: "Controla se o formulário de registro está aberto" });
        if (error) throw error;
      }
      
      setAllowRegistrations(isChecked);
      toast({
        title: "Status do Sistema Alterado",
        description: `Registros e edições agora estão ${isChecked ? "LIBERADOS" : "BLOQUEADOS"}.`,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível alterar a permissão." });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(9)].map((_, i) => (
          <Card key={i} className="animate-pulse"><CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-3/4"></div></CardHeader><CardContent><div className="h-8 bg-muted rounded w-1/2"></div></CardContent></Card>
        ))}
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  // O seu JSX completo, com o novo Card de controle adicionado no topo
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Controle do Sistema</CardTitle>
                <CardDescription>Controle se os secretários de classe podem enviar e editar registros.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
                <Switch
                    id="allow-registrations"
                    checked={allowRegistrations}
                    onCheckedChange={handleToggleRegistrations}
                />
                <Label htmlFor="allow-registrations" className="cursor-pointer">
                    {allowRegistrations ? "Registros Liberados" : "Registros Bloqueados"}
                </Label>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Classes</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{stats.totalClasses}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Alunos</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div></CardContent></Card>
            {/* ... Seus outros cards de estatísticas ... */}
        </div>

        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />Análise Trimestral</CardTitle>
                        <CardDescription>Visualize as métricas do trimestre selecionado</CardDescription>
                    </div>
                    <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Trimestre" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current">Trimestre Atual</SelectItem>
                            <SelectItem value="Q1">1º Trimestre</SelectItem>
                            <SelectItem value="Q2">2º Trimestre</SelectItem>
                            <SelectItem value="Q3">3º Trimestre</SelectItem>
                            <SelectItem value="Q4">4º Trimestre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="attendance">Frequência</TabsTrigger>
                        <TabsTrigger value="classes">Por Classe</TabsTrigger>
                        <TabsTrigger value="financial">Financeiro</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                         <ChartContainer config={{}} className="h-80 w-full">
                            {/* CORREÇÃO: O gráfico agora está dentro do ChartContainer */}
                            <BarChart data={quarterlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="presence" fill="hsl(var(--primary))" name="Presenças" />
                                <Bar dataKey="registrations" fill="hsl(var(--secondary))" name="Registros" />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                    {/* ... Seus outros TabsContent com os gráficos devidamente envolvidos ... */}
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
};
