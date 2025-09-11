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

// ... (Interfaces)

export const AdminDashboard = () => {
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
          fetchSettings()
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

  const getQuarterDates = (quarter: string) => { /* ... (Sua função getQuarterDates) ... */ return { startDate: new Date(), endDate: new Date() }; };
  const fetchQuarterlyData = async () => { /* ... (Sua função fetchQuarterlyData) ... */ };
  const fetchStats = async () => { /* ... (Sua função fetchStats) ... */ };
  
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
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Registros Totais</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{stats.totalRegistrations}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Registros Hoje</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-emerald-600">{stats.todayRegistrations}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Presenças</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">{stats.totalPresence}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Visitantes</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-orange-600">{stats.totalVisitors}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 md:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Ofertas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-yellow-600">R$ {stats.totalOfferings.toFixed(2).replace('.', ',')}</div></CardContent></Card>
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

                    {/* CORREÇÃO APLICADA AQUI */}
                    <ChartContainer config={{}} className="h-[400px] w-full">
                        <TabsContent value="overview">
                            <BarChart data={quarterlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="presence" fill="hsl(var(--primary))" name="Presenças" />
                                <Bar dataKey="registrations" fill="hsl(var(--secondary))" name="Registros" />
                            </BarChart>
                        </TabsContent>
                        <TabsContent value="classes">
                           <BarChart data={classData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="className" type="category" width={150} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="present" fill="hsl(var(--primary))" name="Presentes" stackId="a" />
                                <Bar dataKey="enrolled" fill="hsl(var(--muted))" name="Matriculados" stackId="a" />
                           </BarChart>
                        </TabsContent>
                    </ChartContainer>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
};
