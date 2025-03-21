import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery";

export async function GET() {
  try {
    const query = "SELECT 1 as test";
    const options = { query };
    const [rows] = await bigquery.query(options);
    console.log("✅ Conexión exitosa:", rows);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error en la conexión a BigQuery:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
