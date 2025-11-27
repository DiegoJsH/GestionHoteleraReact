import React, { useEffect, useState } from "react";
import {
  FaChartPie,
  FaMoneyBillWave,
  FaBed,
  FaUsers,
  FaConciergeBell,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTrophy,
  FaCalendarAlt,
} from "react-icons/fa";

// Componente reutilizable para tarjetas de resumen
const SummaryCard = ({ icon: Icon, title, value, gradient }) => (
  <div className="col-md-3 col-sm-6">
    <div
      className="card shadow-sm border-0 text-center p-3 h-100"
      style={{ background: gradient }}
    >
      <Icon size={35} className="text-white mb-2" />
      <h6 className="text-white text-uppercase mb-1">{title}</h6>
      <h2 className="fw-bold text-white mb-0">{value}</h2>
    </div>
  </div>
);

// Componente para filas de estadísticas
const StatRow = ({ icon: Icon, label, value, color, isLast }) => (
  <div
    className={`d-flex justify-content-between align-items-center ${
      !isLast ? "mb-3 pb-3 border-bottom" : ""
    }`}
  >
    <div className="d-flex align-items-center">
      <Icon className={`text-${color} me-2`} size={24} />
      <span className="fw-bold">{label}</span>
    </div>
    <h4 className={`mb-0 text-${color}`}>{value}</h4>
  </div>
);

const Reportes = () => {
  const [reportes, setReportes] = useState({
    totalHabitaciones: 0,
    habitacionesOcupadas: 0,
    habitacionesDisponibles: 0,
    habitacionesMantenimiento: 0,
    totalHuespedes: 0,
    ingresosTotales: 0,
    promedioOcupacion: 0,
    reservasActivas: 0,
    reservasCompletadas: 0,
    reservasCanceladas: 0,
  });

  const [habitacionesPorTipo, setHabitacionesPorTipo] = useState([]);
  const [topHabitaciones, setTopHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const [habitacionesRes, huespedesRes, ingresosRes, reservasRes] =
          await Promise.all([
            fetch(`${API_URL}/habitaciones`),
            fetch(`${API_URL}/huespedes`),
            fetch(`${API_URL}/ingresos`),
            fetch(`${API_URL}/reservas`),
          ]);

        if (
          !habitacionesRes.ok ||
          !huespedesRes.ok ||
          !ingresosRes.ok ||
          !reservasRes.ok
        ) {
          throw new Error("Error al obtener datos del servidor");
        }

        const dataHabitaciones = await habitacionesRes.json();
        const dataHuespedes = await huespedesRes.json();
        const dataIngresos = await ingresosRes.json();
        const dataReservas = await reservasRes.json();

        // Cálculos básicos
        const totalHabitaciones = dataHabitaciones.length;
        const habitacionesOcupadas = dataHabitaciones.filter(
          (h) => h.estado === "Ocupada"
        ).length;
        const habitacionesDisponibles = dataHabitaciones.filter(
          (h) => h.estado === "Disponible"
        ).length;
        const habitacionesMantenimiento = dataHabitaciones.filter(
          (h) => h.estado === "Mantenimiento"
        ).length;
        const totalHuespedes = dataHuespedes.length;
        const ingresosTotales = dataIngresos.reduce(
          (acc, item) => acc + parseFloat(item.monto || 0),
          0
        );
        const promedioOcupacion =
          totalHabitaciones > 0
            ? ((habitacionesOcupadas / totalHabitaciones) * 100).toFixed(1)
            : 0;

        // Estadísticas de reservas
        const reservasActivas = dataReservas.filter(
          (r) => r.estado === "Activa"
        ).length;
        const reservasCompletadas = dataReservas.filter(
          (r) => r.estado === "Completada"
        ).length;
        const reservasCanceladas = dataReservas.filter(
          (r) => r.estado === "Cancelada"
        ).length;

        // Habitaciones por tipo (agrupadas)
        const tipoCount = dataHabitaciones.reduce((acc, hab) => {
          const tipo = hab.tipo_id || "Sin tipo";
          if (!acc[tipo]) {
            acc[tipo] = { tipo, cantidad: 0, ocupadas: 0, ingresos: 0 };
          }
          acc[tipo].cantidad++;
          if (hab.estado === "Ocupada") acc[tipo].ocupadas++;
          return acc;
        }, {});

        // Calcular ingresos por habitación
        const ingresosPorHabitacion = dataReservas.reduce((acc, reserva) => {
          const habId = reserva.id_habitacion;
          if (!acc[habId]) {
            acc[habId] = {
              numero: reserva.numero_habitacion,
              ingresos: 0,
              reservas: 0,
            };
          }
          acc[habId].ingresos += parseFloat(reserva.precio || 0);
          acc[habId].reservas++;
          return acc;
        }, {});

        // Top 5 habitaciones más rentables
        const top = Object.values(ingresosPorHabitacion)
          .sort((a, b) => b.ingresos - a.ingresos)
          .slice(0, 5);

        setReportes({
          totalHabitaciones,
          habitacionesOcupadas,
          habitacionesDisponibles,
          habitacionesMantenimiento,
          totalHuespedes,
          ingresosTotales,
          promedioOcupacion,
          reservasActivas,
          reservasCompletadas,
          reservasCanceladas,
        });

        setHabitacionesPorTipo(Object.values(tipoCount));
        setTopHabitaciones(top);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
        alert(
          "Error al cargar los reportes. Verifique que el servidor esté funcionando."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <h4 className="mt-3">Cargando reportes...</h4>
      </div>
    );
  }

  const summaryData = [
    {
      icon: FaBed,
      title: "Total Habitaciones",
      value: reportes.totalHabitaciones,
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
    },
    {
      icon: FaConciergeBell,
      title: "Ocupadas",
      value: reportes.habitacionesOcupadas,
      gradient: "linear-gradient(135deg, #1660a1 0%, #1e88e5 100%)",
    },
    {
      icon: FaUsers,
      title: "Huéspedes",
      value: reportes.totalHuespedes,
      gradient: "linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%)",
    },
    {
      icon: FaMoneyBillWave,
      title: "Ingresos Totales",
      value: `S/. ${reportes.ingresosTotales.toLocaleString()}`,
      gradient: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
    },
  ];

  const habitacionesStats = [
    {
      icon: FaCheckCircle,
      label: "Disponibles",
      value: reportes.habitacionesDisponibles,
      color: "success",
    },
    {
      icon: FaConciergeBell,
      label: "Ocupadas",
      value: reportes.habitacionesOcupadas,
      color: "danger",
    },
    {
      icon: FaClock,
      label: "Mantenimiento",
      value: reportes.habitacionesMantenimiento,
      color: "warning",
    },
    {
      icon: FaChartPie,
      label: "Ocupación Promedio",
      value: `${reportes.promedioOcupacion}%`,
      color: "info",
    },
  ];

  const reservasStats = [
    {
      icon: FaCheckCircle,
      label: "Activas",
      value: reportes.reservasActivas,
      color: "primary",
    },
    {
      icon: FaCheckCircle,
      label: "Completadas",
      value: reportes.reservasCompletadas,
      color: "success",
    },
    {
      icon: FaTimesCircle,
      label: "Canceladas",
      value: reportes.reservasCanceladas,
      color: "danger",
    },
    {
      icon: FaCalendarAlt,
      label: "Total Reservas",
      value:
        reportes.reservasActivas +
        reportes.reservasCompletadas +
        reportes.reservasCanceladas,
      color: "secondary",
    },
  ];

  return (
    <div className="container-fluid p-4">
      <h1 className="fw-bold text-center mb-2">Reportes Detallados</h1>
      <p className="text-center text-muted mb-4">
        Análisis completo del estado del hotel -{" "}
        {new Date().toLocaleDateString("es-ES", { dateStyle: "full" })}
      </p>

      {/* Resumen General */}
      <div className="row g-3 mb-4">
        {summaryData.map((item, idx) => (
          <SummaryCard key={idx} {...item} />
        ))}
      </div>

      {/* Estadísticas Detalladas */}
      <div className="row g-3 mb-4">
        {/* Estado de Habitaciones */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div
              className="card-header text-white"
              style={{ background: "#1660a1" }}
            >
              <h5 className="mb-0">
                <FaBed className="me-2" />
                Estado de Habitaciones
              </h5>
            </div>
            <div className="card-body">
              {habitacionesStats.map((stat, idx) => (
                <StatRow
                  key={idx}
                  {...stat}
                  isLast={idx === habitacionesStats.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Estado de Reservas */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div
              className="card-header text-white"
              style={{ background: "#16a34a" }}
            >
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Estado de Reservas
              </h5>
            </div>
            <div className="card-body">
              {reservasStats.map((stat, idx) => (
                <StatRow
                  key={idx}
                  {...stat}
                  isLast={idx === reservasStats.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Habitaciones por Tipo y Top 5 */}
      <div className="row g-3 mb-4">
        {/* Habitaciones por Tipo */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div
              className="card-header text-white"
              style={{ background: "#0f4c75" }}
            >
              <h5 className="mb-0">
                <FaBed className="me-2" />
                Habitaciones por Tipo
              </h5>
            </div>
            <div className="card-body">
              {habitacionesPorTipo.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th className="text-center">Total</th>
                        <th className="text-center">Ocupadas</th>
                        <th className="text-center">Ocupación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {habitacionesPorTipo.map((tipo, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold">Tipo {tipo.tipo}</td>
                          <td className="text-center">{tipo.cantidad}</td>
                          <td className="text-center">{tipo.ocupadas}</td>
                          <td className="text-center">
                            <span
                              className={`badge ${
                                tipo.ocupadas / tipo.cantidad > 0.7
                                  ? "bg-danger"
                                  : tipo.ocupadas / tipo.cantidad > 0.4
                                  ? "bg-warning"
                                  : "bg-success"
                              }`}
                            >
                              {((tipo.ocupadas / tipo.cantidad) * 100).toFixed(
                                0
                              )}
                              %
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">
                  No hay datos disponibles
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top 5 Habitaciones Más Rentables */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div
              className="card-header text-white"
              style={{ background: "#05162b" }}
            >
              <h5 className="mb-0">
                <FaTrophy className="me-2" />
                Top 5 Habitaciones Más Rentables
              </h5>
            </div>
            <div className="card-body">
              {topHabitaciones.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Posición</th>
                        <th>Habitación</th>
                        <th className="text-end">Reservas</th>
                        <th className="text-end">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topHabitaciones.map((hab, idx) => (
                        <tr key={idx}>
                          <td>
                            {idx === 0 && (
                              <FaTrophy className="text-warning me-1" />
                            )}
                            #{idx + 1}
                          </td>
                          <td className="fw-bold">Hab. {hab.numero}</td>
                          <td className="text-end">{hab.reservas}</td>
                          <td className="text-end fw-bold text-success">
                            S/. {hab.ingresos.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">
                  No hay datos disponibles
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
