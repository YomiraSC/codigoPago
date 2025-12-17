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
const schemaCache = new Map();

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

    const project = 'peak-emitter-350713';
    const dataset = 'BOT_codpago';

    const schema = await getSchema(project, dataset, table);

    /* 3.1 WHERE y params primitivos */
    const params = {};
    const whereParts = [];

    filters.forEach((f, idx) => {
      const p = `val${idx}`;
      const colName = f.column;
      const colType = schema[colName] || 'STRING';
      let val = f.value;

      if (val == null || val === '' || val === 'Todos') {
        return;
      }

      console.log(`Procesando filtro - Columna: ${colName}, Tipo: ${colType}, Valor: ${val}`);

      // 👇 CASO ESPECIAL: mes_gestion (sin importar el tipo detectado)
      if (colName === 'mes_gestion') {
        const fechaCompleta = `${val}-01`;
        params[p] = fechaCompleta;
        whereParts.push(
          `DATE_TRUNC(CAST(\`${colName}\` AS DATE), MONTH) = DATE_TRUNC(CAST(@${p} AS DATE), MONTH)`
        );
        return;
      }

      // Otros campos DATE o DATETIME
      if (colType === 'DATE' || colType === 'DATETIME') {
        const fechaSolo = val.split('T')[0];
        params[p] = fechaSolo;
        whereParts.push(`DATE(\`${colName}\`) = @${p}`);
        return;
      }

      // Convertir a número si es necesario
      if (colType === 'INT64') val = Number.parseInt(val, 10);
      if (colType === 'FLOAT64') val = Number.parseFloat(val);
      params[p] = val;
      whereParts.push(`\`${colName}\` = @${p}`);
    });

    const whereSQL = whereParts.length > 0 ? whereParts.join(' AND ') : '1=1';
    console.log('WHERE SQL:', whereSQL);
    console.log('Params:', params);
    console.log('📊 PARAMS FINALES:', JSON.stringify(params, null, 2));

    /* 3.2 Consulta final con exclusión de cobranzas */
    const QUERY = `
WITH base_filtrada AS (
  SELECT *
  FROM \`${project}.${dataset}.gestion_mensual\`
  WHERE ${whereSQL}
),

join_fondos AS (
  SELECT
    b.dni,
    b.nombre,
    b.telefono,
    b.estrategia,
    b.categoria_urgencia,
    b.score_urgencia,
    b.mes_gestion,
    b.estado,
    b.prioridad,
    f.Codigo_Asociado,
    REGEXP_REPLACE(TRIM(CAST(f.Cod_Bco AS STRING)), r',$', '') AS Cod_Bco,
    f.Pago_cuota,
    f.Mora,
    f.Estado_Asociado,
    f.Estado_Adjudicado
  FROM base_filtrada b
  INNER JOIN  \`${project}.FR_general.bd_fondos\` f
    ON REGEXP_REPLACE(CAST(b.dni AS STRING), r'[^0-9]', '') =
       REGEXP_REPLACE(CAST(f.N_Doc AS STRING), r'[^0-9]', '')
),

-- 🔑 Solo contratos pendientes
contratos_pendientes AS (
  SELECT *
  FROM join_fondos
  WHERE
    UPPER(TRIM(CAST(Pago_cuota AS STRING))) = 'NO'
    AND CAST(Mora AS INT64) = 0
    AND UPPER(TRIM(Estado_Asociado)) = 'ACTIVO'
    AND UPPER(TRIM(Estado_Adjudicado)) = 'NO ADJUDICADO'
),

-- 🚫 EXCLUSIÓN: LEFT JOIN con cobranzas para eliminar clientes en cobranza_mes_actual
sin_cobranzas AS (
  SELECT
    cp.*
  FROM contratos_pendientes cp
  LEFT JOIN \`${project}.FR_general.cobranza_mes_actual\` c
    ON CAST(cp.Codigo_Asociado AS STRING) = CAST(c.Codigo_Asociado AS STRING)
  WHERE c.Codigo_Asociado IS NULL  -- Solo los que NO están en cobranzas
),

ranked AS (
  SELECT
    dni,
    nombre,
    telefono,
    estrategia,
    categoria_urgencia,
    score_urgencia,
    CAST(mes_gestion AS STRING) AS mes_gestion,
    estado,
    prioridad,
    STRING_AGG(DISTINCT Cod_Bco, ', ' ORDER BY Cod_Bco) AS codigos_pago,
    COUNT(DISTINCT Cod_Bco) AS total_contratos,
    ROW_NUMBER() OVER (
      PARTITION BY dni
      ORDER BY prioridad DESC, score_urgencia DESC
    ) AS rn
  FROM sin_cobranzas
  GROUP BY
    dni,
    nombre,
    telefono,
    estrategia,
    categoria_urgencia,
    score_urgencia,
    mes_gestion,
    estado,
    prioridad
)

SELECT
  dni,
  nombre,
  telefono,
  estrategia,
  categoria_urgencia,
  score_urgencia,
  mes_gestion,
  estado,
  prioridad,
  codigos_pago,
  total_contratos
FROM ranked
WHERE rn = 1
ORDER BY prioridad DESC, score_urgencia DESC;
    `;

    console.log('Consulta SQL:', QUERY);

    /* 3.3 ejecutar */
    const [rows] = await bq.query({
      query: QUERY,
      params,
      parameterMode: 'named',   
    });

    console.log(`Filas obtenidas: ${rows.length}`);
    return Response.json({ rows });
  } catch (err) {
    console.error('Error en /api/filtrar:', err);
    return new Response(`Error ejecutando consulta: ${err.message}`, { status: 500 });
  }
}