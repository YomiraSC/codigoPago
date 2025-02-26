import prisma from "./prisma";

export async function obtenerPersonaIdPorNombre(nombreGestor) {
  if (!nombreGestor) return null;

  try {
    console.log(`🔍 Buscando persona con nombreGestor: "${nombreGestor}"`);

    // 🔹 Dividir el nombre en partes
    const partesNombre = nombreGestor.split(" ");
    const nombre = partesNombre[0] || "";
    const primerApellido = partesNombre[1] || "";
    const segundoApellido = partesNombre.slice(2).join(" ") || "";

    console.log(`📌 Nombre: ${nombre}, Primer Apellido: ${primerApellido}, Segundo Apellido: ${segundoApellido}`);

    // 🔍 Búsqueda en la BD con Prisma
    const persona = await prisma.persona.findFirst({
      where: {
        nombre: { contains: nombre},
        primer_apellido: { contains: primerApellido},
        segundo_apellido: { contains: segundoApellido},
      },
      select: { persona_id: true },
    });

    console.log("🆔 Persona encontrada:", persona?.persona_id || "No encontrada");

    return persona ? persona.persona_id : null;
  } catch (error) {
    console.error("❌ Error al obtener persona_id del gestor:", error);
    return null;
  }
}
