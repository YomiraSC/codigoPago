// import Link from 'next/link';
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "./api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";
// export default async function Home() {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     redirect('/login'); // Redirige al login si no hay sesión
//   }
//   return (
//     <main className="p-4 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Bienvenido a MAQUI+</h1>

//       {session ? (
//         <div className="text-center">
//           <p className="mb-4 text-black">
//             Estás logueado como <span className="font-semibold">{session.user.name || session.user.email}</span>.
//           </p>
//           {/* <Link 
//             href="/dashboard" 
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
//             Ir al Dashboard
//           </Link> */}
//         </div>
//       ) : (
//         <div className="text-center space-y-4">
//           <p>No estás logueado.</p>
//           <div className="space-x-4">
//             <Link 
//               href="/login" 
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
//               Iniciar sesión
//             </Link>
//             <Link 
//               href="/register" 
//               className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
//               Registrarse
//             </Link>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login'); // Redirige al login si no hay sesión
  }
  return (
    <main className="bg-gray-100 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#007391] to-[#005c6b] text-white py-20 text-center">
        <div className="container mx-auto px-6 lg:px-20">
          <h1 className="text-4xl lg:text-5xl font-extrabold">
            Plataforma de <span className="text-yellow-400">Código de Pago</span>
          </h1>
          <p className="mt-4 text-lg lg:text-xl opacity-90">
            Gestiona clientes que obtienen sus códigos de pago y mejora las tasas de promesas de pagos.
          </p>
        </div>
      </section>

      {/* Sección de Accesos Rápidos */}
      <section className="container mx-auto px-6 lg:px-20 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#254e59] mb-10">
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Gestión de Clientes */}
          {session?.user?.role === "Administrador" && (<Link href="/clientes" className="group bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition flex flex-col items-center">
            <img src="/client.jpg" alt="Clientes" className="w-16 mb-4" />
            <h3 className="text-xl font-semibold text-[#007391]">Gestión de Clientes</h3>
            <p className="text-gray-600 mt-2 text-center">
              Administra clientes con pagos pendientes y genera estrategias de recuperación.
            </p>
          </Link>)}

          {/* Promesas de Pago */}
          <Link href="/task" className="group bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition flex flex-col items-center">
            <img src="/paid.jpg" alt="Promesas de Pago" className="w-16 mb-4" />
            <h3 className="text-xl font-semibold text-[#007391]">Promesas de Pago</h3>
            <p className="text-gray-600 mt-2 text-center">
              Registra y gestiona acuerdos de pago con los clientes.
            </p>
          </Link>

          {/* Envío de Mensajes */}
          {session?.user?.role === "Administrador" && (<Link href="/campaigns" className="group bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition flex flex-col items-center">
            <img src="/mesage.jpg" alt="Mensajería" className="w-16 mb-4" />
            <h3 className="text-xl font-semibold text-[#007391]">Envío de Mensajes</h3>
            <p className="text-gray-600 mt-2 text-center">
              Automatiza y gestiona la comunicación con clientes en mora.
            </p>
          </Link>)}
        </div>
      </section>

      {/* Estadísticas Rápidas */}
      {/*<section className="bg-gray-200 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#254e59] mb-10">
          Estadísticas de Reactivaciones
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 px-6 lg:px-20">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
            <h4 className="text-xl font-semibold text-[#007391]">Clientes Reactivados</h4>
            <p className="text-3xl font-bold text-gray-800 mt-2">+350</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
            <h4 className="text-xl font-semibold text-[#007391]">Tasa de Recuperación</h4>
            <p className="text-3xl font-bold text-gray-800 mt-2">78%</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
            <h4 className="text-xl font-semibold text-[#007391]">Mensajes Enviados</h4>
            <p className="text-3xl font-bold text-gray-800 mt-2">+1,500</p>
          </div>
        </div>
      </section>*/}

      {/* CTA Final */}
      <section className="bg-[#007391] text-white text-center py-16">
        <h2 className="text-3xl lg:text-4xl font-extrabold">Optimiza tu Trabajo</h2>
        <p className="mt-4 text-lg lg:text-xl">Accede a las herramientas del CRM y gestiona clientes de manera eficiente.</p>
        <div className="mt-6">
          <Link
            href="/clientes"
            className="bg-yellow-400 text-[#005c6b] px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-300 transition"
          >
            Ir a Gestión de Clientes
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#254e59] text-white py-6 text-center">
        <p className="text-sm opacity-80">© 2025 Maqui+ CRM - Todos los derechos reservados</p>
      </footer>
    </main>
  );
}
