import React, { useEffect, useState } from "react";
import {
  FaBed,
  FaCalendarCheck,
  FaUsers,
  FaChartLine,
  FaMoneyBillWave,
  FaUserTie,
} from "react-icons/fa";

export default function Dashboard() {
  const [habitaciones, setHabitaciones] = useState(0);
  const [habitacionesTotales, setHabitacionesTotales] = useState(0);
  const [reservas, setReservas] = useState(0);
  const [huespedes, setHuespedes] = useState(0);
  const [empleados, setEmpleados] = useState(0);
  const [ingresosDia, setIngresosDia] = useState(0);
  const [loading, setLoading] = useState(true); //indica carga de datos

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Habitaciones
        const resHabitaciones = await fetch(`${API_URL}/habitaciones`);
        const dataHabitaciones = await resHabitaciones.json();
        setHabitacionesTotales(dataHabitaciones.length);
        setHabitaciones(
          dataHabitaciones.filter((h) => h.estado === "Disponible").length
        );

        // Reservas
        const resReservas = await fetch(`${API_URL}/reservas`);
        const dataReservas = await resReservas.json();
        setReservas(dataReservas.filter((r) => r.estado === "Activa").length);

        // Huéspedes
        const resHuespedes = await fetch(`${API_URL}/huespedes`);
        const dataHuespedes = await resHuespedes.json();
        setHuespedes(dataHuespedes.length);

        // Empleados
        const resEmpleados = await fetch(`${API_URL}/empleados`);
        const dataEmpleados = await resEmpleados.json();
        setEmpleados(dataEmpleados.length);

        // Ingresos del día (reservas creadas hoy y activas)
        const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const reservasHoy = dataReservas.filter((reserva) => {
          if (!reserva.fecha_creacion) return false;
          const fechaCreacion = new Date(reserva.fecha_creacion)
            .toISOString()
            .split("T")[0];
          return fechaCreacion === hoy && reserva.estado === "Activa";
        });
        const totalIngresos = reservasHoy.reduce((total, reserva) => {
          return total + parseFloat(reserva.precio || 0);
        }, 0);
        setIngresosDia(totalIngresos);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h4>Cargando datos del dashboard...</h4>
      </div>
    );
  }

  return (
    <div className="h-100">
      <div className="container-fluid p-4">
        <div className="text-center mb-4">
          <h1
            className="fw-bold mb-2"
            style={{
              background:
                "linear-gradient(135deg, #1660a1ff 0%, #05162bff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Panel de Control
          </h1>
          <p className="text-muted mb-0">
            Última actualización:{" "}
            {new Date().toLocaleString("es-ES", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="row g-4 mb-4">
          {/* Habitaciones */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card text-white h-100"
              style={{
                background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
              }}
            >
              <div className="card-body text-center">
                <FaBed className="mb-3" size={40} />
                <h6 className="text-uppercase">Habitaciones Disponibles</h6>
                <h2 className="fw-bold mb-0">{habitaciones}</h2>
                <small className="opacity-75">
                  de {habitacionesTotales} totales
                </small>
              </div>
            </div>
          </div>

          {/* Reservas */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card text-white h-100"
              style={{
                background: "linear-gradient(135deg, #e53935 0%, #ef5350 100%)",
              }}
            >
              <div className="card-body text-center">
                <FaCalendarCheck className="mb-3" size={40} />
                <h6 className="text-uppercase">Reservas Activas</h6>
                <h2 className="fw-bold mb-0">{reservas}</h2>
                <small className="opacity-75">en curso</small>
              </div>
            </div>
          </div>

          {/* Huéspedes */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card text-white h-100"
              style={{
                background: "linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)",
              }}
            >
              <div className="card-body text-center">
                <FaUsers className="mb-3" size={40} />
                <h6 className="text-uppercase">Huéspedes Registrados</h6>
                <h2 className="fw-bold mb-0">{huespedes}</h2>
                <small className="opacity-75">en la base de datos</small>
              </div>
            </div>
          </div>

          {/* Empleados */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card text-white h-100"
              style={{
                background: "linear-gradient(135deg, #fb8c00 0%, #ffa726 100%)",
              }}
            >
              <div className="card-body text-center">
                <FaUserTie className="mb-3" size={40} />
                <h6 className="text-uppercase">Empleados Activos</h6>
                <h2 className="fw-bold mb-0">{empleados}</h2>
                <small className="opacity-75">personal en servicio</small>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficas e ingresos */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle p-3 me-3"
                    style={{
                      background:
                        "linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)",
                    }}
                  >
                    <FaChartLine className="text-white" />
                  </div>
                  <div>
                    <h5 className="card-title mb-0">Ocupación Mensual</h5>
                    <small className="text-muted">
                      {new Date().toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })}
                    </small>
                  </div>
                </div>
                <div
                  className="progress"
                  style={{ height: "30px", borderRadius: "10px" }}
                >
                  <div
                    className="progress-bar text-white fw-semibold"
                    style={{
                      width: `${
                        habitacionesTotales > 0
                          ? Math.round(
                              ((habitacionesTotales - habitaciones) /
                                habitacionesTotales) *
                                100
                            )
                          : 0
                      }%`,
                      background:
                        "linear-gradient(90deg, #1e88e5 0%, #42a5f5 100%)",
                    }}
                  >
                    {habitacionesTotales > 0
                      ? Math.round(
                          ((habitacionesTotales - habitaciones) /
                            habitacionesTotales) *
                            100
                        )
                      : 0}
                    % ocupación
                  </div>
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    {habitacionesTotales - habitaciones} de{" "}
                    {habitacionesTotales} habitaciones ocupadas
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle p-3 me-3"
                    style={{
                      background:
                        "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
                    }}
                  >
                    <FaMoneyBillWave className="text-white" />
                  </div>
                  <div>
                    <h5 className="card-title mb-0">Ingresos del Día</h5>
                    <small className="text-muted">
                      {new Date().toLocaleDateString("es-ES")}
                    </small>
                  </div>
                </div>
                <h2
                  className="fw-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  $
                  {ingresosDia.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </h2>
                <div className="mt-3">
                  <small className="text-muted">
                    Generados por reservas activas
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
