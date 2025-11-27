import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaUsers } from "react-icons/fa";

export default function Huespedes() {
  const [huespedes, setHuespedes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [huespedActual, setHuespedActual] = useState({
    id_huesped: null,
    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    telefono: "",
  });
  const [busqueda, setBusqueda] = useState("");

  // Cargar huéspedes desde el backend
  const cargarHuespedes = () => {
    fetch("http://localhost:5000/huespedes")
      .then((res) => res.json())
      .then((data) => setHuespedes(data))
      .catch((err) => console.error("Error al obtener huéspedes:", err));
  };

  useEffect(() => {
    cargarHuespedes();
  }, []);

  // Abrir modal para nuevo huésped
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setHuespedActual({
      id_huesped: null,
      nombres: "",
      apellidos: "",
      dni: "",
      correo: "",
      telefono: "",
    });
    setMostrarModal(true);
  };

  // Abrir modal para editar huésped
  const abrirModalEditar = (huesped) => {
    setModoEdicion(true);
    setHuespedActual(huesped);
    setMostrarModal(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setHuespedActual({
      id_huesped: null,
      nombres: "",
      apellidos: "",
      dni: "",
      correo: "",
      telefono: "",
    });
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHuespedActual({ ...huespedActual, [name]: value });
  };

  // Guardar huésped (crear o actualizar)
  const guardarHuesped = async (e) => {
    e.preventDefault();

    try {
      if (modoEdicion) {
        // Actualizar huésped existente
        const response = await fetch(
          `http://localhost:5000/huespedes/${huespedActual.id_huesped}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombres: huespedActual.nombres,
              apellidos: huespedActual.apellidos,
              dni: huespedActual.dni,
              correo: huespedActual.correo,
              telefono: huespedActual.telefono,
            }),
          }
        );

        if (response.ok) {
          alert("Huésped actualizado con éxito");
          cerrarModal();
          cargarHuespedes();
        } else {
          alert("Error al actualizar huésped");
        }
      } else {
        // Crear nuevo huésped
        const response = await fetch("http://localhost:5000/huespedes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombres: huespedActual.nombres,
            apellidos: huespedActual.apellidos,
            dni: huespedActual.dni,
            correo: huespedActual.correo,
            telefono: huespedActual.telefono,
          }),
        });

        if (response.ok) {
          alert("Huésped registrado con éxito");
          cerrarModal();
          cargarHuespedes();
        } else {
          alert("Error al registrar huésped");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error en la operación");
    }
  };

  // Buscar huésped
  const buscarHuesped = async () => {
    if (busqueda.trim() === "") {
      cargarHuespedes();
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/huespedes/buscar/${busqueda}`
      );
      if (!res.ok) {
        alert("No se encontró el huésped");
        return;
      }
      const data = await res.json();
      setHuespedes(data);
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  // Eliminar huésped
  const eliminarHuesped = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este huésped?")) return;

    try {
      const res = await fetch(`http://localhost:5000/huespedes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Huésped eliminado correctamente");
        cargarHuespedes();
      } else {
        alert("Error al eliminar huésped");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="h-100">
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <h2 className="fw-bold text-center mb-2">
              <FaUsers className="me-2" />
              Gestión de Huéspedes
            </h2>
            <p className="text-muted text-center mb-0">
              Administra los huéspedes registrados en el hotel
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6">
            <div className="d-grid">
              <button className="btn btn-primary" onClick={abrirModalNuevo}>
                <FaPlus className="me-2" />
                Nuevo huésped
              </button>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar por DNI, nombre o apellido..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && buscarHuesped()}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={buscarHuesped}
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
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>DNI</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th className="text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {huespedes.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No hay huéspedes registrados
                      </td>
                    </tr>
                  ) : (
                    huespedes.map((huesped) => (
                      <tr key={huesped.id_huesped}>
                        <td className="px-4">{huesped.id_huesped}</td>
                        <td>{huesped.nombres}</td>
                        <td>{huesped.apellidos}</td>
                        <td>{huesped.dni}</td>
                        <td>{huesped.correo}</td>
                        <td>{huesped.telefono}</td>
                        <td className="text-end px-4">
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => abrirModalEditar(huesped)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => eliminarHuesped(huesped.id_huesped)}
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

      {/* Modal para agregar/editar huésped */}
      {mostrarModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? "Editar Huésped" : "Nuevo Huésped"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <form onSubmit={guardarHuesped}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombres *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombres"
                      value={huespedActual.nombres}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellidos *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apellidos"
                      value={huespedActual.apellidos}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">DNI *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="dni"
                      value={huespedActual.dni}
                      onChange={handleChange}
                      required
                      maxLength="20"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      name="correo"
                      value={huespedActual.correo}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      name="telefono"
                      value={huespedActual.telefono}
                      onChange={handleChange}
                      maxLength="15"
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
