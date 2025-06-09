package unicauca.edu.co.sga.evaluation_service.application.dto.response.stats;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import unicauca.edu.co.sga.evaluation_service.domain.enums.CalificationEnums;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class HistogramByCriteriaDTO {
    private Long criteriaId;
    private String criteriaDescription;
    private Map<String, Long> levelCounts;

    public HistogramByCriteriaDTO(Long criteriaId, String criteriaDescription, Map<String, Long> levelCounts) {
        this.criteriaId = criteriaId;
        this.criteriaDescription = criteriaDescription;
        this.levelCounts = levelCounts;
    }
}
