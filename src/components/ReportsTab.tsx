import adCamposLogo from "@/assets/ad-campos-logo.png";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, FileText, Download } from "lucide-react";
import adCamposLogo from "@/assets/ad-campos-logo.png"; // Certifique-se que o novo logo está neste caminho

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
    // ... (lógica existente para buscar datas)
  };

  const fetchReportData = async (date: string) => {
    // ... (lógica existente para buscar e processar os dados)
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchReportData(date);
  };
  
  // COMPONENTE DO RELATÓRIO GERAL (RETRATO) - ATUALIZADO
  const GeneralReport = () => (
    <div className="max-w-4xl mx-auto bg-white text-black p-4" 
         style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
      
      {/* CABEÇALHO - ATUALIZADO */}
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

      {/* BLOCOS DE ESTATÍSTICAS - ATUALIZADO */}
      <div className="grid grid-cols-2 gap-x-6 mb-4">
        <div className="space-y-2">
          <div className="border border-black p-2 text-sm flex justify-between">
            <span>ALUNOS MATRICULADOS:</span>
            <span className="font-bold">{reportData?.totalEnrolled || 0}</span>
          </div>
          <div className="border border-black p-2 text-sm flex justify-between">
            <span>ALUNOS PRESENTES:</span>
            <span className="font-bold">{reportData?.totalPresent || 0}</span>
          </div>
          <div className="border border-black p-2 text-sm flex justify-between">
            <span>ALUNOS VISITANTES:</span>
            <span className="font-bold">{reportData?.totalVisitors || 0}</span>
          </div>
          <div className="border border-black p-2 text-sm flex justify-between">
            <span>ALUNOS AUSENTES:</span>
            <span className="font-bold">{reportData?.totalAbsent || 0}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="border border-black p-2 text-sm flex justify-between">
            <span>TOTAL DE OFERTAS EBD:</span>
            <span className="font-bold">R$ {reportData?.totalOffering.toFixed(2).replace('.', ',') || '0,00'}</span>
          </div>
          <div className="border border-black p-2 text-sm flex justify-between">
            <span>TOTAL DE REVISTAS EBD, INCLUINDO PROFESSORES:</span>
            <span className="font-bold">{reportData?.totalMagazines || 0}</span>
          </div>
        </div>
      </div>

      {/* TOTAL DE ALUNOS PRESENTES - ATUALIZADO */}
      <div className="border border-black p-2 mb-4 text-sm flex justify-between">
        <span>TOTAL DE ALUNOS PRESENTES (alunos presentes + alunos visitantes):</span>
        <span className="font-bold">{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</span>
      </div>

      {/* Magazine Usage */}
      <div className="space-y-1 mb-4 text-sm">
        <div className="border border-black p-2 flex justify-between">
          <span>TOTAL DE REVISTAS UTILIZADAS (Crianças e Juniores):</span>
          <span>{reportData?.magazinesByCategory.children || 0}</span>
        </div>
        {/* ... outras categorias de revistas ... */}
      </div>

      {/* Classification */}
      <div className="border border-black p-4 mb-4">
        <h4 className="font-bold text-center mb-4">CLASSIFICAÇÃO DAS OFERTAS</h4>
        <div className="space-y-4 text-sm">
          {/* ... seções de classificação ... */}
        </div>
      </div>

      {/* OFERTAS - ATUALIZADO */}
      <div className="flex gap-4 mb-4">
        <div className="border border-black p-2 flex-1 text-sm flex justify-between">
          <span>TOTAL EM DINHEIRO:</span>
          <span className="font-bold">R$ {reportData?.cashTotal.toFixed(2).replace('.', ',') || '0,00'}</span>
        </div>
        <div className="border border-black p-2 flex-1 text-sm flex justify-between">
          <span>TOTAL EM PIX/CARTÃO:</span>
          <span className="font-bold">R$ {reportData?.pixTotal.toFixed(2).replace('.', ',') || '0,00'}</span>
        </div>
      </div>
      
       {/* ... resto do relatório geral ... */}
    </div>
  );

  // COMPONENTE DO RELATÓRIO DE CLASSES (PAISAGEM) - ATUALIZADO
  const ClassesReport = () => (
    <div className="max-w-full mx-auto bg-white text-black p-4" 
         style={{ width: '297mm', minHeight: '210mm', fontFamily: 'Arial, sans-serif' }}>
      
      {/* CABEÇALHO - ATUALIZADO */}
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
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-xs">
           <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-1 text-left">Nome da Classe</th>
              <th className="border border-black p-1">Matriculados</th>
              <th className="border border-black p-1">Presentes</th>
              <th className="border border-black p-1">Visitantes</th>
              <th className="border border-black p-1">Ausentes</th>
              <th className="border border-black p-1">Total Presentes</th>
              <th className="border border-black p-1">Bíblias</th>
              <th className="border border-black p-1">Revistas</th>
              <th className="border border-black p-1">Ofertas</th>
              <th className="border border-black p-1">Rank</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.classDetails.map((classData, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border border-black p-1">{classData.name}</td>
                <td className="border border-black p-1 text-center">{classData.enrolled}</td>
                <td className="border border-black p-1 text-center">{classData.present}</td>
                <td className="border border-black p-1 text-center">{classData.visitors}</td>
                <td className="border border-black p-1 text-center">{classData.absent}</td>
                <td className="border border-black p-1 text-center">{classData.totalPresent}</td>
                <td className="border border-black p-1 text-center">{classData.bibles}</td>
                <td className="border border-black p-1 text-center">{classData.magazines}</td>
                <td className="border border-black p-1 text-center">R$ {classData.offering.toFixed(2).replace('.', ',')}</td>
                <td className="border border-black p-1 text-center">{classData.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTAIS - ATUALIZADO */}
      <div className="mt-4 border-2 border-black p-2">
        <h3 className="text-lg font-bold text-center mb-2">TOTAL GERAL</h3>
        <div className="flex justify-around items-center text-center text-sm">
            <div>
              <p>Matriculados</p>
              <p className="font-bold text-lg">{reportData?.totalEnrolled || 0}</p>
            </div>
            <div>
              <p>Ausentes</p>
              <p className="font-bold text-lg">{reportData?.totalAbsent || 0}</p>
            </div>
            <div>
              <p>Visitantes</p>
              <p className="font-bold text-lg">{reportData?.totalVisitors || 0}</p>
            </div>
            <div>
              <p>Total Presentes</p>
              <p className="font-bold text-lg">{(reportData?.totalPresent || 0) + (reportData?.totalVisitors || 0)}</p>
            </div>
            <div>
              <p>Bíblias</p>
              <p className="font-bold text-lg">{reportData?.totalBibles || 0}</p>
            </div>
            <div>
              <p>Revistas</p>
              <p className="font-bold text-lg">{reportData?.totalMagazines || 0}</p>
            </div>
             <div>
              <p>Ofertas</p>
              <p className="font-bold text-lg">R$ {reportData?.totalOffering.toFixed(2).replace('.', ',') || '0,00'}</p>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="no-print">
        {/* ... (parte de seleção de data e tipo de relatório - sem alterações) ... */}
      </Card>

       {/* Report Display */}
       {reportData && !isLoading && (
        <div className="space-y-4">
          <Separator />
          <div className="flex justify-between items-center no-print">
            <h3 className="text-lg font-semibold">
              {reportType === "general" ? "Visualização: Relatório Geral" : "Visualização: Relatório por Classes"}
            </h3>
            <Button onClick={() => window.print()} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Imprimir/Salvar PDF
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-auto bg-gray-200 p-4">
            <style>{`
              @media print {
                @page { 
                  size: ${reportType === "general" ? "A4 portrait" : "A4 landscape"}; 
                  margin: 10mm; 
                }
                body, html {
                  background-color: #fff;
                }
                .no-print { display: none !important; }
                .printable-area {
                  transform: scale(1);
                  box-shadow: none;
                  border: none;
                }
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
