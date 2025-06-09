package unicauca.edu.co.sga.evaluation_service.application.dto.response.stats;

import lombok.*;

public interface HistogramByCriteriaProjection {
    Long getCriteriaId();
    String getCriteriaDescription();
    String getLevelCounts();
}