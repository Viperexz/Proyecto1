package unicauca.edu.co.sga.evaluation_service.application.services.stats;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import unicauca.edu.co.sga.evaluation_service.application.dto.response.stats.FilterStatsDTO;
import unicauca.edu.co.sga.evaluation_service.application.dto.response.stats.HistogramByCriteriaDTO;
import unicauca.edu.co.sga.evaluation_service.application.dto.response.stats.HistogramByCriteriaProjection;
import unicauca.edu.co.sga.evaluation_service.infrastructure.persistence.repositories.EvaluationRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistogramCriteriaService {

    private final EvaluationRepository evaluationRepository;
    //private final ObjectMapper objectMapper;

    public List<HistogramByCriteriaDTO> getHistogramByCriteria(String subjectName, String rubricName, String period) {
        /*List<Object[]> criteriaData = evaluationRepository.findCriteriaWithActualLevels(
                subjectName, rubricName, period);

        // 2. Organizar por criterio
        Map<Long, List<Object[]>> criteriaMap = criteriaData.stream()
                .collect(Collectors.groupingBy(row -> (Long) row[0]));

        List<HistogramByCriteriaDTO> result = new ArrayList<>();

        // 3. Procesar cada criterio
        for (Map.Entry<Long, List<Object[]>> entry : criteriaMap.entrySet()) {
            Long criteriaId = entry.getKey();
            List<Object[]> levels = entry.getValue();

            // Ordenar niveles por ID
            levels.sort(Comparator.comparing(row -> (Long) row[2]));

            // Obtener descripción del criterio (usamos el primer registro)
            String criteriaDescription = (String) levels.get(0)[1];

            Map<String, Long> levelCounts = new LinkedHashMap<>();

            // 4. Contar estudiantes para cada nivel
            for (Object[] level : levels) {
                Long levelId = (Long) level[2];
                String levelDescription = (String) level[3];
                Double minRango = (Double) level[4];
                Double maxRango = (Double) level[5];

                // Determinar si es el último nivel
                boolean isLastLevel = levelId.equals(levels.get(levels.size()-1)[2]);

                Long count = evaluationRepository.countStudentsByLevelRange(
                        criteriaId,
                        minRango,
                        isLastLevel ? maxRango : maxRango - 0.1,
                        subjectName,
                        rubricName,
                        period
                );

                String levelKey = levelDescription + " (" + minRango + "-" + maxRango + ")";
                levelCounts.put(levelKey, count);
            }

            result.add(new HistogramByCriteriaDTO(criteriaId, criteriaDescription, levelCounts));
        }

        return result;*/
        List<Object[]> results = evaluationRepository.findCriteriaWithAccurateCounts(
                subjectName, rubricName, period);

        Map<Long, HistogramByCriteriaDTO> resultMap = new LinkedHashMap<>();

        for (Object[] row : results) {
            Long criteriaId = (Long) row[0];
            String criteriaDesc = (String) row[1];
            String levelDesc = (String) row[3];
            String rangeNota = (String) row[4];
            Long count = (Long) row[5];

            HistogramByCriteriaDTO dto = resultMap.computeIfAbsent(
                    criteriaId,
                    id -> new HistogramByCriteriaDTO(id, criteriaDesc, new LinkedHashMap<>()));

            String levelKey = levelDesc + " (" + rangeNota + ")";
            dto.getLevelCounts().put(levelKey, count);
        }

        return new ArrayList<>(resultMap.values());
    }
    private static class LevelInfo {
        Long id;
        String description;
        Double minRango;
        Double maxRango;

        LevelInfo(Long id, String description, Double minRango, Double maxRango) {
            this.id = id;
            this.description = description;
            this.minRango = minRango;
            this.maxRango = maxRango;
        }
    }
}
