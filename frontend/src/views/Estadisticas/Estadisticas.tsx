import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import PageTitle from "../../components/pageTitle/pageTitle";
import ActionButtons from "../../components/utils/actionButtons";
import EstadisticasFilters from "./components/EstadisticasFilters";
import EstadisticasCards from "./components/EstadisticasCards";
import PromedioPorCriterioChart from "./components/PromedioPorCriterioChart";
import HistogramaCriterioChart from "./components/HistogramaCriterioChart";
import ExportarExcelButton from "./components/ExportarExcelButton";
import ExportarPDFButton from "./components/ExportarPDFButton";
import EstadisticasStateHandler from "./components/EstadisticasStateHandler";
import { useEstadisticasData } from "./hooks/useEstadisticasData";
import { 
  getStatsByRubric, 
  getHistogramByCriteria,
  getCriteriaAverages,
  CriteriaAverageDTO,
  CourseStatsDTO
} from "../../services/estadisticasService";
import { CourseStatsDTO as CourseStatsDTOType } from "./types/index.ts";
import { CriteriaStatsResponseDTO } from "../../services/estadisticasService";
import axios from "axios";

const Estadisticas: React.FC = () => {
  const location = useLocation();
  const state = location.state as { materia?: string; rubrica?: string; periodo?: string };
  const {
    materias,
    selectedMateria,
    setSelectedMateria,
    rubricas,
    selectedRubrica,
    periodos,
    selectedPeriodo,
    setSelectedPeriodo,
    handleSelectRubrica,
    raName,
  } = useEstadisticasData();

  const [estadisticas, setEstadisticas] = useState<CourseStatsDTO | null>(null);
  const [histogramas, setHistogramas] = useState<CriteriaStatsResponseDTO[]>([]);
  const [promediosCriterios, setPromediosCriterios] = useState<CriteriaAverageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);
  const [aplicadoFiltrosIniciales, setAplicadoFiltrosIniciales] = useState(false);

  // Limpiar datos si falta algún filtro
  useEffect(() => {
    setError(null); // Limpia el error al cambiar filtros
    if (!selectedMateria || !selectedRubrica || !selectedPeriodo) {
      setEstadisticas(null);
      setHistogramas([]);
      setPromediosCriterios([]);
    }
  }, [selectedMateria, selectedRubrica, selectedPeriodo]);

  const handleBeforePrint = () => {
    setIsPrintMode(true);
  };

  const handleAfterPrint = () => {
    setIsPrintMode(false);
  };

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedMateria || !selectedRubrica || !selectedPeriodo) {
        setError("Por favor, selecciona todos los filtros necesarios");
        return;
      }

      const filter = {
        subjectName: selectedMateria,
        rubricName: selectedRubrica.nombreRubrica,
        period: selectedPeriodo
      };

      // Cargar estadísticas generales
      const statsData = await getStatsByRubric(filter);
      setEstadisticas(statsData);

      // Cargar histogramas por criterio
      const histogramCriteriaDTO = {
        subjectName: selectedMateria,
        rubricName: selectedRubrica.nombreRubrica,
        period: selectedPeriodo
      };
      const histogramData = await getHistogramByCriteria(histogramCriteriaDTO);
      setHistogramas(histogramData);

      // Cargar promedios por criterio
      const promediosData = await getCriteriaAverages(filter);
      setPromediosCriterios(promediosData);

    } catch (err) {
      // Detectar si es un 404 y el mensaje es "No evaluations found"
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 404 &&
        typeof err.response?.data === 'string' &&
        err.response.data.includes('No evaluations found')
      ) {
        setEstadisticas(null);
        setHistogramas([]);
        setPromediosCriterios([]);
        setError(null);
      } else {
        setError(
          "No se encontraron datos para los filtros seleccionados."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Limpiar filtros al montar si no hay state de navegación
  useEffect(() => {
    if (!location.state) {
      setSelectedMateria("");
      setSelectedPeriodo("");
      handleSelectRubrica("");
      setAplicadoFiltrosIniciales(false);
    }
    // eslint-disable-next-line
  }, []);

  // Fijar materia primero
  useEffect(() => {
    if (
      !aplicadoFiltrosIniciales &&
      state &&
      materias.length > 0 &&
      state.materia &&
      materias.some((m) => m.name === state.materia)
    ) {
      setSelectedMateria(state.materia);
    }
  }, [state, materias, aplicadoFiltrosIniciales]);

  // Fijar rúbrica y período después de la materia
  useEffect(() => {
    if (
      !aplicadoFiltrosIniciales &&
      state &&
      rubricas.length > 0 &&
      ((state.rubrica && rubricas.some((r) => r.nombreRubrica === state.rubrica || r.name === state.rubrica)) ||
        (state.periodo && periodos.includes(state.periodo)))
    ) {
      if (state.rubrica) handleSelectRubrica(state.rubrica);
      if (state.periodo) setSelectedPeriodo(state.periodo);
      setAplicadoFiltrosIniciales(true);
    }
  }, [state, rubricas, periodos, aplicadoFiltrosIniciales]);

  useEffect(() => {
    if (selectedMateria && selectedRubrica && selectedPeriodo) {
      cargarEstadisticas();
    }
  }, [selectedMateria, selectedRubrica, selectedPeriodo]);

  const hasData = Boolean(
    estadisticas &&
    (estadisticas.average !== null && estadisticas.median !== null && estadisticas.standardDeviation !== null &&
      estadisticas.maxScore !== null && estadisticas.minScore !== null)
  );

  return (
    <div ref={printRef} className="estadisticas-main-container">
      <div className="header-row">
        <PageTitle title="Estadísticas" />
      </div>

      <EstadisticasFilters
        materias={materias.map((m) => m.name)}
        rubricas={rubricas.map((r) => r.nombreRubrica || r.name).filter((x): x is string => Boolean(x))}
        periodos={periodos}
        materiaSeleccionada={selectedMateria}
        rubricaSeleccionada={selectedRubrica?.nombreRubrica || selectedRubrica?.name || ""}
        periodoSeleccionado={selectedPeriodo}
        resultadoAprendizaje={raName}
        onSelectMateria={setSelectedMateria}
        onSelectRubrica={handleSelectRubrica}
        onSelectPeriodo={setSelectedPeriodo}
      />

      <EstadisticasStateHandler
        loading={loading}
        error={error}
        hasData={hasData}
        filtrosCompletos={Boolean(selectedMateria && selectedRubrica && selectedPeriodo)}
      />

      {selectedMateria && selectedRubrica && selectedPeriodo && !loading && !error && hasData && estadisticas && (
        <div className="estadisticas-content-centered">
          <EstadisticasCards
            media={estadisticas.average}
            desviacionEstandar={estadisticas.standardDeviation}
            maximo={estadisticas.maxScore}
            minimo={estadisticas.minScore}
          />
          <HistogramaCriterioChart 
            histogramas={histogramas.map(h => ({
              criterio: h.criteriaDescription,
              descripcion: h.criteriaDescription,
              niveles: Object.entries(h.levelCounts).map(([nivel, cantidad]) => ({
                nivel,
                cantidad
              }))
            }))}
            isPrintMode={isPrintMode}
          />
          <PromedioPorCriterioChart 
            data={promediosCriterios.map(c => ({
              nombre: c.criterioDescripcion,
              promedio: c.promedioNota
            }))} 
          />
          <div
            className="estadisticas-export-buttons"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              verticalAlign: "middle",
              gap: 16,
              paddingTop: 24,
              width: "100%"
            }}
          >
            <ExportarExcelButton 
              estadisticas={estadisticas} 
              criterios={promediosCriterios}
              histogramas={histogramas}
              filtros={{
                materia: selectedMateria,
                rubrica: selectedRubrica?.name || selectedRubrica?.nombreRubrica || "",
                periodo: selectedPeriodo,
                resultadoAprendizaje: raName,
              }}
            />
            <ExportarPDFButton 
              targetRef={printRef} 
              onBeforePrint={handleBeforePrint}
              onAfterPrint={handleAfterPrint}
              filtros={{
                materia: selectedMateria,
                rubrica: selectedRubrica?.name || selectedRubrica?.nombreRubrica || "",
                periodo: selectedPeriodo
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Estadisticas;
