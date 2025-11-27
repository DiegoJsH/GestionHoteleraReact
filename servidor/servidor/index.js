//librerias importadas
import express from "express"; //Framework para crear el servidor y las rutas API
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();
const { Pool } = pkg; //clase para administar conexiones

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

//Probar la conexión
pool
  .connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch((err) => console.error("Error al conectar:", err.message));

// Servidor
const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

// ==============================
// ENDPOINT DE AUTENTICACIÓN
// ==============================

// Login con contraseña encriptada
app.post("/login", async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    // Buscar usuario en la base de datos
    const resultado = await pool.query(
      "SELECT id_usuario, usuario, password_hash FROM usuarios WHERE usuario = $1",
      [usuario]
    );

    // Si no encuentra el usuario
    if (resultado.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    const datosUsuario = resultado.rows[0];

    // Verificar contraseña encriptada con bcrypt
    const contraseñaValida = await bcrypt.compare(
      contraseña,
      datosUsuario.password_hash
    );

    if (!contraseñaValida) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Login exitoso
    res.json({
      success: true,
      message: "Bienvenido al sistema",
      usuario: {
        id: datosUsuario.id_usuario,
        usuario: datosUsuario.usuario,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
});

// ==============================
// ENDPOINTS PARA HABITACIONES
// ==============================

// Ruta para obtener todas las habitaciones
app.get("/habitaciones", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM Habitaciones ORDER BY id_habitacion ASC"
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error("Error al obtener habitaciones:", err);
    res.status(500).send("Error en el servidor");
  }
});

// Ruta para agregar una habitación
app.post("/habitaciones", async (req, res) => {
  const { numero, tipo_id, precio, estado } = req.body;
  try {
    await pool.query(
      "INSERT INTO Habitaciones (numero, tipo_id, precio, estado) VALUES ($1, $2, $3, $4)",
      [numero, tipo_id, precio, estado]
    );
    res.status(201).send("Habitación creada correctamente");
  } catch (err) {
    console.error(" Error al insertar habitación:", err);
    res.status(500).send("Error al insertar habitación");
  }
});

// Buscar habitación por número
app.get("/habitaciones/buscar/:numero", async (req, res) => {
  try {
    const { numero } = req.params;
    const result = await pool.query(
      "SELECT * FROM Habitaciones WHERE numero ILIKE $1",
      [`%${numero}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar habitación" });
  }
});

// Eliminar habitación
app.delete("/habitaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Habitaciones WHERE id_habitacion = $1", [id]);
    res.json({ message: "Habitación eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar habitación" });
  }
});

// Actualizar habitación (todos los campos o solo estado)
app.put("/habitaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, tipo_id, precio, estado } = req.body;

    // Si solo viene el estado, actualizar solo el estado
    if (estado && !numero && !tipo_id && !precio) {
      await pool.query(
        "UPDATE Habitaciones SET estado = $1 WHERE id_habitacion = $2",
        [estado, id]
      );
      return res.json({ message: "Estado actualizado" });
    }

    // Si vienen todos los campos, actualizar toda la habitación
    await pool.query(
      "UPDATE Habitaciones SET numero = $1, tipo_id = $2, precio = $3, estado = $4 WHERE id_habitacion = $5",
      [numero, tipo_id, precio, estado, id]
    );
    res.json({ message: "Habitación actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    res.status(500).json({ error: "Error al actualizar habitación" });
  }
});

// ==============================
// ENDPOINTS PARA HUESPEDES
// ==============================

// Ruta para obtener todas las habitaciones
app.get("/huespedes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM Huespedes ORDER BY id_huesped ASC"
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error("Error al obtener huespedes:", err);
    res.status(500).send("Error en el servidor");
  }
});

// Ruta para agregar un huésped
app.post("/huespedes", async (req, res) => {
  const { nombres, apellidos, dni, correo, telefono } = req.body;
  try {
    await pool.query(
      "INSERT INTO Huespedes (nombres, apellidos, dni, correo, telefono) VALUES ($1, $2, $3, $4, $5)",
      [nombres, apellidos, dni, correo, telefono]
    );
    res.status(201).json({ message: "Huésped registrado correctamente" });
  } catch (err) {
    console.error("Error al registrar huésped:", err);
    res.status(500).json({ error: "Error al registrar huésped" });
  }
});

// Buscar huésped por DNI o nombre/apellido
app.get("/huespedes/buscar/:termino", async (req, res) => {
  try {
    const { termino } = req.params;
    const result = await pool.query(
      "SELECT * FROM Huespedes WHERE dni ILIKE $1 OR nombres ILIKE $1 OR apellidos ILIKE $1",
      [`%${termino}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al buscar huésped:", error);
    res.status(500).json({ error: "Error al buscar huésped" });
  }
});

// Eliminar huésped
app.delete("/huespedes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Huespedes WHERE id_huesped = $1", [id]);
    res.json({ message: "Huésped eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar huésped:", error);
    res.status(500).json({ error: "Error al eliminar huésped" });
  }
});

// Actualizar huésped (todos los datos)
app.put("/huespedes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, dni, correo, telefono } = req.body;
    await pool.query(
      "UPDATE Huespedes SET nombres = $1, apellidos = $2, dni = $3, correo = $4, telefono = $5 WHERE id_huesped = $6",
      [nombres, apellidos, dni, correo, telefono, id]
    );
    res.json({ message: "Huésped actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar huésped:", error);
    res.status(500).json({ error: "Error al actualizar huésped" });
  }
});

// ==============================
// ENDPOINTS PARA RESERVAS
// ==============================

// Obtener todas las reservas con información relacionada
app.get("/reservas", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        r.id_reserva,
        r.fecha_ingreso,
        r.fecha_salida,
        r.estado,
        r.fecha_creacion,
        h.id_huesped,
        h.nombres || ' ' || h.apellidos AS nombre_cliente,
        h.dni,
        hab.id_habitacion,
        hab.numero AS numero_habitacion,
        hab.precio AS precio_noche,
        CAST(hab.precio * GREATEST((r.fecha_salida::date - r.fecha_ingreso::date), 1) AS DECIMAL(10,2)) AS precio
      FROM Reservas r
      INNER JOIN Huespedes h ON r.cliente_id = h.id_huesped
      INNER JOIN Habitaciones hab ON r.habitacion_id = hab.id_habitacion
      ORDER BY r.id_reserva DESC
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error("Error al obtener reservas:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Crear una nueva reserva
app.post("/reservas", async (req, res) => {
  const { cliente_id, habitacion_id, fecha_ingreso, fecha_salida, estado } =
    req.body;
  try {
    // Verificar que la habitación esté disponible
    const habitacion = await pool.query(
      "SELECT estado FROM Habitaciones WHERE id_habitacion = $1",
      [habitacion_id]
    );

    if (habitacion.rows.length === 0) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    if (habitacion.rows[0].estado === "Ocupada") {
      return res.status(400).json({
        error:
          "La habitación ya está ocupada. Por favor seleccione otra habitación.",
      });
    }

    // Crear la reserva
    await pool.query(
      "INSERT INTO Reservas (cliente_id, habitacion_id, fecha_ingreso, fecha_salida, estado) VALUES ($1, $2, $3, $4, $5)",
      [
        cliente_id,
        habitacion_id,
        fecha_ingreso,
        fecha_salida,
        estado || "Activa",
      ]
    );

    // Cambiar el estado de la habitación a "Ocupada" solo si la reserva está activa
    if (!estado || estado === "Activa") {
      await pool.query(
        "UPDATE Habitaciones SET estado = 'Ocupada' WHERE id_habitacion = $1",
        [habitacion_id]
      );
    }

    res.status(201).json({
      message: "Reserva creada correctamente y habitación marcada como ocupada",
    });
  } catch (err) {
    console.error("Error al crear reserva:", err);
    res.status(500).json({ error: "Error al crear reserva" });
  }
});

// Buscar reserva por ID, cliente o habitación
app.get("/reservas/buscar/:termino", async (req, res) => {
  try {
    const { termino } = req.params;
    const result = await pool.query(
      `
      SELECT 
        r.id_reserva,
        r.fecha_ingreso,
        r.fecha_salida,
        r.estado,
        r.fecha_creacion,
        h.id_huesped,
        h.nombres || ' ' || h.apellidos AS nombre_cliente,
        h.dni,
        hab.id_habitacion,
        hab.numero AS numero_habitacion,
        hab.precio
      FROM Reservas r
      INNER JOIN Huespedes h ON r.cliente_id = h.id_huesped
      INNER JOIN Habitaciones hab ON r.habitacion_id = hab.id_habitacion
      WHERE 
        h.nombres ILIKE $1 OR 
        h.apellidos ILIKE $1 OR 
        h.dni ILIKE $1 OR
        hab.numero ILIKE $1 OR
        CAST(r.id_reserva AS TEXT) ILIKE $1
      ORDER BY r.id_reserva DESC
    `,
      [`%${termino}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al buscar reserva:", error);
    res.status(500).json({ error: "Error al buscar reserva" });
  }
});

// Actualizar reserva
app.put("/reservas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente_id, habitacion_id, fecha_ingreso, fecha_salida, estado } =
      req.body;

    // Obtener la reserva anterior para saber si cambió de habitación
    const reservaAnterior = await pool.query(
      "SELECT habitacion_id, estado FROM Reservas WHERE id_reserva = $1",
      [id]
    );

    if (reservaAnterior.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const habitacionAnterior = reservaAnterior.rows[0].habitacion_id;
    const estadoAnterior = reservaAnterior.rows[0].estado;

    // Actualizar la reserva
    await pool.query(
      "UPDATE Reservas SET cliente_id = $1, habitacion_id = $2, fecha_ingreso = $3, fecha_salida = $4, estado = $5 WHERE id_reserva = $6",
      [cliente_id, habitacion_id, fecha_ingreso, fecha_salida, estado, id]
    );

    // Si el estado cambió a "Cancelada" o "Completada", liberar la habitación
    if (
      (estado === "Cancelada" || estado === "Completada") &&
      estadoAnterior === "Activa"
    ) {
      await pool.query(
        "UPDATE Habitaciones SET estado = 'Disponible' WHERE id_habitacion = $1",
        [habitacionAnterior]
      );
    }

    // Si el estado cambió a "Activa", ocupar la nueva habitación
    if (estado === "Activa" && estadoAnterior !== "Activa") {
      await pool.query(
        "UPDATE Habitaciones SET estado = 'Ocupada' WHERE id_habitacion = $1",
        [habitacion_id]
      );
    }

    // Si cambió de habitación y la reserva sigue activa
    if (habitacion_id !== habitacionAnterior && estado === "Activa") {
      // Liberar la habitación anterior
      await pool.query(
        "UPDATE Habitaciones SET estado = 'Disponible' WHERE id_habitacion = $1",
        [habitacionAnterior]
      );
      // Ocupar la nueva habitación
      await pool.query(
        "UPDATE Habitaciones SET estado = 'Ocupada' WHERE id_habitacion = $1",
        [habitacion_id]
      );
    }

    res.json({ message: "Reserva actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    res.status(500).json({ error: "Error al actualizar reserva" });
  }
});

// Cancelar reserva (cambiar estado)
app.patch("/reservas/:id/cancelar", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la habitación de la reserva
    const reserva = await pool.query(
      "SELECT habitacion_id FROM Reservas WHERE id_reserva = $1",
      [id]
    );

    if (reserva.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const habitacion_id = reserva.rows[0].habitacion_id;

    // Cancelar la reserva
    await pool.query(
      "UPDATE Reservas SET estado = 'Cancelada' WHERE id_reserva = $1",
      [id]
    );

    // Liberar la habitación
    await pool.query(
      "UPDATE Habitaciones SET estado = 'Disponible' WHERE id_habitacion = $1",
      [habitacion_id]
    );

    res.json({
      message: "Reserva cancelada y habitación liberada correctamente",
    });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
});

// Completar reserva (cambiar estado)
app.patch("/reservas/:id/completar", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el habitacion_id de la reserva antes de completarla
    const reserva = await pool.query(
      "SELECT habitacion_id FROM Reservas WHERE id_reserva = $1",
      [id]
    );

    if (reserva.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const habitacion_id = reserva.rows[0].habitacion_id;

    // Actualizar el estado de la reserva a "Completada"
    await pool.query(
      "UPDATE Reservas SET estado = 'Completada' WHERE id_reserva = $1",
      [id]
    );

    // Marcar la habitación como "Disponible"
    await pool.query(
      "UPDATE Habitaciones SET estado = 'Disponible' WHERE id_habitacion = $1",
      [habitacion_id]
    );

    res.json({
      message: "Reserva completada y habitación liberada correctamente",
    });
  } catch (error) {
    console.error("Error al completar reserva:", error);
    res.status(500).json({ error: "Error al completar reserva" });
  }
});

// ==============================
// ENDPOINTS PARA REPORTES
// ==============================

// Obtener ingresos totales de todas las reservas completadas y activas
app.get("/ingresos", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        r.id_reserva,
        CAST(hab.precio * GREATEST((r.fecha_salida::date - r.fecha_ingreso::date), 1) AS DECIMAL(10,2)) AS monto
      FROM Reservas r
      INNER JOIN Habitaciones hab ON r.habitacion_id = hab.id_habitacion
      WHERE r.estado IN ('Activa', 'Completada')
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error("Error al obtener ingresos:", err);
    res.status(500).json({ error: "Error al obtener ingresos" });
  }
});

// ==============================
// ENDPOINTS PARA EMPLEADOS
// ==============================

// Obtener todos los empleados
app.get("/empleados", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM empleados ORDER BY id_empleado ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

// Buscar empleado por nombre, cargo o correo
app.get("/empleados/buscar/:termino", async (req, res) => {
  try {
    const { termino } = req.params;
    const result = await pool.query(
      "SELECT * FROM empleados WHERE nombre ILIKE $1 OR cargo ILIKE $1 OR correo ILIKE $1 ORDER BY id_empleado ASC",
      [`%${termino}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al buscar empleado:", error);
    res.status(500).json({ error: "Error al buscar empleado" });
  }
});

// Obtener un empleado por ID
app.get("/empleados/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM empleados WHERE id_empleado = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    res.status(500).json({ error: "Error al obtener empleado" });
  }
});
// Registrar nuevo empleado
app.post("/empleados", async (req, res) => {
  const { nombre, cargo, correo, telefono } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO empleados (nombre, cargo, correo, telefono) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, cargo, correo, telefono]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al registrar empleado:", error);
    res.status(500).json({ error: "Error al registrar empleado" });
  }
});
// Actualizar empleado
app.put("/empleados/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, correo, telefono } = req.body;
  try {
    const result = await pool.query(
      "UPDATE empleados SET nombre = $1, cargo = $2, correo = $3, telefono = $4 WHERE id_empleado = $5 RETURNING *",
      [nombre, cargo, correo, telefono, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
});
// Eliminar empleado
app.delete("/empleados/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM empleados WHERE id_empleado = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json({ mensaje: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
});
