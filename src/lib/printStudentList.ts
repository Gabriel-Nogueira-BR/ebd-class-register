import { getReportTheme } from "@/lib/reportTheme";

interface PrintableStudent { name: string; birth_date: string | null; phone: string | null; }

export const printStudentList = (className: string, classStudents: PrintableStudent[]) => {
  const cls = { name: className };
    const theme = getReportTheme(new Date().getFullYear());
    const today = new Date().toLocaleDateString("pt-BR");

    const formatBirthDate = (d: string | null) => {
      if (!d) return "-";
      return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
    };

    const rows = classStudents
      .map(
        (s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td style="text-align:left">${s.name}</td>
          <td>${formatBirthDate(s.birth_date)}</td>
          <td>${s.phone || "-"}</td>
        </tr>`
      )
      .join("");

    const printWindow = window.open("", "", "height=800,width=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Lista de Alunos - ${cls.name}</title>
          <style>
            @page { size: A4 portrait; margin: 6mm; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 11px;
              color: #000;
              display: flex;
              flex-direction: column;
              min-height: 282mm;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .header h1 { font-size: 16px; margin: 0 0 4px 0; text-transform: uppercase; }
            .header h2 { font-size: 13px; margin: 0 0 2px 0; font-weight: normal; }
            .header p { font-size: 10px; margin: 2px 0; color: #333; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px 6px;
              text-align: center;
              font-size: 11px;
            }
            th { background: #e5e5e5; font-weight: bold; }
            .summary { margin-top: 8px; font-size: 11px; }
            .footer {
              margin-top: auto;
              padding-top: 10px;
              border-top: 2px solid #000;
              text-align: center;
              font-size: 11px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Escola Bíblica Dominical</h1>
            <h2>Lista de Alunos - ${cls.name}</h2>
            <p>Emitido em ${today}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:40px">Nº</th>
                <th>Nome</th>
                <th style="width:100px">Nascimento</th>
                <th style="width:120px">Telefone</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="4">Nenhum aluno ativo nesta classe.</td></tr>`}
            </tbody>
          </table>
          <p class="summary"><strong>Total de alunos ativos:</strong> ${classStudents.length}</p>
          <div class="footer">${theme}</div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    };
};
