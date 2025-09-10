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
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState("current");
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      // Buscar configuração de bloqueio do banco
      const { data: settings } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "allow_registrations")
        .single();
      
      if (settings) {
        setAllowRegistrations(settings.value === true || settings.value === 'true');
      }
      
      await fetchStats();
      await fetchQuarterlyData();
      setIsLoading(false);
    };
    loadInitialData();
    
    const interval = setInterval(fetchStats, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);


  const getQuarterDates = (quarter: string) => {
    const now = new Date();
    const year = now.getFullYear();
    
    let startMonth, endMonth;
    
    switch (quarter) {
      case "Q1":
        startMonth = 0; // Janeiro
        endMonth = 2; // Março
        break;
      case "Q2":
        startMonth = 3; // Abril
        endMonth = 5; // Junho
        break;
      case "Q3":
        startMonth = 6; // Julho
        endMonth = 8; // Setembro
        break;
      case "Q4":
        startMonth = 9; // Outubro
        endMonth = 11; // Dezembro
        break;
      default: // current quarter
        const currentMonth = now.getMonth();
        startMonth = Math.floor(currentMonth / 3) * 3;
        endMonth = startMonth + 2;
    }
    
    // Ajustar para fuso horário de Brasília (-3 UTC)
    const startDate = new Date(year, startMonth, 1, 3, 0, 0);
    const endDate = new Date(year, endMonth + 1, 0, 20, 59, 59);
    
    return { startDate, endDate };
  };

  const fetchQuarterlyData = async () => {
    try {
      const { startDate, endDate } = getQuarterDates(selectedQuarter);
      
      // Buscar dados de registros do trimestre
      const { data: registrations } = await supabase
        .from("registrations")
        .select("registration_date, total_present, visitors, offering_cash, offering_pix, class_id")
        .gte("registration_date", startDate.toISOString())
        .lte("registration_date", endDate.toISOString());
      
      // Buscar classes e alunos
      const { data: classes } = await supabase.from("classes").select("id, name");
      const { data: students } = await supabase.from("students").select("class_id").eq("active", true);
      
      if (registrations && classes) {
        // Processar dados mensais
        const monthlyData: { [key: string]: QuarterlyData } = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        registrations.forEach(reg => {
          const date = new Date(reg.registration_date);
          const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthKey,
              registrations: 0,
              presence: 0,
              offerings: 0
            };
          }
          
          monthlyData[monthKey].registrations++;
          monthlyData[monthKey].presence += (reg.total_present || 0) + (reg.visitors || 0);
          monthlyData[monthKey].offerings += parseFloat(String(reg.offering_cash || 0)) + parseFloat(String(reg.offering_pix || 0));
        });
        
        setQuarterlyData(Object.values(monthlyData));
        
        // Processar dados de frequência por dia da semana
        const weekDayData: { [key: number]: number } = {};
        const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        
        registrations.forEach(reg => {
          const date = new Date(reg.registration_date);
          const dayOfWeek = date.getDay();
          weekDayData[dayOfWeek] = (weekDayData[dayOfWeek] || 0) + (reg.total_present || 0);
        });
        
        const attendanceArray = weekDays.map((day, index) => ({
          dayOfWeek: day,
          attendance: weekDayData[index] || 0
        }));
        
        setAttendanceData(attendanceArray);
        
        // Processar dados por classe
        const classStats: { [key: number]: { enrolled: number; present: number } } = {};
        
        // Contar alunos matriculados por classe
        if (students) {
          students.forEach(student => {
            if (student.class_id) {
              if (!classStats[student.class_id]) {
                classStats[student.class_id] = { enrolled: 0, present: 0 };
              }
              classStats[student.class_id].enrolled++;
            }
          });
        }
        
        // Calcular presenças por classe
        registrations.forEach(reg => {
          if (reg.class_id) {
            if (!classStats[reg.class_id]) {
              classStats[reg.class_id] = { enrolled: 0, present: 0 };
            }
            classStats[reg.class_id].present += reg.total_present || 0;
          }
        });
        
        const classArray = classes.map(cls => ({
          className: cls.name,
          enrolled: classStats[cls.id]?.enrolled || 0,
          present: classStats[cls.id]?.present || 0,
          percentage: classStats[cls.id]?.enrolled 
            ? Math.round((classStats[cls.id].present / (classStats[cls.id].enrolled * registrations.length)) * 100)
            : 0
        }));
        
        setClassData(classArray);
      }
    } catch (error) {
      console.error("Error fetching quarterly data:", error);
    }
  };

  useEffect(() => {
    if (selectedQuarter) {
      fetchQuarterlyData();
    }
  }, [selectedQuarter]);

  const fetchStats = async () => {
    try {
      const { count: totalRegistrations } = await supabase.from("registrations").select("*", { count: "exact", head: true });
      const { count: totalStudents } = await supabase.from("students").select("*", { count: "exact", head: true }).eq("active", true);
      const { count: totalClasses } = await supabase.from("classes").select("*", { count: "exact", head: true });
      const today = new Date().toISOString().split('T')[0];
      const { count: todayRegistrations } = await supabase.from("registrations").select("*", { count: "exact", head: true }).gte("registration_date", `${today}T00:00:00Z`).lt("registration_date", `${today}T23:59:59Z`);
      const { data: aggregatedData } = await supabase.from("registrations").select("total_present, visitors, offering_cash, offering_pix");

      let totalPresence = 0, totalVisitors = 0, totalOfferings = 0;

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
    }
  };

  const handleToggleRegistrations = async () => {
    const newValue = !allowRegistrations;
    setAllowRegistrations(newValue);
    
    // Salvar no banco de dados
    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: "allow_registrations",
        value: newValue,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error updating settings:", error);
      setAllowRegistrations(!newValue); // Reverter em caso de erro
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: newValue ? "Formulário Liberado" : "Formulário Bloqueado",
      description: newValue 
        ? "Os secretários de classe podem enviar registros" 
        : "Apenas visualização está disponível",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(9)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-3/4"></div></CardHeader>
            <CardContent><div className="h-8 bg-muted rounded w-1/2"></div></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-6">
      {/* Controle de Liberação do Formulário */}
      <Card className="bg-gradient-to-br from-slate-500/10 to-slate-500/5 border-slate-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Controle de Acesso ao Formulário</CardTitle>
          <CardDescription>
            Controle se os secretários de classe podem enviar registros
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <Switch
            id="allow-registrations"
            checked={allowRegistrations}
            onCheckedChange={handleToggleRegistrations}
          />
          <Label htmlFor="allow-registrations" className="cursor-pointer">
            {allowRegistrations ? "Formulário Liberado" : "Formulário Bloqueado"}
          </Label>
        </CardContent>
      </Card>
      
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Classes</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">{stats.totalClasses}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Alunos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Registros Totais</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{stats.totalRegistrations}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Registros Hoje</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">{stats.todayRegistrations}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Presenças</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-purple-600">{stats.totalPresence}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Visitantes</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-orange-600">{stats.totalVisitors}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Ofertas</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-yellow-600">R$ {stats.totalOfferings.toFixed(2).replace('.', ',')}</div></CardContent>
        </Card>
      </div>

      {/* Análise Trimestral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Análise Trimestral
              </CardTitle>
              <CardDescription>Visualize as métricas do trimestre selecionado</CardDescription>
            </div>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trimestre" />
              </SelectTrigger>
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

            <TabsContent value="overview" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="registrations" fill="hsl(var(--primary))" name="Registros" />
                    <Bar dataKey="presence" fill="hsl(var(--secondary))" name="Presenças" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="dayOfWeek" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Frequência"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="className" type="category" className="text-xs" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="enrolled" fill="hsl(var(--primary))" name="Matriculados" />
                      <Bar dataKey="present" fill="hsl(var(--secondary))" name="Presentes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ className, percentage }) => `${className}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {classData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total do Trimestre
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {quarterlyData.reduce((acc, curr) => acc + curr.offerings, 0).toFixed(2).replace('.', ',')}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Média Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {(quarterlyData.reduce((acc, curr) => acc + curr.offerings, 0) / (quarterlyData.length || 1)).toFixed(2).replace('.', ',')}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Média por Presença
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {(quarterlyData.reduce((acc, curr) => acc + curr.offerings, 0) / (quarterlyData.reduce((acc, curr) => acc + curr.presence, 0) || 1)).toFixed(2).replace('.', ',')}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="offerings" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Ofertas (R$)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
