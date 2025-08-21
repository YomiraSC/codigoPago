// app/api/fondos/route.js

import bigquery from '@/lib/bigquery_peak';

export async function GET(req) {
  try {
    // Define el nombre del proyecto y dataset de BigQuery
    const projectId = 'peak-emitter-350713';
    const datasetId = 'BOT_codpago';  // Nombre del dataset

    // Obtiene las tablas dentro del dataset
    const [tables] = await bigquery.dataset(datasetId).getTables();

    // Mapeamos los nombres de las tablas
    const tableNames = tables.map(table => table.id);  // Solo los nombres de las tablas

    console.log('✅ Tablas obtenidas:', tableNames);

    // Retorna la lista de nombres de tablas en formato JSON con el status 200 (OK)
    return new Response(
      JSON.stringify({
        message: '✅ Consulta exitosa a BigQuery',
        tables: tableNames,  // Devolvemos solo los nombres de las tablas
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error conectando a BigQuery:', error.message);

    // Si ocurre un error, se responde con el error y un status 500
    return new Response(
      JSON.stringify({
        message: '❌ Fallo al conectar a BigQuery',
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
