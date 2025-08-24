import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, FileText, Download } from "lucide-react";
import adCamposLogo from "@/assets/ad-campos-logo.png";

// Interfaces para os dados do relatório (sem alterações)
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

export const ReportsTab = () => {
  // Estados (sem alterações)
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [reportType, setReportType] = useState<"general" | "classes">("general");

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Funções de busca de dados (sem alterações na lógica principal)
  const fetchAvailableDates = async () => { /* ...código anterior... */ };
  const fetchReportData = async (date: string) => { /* ...código anterior... */ };
  const handleDateChange = (date: string) => { /* ...código anterior... */ };

  // --- COMPONENTES DE RELATÓRIO REESCRITOS ---

  const GeneralReport = () => (
    <div className="bg-white text-black p-6" style={{ width: '210mm', height: '297mm', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', fontSize: '10pt' }}>
      <header className="flex items-start justify-between pb-4">
        <div className="flex items-center gap-4">
          <img src={adCamposLogo} alt="AD Campos Logo" className="w-[75px] h-[75px]" />
          <div>
            <h1 className="text-lg font-bold">Catedral das Assembleias de Deus em Campos</h1>
            <h2 className="text-base">Secretaria da Escola Bíblica Dominical - EBD</h2>
            <p className="text-xs text-gray-600">Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold">Ano</p>
          <p className="text-4xl font-bold tracking-tighter">2025</p>
        </div>
      </header>
      <div className="text-center"><h3 className="text-lg font-bold">RELATÓRIO DA ESCOLA BÍBLICA DOMINICAL</h3></div>
      <div className="flex justify-end text-xs mt-1 mb-2"><p><strong>Data:</strong> {selectedDate ? new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('pt-BR') : ''}</p></div>
      
      <main className="flex-grow">
        <div className="grid grid-cols-2 gap-x-4 mb-2">
          <div className="space-y-1">
            <div className="border border-black px-2 py-1 text-xs flex justify-between"><span>ALUNOS MATRICULADOS:</span><span className="font-bold">{reportData?.totalEnrolled || 0}</span></div>
            <div className="border border-black px-2 py-1 text-xs flex justify-between"><span>ALUNOS PRESENTES:</span><span className="font-bold">{reportData?.totalPresent || 0}</span></div>
            <div className="border border-black px-2 py-1 text-xs flex justify-between"><span>ALUNOS VISITANTES:</span><span className="font-bold">{reportData?.totalVisitors || 0}</span></div>
            <div className="border border-black px-2 py-1 text-xs flex justify-between"><span>ALUNOS AUSENTES:</span><span className="font-bold">{reportData?.totalAbsent || 0}</span></div>
          </div>
          <div className="space-y-1">
            <div className="border border-black px-2 py-1 text-xs flex justify-between"><span>TOTAL DE OFERTAS EBD:</span><span className="font-bold">R$ {reportData?.totalOffering.toFixed(2).replace('.', ',') || '0,00'}</span></div>
            <div className="border border-black px-2 py-1 text-xs flex justify-between"><span>TOTAL DE REVISTAS EBD, INCLUINDO PROFESSORES:</span><span className="font-bold">{reportData?.totalMagazines || 0}</span></div>
          </div>
        </div>

        <div className="border border-black px-2 py-1 mb-2 text-xs flex justify-between"><span>TOTAL DE ALUNOS PRESENTES (alunos presentes + alunos visitantes):</span><span className="font-bold">{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</span></div>
        
        <div className="space-y-1 mb-2 text-xs">
            <div className="border border-black px-2 py-1 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Crianças e Juniores):</span><span>{reportData?.magazinesByCategory?.children || 0}</span></div>
            <div className="border border-black px-2 py-1 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Adolescentes):</span><span>{reportData?.magazinesByCategory?.adolescents || 0}</span></div>
            <div className="border border-black px-2 py-1 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Jovens):</span><span>{reportData?.magazinesByCategory?.youth || 0}</span></div>
            <div className="border border-black px-2 py-1 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Novos Convertidos):</span><span>{reportData?.magazinesByCategory?.newConverts || 0}</span></div>
            <div className="border border-black px-2 py-1 flex justify-between"><span>TOTAL DE REVISTAS UTILIZADAS (Adultos):</span><span>{reportData?.magazinesByCategory?.adults || 0}</span></div>
            <div className="border border-black px-2 py-1 flex justify-between"><span>TOTAL DE REVISTAS PROFESSORES EM CLASSE:</span><span>{reportData?.magazinesByCategory?.teachers || 0}</span></div>
        </div>

        <div className="border border-black p-2 mb-2 text-xs">
            <h4 className="font-bold text-center mb-2 text-sm">CLASSIFICAÇÃO DAS OFERTAS</h4>
            <div className="space-y-2">
                <div>
                    <div className="flex justify-between font-bold bg-gray-200 px-2 py-1"><span>CLASSES DAS CRIANÇAS:</span><span>VALOR R$</span></div>
                    {reportData?.topClasses?.children.map((cls) => (<div key={cls.name} className="flex justify-between px-2"><span>{cls.rank} {cls.name}</span><span>R$ {cls.offering.toFixed(2).replace('.', ',')}</span></div>))}
                </div>
                <div>
                    <div className="flex justify-between font-bold bg-gray-200 px-2 py-1"><span>CLASSES DOS ADOLESCENTES:</span><span>VALOR R$</span></div>
                    {reportData?.topClasses?.adolescents.map((cls) => (<div key={cls.name} className="flex justify-between px-2"><span>{cls.rank} {cls.name}</span><span>R$ {cls.offering.toFixed(2).replace('.', ',')}</span></div>))}
                </div>
                <div>
                    <div className="flex justify-between font-bold bg-gray-200 px-2 py-1"><span>CLASSES DOS ADULTOS:</span><span>VALOR R$</span></div>
                    {reportData?.topClasses?.adults.map((cls) => (<div key={cls.name} className="flex justify-between px-2"><span>{cls.rank} {cls.name}</span><span>R$ {cls.offering.toFixed(2).replace('.', ',')}</span></div>))}
                </div>
            </div>
        </div>
        
        <div className="flex gap-4 mb-2">
            <div className="border border-black p-1 flex-1 text-xs flex justify-between"><span>TOTAL EM DINHEIRO:</span><span className="font-bold">R$ {reportData?.cashTotal.toFixed(2).replace('.', ',') || '0,00'}</span></div>
            <div className="border border-black p-1 flex-1 text-xs flex justify-between"><span>TOTAL EM PIX/CARTÃO:</span><span className="font-bold">R$ {reportData?.pixTotal.toFixed(2).replace('.', ',') || '0,00'}</span></div>
        </div>
        <div className="border border-black p-2 h-20 text-xs"><span className="font-bold">OBSERVAÇÕES:</span></div>
      </main>
      
      <footer className="text-center mt-auto"><p className="font-bold text-xs">2025 ANO DA CELEBRAÇÃO - SALMOS 35.27</p></footer>
    </div>
  );

  const ClassesReport = () => (
    <div className="bg-white text-black p-4" style={{ width: '297mm', height: '210mm', fontFamily: 'Arial, sans-serif' }}>
       {/* ... (código do cabeçalho paisagem aqui) ... */}
       <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-[8px]">
          {/* ... (código da tabela aqui) ... */}
        </table>
      </div>
       {/* ... (código dos totais gerais aqui) ... */}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="no-print">
        {/* ... (código do seletor de data e tipo de relatório - sem alterações) ... */}
      </Card>
      
      {/* --- ÁREA DE RENDERIZAÇÃO E IMPRESSÃO ATUALIZADA --- */}
      {isLoading && <p>Carregando...</p>}
      {noData && !isLoading && selectedDate && <p>Nenhum dado encontrado para esta data.</p>}
      
      {reportData && !isLoading && !noData && (
        <>
          {/* Visualização na tela */}
          <div className="space-y-4 no-print">
            <Separator />
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Visualização: {reportType === "general" ? "Relatório Geral" : "Relatório por Classes"}</h3>
              <Button onClick={() => window.print()} className="flex items-center gap-2"><Download className="h-4 w-4" />Imprimir/Salvar PDF</Button>
            </div>
            <div className="border rounded-lg overflow-auto bg-gray-200 p-4">
              <div className="mx-auto" style={{ width: reportType === 'general' ? '210mm' : '297mm', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                 {reportType === "general" ? <GeneralReport /> : <ClassesReport />}
              </div>
            </div>
          </div>

          {/* Área exclusiva para impressão (escondida da tela) */}
          <div className="printable-area">
            <style>{`
              @media screen {
                .printable-area { display: none; }
              }
              @media print {
                body * { visibility: hidden; }
                .printable-area, .printable-area * { visibility: visible; }
                .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                @page { 
                  size: ${reportType === "general" ? "A4 portrait" : "A4 landscape"}; 
                  margin: 0; 
                }
              }
            `}</style>
            {reportType === "general" ? <GeneralReport /> : <ClassesReport />}
          </div>
        </>
      )}
    </div>
  );
};
