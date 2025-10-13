import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
    children: Array<{ name: string; offering: number; rank: string }>;
    adolescents: Array<{ name: string; offering: number; rank: string }>;
    adults: Array<{ name: string; offering: number; rank: string }>;
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

// Componentes do Relatório (definidos fora para melhor performance)
const GeneralReport = ({
  reportData,
  selectedDate,
  ebdObservations,
}: {
  reportData: ReportData | null;
  selectedDate: string;
  ebdObservations?: string;
}) => (
  <>
    <img src={adCamposLogo} alt="AD Campos Logo" className="report-logo" />
    <h1>Catedral das Assembleias de Deus em Campos</h1>
    <h2>Secretaria da Escola Bíblica Dominical - EBD</h2>
    <p>Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
    <p>Ano 2025</p>

    <h3>RELATÓRIO DA ESCOLA BÍBLICA DOMINICAL</h3>
    <p className="report-date">
      Data: {selectedDate ? new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('pt-BR') : ''}
    </p>

    <div className="stats-section">
      <div className="stat-line">ALUNOS MATRICULADOS: {reportData?.totalEnrolled || 0}</div>
      <div className="stat-line">ALUNOS PRESENTES: {reportData?.totalPresent || 0}</div>
      <div className="stat-line">ALUNOS VISITANTES: {reportData?.totalVisitors || 0}</div>
      <div className="stat-line">ALUNOS AUSENTES: {reportData?.totalAbsent || 0}</div>
      <div className="stat-line">
        TOTAL DE OFERTAS EBD: R$ {reportData?.totalOffering.toFixed(2).replace('.', ',') || '0,00'}
      </div>
      <div className="stat-line">
        TOTAL DE REVISTAS EBD, INCLUINDO PROFESSORES: {reportData?.totalMagazines || 0}
      </div>
      <div className="stat-line">
        TOTAL DE ALUNOS PRESENTES (alunos presentes + alunos visitantes): {(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}
      </div>
      <div className="stat-line">
        TOTAL DE REVISTAS UTILIZADAS (Crianças e Juniores): {reportData?.magazinesByCategory?.children || 0}
      </div>
      <div className="stat-line">
        TOTAL DE REVISTAS UTILIZADAS (Adolescentes): {reportData?.magazinesByCategory?.adolescents || 0}
      </div>
      <div className="stat-line">
        TOTAL DE REVISTAS UTILIZADAS (Jovens): {reportData?.magazinesByCategory?.youth || 0}
      </div>
      <div className="stat-line">
        TOTAL DE REVISTAS UTILIZADAS (Novos Convertidos): {reportData?.magazinesByCategory?.newConverts || 0}
      </div>
      <div className="stat-line">
        TOTAL DE REVISTAS UTILIZADAS (Adultos): {reportData?.magazinesByCategory?.adults || 0}
      </div>
      <div className="stat-line">
        TOTAL DE REVISTAS PROFESSORES EM CLASSE: {reportData?.magazinesByCategory?.teachers || 0}
      </div>
    </div>

    <h4>CLASSIFICAÇÃO DAS OFERTAS</h4>

    <div className="class-section">
      <div className="section-header">CLASSES DAS CRIANÇAS: VALOR R$</div>
      {reportData?.topClasses?.children.map((cls) => (
        <div key={cls.name} className="class-line">
          {cls.rank} {cls.name} R$ {cls.offering.toFixed(2).replace('.', ',')}
        </div>
      ))}

      <div className="section-header">CLASSES DOS ADOLESCENTES: VALOR R$</div>
      {reportData?.topClasses?.adolescents.map((cls) => (
        <div key={cls.name} className="class-line">
          {cls.rank} {cls.name} R$ {cls.offering.toFixed(2).replace('.', ',')}
        </div>
      ))}

      <div className="section-header">CLASSES DOS ADULTOS: VALOR R$</div>
      {reportData?.topClasses?.adults.map((cls) => (
        <div key={cls.name} className="class-line">
          {cls.rank} {cls.name} R$ {cls.offering.toFixed(2).replace('.', ',')}
        </div>
      ))}
    </div>

    <div className="totals-section">
      <div className="total-line">TOTAL EM DINHEIRO: R$ {reportData?.cashTotal.toFixed(2).replace('.', ',') || '0,00'}</div>
      <div className="total-line">TOTAL EM PIX/CARTÃO: R$ {reportData?.pixTotal.toFixed(2).replace('.', ',') || '0,00'}</div>
    </div>

    <p className="observations">OBSERVAÇÕES: {ebdObservations}</p>

    <p className="footer">2025 ANO DA CELEBRAÇÃO - SALMOS 35.27</p>
  </>
);

const ClassesReport = ({ reportData, selectedDate }: { reportData: ReportData | null; selectedDate: string }) => {
  // Separar classes por faixa etária e ordenar por nome
  const childrenClasses = reportData?.classDetails?.filter(c => 
    c.name.includes("SOLDADOS") || c.name.includes("OVELHINHAS")
  ) || [];
  
  const adolescentsClasses = reportData?.classDetails?.filter(c => 
    c.name.includes("ESTRELA") || c.name.includes("LAEL") || c.name.includes("ÁGAPE")
  ) || [];
  
  const adultsClasses = reportData?.classDetails?.filter(c => 
    !childrenClasses.some(child => child.name === c.name) && 
    !adolescentsClasses.some(adol => adol.name === c.name)
  ) || [];

  // Função para calcular ranking por faixa etária (top 3 apenas)
  const calculateRanking = (classes: typeof childrenClasses) => {
    const sortedByOffering = [...classes].sort((a, b) => b.offering - a.offering);
    return classes.map(c => {
      const position = sortedByOffering.findIndex(sc => sc.name === c.name) + 1;
      return { ...c, rank: position <= 3 ? `${position}°` : '-' };
    }).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Aplicar ranking e ordenar por nome
  const rankedChildren = calculateRanking(childrenClasses);
  const rankedAdolescents = calculateRanking(adolescentsClasses);
  const rankedAdults = calculateRanking(adultsClasses);

  // Combinar todas as classes na ordem: crianças, adolescentes, adultos
  const allClassesOrdered = [...rankedChildren, ...rankedAdolescents, ...rankedAdults];

  return (
    <div className="bg-white text-black px-6 py-4" style={{ width: '280mm', height: '193mm', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <header className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src={adCamposLogo} alt="AD Campos Logo" className="w-14 h-14" />
          <div>
            <h1 className="text-sm font-bold">Catedral das Assembleias de Deus em Campos</h1>
            <h2 className="text-xs">Secretaria da Escola Bíblica Dominical - EBD</h2>
            <p className="text-[10px] text-gray-700">Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold">Ano 2025</p>
          <p className="text-[10px]"><strong>Data:</strong> {selectedDate ? new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('pt-BR') : ''}</p>
        </div>
      </header>
      <div>
        <table className="w-full border-collapse border border-black text-[12px]">
          <thead><tr className="bg-gray-200 font-bold"><th className="border border-black px-2 py-1.5 text-left">Nome da Classe</th><th className="border border-black px-2 py-1.5">Matriculados</th><th className="border border-black px-2 py-1.5">Presentes</th><th className="border border-black px-2 py-1.5">Visitantes</th><th className="border border-black px-2 py-1.5">Ausentes</th><th className="border border-black px-2 py-1.5">Total Presentes</th><th className="border border-black px-2 py-1.5">Bíblias</th><th className="border border-black px-2 py-1.5">Revistas</th><th className="border border-black px-2 py-1.5">Ofertas</th><th className="border border-black px-2 py-1.5">Rank</th></tr></thead>
          <tbody>
            {allClassesOrdered.map((classData, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-1.5">{classData.name}</td><td className="border border-black px-2 py-1.5 text-center">{classData.enrolled}</td><td className="border border-black px-2 py-1.5 text-center">{classData.present}</td><td className="border border-black px-2 py-1.5 text-center">{classData.visitors}</td><td className="border border-black px-2 py-1.5 text-center">{classData.absent}</td><td className="border border-black px-2 py-1.5 text-center">{classData.totalPresent}</td><td className="border border-black px-2 py-1.5 text-center">{classData.bibles}</td><td className="border border-black px-2 py-1.5 text-center">{classData.magazines}</td><td className="border border-black px-2 py-1.5 text-center">R$ {classData.offering.toFixed(2).replace('.', ',')}</td><td className="border border-black px-2 py-1.5 text-center font-bold">{classData.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 border-2 border-black p-2">
        <h3 className="text-sm font-bold text-center mb-1">TOTAL GERAL</h3>
        <div className="flex justify-around items-center text-center text-xs">
            <div><p>Matriculados</p><p className="font-bold text-base">{reportData?.totalEnrolled || 0}</p></div>
            <div><p>Ausentes</p><p className="font-bold text-base">{reportData?.totalAbsent || 0}</p></div>
            <div><p>Visitantes</p><p className="font-bold text-base">{reportData?.totalVisitors || 0}</p></div>
            <div><p>Total Presentes</p><p className="font-bold text-base">{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</p></div>
            <div><p>Bíblias</p><p className="font-bold text-base">{reportData?.totalBibles || 0}</p></div>
            <div><p>Revistas</p><p className="font-bold text-base">{reportData?.totalMagazines || 0}</p></div>
            <div><p>Ofertas</p><p className="font-bold text-base">R$ {reportData?.totalOffering.toFixed(2).replace('.', ',') || '0,00'}</p></div>
        </div>
      </div>
      <div className="text-center mt-1" style={{ marginTop: 'auto' }}>
        <p className="font-bold text-xs">2025 ANO DA CELEBRAÇÃO - SALMOS 35.27</p>
      </div>
    </div>
  );
};


export const ReportsTab = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [reportType, setReportType] = useState<"general" | "classes">("general");
  const [ebdObservations, setEbdObservations] = useState<string>("");
  const printableAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    try {
      const { data } = await supabase.from("registrations").select("registration_date").order("registration_date", { ascending: false });
      if (data) {
        const dates = [...new Set(data.map(r => new Date(r.registration_date).toISOString().split('T')[0]))];
        setAvailableDates(dates);
      }
    } catch (error) { console.error("Error fetching dates:", error); }
  };

  const fetchReportData = async (date: string) => {
    if (!date) return;
    setIsLoading(true);
    setReportData(null);
    setNoData(false);
    try {
      // Ajustar para buscar do início ao fim do dia na data selecionada
      const startDate = new Date(date + 'T00:00:00.000Z');
      const endDate = new Date(date + 'T23:59:59.999Z');
      
      const { data: registrations } = await supabase
        .from("registrations")
        .select("*, classes(name)")
        .gte("registration_date", startDate.toISOString())
        .lte("registration_date", endDate.toISOString());

      if (!registrations || registrations.length === 0) {
        setNoData(true);
        return;
      }
      
      const { data: students } = await supabase.from("students").select("*, classes(id, name)").eq("active", true);
      if (!students) {
        setNoData(true);
        return;
      };

      const totalEnrolled = students.length;
      let totalPresent = 0, totalVisitors = 0, totalMagazines = 0, totalBibles = 0, cashTotal = 0, pixTotal = 0;
      registrations.forEach(reg => {
        totalPresent += reg.total_present || 0;
        totalVisitors += reg.visitors || 0;
        totalMagazines += reg.magazines || 0;
        totalBibles += reg.bibles || 0;
        cashTotal += parseFloat(String(reg.offering_cash || 0));
        pixTotal += parseFloat(String(reg.offering_pix || 0));
      });
      const totalOffering = cashTotal + pixTotal;

      const classDetails = registrations.map(reg => {
        const classStudents = students.filter(s => s.class_id === reg.class_id);
        const enrolled = classStudents.length;
        const present = reg.total_present || 0;
        const offering = (parseFloat(String(reg.offering_cash || 0)) + parseFloat(String(reg.offering_pix || 0)));
        return {
          name: reg.classes?.name || "Classe Desconhecida", enrolled, present,
          visitors: reg.visitors || 0, absent: enrolled - present, totalPresent: present + (reg.visitors || 0),
          bibles: reg.bibles || 0, magazines: reg.magazines || 0,
          offering, rank: ""
        };
      });

      const sortedByOffering = [...classDetails].sort((a, b) => b.offering - a.offering);
      const getTopN = (items: typeof classDetails, n: number) => {
        return items.slice(0, n).map((item, index) => ({ ...item, rank: `${index + 1}°` }));
      };
      
      const childrenClasses = sortedByOffering.filter(c => c.name.includes("SOLDADOS") || c.name.includes("OVELHINHAS"));
      const adolescentsClasses = sortedByOffering.filter(c => c.name.includes("ESTRELA") || c.name.includes("LAEL") || c.name.includes("ÁGAPE"));
      const adultsClasses = sortedByOffering.filter(c => !childrenClasses.some(child => child.name === c.name) && !adolescentsClasses.some(adol => adol.name === c.name));
      
      classDetails.sort((a, b) => a.name.localeCompare(b.name));

      // Observação: agora o campo ebd_notes será preenchido diretamente na interface de relatórios

      setReportData({
        totalEnrolled, totalPresent, totalAbsent: totalEnrolled - totalPresent, totalVisitors,
        totalOffering, totalMagazines, totalBibles,
        magazinesByCategory: { children: 20, adolescents: 17, youth: 15, newConverts: 9, adults: 136, teachers: 36 },
        topClasses: {
          children: getTopN(childrenClasses, 3),
          adolescents: getTopN(adolescentsClasses, 3),
          adults: getTopN(adultsClasses, 3)
        },
        classDetails, cashTotal, pixTotal
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

const handlePrint = () => {
  const printContent = printableAreaRef.current?.innerHTML;
  console.log('Conteúdo para impressão:', printContent); // Debug
  if (!printContent) {
    alert('Erro: Conteúdo não encontrado para impressão.');
    return;
  }

  const printWindow = window.open('', '', 'height=800,width=800');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório EBD - Pré-visualização</title>
          <style>
            /* Estilos para tela (preview) */
            body {
              margin: 1cm !important;
              padding: 0 !important;
              font-family: 'Arial', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: black !important;
              background: white !important;
            }
            .report-logo {
              max-width: 100px;
              height: auto;
              display: block;
              margin-bottom: 10px;
            }
            h1, h2, h3, h4 {
              margin-top: 5px;
              margin-bottom: 8px;
              font-size: 12pt;
              color: black !important;
            }
            p, .section-header {
              margin: 5px 0;
              color: black !important;
            }
            .stats-section, .class-section, .totals-section {
              margin-bottom: 10px;
            }
            .stat-line, .class-line, .total-line {
              margin: 3px 0;
              padding: 2px;
              font-size: 10pt;
              white-space: pre-wrap; /* Preserva espaços e quebras */
              color: black !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10pt;
              margin-top: 10px;
            }
            table th, table td {
              border: 1px solid black;
              padding: 4px;
              text-align: center;
              color: black !important;
            }
            .no-print, [style*="display: none"] {
              display: none !important;
            }

            /* Estilos para impressão/PDF - Ajustado para matching o primeiro PDF */
            @media print {
              @page {
                size: A4 portrait;
                margin: 0.5cm; /* Mantém sem blanks no topo */
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                font-family: 'Arial', sans-serif;
                font-size: 11pt;
                line-height: 1.3; /* Ligeiro aumento para separar linhas */
                color: black !important;
                background: white !important;
              }
              .report-logo {
                max-width: 100px;
                height: auto;
                page-break-inside: avoid;
                margin-bottom: 0.5cm;
              }
              h1, h2, h3, h4 {
                page-break-after: avoid;
                page-break-inside: avoid;
                margin-top: 0.2cm;
                margin-bottom: 0.4cm; /* Mais espaço após títulos */
                font-size: 12pt;
                color: black !important;
              }
              p, .observations, .footer {
                margin: 0.2cm 0; /* Aumentado para quebras visíveis */
                page-break-inside: avoid;
                color: black !important;
              }
              .report-date {
                margin: 0.3cm 0;
              }
              .stats-section, .class-section, .totals-section {
                page-break-inside: avoid;
                margin-bottom: 0.5cm;
              }
              .stat-line, .class-line, .total-line {
                margin: 0.3cm 0; /* Espaçamento entre stats para evitar colagem */
                padding: 0.1cm;
                font-size: 10pt;
                white-space: pre-wrap !important; /* Força preservação de espaços */
                page-break-inside: avoid;
                color: black !important;
                word-wrap: break-word; /* Evita overflow horizontal */
              }
              .section-header {
                font-weight: bold;
                margin: 0.4cm 0 0.2cm 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                page-break-inside: auto; /* Permite quebra na tabela se necessário */
                font-size: 10pt;
                margin-top: 0.5cm;
              }
              table th, table td {
                border: 1px solid black;
                padding: 0.2cm;
                text-align: center;
                color: black !important;
              }
              .no-print, [style*="display: none"] {
                display: none !important;
              }
              /* Quebra após header para página 1, stats para 2 */
              h3:first-of-type {
                page-break-after: avoid;
              }
              .stats-section {
                page-break-before: auto;
                page-break-after: always; /* Força quebra após stats, como no PDF 1 */
              }
              .class-section {
                page-break-before: always; /* Classificações na página 3 */
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Comente para debug: printWindow.close();
    }, 500);
  } else {
    alert('Erro: Não foi possível abrir a janela de impressão.');
  }
};

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
                {availableDates.map(date => (<SelectItem key={date} value={date}>{new Date(date + 'T12:00:00Z').toLocaleDateString('pt-BR')}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {selectedDate && (<div className="flex gap-4"><Button variant={reportType === "general" ? "default" : "outline"} onClick={() => setReportType("general")}>Relatório Geral (A4)</Button><Button variant={reportType === "classes" ? "default" : "outline"} onClick={() => setReportType("classes")}>Relatório por Classes (A4 Paisagem)</Button></div>)}
          
          {selectedDate && reportType === "general" && (
            <div className="space-y-2">
              <Label htmlFor="ebd-observations">Observações da EBD (aparecerá no relatório geral)</Label>
              <textarea
                id="ebd-observations"
                className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Digite aqui as observações gerais da EBD..."
                value={ebdObservations}
                onChange={(e) => setEbdObservations(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {isLoading && (<div className="text-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-muted-foreground">Gerando relatório...</p></div>)}
      
      {noData && !isLoading && selectedDate && (<Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">Nenhum dado encontrado para a data selecionada.</p></CardContent></Card>)}
      
      {reportData && !isLoading && !noData && (
        <>
          <div className="space-y-4 no-print">
            <Separator />
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Visualização: {reportType === "general" ? "Relatório Geral" : "Relatório por Classes"}</h3>
              <Button onClick={handlePrint} className="flex items-center gap-2"><Download className="h-4 w-4" />Imprimir/Salvar PDF</Button>
            </div>
            <div className="border rounded-lg overflow-auto bg-gray-200 p-4 flex justify-center">
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                 {reportType === "general" ? <GeneralReport reportData={reportData} selectedDate={selectedDate} ebdObservations={ebdObservations} /> : <ClassesReport reportData={reportData} selectedDate={selectedDate} />}
              </div>
            </div>
          </div>

          <div className="hidden">
            <div ref={printableAreaRef}>
              {reportType === "general" ? <GeneralReport reportData={reportData} selectedDate={selectedDate} ebdObservations={ebdObservations} /> : <ClassesReport reportData={reportData} selectedDate={selectedDate} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
