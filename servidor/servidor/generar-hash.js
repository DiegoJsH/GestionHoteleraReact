import bcrypt from "bcrypt";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\nGENERADOR DE CONTRASEÑAS ENCRIPTADAS");
console.log("========================================\n");

rl.question("Ingresa la contraseña a encriptar: ", async (contraseña) => {
  try {
    const hash = await bcrypt.hash(contraseña, 10);

    console.log("\nHash generado con éxito!");
    console.log("================================");
    console.log("Contraseña original:", contraseña);
    console.log("Hash encriptado:");
    console.log(hash);
    console.log("================================\n");
    console.log("INSERT para PostgreSQL:\n");
    console.log(`INSERT INTO usuarios (usuario, password_hash) VALUES`);
    console.log(`('admin', '${hash}');\n`);
  } catch (error) {
    console.error("Error al generar hash:", error);
  } finally {
    rl.close();
  }
});
