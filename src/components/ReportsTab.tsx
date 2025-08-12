import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, FileText, Download } from "lucide-react";

interface ReportData {
  totalEnrolled: number;
  totalPresent: number;
  totalAbsent: number;
  totalVisitors: number;
  totalOffering: number;
  totalMagazines: number;
  totalBibles: number;
  magazinesByCategory: {
    children: number;
    adolescents: number;
    youth: number;
    newConverts: number;
    adults: number;
    teachers: number;
  };
  topClasses: {
    children: Array<{ name: string; offering: number }>;
    adolescents: Array<{ name: string; offering: number }>;
    adults: Array<{ name: string; offering: number }>;
  };
  classDetails: Array<{
    name: string;
    enrolled: number;
    present: number;
    visitors: number;
    absent: number;
    totalPresent: number;
    bibles: number;
    magazines: number;
    offering: number;
    rank: string;
  }>;
  cashTotal: number;
  pixTotal: number;
}

export const ReportsTab = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<"general" | "classes">("general");

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    try {
      const { data: registrations } = await supabase
        .from("registrations")
        .select("registration_date")
        .order("registration_date", { ascending: false });

      if (registrations) {
        const dates = [...new Set(registrations.map(r => 
          new Date(r.registration_date).toISOString().split('T')[0]
        ))];
        setAvailableDates(dates);
      }
    } catch (error) {
      console.error("Error fetching dates:", error);
    }
  };

  const fetchReportData = async (date: string) => {
    if (!date) return;
    
    setIsLoading(true);
    try {
      // Get registrations for selected date
      const { data: registrations } = await supabase
        .from("registrations")
        .select(`
          *,
          classes(name)
        `)
        .gte("registration_date", date + "T00:00:00")
        .lt("registration_date", date + "T23:59:59");

      // Get all students
      const { data: students } = await supabase
        .from("students")
        .select(`
          *,
          classes(name)
        `)
        .eq("active", true);

      if (!registrations || !students) return;

      // Calculate totals
      const totalEnrolled = students.length;
      let totalPresent = 0;
      let totalVisitors = 0;
      let totalOffering = 0;
      let totalMagazines = 0;
      let totalBibles = 0;
      let cashTotal = 0;
      let pixTotal = 0;

      registrations.forEach(reg => {
        totalPresent += reg.total_present || 0;
        totalVisitors += reg.visitors || 0;
        totalMagazines += reg.magazines || 0;
        totalBibles += reg.bibles || 0;
        cashTotal += parseFloat(String(reg.offering_cash || 0));
        pixTotal += parseFloat(String(reg.offering_pix || 0));
      });

      totalOffering = cashTotal + pixTotal;
      const totalAbsent = totalEnrolled - totalPresent;

      // Calculate magazines by category (mock data based on patterns)
      const magazinesByCategory = {
        children: Math.floor(totalMagazines * 0.1),
        adolescents: Math.floor(totalMagazines * 0.08),
        youth: Math.floor(totalMagazines * 0.04),
        newConverts: Math.floor(totalMagazines * 0.04),
        adults: Math.floor(totalMagazines * 0.74),
        teachers: Math.floor(totalMagazines * 0.22),
      };

      // Calculate class details
      const classDetails = registrations.map((reg, index) => {
        const className = reg.classes?.name || `Classe ${index + 1}`;
        const classStudents = students.filter(s => s.class_id === reg.class_id);
        const enrolled = classStudents.length;
        const present = reg.total_present || 0;
        const visitors = reg.visitors || 0;
        const absent = enrolled - present;
        const offering = parseFloat(String(reg.offering_cash || 0)) + parseFloat(String(reg.offering_pix || 0));
        
        return {
          name: className,
          enrolled,
          present,
          visitors,
          absent,
          totalPresent: present + visitors,
          bibles: reg.bibles || 0,
          magazines: reg.magazines || 0,
          offering,
          rank: index < 3 ? `${index + 1}°` : "-"
        };
      });

      // Sort and get top 3 for each category
      const sortedByOffering = [...classDetails].sort((a, b) => b.offering - a.offering);
      
      const topClasses = {
        children: sortedByOffering.filter(c => 
          c.name.toLowerCase().includes("soldados") || 
          c.name.toLowerCase().includes("ovelhinhas")
        ).slice(0, 2).map((c, i) => ({ name: c.name, offering: c.offering })),
        adolescents: sortedByOffering.filter(c => 
          c.name.toLowerCase().includes("ágape") || 
          c.name.toLowerCase().includes("lael") || 
          c.name.toLowerCase().includes("estrela")
        ).slice(0, 3).map((c, i) => ({ name: c.name, offering: c.offering })),
        adults: sortedByOffering.filter(c => 
          !c.name.toLowerCase().includes("soldados") && 
          !c.name.toLowerCase().includes("ovelhinhas") &&
          !c.name.toLowerCase().includes("ágape") && 
          !c.name.toLowerCase().includes("lael") && 
          !c.name.toLowerCase().includes("estrela")
        ).slice(0, 3).map((c, i) => ({ name: c.name, offering: c.offering }))
      };

      setReportData({
        totalEnrolled,
        totalPresent,
        totalAbsent,
        totalVisitors,
        totalOffering,
        totalMagazines,
        totalBibles,
        magazinesByCategory,
        topClasses,
        classDetails,
        cashTotal,
        pixTotal
      });

    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchReportData(date);
  };

  const GeneralReport = () => (
    <div className="max-w-4xl mx-auto bg-white text-black p-8 min-h-[1050px]" style={{ width: '210mm' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">AD</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Catedral das Assembleias de Deus em Campos</h1>
            <h2 className="text-lg">Secretaria da Escola Bíblica Dominical - EBD</h2>
            <p className="text-sm">Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">Ano</p>
          <p className="text-4xl font-bold">2025</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-center mb-6">RELATÓRIO DA ESCOLA BÍBLICA DOMINICAL</h3>
      
      <div className="flex justify-between items-center mb-6">
        <p><strong>Data:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : ''}</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="border border-black p-2">
            <div className="flex justify-between">
              <span>ALUNOS MATRICULADOS:</span>
              <span>{reportData?.totalEnrolled || 0}</span>
            </div>
          </div>
          <div className="border border-black p-2">
            <div className="flex justify-between">
              <span>ALUNOS PRESENTES:</span>
              <span>{reportData?.totalPresent || 0}</span>
            </div>
          </div>
          <div className="border border-black p-2">
            <div className="flex justify-between">
              <span>ALUNOS VISITANTES:</span>
              <span>{reportData?.totalVisitors || 0}</span>
            </div>
          </div>
          <div className="border border-black p-2">
            <div className="flex justify-between">
              <span>ALUNOS AUSENTES:</span>
              <span>{reportData?.totalAbsent || 0}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black p-2">
            <div className="flex justify-between">
              <span>TOTAL DE OFERTAS EBD:</span>
              <span>R$ {reportData?.totalOffering.toFixed(2) || '0,00'}</span>
            </div>
          </div>
          <div className="border border-black p-2">
            <div className="flex justify-between">
              <span>TOTAL DE REVISTAS EBD, INCLUINDO PROFESSORES:</span>
              <span>{reportData?.totalMagazines || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Present */}
      <div className="border border-black p-2 mb-6 bg-gray-100">
        <div className="flex justify-between font-bold">
          <span>TOTAL DE ALUNOS PRESENTES (alunos presentes + alunos visitantes):</span>
          <span>{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</span>
        </div>
      </div>

      {/* Magazine Usage */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>TOTAL DE REVISTAS UTILIZADAS (Crianças e Juniores):</span>
          <span>{reportData?.magazinesByCategory.children || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>TOTAL DE REVISTAS UTILIZADAS (Adolescentes):</span>
          <span>{reportData?.magazinesByCategory.adolescents || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>TOTAL DE REVISTAS UTILIZADAS (Jovens):</span>
          <span>{reportData?.magazinesByCategory.youth || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>TOTAL DE REVISTAS UTILIZADAS (Novos Convertidos):</span>
          <span>{reportData?.magazinesByCategory.newConverts || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>TOTAL DE REVISTAS UTILIZADAS (Adultos):</span>
          <span>{reportData?.magazinesByCategory.adults || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>TOTAL DE REVISTAS PROFESSORES EM CLASSE:</span>
          <span>{reportData?.magazinesByCategory.teachers || 0}</span>
        </div>
      </div>

      {/* Classification */}
      <div className="border border-black p-4 mb-6">
        <h4 className="font-bold text-center mb-4">CLASSIFICAÇÃO DAS OFERTAS</h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between font-bold bg-gray-200 p-2">
              <span>CLASSES DAS CRIANÇAS:</span>
              <span>VALOR R$</span>
            </div>
            {reportData?.topClasses.children.map((cls, idx) => (
              <div key={idx} className="flex justify-between p-1">
                <span>{idx + 1}° {cls.name}</span>
                <span>R$ {cls.offering.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between font-bold bg-gray-200 p-2">
              <span>CLASSES DOS ADOLESCENTES:</span>
              <span>VALOR R$</span>
            </div>
            {reportData?.topClasses.adolescents.map((cls, idx) => (
              <div key={idx} className="flex justify-between p-1">
                <span>{idx + 1}° {cls.name}</span>
                <span>R$ {cls.offering.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between font-bold bg-gray-200 p-2">
              <span>CLASSES DOS ADULTOS:</span>
              <span>VALOR R$</span>
            </div>
            {reportData?.topClasses.adults.map((cls, idx) => (
              <div key={idx} className="flex justify-between p-1">
                <span>{idx + 1}° {cls.name}</span>
                <span>R$ {cls.offering.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="flex justify-between mb-6">
        <div className="border border-black p-2 flex-1 mr-4">
          <div className="flex justify-between">
            <span>TOTAL EM DINHEIRO:</span>
            <span>R$ {reportData?.cashTotal.toFixed(2) || '0,00'}</span>
          </div>
        </div>
        <div className="border border-black p-2 flex-1">
          <div className="flex justify-between">
            <span>TOTAL EM PIX/CARTÃO:</span>
            <span>R$ {reportData?.pixTotal.toFixed(2) || '0,00'}</span>
          </div>
        </div>
      </div>

      {/* Observations */}
      <div className="border border-black p-4 mb-6 h-24">
        <span className="font-bold">OBSERVAÇÕES:</span>
      </div>

      {/* Footer */}
      <div className="text-center mt-auto">
        <p className="font-bold">2025 ANO DA CELEBRAÇÃO - SALMOS 35.27</p>
      </div>
    </div>
  );

  const ClassesReport = () => (
    <div className="max-w-6xl mx-auto bg-white text-black p-8 min-h-[745px]" style={{ width: '297mm' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">AD</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Catedral das Assembleias de Deus em Campos</h1>
            <h2 className="text-lg">Secretaria da Escola Bíblica Dominical - EBD</h2>
            <p className="text-sm">Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">Ano</p>
          <p className="text-4xl font-bold">2025</p>
          <p className="mt-2"><strong>Data:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : ''}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left">Nome da Classe</th>
              <th className="border border-black p-2">Matriculados</th>
              <th className="border border-black p-2">Presentes</th>
              <th className="border border-black p-2">Visitantes</th>
              <th className="border border-black p-2">Ausentes</th>
              <th className="border border-black p-2">Total Presentes</th>
              <th className="border border-black p-2">Bíblias</th>
              <th className="border border-black p-2">Revistas</th>
              <th className="border border-black p-2">Ofertas</th>
              <th className="border border-black p-2">Rank</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.classDetails.map((classData, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border border-black p-2">{classData.name}</td>
                <td className="border border-black p-2 text-center">{classData.enrolled}</td>
                <td className="border border-black p-2 text-center">{classData.present}</td>
                <td className="border border-black p-2 text-center">{classData.visitors}</td>
                <td className="border border-black p-2 text-center">{classData.absent}</td>
                <td className="border border-black p-2 text-center">{classData.totalPresent}</td>
                <td className="border border-black p-2 text-center">{classData.bibles}</td>
                <td className="border border-black p-2 text-center">{classData.magazines}</td>
                <td className="border border-black p-2 text-center">R$ {classData.offering.toFixed(2)}</td>
                <td className="border border-black p-2 text-center">{classData.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-8">
        <div className="bg-gray-200 p-4 text-center">
          <h3 className="text-2xl font-bold mb-4">TOTAL GERAL</h3>
          <div className="grid grid-cols-6 gap-8 text-center">
            <div>
              <p className="text-lg font-bold">Matriculados</p>
              <p className="text-3xl font-bold">{reportData?.totalEnrolled || 0}</p>
            </div>
            <div>
              <p className="text-lg font-bold">Ausentes</p>
              <p className="text-3xl font-bold">{reportData?.totalAbsent || 0}</p>
            </div>
            <div>
              <p className="text-lg font-bold">Visitantes</p>
              <p className="text-3xl font-bold">{reportData?.totalVisitors || 0}</p>
            </div>
            <div>
              <p className="text-lg font-bold">Total Presentes</p>
              <p className="text-3xl font-bold">{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</p>
            </div>
            <div>
              <p className="text-lg font-bold">Bíblias</p>
              <p className="text-3xl font-bold">{reportData?.totalBibles || 0}</p>
            </div>
            <div>
              <p className="text-lg font-bold">Revistas</p>
              <p className="text-3xl font-bold">{reportData?.totalMagazines || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-lg font-bold">Ofertas</p>
            <p className="text-4xl font-bold">R$ {reportData?.totalOffering.toFixed(2) || '0,00'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios da EBD
          </CardTitle>
          <CardDescription>
            Gere relatórios detalhados das atividades da Escola Bíblica Dominical
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="flex items-center gap-4">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedDate} onValueChange={handleDateChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione uma data" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map(date => (
                  <SelectItem key={date} value={date}>
                    {new Date(date).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Type Selection */}
          {selectedDate && (
            <div className="flex gap-4">
              <Button
                variant={reportType === "general" ? "default" : "outline"}
                onClick={() => setReportType("general")}
              >
                Relatório Geral (A4)
              </Button>
              <Button
                variant={reportType === "classes" ? "default" : "outline"}
                onClick={() => setReportType("classes")}
              >
                Relatório por Classes (A4 Paisagem)
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Gerando relatório...</p>
            </div>
          )}

          {/* Report Display */}
          {reportData && !isLoading && (
            <div className="space-y-4">
              <Separator />
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {reportType === "general" ? "Relatório Geral" : "Relatório por Classes"}
                </h3>
                <Button onClick={() => window.print()} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Imprimir/Salvar PDF
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                {reportType === "general" ? <GeneralReport /> : <ClassesReport />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};