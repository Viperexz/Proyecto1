import api from "@/services/api";

export interface FilterStatsDTO {
  subjectName: string;
  rubricName: string;
  period: string;
}

export interface CourseStatsDTO {
  raName: string;
  average: number;
  median: number;
  standardDeviation: number;
  minScore: number;
  maxScore: number;
  studentsCount: number;
}

export interface CriteriaDTO {
  rubricId: number;
  subjectId: number;
  semester: string;
}

export interface CriteriaStatsResponseDTO {
  criteriaId: number;
  criteriaDescription: string;
  levelCounts: Record<string, number>;
}

export interface CriteriaAverageDTO {
  idCriterio: number;
  criterioDescripcion: string;
  promedioNota: number;
}

export async function getStatsByRubric(
  filter: FilterStatsDTO
): Promise<CourseStatsDTO> {
  try {
    const { data } = await api.post("/stats/by-rubric", filter);
    return data;
  } catch (error) {
    console.error("Error al obtener estadísticas por rúbrica:", error);
    throw new Error("Error al obtener las estadísticas por rúbrica");
  }
}

export async function getHistogramByCriteria(
  criteria: FilterStatsDTO
): Promise<CriteriaStatsResponseDTO[]> {
  try {
    const { data } = await api.post("/stats/by-criteria", criteria);
    console.log("Se consume este servicio");
    return data;
  } catch (error) {
    console.error("Error al obtener histograma por criterio:", error);
    throw new Error("Error al obtener el histograma por criterio");
  }
}

export async function getCriteriaAverages(
  filter: FilterStatsDTO
): Promise<CriteriaAverageDTO[]> {
  try {
    const { data } = await api.post("/stats/criteria-stats", filter);
    return data;
  } catch (error) {
    console.error("Error al obtener promedios por criterio:", error);
    throw new Error("Error al obtener los promedios por criterio");
  }
}

export async function getEstadisticasPorMateria(
  materiaId: string
): Promise<CourseStatsDTO> {
  try {
    const { data } = await api.get(`/estadisticas/materia/${materiaId}`);
    return data;
  } catch (error) {
    console.error("Error al obtener estadísticas por materia:", error);
    throw new Error("Error al obtener las estadísticas de la materia");
  }
}

export async function getEstadisticasPorRubrica(
  rubricaId: string
): Promise<CourseStatsDTO> {
  try {
    const { data } = await api.get(`/estadisticas/rubrica/${rubricaId}`);
    return data;
  } catch (error) {
    console.error("Error al obtener estadísticas por rúbrica:", error);
    throw new Error("Error al obtener las estadísticas de la rúbrica");
  }
}

export async function getEstadisticasPorPeriodo(
  periodoId: string
): Promise<CourseStatsDTO> {
  try {
    const { data } = await api.get(`/estadisticas/periodo/${periodoId}`);
    return data;
  } catch (error) {
    console.error("Error al obtener estadísticas por período:", error);
    throw new Error("Error al obtener las estadísticas del período");
  }
}
