import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import adCamposLogo from '../assets/ad-campos-logo.png'; // Assumindo o path da logo

// Tipos (assumindo que você tem ReportData definido)
interface ReportData {
  totalEnrolled: number;
  totalPresent: number;
  totalVisitors: number;
  totalAbsent: number;
  totalOffering: number;
  totalMagazines: number;
  magazinesByCategory: {
    children: number;
    adolescents: number;
    youth: number;
    newConverts: number;
    adults: number;
    teachers: number;
  };
  topClasses: {
    children: { name: string; rank: string; offering: number }[];
    adolescents: { name: string; rank: string; offering: number }[];
    adults: { name: string; rank: string; offering: number }[];
  };
  cashTotal: number;
  pixTotal: number;
}

interface ClassData {
  name: string;
  enrolled: number;
  present: number;
  visitors: number;
  absent: number;
  totalPresent: number;
  bibles: number;
  magazines: number;
  offering: string;
  rank: string;
}

const ReportsTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [reportType, setReportType] = useState<'general' | 'classes'>('general');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [ebdObservations, setEbdObservations] = useState<string>('');
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Funções para fetch data (assumindo que você tem; placeholder)
  const fetchReportData = async (date: string) => {
    // Simule ou chame API; use dados do PDF 1 para teste
    return {
      totalEnrolled: 273,
      totalPresent: 168,
      totalVisitors: 27,
      totalAbsent: 105,
      totalOffering: 1247.10,
      totalMagazines: 167,
      magazinesByCategory: { children: 20, adolescents: 17, youth: 15, newConverts: 9, adults: 136, teachers: 36 },
      topClasses: {
        children: [
          { name: '01. OVELHINHAS E CORDEIRINHOS DE CRISTO (2 a 5 anos)', rank: '1°', offering: 3.60 },
          { name: '02. SOLDADOS DE CRISTO (6 a 8 anos)', rank: '2°', offering: 1.00 },
        ],
        adolescents: [
          { name: '04. LAEL (12 a 14 anos)', rank: '1°', offering: 26.00 },
          { name: '03. ESTRELA DE DAVI (9 a 11 anos)', rank: '2°', offering: 22.60 },
          { name: '05. ÁGAPE (15 a 17 anos)', rank: '3°', offering: 5.00 },
        ],
        adults: [
          { name: '15. ABRAÃO (Pastores, Evangelistas e Presbíteros)', rank: '1°', offering: 254.85 },
          { name: '10. VENCEDORAS PELA FÉ (irmãs)', rank: '2°', offering: 241.00 },
          { name: '11. ESPERANÇA (irmãs)', rank: '3°', offering: 221.00 },
        ],
      },
      cashTotal: 1105.10,
      pixTotal: 142.00,
    };
  };

  const fetchClassData = async (date: string) => {
    // Simule; use dados do PDF classes
    return [
      // ... array de ClassData do PDF "Classificação EBD 05 10 1.pdf"
      { name: '01. OVELHINHAS E CORDEIRINHOS DE CRISTO (2 a 5 anos)', enrolled: 6, present: 3, visitors: 1, absent: 3, totalPresent: 4, bibles: 3, magazines: 5, offering: 'R$ 3,60', rank: '1°' },
      // Adicione os outros...
    ];
  };

  const handleGenerateReport = async () => {
    if (!selectedDate) return;
    const date = format(new Date(selectedDate), 'dd/MM/yyyy', { locale: ptBR });
    if (reportType === 'general') {
      const data = await fetchReportData(selectedDate);
      setReportData(data);
    } else {
      const data = await fetchClassData(selectedDate);
      setClassData(data);
    }
  };

  const GeneralReport = ({ reportData, selectedDate, ebdObservations }: {
    reportData: ReportData;
    selectedDate: string;
    ebdObservations?: string;
  }) => (
    <div style={{ margin: 0, padding: 0 }}>
      <img src={adCamposLogo} alt="AD Campos Logo" className="report-logo" />
      <h1>Catedral das Assembleias de Deus em Campos</h1>
      <h2>Secretaria da Escola Bíblica Dominical - EBD</h2>
      <p>Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
      <p>Ano 2025</p>
      <h3>RELATÓRIO DA ESCOLA BÍBLICA DOMINICAL</h3>
      <p className="report-date">Data: {format(new Date(selectedDate + 'T12:00:00Z'), 'dd/MM/yyyy', { locale: ptBR })}</p>

      {/* Tabela de Stats - 2 colunas */}
      <table className="stats-table">
        <tbody>
          <tr><td>ALUNOS MATRICULADOS:</td><td>{reportData.totalEnrolled}</td></tr>
          <tr><td>ALUNOS PRESENTES:</td><td>{reportData.totalPresent}</td></tr>
          <tr><td>ALUNOS VISITANTES:</td><td>{reportData.totalVisitors}</td></tr>
          <tr><td>ALUNOS AUSENTES:</td><td>{reportData.totalAbsent}</td></tr>
          <tr><td>TOTAL DE OFERTAS EBD:</td><td>R$ {reportData.totalOffering.toFixed(2).replace('.', ',')}</td></tr>
          <tr><td>TOTAL DE REVISTAS EBD, INCLUINDO PROFESSORES:</td><td>{reportData.totalMagazines}</td></tr>
          <tr><td>TOTAL DE ALUNOS PRESENTES (alunos presentes + alunos visitantes):</td><td>{reportData.totalPresent + reportData.totalVisitors}</td></tr>
          <tr><td>TOTAL DE REVISTAS UTILIZADAS (Crianças e Juniores):</td><td>{reportData.magazinesByCategory.children}</td></tr>
          <tr><td>TOTAL DE REVISTAS UTILIZADAS (Adolescentes):</td><td>{reportData.magazinesByCategory.adolescents}</td></tr>
          <tr><td>TOTAL DE REVISTAS UTILIZADAS (Jovens):</td><td>{reportData.magazinesByCategory.youth}</td></tr>
          <tr><td>TOTAL DE REVISTAS UTILIZADAS (Novos Convertidos):</td><td>{reportData.magazinesByCategory.newConverts}</td></tr>
          <tr><td>TOTAL DE REVISTAS UTILIZADAS (Adultos):</td><td>{reportData.magazinesByCategory.adults}</td></tr>
          <tr><td>TOTAL DE REVISTAS PROFESSORES EM CLASSE:</td><td>{reportData.magazinesByCategory.teachers}</td></tr>
        </tbody>
      </table>

      <h4>CLASSIFICAÇÃO DAS OFERTAS</h4>

      {/* Tabela Crianças */}
      <table className="classes-table">
        <thead><tr><th>CLASSES DAS CRIANÇAS</th><th>VALOR R$</th></tr></thead>
        <tbody>
          {reportData.topClasses.children.map((cls) => (
            <tr key={cls.name}><td>{cls.rank} {cls.name}</td><td>R$ {cls.offering.toFixed(2).replace('.', ',')}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Tabela Adolescentes */}
      <table className="classes-table">
        <thead><tr><th>CLASSES DOS ADOLESCENTES</th><th>VALOR R$</th></tr></thead>
        <tbody>
          {reportData.topClasses.adolescents.map((cls) => (
            <tr key={cls.name}><td>{cls.rank} {cls.name}</td><td>R$ {cls.offering.toFixed(2).replace('.', ',')}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Tabela Adultos */}
      <table className="classes-table">
        <thead><tr><th>CLASSES DOS ADULTOS</th><th>VALOR R$</th></tr></thead>
        <tbody>
          {reportData.topClasses.adults.map((cls) => (
            <tr key={cls.name}><td>{cls.rank} {cls.name}</td><td>R$ {cls.offering.toFixed(2).replace('.', ',')}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Tabela Totais */}
      <table className="totals-table">
        <tbody>
          <tr><td>TOTAL EM DINHEIRO:</td><td>R$ {reportData.cashTotal.toFixed(2).replace('.', ',')}</td></tr>
          <tr><td>TOTAL EM PIX/CARTÃO:</td><td>R$ {reportData.pixTotal.toFixed(2).replace('.', ',')}</td></tr>
        </tbody>
      </table>

      <p className="observations">OBSERVAÇÕES: {ebdObservations || ''}</p>
      <p className="footer">2025 ANO DA CELEBRAÇÃO - SALMOS 35.27</p>
    </div>
  );

  const ClassesReport = ({ classData, selectedDate }: { classData: ClassData[]; selectedDate: string }) => (
    <div style={{ margin: 0, padding: 0 }}>
      <img src={adCamposLogo} alt="AD Campos Logo" className="report-logo" />
      <h1>Catedral das Assembleias de Deus em Campos</h1>
      <h2>Secretaria da Escola Bíblica Dominical - EBD</h2>
      <p>Pastor Presidente Paulo Areas de Moraes - Ministério de Madureira</p>
      <p>Ano 2025</p>
      <p>Data: {format(new Date(selectedDate + 'T12:00:00Z'), 'dd/MM/yyyy', { locale: ptBR })}</p>

      <table className="classes-full-table">
        <thead>
          <tr>
            <th>Nome da Classe</th>
            <th>Matriculados</th>
            <th>Presentes</th>
            <th>Visitantes</th>
            <th>Ausentes</th>
            <th>Total Presentes</th>
            <th>Bíblias</th>
            <th>Revistas</th>
            <th>Ofertas</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          {classData.map((cls, index) => (
            <tr key={index}>
              <td>{cls.name}</td>
              <td>{cls.enrolled}</td>
              <td>{cls.present}</td>
              <td>{cls.visitors}</td>
              <td>{cls.absent}</td>
              <td>{cls.totalPresent}</td>
              <td>{cls.bibles}</td>
              <td>{cls.magazines}</td>
              <td>{cls.offering}</td>
              <td>{cls.rank}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>TOTAL GERAL</td>
            <td>{classData.reduce((sum) => sum + sum.enrolled, 0)}</td>
            <td>{classData.reduce((sum) => sum + sum.present, 0)}</td>
            <td>{classData.reduce((sum) => sum + sum.visitors, 0)}</td>
            <td>{classData.reduce((sum) => sum + sum.absent, 0)}</td>
            <td>{classData.reduce((sum) => sum + sum.totalPresent, 0)}</td>
            <td>{classData.reduce((sum) => sum + sum.bibles, 0)}</td>
            <td>{classData.reduce((sum) => sum + sum.magazines, 0)}</td>
            <td>R$ {classData.reduce((sum, cls) => sum + parseFloat(cls.offering.replace('R$ ', '').replace(',', '.')), 0).toFixed(2).replace('.', ',')}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <p className="footer">2025 ANO DA CELEBRAÇÃO - SALMOS 35.27</p>
    </div>
  );

  const handlePrint = () => {
    const printContent = printableAreaRef.current?.innerHTML;
    console.log('Conteúdo para impressão:', printContent);
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
              body { margin: 1cm !important; padding: 0 !important; font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.2; color: black !important; background: white !important; }
              .report-logo { max-width: 100px; height: auto; display: block; margin-bottom: 10px; }
              h1, h2, h3, h4 { margin-top: 5px; margin-bottom: 8px; font-size: 11pt; color: black !important; }
              p { margin: 5px 0; color: black !important; }
              .report-date { margin: 0.3cm 0; }
              table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 5px; }
              table th, table td { border: 1px solid black; padding: 3px; text-align: left; vertical-align: top; color: black !important; }
              table th { text-align: center; background: #f0f0f0; }
              .total-row td { font-weight: bold; }
              .no-print, [style*="display: none"] { display: none !important; }

              /* Estilos para impressão/PDF - Compacto para 1 página */
              @media print {
                @page { size: A4 portrait; margin: 0.3cm; } /* Menor margem para caber tudo */
                body { margin: 0 !important; padding: 0 !important; font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.1; color: black !important; background: white !important; }
                .report-logo { max-width: 80px; height: auto; page-break-inside: avoid; margin-bottom: 0.2cm; }
                h1, h2, h3, h4 { page-break-after: avoid; page-break-inside: avoid; margin-top: 0.1cm; margin-bottom: 0.2cm; font-size: 10pt; color: black !important; }
                p, .observations, .footer { margin: 0.1cm 0; page-break-inside: avoid; color: black !important; font-size: 9pt; }
                .report-date { margin: 0.2cm 0; }
                table { width: 100%; border-collapse: collapse; page-break-inside: avoid; font-size: 8pt; margin: 0.1cm 0; } /* Pequeno para caber */
                table th, table td { border: 1px solid black; padding: 0.1cm; text-align: left; vertical-align: top; color: black !important; }
                table th { text-align: center; background: #f0f0f0; font-size: 8pt; }
                .stats-table td:first-child { width: 60%; } /* Labels mais largas */
                .classes-table, .totals-table { margin-bottom: 0.2cm; }
                .total-row td { font-weight: bold; }
                .classes-full-table { font-size: 7pt; } /* Para classes caber se multi-linha */
                .classes-full-table th, .classes-full-table td { padding: 0.05cm; }
                .no-print, [style*="display: none"] { display: none !important; }
                /* Sem quebras forçadas - tudo em 1 página */
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
      }, 500);
    } else {
      alert('Erro: Não foi possível abrir a janela de impressão.');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label>Data: </label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="ml-2 p-1 border" />
        <select value={reportType} onChange={(e) => setReportType(e.target.value as 'general' | 'classes')} className="ml-4 p-1 border">
          <option value="general">Relatório Geral</option>
          <option value="classes">Relatório de Classes</option>
        </select>
        <button onClick={handleGenerateReport} className="ml-4 px-4 py-1 bg-blue-500 text-white">Gerar Relatório</button>
        <button onClick={handlePrint} disabled={!reportData && !classData} className="ml-2 px-4 py-1 bg-green-500 text-white">Imprimir PDF</button>
      </div>
      {reportType === 'general' && ebdObservations && <textarea value={ebdObservations} onChange={(e) => setEbdObservations(e.target.value)} placeholder="Observações" className="w-full p-2 border mb-2" />}

      {reportData && reportType === 'general' && (
        <div ref={printableAreaRef}>
          <GeneralReport reportData={reportData} selectedDate={selectedDate} ebdObservations={ebdObservations} />
        </div>
      )}
      {classData.length > 0 && reportType === 'classes' && (
        <div ref={printableAreaRef}>
          <ClassesReport classData={classData} selectedDate={selectedDate} />
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
