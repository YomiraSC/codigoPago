import { BigQuery } from "@google-cloud/bigquery";

const credentials = JSON.parse(process.env.BQ_CREDENTIALS);

const bigquery = new BigQuery({
  projectId: credentials.project_id,
  credentials,
});

export default bigquery;