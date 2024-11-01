import React from "react";
import "./Empresas.css";
const Empresas = () => {
  return (
    <div className="max-w-[1200px] mx-auto flex justify-center items-center  empresas">
      <div className="agencia-viaje">
        <img
          className="w-[300px]"
          src="/image/Empresas/agencia.png"
          alt="Agencia de Viajes y Turismo Registrada"
        />
      </div>
      <div className="ministerio">
        <img
          className="w-[300px]"
          src="/image/Empresas/Mincetu.png"
          alt="Ministerio de Comercio Exterior y Turismo"
        />
      </div>
    </div>
  );
};

export default Empresas;
