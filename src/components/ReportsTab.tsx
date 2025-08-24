import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, FileText, Download } from "lucide-react";
import adCamposLogo from "@/assets/ad-campos-logo.png";

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
  const [noData, setNoData] = useState(false);
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
    setReportData(null);
    setNoData(false);
    
    try {
      const { data: registrations } = await supabase
        .from("registrations")
        .select("*, classes(name)")
        .gte("registration_date", `${date}T00:00:00Z`)
        .lt("registration_date", `${date}T23:59:59Z`);

      if (!registrations || registrations.length === 0) {
        setNoData(true);
        return;
      }
      
      const { data: students } = await supabase.from("students").select("*, classes(name)").eq("active", true);
      if (!students) return;

      const totalEnrolled = students.length;
      let totalPresent = 0, totalVisitors = 0, totalOffering = 0, totalMagazines = 0, totalBibles = 0, cashTotal = 0, pixTotal = 0;

      registrations.forEach(reg => {
        totalPresent += reg.total_present || 0;
        totalVisitors += reg.visitors || 0;
        totalMagazines += reg.magazines || 0;
        totalBibles += reg.bibles || 0;
        cashTotal += parseFloat(String(reg.offering_cash || 0));
        pixTotal += parseFloat(String(reg.offering_pix || 0));
      });
      totalOffering = cashTotal + pixTotal;

      let classDetails = registrations.map(reg => {
        const classStudents = students.filter(s => s.class_id === reg.class_id);
        const enrolled = classStudents.length;
        const present = reg.total_present || 0;
        const offering = (parseFloat(String(reg.offering_cash || 0)) + parseFloat(String(reg.offering_pix || 0)));
        return {
          name: reg.classes?.name || "Classe Desconhecida",
          enrolled,
          present,
          visitors: reg.visitors || 0,
          absent: enrolled - present,
          totalPresent: present + (reg.visitors || 0),
          bibles: reg.bibles || 0,
          magazines: reg.magazines || 0,
          offering,
          rank: ""
        };
      });

      // Simple ranking logic based on offering
      classDetails.sort((a, b) => b.offering - a.offering);
      classDetails = classDetails.map((cd, index) => ({
        ...cd,
        rank: index < 3 ? `${index + 1}°` : "-"
      }));
      
      setReportData({
        totalEnrolled,
        totalPresent,
        totalAbsent: totalEnrolled - totalPresent,
        totalVisitors,
        totalOffering,
        totalMagazines,
        totalBibles,
        magazinesByCategory: { /* Example logic, adjust if needed */
          children: Math.round(totalMagazines * 0.2),
          adolescents: Math.round(totalMagazines * 0.2),
          youth: Math.round(totalMagazines * 0.1),
          newConverts: Math.round(totalMagazines * 0.1),
          adults: Math.round(totalMagazines * 0.3),
          teachers: Math.round(totalMagazines * 0.1),
        },
        topClasses: { /* Example logic */
          children: classDetails.slice(0, 3).map(c => ({ name: c.name, offering: c.offering })),
          adolescents: classDetails.slice(0, 3).map(c => ({ name: c.name, offering: c.offering })),
          adults: classDetails.slice(0, 3).map(c => ({ name: c.name, offering: c.offering })),
        },
        classDetails,
        cashTotal,
        pixTotal
      });

    } catch (error) {
      console.error("Error fetching report data:", error);
      setNoData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchReportData(date);
  };
  
  const GeneralReport = () => (
    <div className="max-w-4xl mx-auto bg-white text-black p-4" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={adCamposLogo} alt="AD Campos Logo" className="w-20 h-20" />
          <div>
            <h1 className="text-xl font-bold">Catedral das Assembleias de Deus em Campos</h1>
            <h2 className="text-lg">Secretaria da Escola Bíblica Dominical - EBD</h2>
            <p className="text-sm text-gray-700">Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">Ano</p>
          <p className="text-5xl font-bold">2025</p>
        </div>
      </div>
      <h3 className="text-xl font-bold text-center mb-2">RELATÓRIO DA ESCOLA BÍBLICA DOMINICAL</h3>
      <div className="flex justify-end items-center mb-4 text-sm">
        <p><strong>Data:</strong> {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 mb-4">
        <div className="space-y-2">
          <div className="border border-black p-2 text-sm flex justify-between"><span>ALUNOS MATRICULADOS:</span><span className="font-bold">{reportData?.totalEnrolled || 0}</span></div>
          <div className="border border-black p-2 text-sm flex justify-between"><span>ALUNOS PRESENTES:</span><span className="font-bold">{reportData?.totalPresent || 0}</span></div>
          <div className="border border-black p-2 text-sm flex justify-between"><span>ALUNOS VISITANTES:</span><span className="font-bold">{reportData?.totalVisitors || 0}</span></div>
          <div className="border border-black p-2 text-sm flex justify-between"><span>ALUNOS AUSENTES:</span><span className="font-bold">{reportData?.totalAbsent || 0}</span></div>
        </div>
        <div className="space-y-2">
          <div className="border border-black p-2 text-sm flex justify-between"><span>TOTAL DE OFERTAS EBD:</span><span className="font-bold">R$ {reportData?.totalOffering.toFixed(2).replace('.', ',') || '0,00'}</span></div>
          <div className="border border-black p-2 text-sm flex justify-between"><span>TOTAL DE REVISTAS EBD, INCLUINDO PROFESSORES:</span><span className="font-bold">{reportData?.totalMagazines || 0}</span></div>
        </div>
      </div>
      <div className="border border-black p-2 mb-4 text-sm flex justify-between">
        <span>TOTAL DE ALUNOS PRESENTES (alunos presentes + alunos visitantes):</span>
        <span className="font-bold">{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</span>
      </div>
      <div className="space-y-1 mb-4 text-sm">
        <div className="border border-black p-2 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Crianças e Juniores):</span><span>{reportData?.magazinesByCategory?.children || 0}</span></div>
        <div className="border border-black p-2 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Adolescentes):</span><span>{reportData?.magazinesByCategory?.adolescents || 0}</span></div>
        <div className="border border-black p-2 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Jovens):</span><span>{reportData?.magazinesByCategory?.youth || 0}</span></div>
        <div className="border border-black p-2 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Novos Convertidos):</span><span>{reportData?.magazinesByCategory?.newConverts || 0}</span></div>
        <div className="border border-black p-2 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Adultos):</span><span>{reportData?.magazinesByCategory?.adults || 0}</span></div>
        <div className="border border-black p-2 flex justify-between"><span>TOTAL DE REVISTAS PROFESSORES EM CLASSE:</span><span>{reportData?.magazinesByCategory?.teachers || 0}</span></div>
      </div>
    </div>
  );

  const ClassesReport = () => (
    <div className="max-w-full mx-auto bg-white text-black p-4" style={{ width: '297mm', minHeight: '210mm', fontFamily: 'Arial, sans-serif' }}>
       <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={adCamposLogo} alt="AD Campos Logo" className="w-20 h-20" />
          <div>
            <h1 className="text-xl font-bold">Catedral das Assembleias de Deus em Campos</h1>
            <h2 className="text-lg">Secretaria da Escola Bíblica Dominical - EBD</h2>
            <p className="text-sm text-gray-700">Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">Ano</p>
          <p className="text-5xl font-bold">2025</p>
          <p className="mt-1 text-sm"><strong>Data:</strong> {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-xs">
          <thead><tr className="bg-gray-200"><th className="border border-black p-1 text-left">Nome da Classe</th><th className="border border-black p-1">Matriculados</th><th className="border border-black p-1">Presentes</th><th className="border border-black p-1">Visitantes</th><th className="border border-black p-1">Ausentes</th><th className="border border-black p-1">Total Presentes</th><th className="border border-black p-1">Bíblias</th><th className="border border-black p-1">Revistas</th><th className="border border-black p-1">Ofertas</th><th className="border border-black p-1">Rank</th></tr></thead>
          <tbody>
            {reportData?.classDetails?.map((classData, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border border-black p-1">{classData.name}</td><td className="border border-black p-1 text-center">{classData.enrolled}</td><td className="border border-black p-1 text-center">{classData.present}</td><td className="border border-black p-1 text-center">{classData.visitors}</td><td className="border border-black p-1 text-center">{classData.absent}</td><td className="border border-black p-1 text-center">{classData.totalPresent}</td><td className="border border-black p-1 text-center">{classData.bibles}</td><td className="border border-black p-1 text-center">{classData.magazines}</td><td className="border border-black p-1 text-center">R$ {classData.offering.toFixed(2).replace('.', ',')}</td><td className="border border-black p-1 text-center">{classData.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 border-2 border-black p-2">
        <h3 className="text-lg font-bold text-center mb-2">TOTAL GERAL</h3>
        <div className="flex justify-around items-center text-center text-sm">
            <div><p>Matriculados</p><p className="font-bold text-lg">{reportData?.totalEnrolled || 0}</p></div>
            <div><p>Ausentes</p><p className="font-bold text-lg">{reportData?.totalAbsent || 0}</p></div>
            <div><p>Visitantes</p><p className="font-bold text-lg">{reportData?.totalVisitors || 0}</p></div>
            <div><p>Total Presentes</p><p className="font-bold text-lg">{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</p></div>
            <div><p>Bíblias</p><p className="font-bold text-lg">{reportData?.totalBibles || 0}</p></div>
            <div><p>Revistas</p><p className="font-bold text-lg">{reportData?.totalMagazines || 0}</p></div>
            <div><p>Ofertas</p><p className="font-bold text-lg">R$ {reportData?.totalOffering.toFixed(2).replace('.', ',') || '0,00'}</p></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Relatórios da EBD</CardTitle>
          <CardDescription>Gere relatórios detalhados das atividades da Escola Bíblica Dominical</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 no-print">
          <div className="flex items-center gap-4">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedDate} onValueChange={handleDateChange}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Selecione uma data" /></SelectTrigger>
              <SelectContent>
                {availableDates.map(date => (
                  <SelectItem key={date} value={date}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedDate && (
            <div className="flex gap-4">
              <Button variant={reportType === "general" ? "default" : "outline"} onClick={() => setReportType("general")}>Relatório Geral (A4)</Button>
              <Button variant={reportType === "classes" ? "default" : "outline"} onClick={() => setReportType("classes")}>Relatório por Classes (A4 Paisagem)</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-muted-foreground">Gerando relatório...</p></div>
      )}

      {noData && !isLoading && selectedDate && (
        <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">Nenhum dado encontrado para a data selecionada.</p></CardContent></Card>
      )}

      {reportData && !isLoading && !noData && (
        <div className="space-y-4">
          <Separator />
          <div className="flex justify-between items-center no-print">
            <h3 className="text-lg font-semibold">{reportType === "general" ? "Visualização: Relatório Geral" : "Visualização: Relatório por Classes"}</h3>
            <Button onClick={() => window.print()} className="flex items-center gap-2"><Download className="h-4 w-4" />Imprimir/Salvar PDF</Button>
          </div>
          <div className="border rounded-lg overflow-auto bg-gray-200 p-4">
            <style>{`
              @media print {
                @page { size: ${reportType === "general" ? "A4 portrait" : "A4 landscape"}; margin: 10mm; }
                body, html { background-color: #fff; }
                .no-print { display: none !important; }
                .printable-area { transform: scale(1); box-shadow: none; border: none; }
              }
            `}</style>
            <div className="printable-area">
              {reportType === "general" ? <GeneralReport /> : <ClassesReport />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
