import React, { useState, useEffect } from "react";
import { FaBed, FaPlus, FaSearch } from "react-icons/fa";

export default function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [nuevaHabitacion, setNuevaHabitacion] = useState({
    numero: "",
    tipo_id: "",
    precio: 0,
    estado: "Disponible",
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [habitacionEditando, setHabitacionEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  //Cargar habitaciones desde el backend
  const cargarHabitaciones = () => {
    fetch("http://localhost:5000/habitaciones")
      .then((res) => res.json())
      .then((data) => setHabitaciones(data))
      .catch((err) => console.error("Error al obtener habitaciones:", err));
  };

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  //Abrir/cerrar modal
  const abrirModal = () => {
    setModoEdicion(false);
    setHabitacionEditando(null);
    setNuevaHabitacion({
      numero: "",
      tipo_id: "",
      precio: 0,
      estado: "Disponible",
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (habitacion) => {
    setModoEdicion(true);
    setHabitacionEditando(habitacion.id_habitacion);
    setNuevaHabitacion({
      numero: habitacion.numero,
      tipo_id: habitacion.tipo_id.toString(),
      precio: habitacion.precio,
      estado: habitacion.estado,
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setHabitacionEditando(null);
    setNuevaHabitacion({
      numero: "",
      tipo_id: "",
      precio: 0,
      estado: "Disponible",
    });
  };

  //Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaHabitacion({ ...nuevaHabitacion, [name]: value });
  };

  //Enviar nueva habitación o actualizar existente
  const guardarHabitacion = async (e) => {
    e.preventDefault();

    try {
      if (modoEdicion) {
        // Actualizar habitación existente
        const response = await fetch(
          `http://localhost:5000/habitaciones/${habitacionEditando}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaHabitacion),
          }
        );

        if (response.ok) {
          alert("Habitación actualizada con éxito");
          cerrarModal();
          cargarHabitaciones();
        } else {
          alert("Error al actualizar habitación");
        }
      } else {
        // Crear nueva habitación
        const response = await fetch("http://localhost:5000/habitaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevaHabitacion),
        });

        if (response.ok) {
          alert("Habitación creada con éxito");
          cerrarModal();
          cargarHabitaciones();
        } else {
          alert("Error al crear habitación");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 🔍 Buscar habitación por número
  const buscarHabitacion = async () => {
    if (busqueda.trim() === "") {
      cargarHabitaciones();
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/habitaciones/buscar/${busqueda}`
      );
      if (!res.ok) {
        alert("No se encontró la habitación ❌");
        return;
      }
      const data = await res.json();
      setHabitaciones(data);
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  // 🗑️ Eliminar habitación
  const eliminarHabitacion = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta habitación?")) return;

    try {
      const res = await fetch(`http://localhost:5000/habitaciones/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Habitación eliminada");
        cargarHabitaciones();
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Cambiar estado (Disponible - Ocupada)
  const cambiarEstado = async (id, estadoActual) => {
    // Verificar si la habitación está ocupada por una reserva activa
    if (estadoActual === "Ocupada") {
      alert(
        "No puedes cambiar el estado de una habitación ocupada. Primero debes cancelar o completar la reserva asociada."
      );
      return;
    }

    const nuevoEstado =
      estadoActual === "Disponible" ? "Ocupada" : "Disponible";

    try {
      const res = await fetch(`http://localhost:5000/habitaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        alert("Estado actualizado");
        cargarHabitaciones();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  return (
    <div className="h-100">
      <div className="container-fluid p-4">
        {/* Cabeza */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <h2 className="fw-bold text-center mb-2">
              <FaBed className="me-2" />
              Gestión de Habitaciones
            </h2>
            <p className="text-muted text-center mb-0">
              Total de habitaciones: {habitaciones.length}
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6">
            <div className="d-grid">
              <button className="btn btn-primary" onClick={abrirModal}>
                <FaPlus className="me-2" />
                Nueva habitación
              </button>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar habitación por número..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={buscarHabitacion}
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="px-4">ID</th>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th className="text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {habitaciones.map((h) => (
                    <tr key={h.id_habitacion}>
                      <td className="px-4">{h.id_habitacion}</td>
                      <td>{h.numero}</td>
                      <td>{h.tipo_id === 1 ? "Simple" : "Doble"}</td>
                      <td>${h.precio}</td>
                      <td>
                        <span
                          className={`badge ${
                            h.estado === "Disponible"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {h.estado}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <button
                          className="btn btn-sm btn-info text-white me-2"
                          onClick={() => abrirModalEditar(h)}
                          title="Editar habitación"
                        >
                          Editar
                        </button>
                        <button
                          className={`btn btn-sm me-2 ${
                            h.estado === "Ocupada"
                              ? "btn-secondary"
                              : "btn-warning"
                          }`}
                          onClick={() =>
                            cambiarEstado(h.id_habitacion, h.estado)
                          }
                          title={
                            h.estado === "Ocupada"
                              ? "No se puede cambiar estado de habitación ocupada"
                              : "Cambiar estado"
                          }
                        >
                          Estado
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarHabitacion(h.id_habitacion)}
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {mostrarModal && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modoEdicion ? "Editar Habitación" : "Nueva Habitación"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={cerrarModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={guardarHabitacion}>
                    <div className="mb-3">
                      <label className="form-label">Número de habitación</label>
                      <input
                        type="text"
                        className="form-control"
                        name="numero"
                        value={nuevaHabitacion.numero}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tipo de habitación</label>
                      <select
                        className="form-select"
                        name="tipo_id"
                        value={nuevaHabitacion.tipo_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione tipo</option>
                        <option value="1">Simple</option>
                        <option value="2">Doble</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Precio (USD)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="precio"
                        value={nuevaHabitacion.precio}
                        onChange={handleChange}
                      />
                    </div>
                    {modoEdicion && (
                      <div className="mb-3">
                        <label className="form-label">Estado</label>
                        <select
                          className="form-select"
                          name="estado"
                          value={nuevaHabitacion.estado}
                          onChange={handleChange}
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Ocupada">Ocupada</option>
                          <option value="Mantenimiento">Mantenimiento</option>
                        </select>
                      </div>
                    )}
                    <button type="submit" className="btn btn-primary w-100">
                      {modoEdicion
                        ? "Actualizar habitación"
                        : "Guardar habitación"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
