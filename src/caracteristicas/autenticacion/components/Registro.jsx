import { useState } from "react";
import CompanyRegister from "./CompanyRegister";
import CandidateRegister from "./CandidateRegister";
import "../../../style.css";

function Registro() {
    const [tipo, setTipo] = useState("candidate");

    return (
        <div className="page-center">
            <div className="card">
                <h2 className="card-title">Crear cuenta</h2>

                <select
                    className="input"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                >
                    <option value="candidate">Postulante</option>
                    <option value="company">Empresa</option>
                </select>

                {tipo === "candidate" && <CandidateRegister />}
                {tipo === "company" && <CompanyRegister />}
            </div>
        </div>
    );
}

export default Registro;
