import adCamposLogo from "@/assets/ad-campos-logo.png";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, FileText, Download } from "lucide-react";
import adCamposLogo from "@/assets/ad-campos-logo.png";

// Interfaces... (sem alterações)

export const ReportsTab = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<"general" | "classes">("general");
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    // ... Lógica de busca de datas existente
  };

  const fetchReportData = async (date: string) => {
    if (!date) return;
    
    setIsLoading(true);
    setReportData(null);
    setNoData(false);
    
    // ... Lógica de busca e processamento de dados existente
    // A única diferença é que, se `registrations` for nulo ou vazio, ajustamos o estado
    try {
      const { data: registrations } = await supabase
        .from("registrations")
        // ...
        .lt("registration_date", date + "T23:59:59");
      
      if (!registrations || registrations.length === 0) {
        setNoData(true);
        setIsLoading(false);
        return;
      }

      // ... Resto da lógica de processamento de dados ...

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
  
  // Componentes GeneralReport e ClassesReport (sem alterações na estrutura, mas mais seguros com os dados)

  // ... (Cole aqui os componentes GeneralReport e ClassesReport da resposta anterior, pois a estrutura deles está correta)

  return (
    <div className="space-y-6">
      <Card className="no-print">
        <CardHeader>
            {/* ... Conteúdo do CardHeader ... */}
        </CardHeader>
        <CardContent className="space-y-6 no-print">
          {/* ... Controles de seleção de data e tipo de relatório ... */}
        </CardContent>
      </Card>

      {/* Lógica de Exibição Atualizada */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Gerando relatório...</p>
        </div>
      )}

      {noData && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhum dado encontrado para a data selecionada.
            </p>
          </CardContent>
        </Card>
      )}

      {reportData && !isLoading && !noData && (
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
