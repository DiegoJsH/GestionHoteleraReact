import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaCalendar,
  FaEdit,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id_reserva: "",
    cliente_id: "",
    habitacion_id: "",
    fecha_ingreso: "",
    fecha_salida: "",
    estado: "Activa",
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarReservas();
    cargarHuespedes();
    cargarHabitaciones();
  }, []);

  // Cargar todas las reservas
  const cargarReservas = async () => {
    try {
      const response = await fetch("http://localhost:5000/reservas");
      const data = await response.json();
      setReservas(data);

      // Verificar y completar automáticamente reservas vencidas
      verificarReservasVencidas(data);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    }
  };

  // Verificar y completar automáticamente reservas vencidas
  const verificarReservasVencidas = async (reservas) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear las horas para comparar solo fechas

    for (const reserva of reservas) {
      if (reserva.estado === "Activa") {
        const fechaSalida = new Date(reserva.fecha_salida);
        fechaSalida.setHours(0, 0, 0, 0);

        // Si la fecha de salida ya pasó, completar automáticamente
        if (fechaSalida < hoy) {
          try {
            await fetch(
              `http://localhost:5000/reservas/${reserva.id_reserva}/completar`,
              {
                method: "PATCH",
              }
            );
            console.log(
              `Reserva ${reserva.id_reserva} completada automáticamente`
            );
          } catch (error) {
            console.error(
              `Error al completar automáticamente reserva ${reserva.id_reserva}:`,
              error
            );
          }
        }
      }
    }

    // Recargar las reservas después de completar las vencidas
    const response = await fetch("http://localhost:5000/reservas");
    const updatedData = await response.json();
    setReservas(updatedData);
  };

  // Cargar huéspedes para el selector
  const cargarHuespedes = async () => {
    try {
      const response = await fetch("http://localhost:5000/huespedes");
      const data = await response.json();
      setHuespedes(data);
    } catch (error) {
      console.error("Error al cargar huéspedes:", error);
    }
  };

  // Cargar habitaciones para el selector
  const cargarHabitaciones = async () => {
    try {
      const response = await fetch("http://localhost:5000/habitaciones");
      const data = await response.json();
      setHabitaciones(data);
    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
    }
  };

  // Buscar reserva
  const buscarReserva = async () => {
    if (searchTerm.trim() === "") {
      cargarReservas();
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/reservas/buscar/${searchTerm}`
      );
      const data = await response.json();
      setReservas(data);
    } catch (error) {
      console.error("Error al buscar:", error);
    }
  };

  // Manejar Enter en búsqueda
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      buscarReserva();
    }
  };

  // Abrir modal para nueva reserva
  const abrirModalNueva = () => {
    setEditMode(false);
    setFormData({
      id_reserva: "",
      cliente_id: "",
      habitacion_id: "",
      fecha_ingreso: "",
      fecha_salida: "",
      estado: "Activa",
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (reserva) => {
    setEditMode(true);
    setFormData({
      id_reserva: reserva.id_reserva,
      cliente_id: reserva.id_huesped,
      habitacion_id: reserva.id_habitacion,
      fecha_ingreso: reserva.fecha_ingreso.split("T")[0],
      fecha_salida: reserva.fecha_salida.split("T")[0],
      estado: reserva.estado,
    });
    setShowModal(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setShowModal(false);
    setFormData({
      id_reserva: "",
      cliente_id: "",
      habitacion_id: "",
      fecha_ingreso: "",
      fecha_salida: "",
      estado: "Activa",
    });
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Guardar reserva (crear o actualizar)
  const guardarReserva = async (e) => {
    e.preventDefault();

    const url = editMode
      ? `http://localhost:5000/reservas/${formData.id_reserva}`
      : "http://localhost:5000/reservas";

    const method = editMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: formData.cliente_id,
          habitacion_id: formData.habitacion_id,
          fecha_ingreso: formData.fecha_ingreso,
          fecha_salida: formData.fecha_salida,
          estado: formData.estado,
        }),
      });

      if (response.ok) {
        alert(editMode ? "Reserva actualizada" : "Reserva creada");
        cerrarModal();
        cargarReservas();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la reserva");
    }
  };

  // Cancelar reserva
  const cancelarReserva = async (id) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/reservas/${id}/cancelar`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        alert("Reserva cancelada");
        cargarReservas();
      }
    } catch (error) {
      console.error("Error al cancelar:", error);
      alert("Error al cancelar la reserva");
    }
  };

  // Determinar color del badge según estado
  const getBadgeColor = (estado) => {
    switch (estado) {
      case "Activa":
        return "bg-success";
      case "Completada":
        return "bg-primary";
      case "Cancelada":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="h-100">
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <h2 className="fw-bold text-center mb-2">
              <FaCalendar className="me-2" />
              Gestión de Reservas
            </h2>
            <p className="text-muted text-center mb-0">
              Administra las reservas del hotel
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6">
            <div className="d-grid">
              <button className="btn btn-primary" onClick={abrirModalNueva}>
                <FaPlus className="me-2" />
                Nueva reserva
              </button>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar por cliente, DNI, habitación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={buscarReserva}
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="px-4">ID</th>
                    <th>Cliente</th>
                    <th>DNI</th>
                    <th>Habitación</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th className="text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-muted">
                        No hay reservas registradas
                      </td>
                    </tr>
                  ) : (
                    reservas.map((reserva) => (
                      <tr key={reserva.id_reserva}>
                        <td className="px-4">{reserva.id_reserva}</td>
                        <td>{reserva.nombre_cliente}</td>
                        <td>{reserva.dni}</td>
                        <td>
                          <span className="badge bg-info text-dark">
                            {reserva.numero_habitacion}
                          </span>
                        </td>
                        <td>
                          {new Date(reserva.fecha_ingreso).toLocaleDateString(
                            "es-PE"
                          )}
                        </td>
                        <td>
                          {new Date(reserva.fecha_salida).toLocaleDateString(
                            "es-PE"
                          )}
                        </td>
                        <td>S/ {reserva.precio}</td>
                        <td>
                          <span
                            className={`badge ${getBadgeColor(reserva.estado)}`}
                          >
                            {reserva.estado}
                          </span>
                        </td>
                        <td className="text-end px-4">
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => abrirModalEditar(reserva)}
                            disabled={reserva.estado !== "Activa"}
                          >
                            <FaEdit />
                          </button>
                          {reserva.estado === "Activa" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                cancelarReserva(reserva.id_reserva)
                              }
                              title="Cancelar"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar reserva */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "Editar Reserva" : "Nueva Reserva"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <form onSubmit={guardarReserva}>
                <div className="modal-body">
                  {/* Selector de Cliente */}
                  <div className="mb-3">
                    <label className="form-label">Cliente *</label>
                    <select
                      className="form-select"
                      name="cliente_id"
                      value={formData.cliente_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione un cliente...</option>
                      {huespedes.map((huesped) => (
                        <option
                          key={huesped.id_huesped}
                          value={huesped.id_huesped}
                        >
                          {huesped.nombres} {huesped.apellidos} - DNI:{" "}
                          {huesped.dni}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de Habitación */}
                  <div className="mb-3">
                    <label className="form-label">Habitación *</label>
                    <select
                      className="form-select"
                      name="habitacion_id"
                      value={formData.habitacion_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione una habitación...</option>
                      {habitaciones
                        .filter(
                          (hab) => hab.estado === "Disponible" || editMode
                        )
                        .map((habitacion) => (
                          <option
                            key={habitacion.id_habitacion}
                            value={habitacion.id_habitacion}
                          >
                            {habitacion.numero} - S/ {habitacion.precio} (
                            {habitacion.estado})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Fecha de Ingreso */}
                  <div className="mb-3">
                    <label className="form-label">Fecha de Ingreso *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha_ingreso"
                      value={formData.fecha_ingreso}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Fecha de Salida */}
                  <div className="mb-3">
                    <label className="form-label">Fecha de Salida *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha_salida"
                      value={formData.fecha_salida}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Estado (solo en edición) */}
                  {editMode && (
                    <div className="mb-3">
                      <label className="form-label">Estado *</label>
                      <select
                        className="form-select"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                      >
                        <option value="Activa">Activa</option>
                        <option value="Completada">Completada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
