import bq from '@/lib/bigquery_peak';

/* ── 1. Normaliza el tipo al formato oficial de BigQuery ── */
const normalizeType = (t = 'STRING') => ({
  STRING: 'STRING', BYTES: 'BYTES',
  BOOL: 'BOOL', BOOLEAN: 'BOOL',
  INT64: 'INT64', INTEGER: 'INT64',
  FLOAT64: 'FLOAT64', FLOAT: 'FLOAT64', DOUBLE: 'FLOAT64',
  NUMERIC: 'NUMERIC', BIGNUMERIC: 'BIGNUMERIC',
  DATE: 'DATE', TIME: 'TIME', DATETIME: 'DATETIME', TIMESTAMP: 'TIMESTAMP',
}[t.toUpperCase()] || 'STRING');

/* ── 2. Cache de esquema por tabla ───────────────────────── */
const schemaCache = new Map();         // { 'proyecto.dataset.tabla' → { col:type,… } }

async function getSchema(project, dataset, table) {
  const key = `${project}.${dataset}.${table}`;
  if (schemaCache.has(key)) return schemaCache.get(key);

  const sql = `
    SELECT column_name, data_type
    FROM   \`${project}.${dataset}.INFORMATION_SCHEMA.COLUMNS\`
    WHERE  table_name = @tbl
  `;
  const [rows] = await bq.query({
    query: sql,
    params: { tbl: table },
    parameterMode: 'named',
  });

  const dict = {};
  rows.forEach(r => { dict[r.column_name] = normalizeType(r.data_type); });
  schemaCache.set(key, dict);
  return dict;
}

/* ── 3. POST /api/filtrar ────────────────────────────────── */
export async function POST(req) {
  try {
    const { table, filters } = await req.json();
    if (!table || !Array.isArray(filters))
      return new Response('Payload inválido', { status: 400 });

    /* Ajusta aquí si cambian proyecto/dataset */
    const project = 'peak-emitter-350713';
    const dataset = 'BOT_codpago';

    const schema = await getSchema(project, dataset, table);

    /* 3.1 WHERE y params primitivos */
    const params = {};          // { val0: 'ALTA', val1: 'convencional', val2: 0.72 }
    const whereParts = [];

    filters.forEach((f, idx) => {
      const p       = `val${idx}`;
      const colName = f.column;
      const colType = schema[colName] || 'STRING';

      // Si el valor es null o vacío, se pone `TRUE` en el WHERE (no afecta el filtro)
      let val = f.value;
      if (val == null || val === '' || val === 'Todos') {
        whereParts.push(`1=1`);  // Siempre verdadero, se omite este filtro
        return; // No agregamos más lógica para este filtro
      }

      // Si es fecha, castea y filtra solo por la parte de la fecha
      if (colName === 'DATETIME' || colType === 'DATE') {

        console.log('Es fecha:', colName, 'Valor:', val);
        // Extrae solo la fecha (YYYY-MM-DD)
        const fechaSolo = val.split('T')[0];
        params[p] = fechaSolo;
        whereParts.push(`DATE(\`${colName}\`) = @${p}`);
        return;
      }

      // convierte a número si la columna es numérica
      if (colType === 'INT64')   val = Number.parseInt(val, 10);
      if (colType === 'FLOAT64') val = Number.parseFloat(val);
      console.log(`Columna: ${colName}, Tipo: ${colType}, Valor: ${val}`);
      params[p] = val;                          // se guarda como PRIMITIVO
      whereParts.push(`\`${colName}\` = @${p}`);
    });
    
    const whereSQL = whereParts.join(' AND ') || '1=1';
    console.log('WHERE SQL:', whereSQL);
    /* 3.2 columnas extra con alias legibles */
    const ALIAS = { segmentacion: 'segmento', cluster: 'cluster', estrategia: 'estrategia' };
    const selectExtra = filters
      .map(f => `\`${f.column}\` AS ${ALIAS[f.type] || f.column}`)
      .join(', ');

    /* 3.3 consulta final con JOIN */
//     const QUERY = `
//    WITH cte_M1 AS (
//     SELECT 
//       base.Codigo_Asociado,
//       base.segmentacion,
//       base.Cluster,
//       base.gestion,
//       fondos.Cta_Act_Pag,
//       fondos.Telf_SMS,
//       fondos.E_mail,
//       fondos.Linea
//     FROM   \`${project}.${dataset}.${table}\` AS base
//     LEFT JOIN peak-emitter-350713.FR_general.bd_fondos AS fondos
//       ON base.Codigo_Asociado = fondos.Codigo_Asociado
//   ),
//   ranked AS (
//     SELECT 
//       M1.Codigo_Asociado,
//       M1.segmentacion,
//       M1.Linea,
//       envios.Email AS email,
//       M1.Cta_Act_Pag,
//       envios.TelfSMS AS telefono,
//       envios.Primer_Nombre AS nombre,
//       envios.Cod_Banco AS codpago,
//       envios.Fec_Venc_Cuota AS feccuota,
//       envios.Modelo AS modelo,
//       FORMAT('%.2f', envios.Monto) AS monto,
//       ROW_NUMBER() OVER (PARTITION BY envios.TelfSMS ORDER BY envios.N_Doc) AS row_num  -- Asigna un número a cada fila por TelfSMS
//     FROM cte_M1 AS M1
//     INNER JOIN peak-emitter-350713.FR_general.envios_cobranzas_m0 AS envios
//       ON M1.Telf_SMS = envios.TelfSMS
//     WHERE   
//       ${whereSQL}
//   )
//   SELECT 
//     Cta_Act_Pag,
//     Codigo_Asociado,
//     segmentacion,
//     email,
//     telefono,
//     nombre,
//     codpago,
//     feccuota,
//     modelo,
//     monto,
//     Linea
//   FROM ranked
//   WHERE row_num = 1;  -- Selecciona solo la primera fila de cada grupo de TelfSMS
// `;

// const QUERY = `
//    WITH base_filtrada AS (
//   SELECT *
//   FROM \`${project}.${dataset}.${table}\`
//   WHERE ${whereSQL}
// ),
// join_fondos AS (
//   SELECT
//     b.*,
//     f.Cod_Bco
//   FROM base_filtrada b
//   LEFT JOIN \`peak-emitter-350713.FR_general.bd_fondos\` f
//     ON REGEXP_REPLACE(CAST(b.DNI AS STRING), r'[^0-9]', '')  -- limpia DNI por si acaso
//        = REGEXP_REPLACE(CAST(f.N_Doc AS STRING), r'[^0-9]', '')  -- quita coma final y no dígitos
// )
// SELECT
//   b.DNI,
//   b.segmentacion,
//   b.Gestion,
//   b.telefono,
//   b.nombre,
//   IFNULL(STRING_AGG(DISTINCT CAST(Cod_Bco AS STRING), ', '), '') AS codigos_pago
// FROM join_fondos b
// GROUP BY
//   b.DNI, b.segmentacion, b.Gestion,b.telefono, b.nombre;

// `;

const QUERY = `
   WITH base_filtrada AS (
  SELECT *
  FROM \`${project}.${dataset}.${table}\`
  WHERE ${whereSQL}
),
join_fondos AS (
  SELECT
    b.*,
    REGEXP_REPLACE(TRIM(CAST(f.Cod_Bco AS STRING)), r',$', '') AS Cod_Bco
  FROM base_filtrada b
  LEFT JOIN peak-emitter-350713.FR_general.bd_fondos f
    ON REGEXP_REPLACE(CAST(b.DNI AS STRING), r'[^0-9]', '') =
       REGEXP_REPLACE(CAST(f.N_Doc AS STRING), r'[^0-9]', '')
)
SELECT
  DNI as documento_identidad,
  Frente as segmentacion,
  Estrategia_ as Gestion,
  telefono as celular,
  nombre,
  IFNULL(STRING_AGG(DISTINCT CAST(Cod_Bco AS STRING), ', '), '') AS code_pago 
FROM join_fondos
GROUP BY
  DNI, segmentacion, Gestion, telefono, nombre;

`;
    console.log('Consulta SQL:', QUERY);

    /* 3.4 ejecutar */
    const [rows] = await bq.query({
      query: QUERY,
      params,
      parameterMode: 'named',
    });

    return Response.json({ rows });         // 200 OK
  } catch (err) {
    console.error('Error en /api/filtrar:', err);
    return new Response('Error ejecutando consulta', { status: 500 });
  }
}
