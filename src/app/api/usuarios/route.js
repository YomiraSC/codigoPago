// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import bcrypt from "bcryptjs";


// export async function GET() {
//   try {
//     const total = await prisma.usuario.count(); 
//     const usuarios = await prisma.usuario.findMany({
//       include: {
//         persona: true,
//         rol: true,
//       },
//     });
//     console.log("📢 Usuarios obtenidos:", usuarios);
//     console.log("cant usuarios: ",total);
//     // Modificar el atributo activo antes de enviar la respuesta
//     const usuariosModificados = usuarios.map(usuario => ({
//       ...usuario,
//       activo: usuario.activo ? "Activo" : "Inactivo"
//     }));

//     //console.log("📢 Usuarios obtenidos de la BD:", usuariosModificados);
//     return NextResponse.json({usuariosModificados, total});
//   } catch (error) {
//     console.error("❌ Error obteniendo usuarios:", error);
//     return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 });
//   }
// }


// export async function POST(req) {
//   try {
//     const body = await req.json();
//     console.log("📩 Recibiendo datos:", body);

//     if (!body) {
//       return NextResponse.json({ error: "No se enviaron datos" }, { status: 400 });
//     }

//     const { username, password, rol_id, activo, nombre, primer_apellido, segundo_apellido, celular } = body;

//     if (!username || !password || !nombre || !primer_apellido) {
//       return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
//     }

//     // Convertir rol_id a número
//     const parsedRolId = parseInt(rol_id);
//     if (isNaN(parsedRolId)) {
//       return NextResponse.json({ error: "rol_id debe ser un número válido" }, { status: 400 });
//     }

//     // Hashear la contraseña antes de guardarla
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Crear usuario y su persona asociada
//     const newUsuario = await prisma.usuario.create({
//       data: {
//         username,
//         password: hashedPassword,
//         rol_id: parsedRolId || 2,
//         activo: activo ?? true,
//         persona: {
//           create: {
//             nombre,
//             primer_apellido,
//             segundo_apellido,
//             celular,
//             num_leads: 1, // Asegúrate de que esto sea correcto en el modelo
//           },
//         },
//       },
//       include: { persona: true, rol: true},
//     });
//     // Transformar el campo "activo" en "activo" si es 1 o true
//     return NextResponse.json({
//       ...newUsuario,
//       activo: newUsuario.activo ? "Activo" : "Inactivo",
//   });
//     console.log("✅ Usuario creado:", newUsuario);

//     return NextResponse.json(newUsuario, { status: 201 });
//   } catch (error) {
//     console.error("❌ Error creando usuario:", error);
    
//     return NextResponse.json(
//       { error: "Error creando usuario", details: error.message },
//       { status: 500 }
//     );
//   }
// }


// export async function PUT(req, { params }) {
//   try {
//     const { id } = params;
//     const { username, password, rol_id, activo, nombre, primer_apellido, segundo_apellido, celular } = await req.json();

//     // Buscar usuario existente
//     const usuarioExistente = await prisma.usuario.findUnique({
//       where: { usuario_id: parseInt(id) },
//       include: { persona: true },
//     });

//     if (!usuarioExistente) {
//       return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
//     }

//     // Si hay contraseña nueva, la hasheamos
//     let hashedPassword = usuarioExistente.password;
//     if (password) {
//       hashedPassword = await bcrypt.hash(password, 10);
//     }

//     // Actualizar usuario y persona asociada
//     const updatedUsuario = await prisma.usuario.update({
//       where: { usuario_id: parseInt(id) },
//       data: {
//         username,
//         password: hashedPassword,
//         rol_id,
//         activo,
//         persona: {
//           update: {
//             nombre,
//             primer_apellido,
//             segundo_apellido,
//             celular,
//           },
//         },
//       },
//       include: { persona: true },
//     });
//     // Transformar el campo "activo" en "activo" si es 1 o true
//     return NextResponse.json({
//       ...updatedUsuario,
//       activo: updatedUsuario.activo ? "Activo" : "Inactivo",
//   });
//     return NextResponse.json(updatedUsuario);
//   } catch (error) {
//     console.error("❌ Error actualizando usuario:", error);
//     return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helpers
const toInt = (v, label = "valor") => {
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`${label} debe ser numérico`);
  return n;
};

const toBool = (v, def = true) => {
  if (v === undefined || v === null || v === "") return def;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["1", "true", "sí", "si", "on", "activo"].includes(s)) return true;
    if (["0", "false", "no", "off", "inactivo"].includes(s)) return false;
  }
  // opción conservadora: lanzar error para que el cliente corrija
  throw new Error("Valor inválido para 'activo'");
};

export async function GET() {
  try {
    const total = await prisma.usuario.count();
    const usuarios = await prisma.usuario.findMany({
      include: { persona: true, rol: true },
    });

    const usuariosModificados = usuarios.map((u) => ({
      ...u,
      activo: u.activo ? "Activo" : "Inactivo",
    }));

    return NextResponse.json({ usuariosModificados, total });
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body) {
      return NextResponse.json({ error: "No se enviaron datos" }, { status: 400 });
    }

    const {
      username,
      password,
      rol_id,      // puede venir como string
      activo,      // puede venir como 1/0 o string
      nombre,
      primer_apellido,
      segundo_apellido,
      celular,
    } = body;

    if (!username || !password || !nombre || !primer_apellido) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const parsedRolId = rol_id === undefined ? 2 : toInt(rol_id, "rol_id");
    const parsedActivo = toBool(activo, true);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUsuario = await prisma.usuario.create({
      data: {
        username,
        password: hashedPassword,
        rol_id: parsedRolId,
        activo: parsedActivo,
        persona: {
          create: {
            nombre,
            primer_apellido,
            segundo_apellido,
            celular,
            num_leads: 1,
          },
        },
      },
      include: { persona: true, rol: true },
    });

    // Respuesta “bonita”
    return NextResponse.json({
      ...newUsuario,
      activo: newUsuario.activo ? "Activo" : "Inactivo",
    }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    return NextResponse.json(
      { error: "Error creando usuario", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { usuario_id: toInt(id, "id") },
      include: { persona: true },
    });
    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const {
      username,
      password,
      rol_id,
      activo,
      nombre,
      primer_apellido,
      segundo_apellido,
      celular,
    } = body;

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : usuarioExistente.password;

    const updateData = {
      username,
      password: hashedPassword,
      // Solo setear si llega; así evitas pisar con null/undefined
      ...(rol_id !== undefined && { rol_id: toInt(rol_id, "rol_id") }),
      ...(activo !== undefined && { activo: toBool(activo, usuarioExistente.activo) }),
      persona: {
        update: {
          nombre,
          primer_apellido,
          segundo_apellido,
          celular,
        },
      },
    };

    const updatedUsuario = await prisma.usuario.update({
      where: { usuario_id: toInt(id, "id") },
      data: updateData,
      include: { persona: true, rol: true },
    });

    return NextResponse.json({
      ...updatedUsuario,
      activo: updatedUsuario.activo ? "Activo" : "Inactivo",
    });
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error);
    return NextResponse.json({ error: "Error actualizando usuario", details: error.message }, { status: 500 });
  }
}
