"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRubricById } from "@/services/rubricService";
import { RubricInterface } from "@/interfaces/RubricInterface";

export default function RubricDetail() {
    const { id } = useParams<{ id: string }>();
    const [rubric, setRubric] = useState<RubricInterface | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            getRubricById(id)
                .then((data) => setRubric(data))
                .catch((error) => console.error(error));
        }
    }, [id]);

    if (!rubric) {
        return <p className="text-center text-red-500">Rúbrica no encontrada.</p>;
    }

    return (
        <div className="overflow-x-auto p-4">
            <h2 className="title2 border-b-2 border-red-500 inline-block" style={{ color: "var(--primary-regular-color)" }}>
                Visualizar Rúbrica
            </h2>

            <div className="flex flex-wrap gap-4 mb-4">
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <p className="font-semibold">Identificador:</p>
                    <p className="border p-2 rounded">{rubric.idRubrica}</p>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <p className="font-semibold">Nombre:</p>
                    <p className="border p-2 rounded">{rubric.nombreRubrica}</p>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <p className="font-semibold">Nota Máxima:</p>
                    <p className="border p-2 rounded">{rubric.notaRubrica}</p>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <p className="font-semibold">Materia:</p>
                    <p className="border p-2 rounded">{rubric.materia || rubric.nombreMateria}</p>
                </div>
                <div className="w-full">
                    <p className="font-semibold">Objetivo de Estudio:</p>
                    <p className="border p-2 rounded">{rubric.objetivoEstudio}</p>
                </div>
            </div>

            <table className="w-full table-fixed border border-gray-300 text-sm">
                <thead>
                <tr>
                    <th className="border border-gray-300 bg-gray-200 px-4 py-2"></th>
                    <th colSpan={rubric.criterios[0]?.niveles.length} className="border border-gray-300 bg-gray-200 text-black px-4 py-2 text-center">
                        DESCRIPTORES
                    </th>
                    <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-center"></th>
                </tr>
                <tr>
                    <th className="border border-gray-300 bg-[#000066] text-white px-4 py-2 text-left min-w-[150px]">
                        CRITERIOS
                    </th>
                    {rubric.criterios[0]?.niveles.map((nivel, index) => (
                        <th
                            key={index}
                            className="border border-gray-300 bg-[#000066] text-white px-4 py-2 text-center break-words min-w-[130px]"
                        >
                            {`Nivel ${nivel.idNivel}`}<br />
                            {nivel.rangoNota}
                        </th>
                    ))}
                    <th className="border border-gray-300 bg-[#000066] text-white px-4 py-2 text-center min-w-[100px]">
                        Porcentaje
                    </th>
                </tr>
                </thead>
                <tbody>
                {rubric.criterios.map((criterio, index) => (
                    <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 break-words">{criterio.crfDescripcion}</td>
                        {criterio.niveles.map((nivel, i) => (
                            <td key={i} className="border border-gray-300 px-4 py-2 break-words">{nivel.nivelDescripcion}</td>
                        ))}
                        <td className="border border-gray-300 px-4 py-2 text-center">{criterio.crfPorcentaje}%</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="flex gap-4 mt-4">
                <button
                    onClick={() => navigate('/evaluaciones')}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Ir a Evaluación
                </button>
                <button
                    onClick={() => navigate('/rubricas')}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                    Volver a Consultar Rúbrica
                </button>
            </div>
        </div>
    );
}