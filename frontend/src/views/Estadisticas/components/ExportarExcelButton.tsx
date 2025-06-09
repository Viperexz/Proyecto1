import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ExportarExcelButtonProps {
  estadisticas: any;
  criterios: any[];
  histogramas: any[];
  filtros: {
    materia: string;
    rubrica: string;
    periodo: string;
    resultadoAprendizaje: string;
  };
}

const ExportarExcelButton: React.FC<ExportarExcelButtonProps> = ({
  estadisticas,
  criterios,
  histogramas,
  filtros,
}) => {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const azulHeader = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'D6EAF8' } };
    const grisTitulo = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'F2F4F4' } };
    const borderStyle = { top: {style:'thin' as const}, left: {style:'thin' as const}, bottom: {style:'thin' as const}, right: {style:'thin' as const} };
    const fontHeader = { bold: true, color: { argb: '1B2631' }, size: 12, name: 'Calibri' };
    const fontTitulo = { bold: true, color: { argb: '154360' }, size: 14, name: 'Calibri' };
    const fontNormal = { size: 12, name: 'Calibri' };

    // Utilidad para ajustar ancho
    const autoWidth = (ws: ExcelJS.Worksheet) => {
      if (ws.columns) {
        ws.columns.forEach(col => {
          let max = 10;
          if (col.eachCell) {
            col.eachCell({ includeEmpty: true }, cell => {
              max = Math.max(max, (cell.value ? cell.value.toString().length : 0) + 2);
            });
          }
          col.width = max;
        });
      }
    };

    // 1. Hoja Resumen
    const wsResumen = workbook.addWorksheet('Resumen');
    wsResumen.mergeCells('A1:B1');
    wsResumen.getCell('A1').value = 'Datos de Búsqueda';
    wsResumen.getCell('A1').alignment = { horizontal: 'center' };
    wsResumen.getCell('A1').font = { bold: true, color: { argb: 'FFFFFF' }, size: 13, name: 'Calibri' };
    wsResumen.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '305496' } }; // Azul fuerte
    // Filas de datos de búsqueda
    const datosBusqueda = [
      ['Materia', filtros.materia],
      ['Rúbrica', filtros.rubrica],
      ['Período', filtros.periodo],
      ['Resultado de Aprendizaje', filtros.resultadoAprendizaje],
    ];
    datosBusqueda.forEach((fila, idx) => {
      const row = wsResumen.addRow(fila);
      row.getCell(1).font = { bold: true, color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.getCell(2).font = { color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }; // Azul claro
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });
    // Encabezado de Resumen Estadístico
    const resumenHeaderRowIdx = wsResumen.lastRow ? wsResumen.lastRow.number + 1 : datosBusqueda.length + 2;
    wsResumen.mergeCells(`A${resumenHeaderRowIdx}:B${resumenHeaderRowIdx}`);
    wsResumen.getCell(`A${resumenHeaderRowIdx}`).value = 'Resumen Estadístico';
    wsResumen.getCell(`A${resumenHeaderRowIdx}`).alignment = { horizontal: 'center' };
    wsResumen.getCell(`A${resumenHeaderRowIdx}`).font = { bold: true, color: { argb: '000000' }, size: 13, name: 'Calibri' };
    wsResumen.getCell(`A${resumenHeaderRowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A9D08E' } }; // Verde claro
    // Filas de resumen estadístico
    const resumenEstadistico = [
      ['Media', estadisticas.average],
      ['Mediana', estadisticas.median],
      ['Desviación Estándar', estadisticas.standardDeviation],
      ['Máximo', estadisticas.maxScore],
      ['Mínimo', estadisticas.minScore],
      ['Cantidad de Estudiantes', estadisticas.studentsCount],
    ];
    resumenEstadistico.forEach((fila, idx) => {
      const row = wsResumen.addRow(fila);
      row.getCell(1).font = { bold: true, color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.getCell(2).font = { color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }; // Verde muy claro
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });
    autoWidth(wsResumen);

    // 2. Hoja Promedio por Criterio
    const wsPromCriterio = workbook.addWorksheet('Promedio por Criterio');
    wsPromCriterio.mergeCells('A1:B1');
    wsPromCriterio.getCell('A1').value = 'Datos de Búsqueda';
    wsPromCriterio.getCell('A1').alignment = { horizontal: 'center' };
    wsPromCriterio.getCell('A1').font = { bold: true, color: { argb: 'FFFFFF' }, size: 13, name: 'Calibri' };
    wsPromCriterio.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '305496' } }; // Azul fuerte
    // Filas de datos de búsqueda
    datosBusqueda.forEach((fila, idx) => {
      const row = wsPromCriterio.addRow(fila);
      row.getCell(1).font = { bold: true, color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.getCell(2).font = { color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }; // Azul claro
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });
    // Encabezado de sección (verde oscuro)
    const promHeaderRowIdx = wsPromCriterio.lastRow ? wsPromCriterio.lastRow.number + 1 : datosBusqueda.length + 2;
    wsPromCriterio.mergeCells(`A${promHeaderRowIdx}:B${promHeaderRowIdx}`);
    wsPromCriterio.getCell(`A${promHeaderRowIdx}`).value = 'Promedio por Criterio';
    wsPromCriterio.getCell(`A${promHeaderRowIdx}`).alignment = { horizontal: 'center' };
    wsPromCriterio.getCell(`A${promHeaderRowIdx}`).font = { bold: true, color: { argb: 'FFFFFF' }, size: 13, name: 'Calibri' };
    wsPromCriterio.getCell(`A${promHeaderRowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '548235' } }; // Verde oscuro
    wsPromCriterio.getCell(`A${promHeaderRowIdx}`).border = borderStyle;
    wsPromCriterio.getCell(`B${promHeaderRowIdx}`).border = borderStyle;
    // Encabezado de tabla (verde intermedio)
    const headerRow = wsPromCriterio.addRow(['Criterio', 'Promedio']);
    headerRow.font = { bold: true, color: { argb: '000000' }, size: 12, name: 'Calibri' };
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A9D08E' } }; // Verde intermedio
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    // Filas de datos (verde muy suave)
    criterios.forEach(c => {
      const row = wsPromCriterio.addRow([c.criterioDescripcion, c.promedioNota]);
      row.getCell(1).font = { color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.getCell(2).font = { color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }; // Verde muy suave
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });
    autoWidth(wsPromCriterio);

    // 3. Hoja Histogramas
    const wsHist = workbook.addWorksheet('Histogramas');
    wsHist.mergeCells('A1:D1');
    wsHist.getCell('A1').value = 'Datos de Búsqueda';
    wsHist.getCell('A1').alignment = { horizontal: 'center' };
    wsHist.getCell('A1').font = { bold: true, color: { argb: 'FFFFFF' }, size: 13, name: 'Calibri' };
    wsHist.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '305496' } }; // Azul fuerte
    // Filas de datos de búsqueda (agrupadas de a dos por fila)
    const datosBusquedaHist = [
      ['Materia', filtros.materia, 'Rúbrica', filtros.rubrica],
      ['Período', filtros.periodo, 'Resultado de Aprendizaje', filtros.resultadoAprendizaje],
    ];
    datosBusquedaHist.forEach((fila) => {
      const row = wsHist.addRow(fila);
      row.getCell(1).font = { bold: true, color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.getCell(2).font = { color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.getCell(3).font = { bold: true, color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.getCell(4).font = { color: { argb: '000000' }, size: 12, name: 'Calibri' };
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }; // Azul claro
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });
    // Encabezado de sección (verde oscuro)
    const histHeaderRowIdx = wsHist.lastRow ? wsHist.lastRow.number + 1 : datosBusqueda.length + 2;
    wsHist.mergeCells(`A${histHeaderRowIdx}:D${histHeaderRowIdx}`);
    wsHist.getCell(`A${histHeaderRowIdx}`).value = 'Histogramas';
    wsHist.getCell(`A${histHeaderRowIdx}`).alignment = { horizontal: 'center' };
    wsHist.getCell(`A${histHeaderRowIdx}`).font = { bold: true, color: { argb: 'FFFFFF' }, size: 13, name: 'Calibri' };
    wsHist.getCell(`A${histHeaderRowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '548235' } }; // Verde oscuro
    wsHist.getCell(`A${histHeaderRowIdx}`).border = borderStyle;
    wsHist.getCell(`B${histHeaderRowIdx}`).border = borderStyle;
    wsHist.getCell(`C${histHeaderRowIdx}`).border = borderStyle;
    wsHist.getCell(`D${histHeaderRowIdx}`).border = borderStyle;
    // Encabezado de tabla (verde intermedio)
    const headerRowHist = wsHist.addRow(['Criterio', 'Descripción', 'Nivel', 'Cantidad']);
    headerRowHist.font = { bold: true, color: { argb: '000000' }, size: 12, name: 'Calibri' };
    headerRowHist.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A9D08E' } }; // Verde intermedio
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    // Filas de datos (verde muy suave)
    histogramas.forEach(h => {
      if (h.levelCounts && typeof h.levelCounts === 'object') {
        Object.entries(h.levelCounts).forEach(([nivel, cantidad]) => {
          const row = wsHist.addRow([
            h.criteriaDescription,
            h.criteriaDescription,
            nivel,
            cantidad
          ]);
          row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }; // Verde muy suave
            cell.border = borderStyle;
            cell.alignment = { vertical: 'middle', wrapText: true };
          });
        });
      }
    });
    autoWidth(wsHist);

    // Guardar archivo
    const nombreArchivo = `${(filtros.materia || 'materia').replace(/\s+/g, '_')}_${(filtros.rubrica || 'rubrica').replace(/\s+/g, '_')}_${(filtros.periodo || 'periodo').replace(/\s+/g, '_')}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), nombreArchivo);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 font-semibold flex items-center gap-2 shadow-md"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
        download
      </span>
      Exportar a Excel
    </button>
  );
};

export default ExportarExcelButton;
