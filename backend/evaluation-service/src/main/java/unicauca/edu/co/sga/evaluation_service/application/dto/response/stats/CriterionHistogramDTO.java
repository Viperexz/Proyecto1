package unicauca.edu.co.sga.evaluation_service.application.dto.response.stats;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

//BORRAR
@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriterionHistogramDTO {
    private Long idCriterio;
    private String descripcion;
    @Setter
    @Getter
    private List<HistogramByCriteriaProjection> niveles;

    public CriterionHistogramDTO(Long idCriterio, String descripcion) {
        this.idCriterio = idCriterio;
        this.descripcion = descripcion;
        this.niveles = new ArrayList<>();
    }
}

