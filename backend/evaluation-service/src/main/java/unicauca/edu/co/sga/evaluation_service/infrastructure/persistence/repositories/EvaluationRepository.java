package unicauca.edu.co.sga.evaluation_service.infrastructure.persistence.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import unicauca.edu.co.sga.evaluation_service.application.dto.response.stats.*;
import unicauca.edu.co.sga.evaluation_service.infrastructure.persistence.entities.EvaluationEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<EvaluationEntity, Long> {
    Boolean existsByEnrollIdAndRubric_IdRubrica(Long enrollId, Long rubricId);
    List<EvaluationEntity> findByEnrollId(Long enrollId);
    List<EvaluationEntity> findByRubric_IdRubrica(Long rubricId);

    @Query("SELECT e.score FROM EvaluationEntity e " +
            "JOIN e.enroll en " +
            "JOIN en.student s " +
            "JOIN en.course co " +
            "JOIN co.subject sub " +
            "JOIN e.rubric r " +
            "WHERE s.id = :studentId " +
            "AND sub.id = :subjectId " +
            "AND en.semester = :semester " +
            "AND r.idRubrica = :rubricId")
    Optional<BigDecimal> findEvaluationsByStudentAndSubject(
            @Param("studentId") Long studentId,
            @Param("subjectId") Long subjectId,
            @Param("semester") String semester,
            @Param("rubricId") Long rubricId);

    //SELECCIONA LA PUNTUACION PARA CADA ESTUDIANTE

    //@Query("SELECT s.name FROM SubjectEntity s JOIN s.course c WHERE c.id = :courseId")
    //String findNameByCourseId(@Param("courseId") Long courseId);

    @Query("""
    SELECT new unicauca.edu.co.sga.evaluation_service.application.dto.response.stats.EvaluationStats(e.score, ra.name)
    FROM EvaluationEntity e
    JOIN e.enroll en
    JOIN en.course co
    JOIN co.subject s
    JOIN e.rubric r
    JOIN r.ra ra
    WHERE (:subjectName IS NULL OR s.name = :subjectName)
    AND (:rubricName IS NULL OR r.nombreRubrica = :rubricName)
    AND (:period IS NULL OR en.semester = :period)
    AND e.score IS NOT NULL
    """)
    List<EvaluationStats> findStatsByFilters(@Param("rubricName") String rubricName,
                                             @Param("subjectName") String subjectName,
                                             @Param("period") String period);

    //HISTOGRAMA POR CRITERIO
    /*@Query(
            """
            SELECT 
                c.idCriterio as criteriaId,
                c.crfDescripcion as criteriaDescription,
                (
                    SELECT JSON_OBJECTAGG(n.nivelDescripcion, COUNT(cr.id))
                    FROM PerformanceEntity n
                    LEFT JOIN CalificationRegisterEntity cr ON cr.criterio.idCriterio = c.idCriterio 
                        AND cr.evaluation.id = e.id
                        AND cr.calification BETWEEN 
                            CAST(SUBSTRING_INDEX(n.rangoNota, '-', 1) AS double) 
                            AND 
                            CAST(SUBSTRING_INDEX(n.rangoNota, '-', -1) AS double)
                    WHERE n.criterio.idCriterio = c.idCriterio
                    GROUP BY n.criterio.idCriterio
                ) as levelCounts
            FROM CriteriaEntity c
            JOIN c.rubric r
            JOIN EvaluationEntity e ON e.rubric = r
            JOIN e.enroll en
            JOIN en.course co
            JOIN co.subject s
            WHERE (:subjectName IS NULL OR s.name = :subjectName)
              AND (:rubricName IS NULL OR r.nombreRubrica = :rubricName)
              AND (:period IS NULL OR en.semester = :period)
            GROUP BY c.idCriterio, c.crfDescripcion
            """
    )
    List<HistogramByCriteriaProjection> findHistogramByCriteria(
            @Param("subjectName") String subjectName,
            @Param("rubricName") String rubricName,
            @Param("period") String period
    );
    */
    /*
    @Query("""
    SELECT 
        c.idCriterio,
        c.crfDescripcion,
        n.idNivel,
        n.nivelDescripcion,
        CAST(SUBSTRING_INDEX(n.rangoNota, '-', 1) AS double) as minRango,
        CAST(SUBSTRING_INDEX(n.rangoNota, '-', -1) AS double) as maxRango
    FROM CriteriaEntity c
    JOIN c.niveles n
    JOIN c.rubric r
    JOIN EvaluationEntity e ON e.rubric = r
    JOIN e.enroll en
    JOIN en.course co
    JOIN co.subject s
    WHERE (:subjectName IS NULL OR s.name = :subjectName)
      AND (:rubricName IS NULL OR r.nombreRubrica = :rubricName)
      AND (:period IS NULL OR en.semester = :period)
    ORDER BY c.idCriterio, n.idNivel
""")
    List<Object[]> findCriteriaWithActualLevels(
            @Param("subjectName") String subjectName,
            @Param("rubricName") String rubricName,
            @Param("period") String period
    );

    @Query("""
    SELECT COUNT(cr.id)
    FROM CalificationRegisterEntity cr
    JOIN cr.evaluation e
    JOIN e.enroll en
    JOIN en.course co
    JOIN co.subject s
    WHERE cr.criterio.idCriterio = :criteriaId
      AND (
          (cr.calification BETWEEN :minRango AND :maxRango)
          OR
          (cr.calification = :maxRango AND :maxRango = 5.0)  
      )
      AND (:subjectName IS NULL OR s.name = :subjectName)
      AND (:rubricName IS NULL OR e.rubric.nombreRubrica = :rubricName)
      AND (:period IS NULL OR en.semester = :period)
""")
    Long countStudentsByLevelRange(
            @Param("criteriaId") Long criteriaId,
            @Param("minRango") Double minRango,
            @Param("maxRango") Double maxRango,
            @Param("subjectName") String subjectName,
            @Param("rubricName") String rubricName,
            @Param("period") String period
    );

    @Query("""
    SELECT 
        c.idCriterio,
        c.crfDescripcion,
        n.idNivel,
        n.nivelDescripcion,
        n.rangoNota,
        (
            SELECT COUNT(cr.id)
            FROM CalificationRegisterEntity cr
            JOIN cr.evaluation ev
            JOIN ev.enroll enr
            JOIN enr.course cour
            JOIN cour.subject sub
            WHERE cr.criterio.idCriterio = c.idCriterio
              AND cr.calification >= CAST(SUBSTRING_INDEX(n.rangoNota, '-', 1) AS double)
              AND cr.calification <= 
                  CASE WHEN n.idNivel = (SELECT MAX(n2.idNivel) FROM PerformanceEntity n2 WHERE n2.criterio = c)
                       THEN CAST(SUBSTRING_INDEX(n.rangoNota, '-', -1) AS double)
                       ELSE CAST(SUBSTRING_INDEX(n.rangoNota, '-', -1) AS double) - 0.01
                  END
              AND (:subjectName IS NULL OR sub.name = :subjectName)
              AND (:rubricName IS NULL OR ev.rubric.nombreRubrica = :rubricName)
              AND (:period IS NULL OR enr.semester = :period)
        ) as conteo
    FROM CriteriaEntity c
    JOIN c.niveles n
    JOIN c.rubric r
    JOIN EvaluationEntity e ON e.rubric = r
    JOIN e.enroll en
    JOIN en.course co
    JOIN co.subject s
    WHERE (:subjectName IS NULL OR s.name = :subjectName)
      AND (:rubricName IS NULL OR r.nombreRubrica = :rubricName)
      AND (:period IS NULL OR en.semester = :period)
    ORDER BY c.idCriterio, n.idNivel
""")
    List<Object[]> findHistogramDataCorrected(
            @Param("subjectName") String subjectName,
            @Param("rubricName") String rubricName,
            @Param("period") String period
    );*/

    @Query("""
    SELECT 
        c.idCriterio,
        c.crfDescripcion,
        n.idNivel,
        n.nivelDescripcion,
        n.rangoNota,
        (
            SELECT COUNT(cr.id)
            FROM CalificationRegisterEntity cr
            JOIN cr.evaluation ev
            JOIN ev.enroll enr
            JOIN enr.course cour
            JOIN cour.subject sub
            WHERE cr.criterio.idCriterio = c.idCriterio
              AND (
                  (n.idNivel = (SELECT MIN(n3.idNivel) FROM PerformanceEntity n3 WHERE n3.criterio = c)
                  AND cr.calification BETWEEN 
                      CAST(SUBSTRING_INDEX(n.rangoNota, '-', 1) AS double)
                      AND 
                      CAST(SUBSTRING_INDEX(n.rangoNota, '-', -1) AS double))
                  OR
                  (n.idNivel != (SELECT MIN(n4.idNivel) FROM PerformanceEntity n4 WHERE n4.criterio = c)
                  AND cr.calification > CAST(SUBSTRING_INDEX(n.rangoNota, '-', 1) AS double)
                  AND cr.calification <= CAST(SUBSTRING_INDEX(n.rangoNota, '-', -1) AS double))
              )
              AND (:subjectName IS NULL OR sub.name = :subjectName)
              AND (:rubricName IS NULL OR ev.rubric.nombreRubrica = :rubricName)
              AND (:period IS NULL OR enr.semester = :period)
        )
    FROM CriteriaEntity c
    JOIN c.niveles n
    JOIN c.rubric r
    JOIN EvaluationEntity e ON e.rubric = r
    JOIN e.enroll en
    JOIN en.course co
    JOIN co.subject s
    WHERE (:subjectName IS NULL OR s.name = :subjectName)
      AND (:rubricName IS NULL OR r.nombreRubrica = :rubricName)
      AND (:period IS NULL OR en.semester = :period)
    ORDER BY c.idCriterio, n.idNivel
""")
    List<Object[]> findCriteriaWithAccurateCounts(
            @Param("subjectName") String subjectName,
            @Param("rubricName") String rubricName,
            @Param("period") String period
    );

    //PROMEDIO POR CRITERIO

    @Query(
            """
SELECT new unicauca.edu.co.sga.evaluation_service.application.dto.response.stats.CriteriaAverageDTO(
    c.idCriterio,
    c.crfDescripcion,
    AVG(cr.calification)
)

            FROM CriteriaEntity c
            JOIN c.rubric r
            JOIN EvaluationEntity e ON e.rubric = r
            JOIN CalificationRegisterEntity cr ON cr.evaluation = e AND cr.criterio = c
            JOIN e.enroll en
            JOIN en.course co
            JOIN co.subject s
            WHERE (:subjectName IS NULL OR s.name = :subjectName)
              AND (:rubricName IS NULL OR r.nombreRubrica = :rubricName)
              AND (:period IS NULL OR en.semester = :period)
            GROUP BY c.idCriterio, c.crfDescripcion
            """
    )
    List<CriteriaAverageDTO> findCriteriaAverages(
            @Param("subjectName") String subjectName,
            @Param("rubricName") String rubricName,
            @Param("period") String period
    );

    @Query("SELECT new unicauca.edu.co.sga.evaluation_service.infrastructure.persistence.entities.EvaluationEntity(" +
            "e.id, e.enroll, e.rubric, e.evaluationStatus, e.description, e.score, e.evidenceUrl) " +
            " FROM EvaluationEntity e"
            + " JOIN e.enroll en " +
            " JOIN e.rubric r " +
            " WHERE en.id = :enrollId AND r.idRubrica = :rubricId"
    )
    EvaluationEntity findByEnrollAndRubricId(@Param("enrollId") Long enrollId, @Param("rubricId") Long rubricId);

    @Query("SELECT new unicauca.edu.co.sga.evaluation_service.application.dto.response.stats.CriteriaStatsDTO" +
            " (ni.rangoNota, cr.calification, cr.level, cri.crfDescripcion, cri.idCriterio ) " +
            " FROM CalificationRegisterEntity cr" +
            " JOIN cr.criterio cri " +
            " JOIN cr.evaluation e " +
            " JOIN cri.niveles ni " +
            " JOIN e.enroll en" +
            " JOIN e.rubric r" +
            " JOIN r.subject s " +
            " JOIN en.course co " +
            " WHERE r.idRubrica = :rubricaId" +
            " AND s.id = :subjectId" +
            " AND en.semester = :semester")
    List<CriteriaStatsDTO> findCalificationAndLevel(@Param("rubricaId") Long rubricaId, @Param("subjectId") Long subjectId, @Param("semester") String semester);



}


