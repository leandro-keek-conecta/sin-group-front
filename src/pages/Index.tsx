import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para a página de identificação
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sinGroup-light-gray">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Carregando Sin Group
        </h1>
        <p className="text-xl text-gray-600">
          Plataforma de Apoio a Tomada de Decisão
        </p>
      </div>
    </div>
  );
}
