import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaUsers } from "react-icons/fa";

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [empleadoActual, setEmpleadoActual] = useState({
    id_empleado: null,
    nombre: "",
    cargo: "Limpieza",
    correo: "",
    telefono: "",
  });
  const [busqueda, setBusqueda] = useState("");

  // --- Cargar empleados desde backend ---
  const cargarEmpleados = async () => {
    try {
      const res = await fetch("http://localhost:5000/empleados");
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // --- Abrir modal nuevo ---
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setEmpleadoActual({
      id_empleado: null,
      nombre: "",
      cargo: "Limpieza",
      correo: "",
      telefono: "",
    });
    setMostrarModal(true);
  };

  // --- Abrir modal editar ---
  const abrirModalEditar = (empleado) => {
    console.log("Editando empleado:", empleado);
    setModoEdicion(true);
    setEmpleadoActual({ ...empleado });
    setMostrarModal(true);
  };

  // --- Cerrar modal ---
  const cerrarModal = () => {
    setMostrarModal(false);
    setEmpleadoActual({
      id_empleado: null,
      nombre: "",
      cargo: "Limpieza",
      correo: "",
      telefono: "",
    });
  };

  // --- Manejar cambio en inputs ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpleadoActual({ ...empleadoActual, [name]: value });
  };

  // --- Guardar o actualizar empleado ---
  const guardarEmpleado = async (e) => {
    e.preventDefault();

    console.log("Empleado actual antes de guardar:", empleadoActual);

    if (modoEdicion && !empleadoActual.id_empleado) {
      alert("Error: no se encontró el ID del empleado para actualizar");
      return;
    }

    try {
      const metodo = modoEdicion ? "PUT" : "POST";
      const url = modoEdicion
        ? `http://localhost:5000/empleados/${empleadoActual.id_empleado}`
        : "http://localhost:5000/empleados";

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: empleadoActual.nombre,
          cargo: empleadoActual.cargo,
          correo: empleadoActual.correo,
          telefono: empleadoActual.telefono,
        }),
      });

      if (!res.ok) throw new Error("Error en el servidor");

      await cargarEmpleados(); // refresca la tabla
      cerrarModal();
      alert(
        modoEdicion
          ? "Empleado actualizado con éxito"
          : "Empleado agregado con éxito"
      );
    } catch (error) {
      console.error("Error al guardar/actualizar:", error);
      alert("Hubo un problema al guardar el empleado");
    }
  };

  // --- Eliminar empleado ---
  const eliminarEmpleado = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este empleado?")) return;

    try {
      const res = await fetch(`http://localhost:5000/empleados/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Empleado eliminado correctamente");
        cargarEmpleados();
      } else {
        alert("Error al eliminar empleado");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // --- Buscar empleado ---
  const buscarEmpleado = async () => {
    if (busqueda.trim() === "") {
      cargarEmpleados();
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/empleados/buscar/${busqueda}`
      );
      if (res.ok) {
        const data = await res.json();
        setEmpleados(data);
      } else {
        alert("Empleado no encontrado");
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  // --- Render ---
  return (
    <div className="h-100">
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <h2 className="fw-bold text-center mb-2">
              <FaUsers className="me-2" />
              Gestión de Empleados
            </h2>
            <p className="text-muted text-center mb-0">
              Administra el personal del hotel
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6">
            <div className="d-grid">
              <button className="btn btn-primary" onClick={abrirModalNuevo}>
                <FaPlus className="me-2" />
                Nuevo empleado
              </button>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar empleado por nombre, cargo o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && buscarEmpleado()}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={buscarEmpleado}
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
                    <th>Nombre</th>
                    <th>Cargo</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th className="text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No hay empleados registrados
                      </td>
                    </tr>
                  ) : (
                    empleados.map((empleado) => (
                      <tr key={empleado.id_empleado}>
                        <td className="px-4">{empleado.id_empleado}</td>
                        <td>{empleado.nombre}</td>
                        <td>
                          <span className="badge bg-info">
                            {empleado.cargo}
                          </span>
                        </td>
                        <td>{empleado.correo}</td>
                        <td>{empleado.telefono}</td>
                        <td className="text-end px-4">
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => abrirModalEditar(empleado)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              eliminarEmpleado(empleado.id_empleado)
                            }
                          >
                            Eliminar
                          </button>
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

      {/* Modal */}
      {mostrarModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? "Editar Empleado" : "Nuevo Empleado"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <form onSubmit={guardarEmpleado}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      value={empleadoActual.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cargo *</label>
                    <select
                      className="form-select"
                      name="cargo"
                      value={empleadoActual.cargo}
                      onChange={handleChange}
                    >
                      <option value="Limpieza">Limpieza</option>
                      <option value="Recepción">Recepción</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Gerente">Gerente</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      name="correo"
                      value={empleadoActual.correo}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      name="telefono"
                      value={empleadoActual.telefono}
                      onChange={handleChange}
                    />
                  </div>
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
                    {modoEdicion ? "Actualizar" : "Guardar"}
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
