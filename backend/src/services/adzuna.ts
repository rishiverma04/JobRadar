import dotenv from "dotenv";

dotenv.config();

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

if (!APP_ID || !APP_KEY) {
  throw new Error("Adzuna API credentials are missing");
}

export async function fetchAdzunaJobs(
  query: string,
  location: string = "india",
  page:number=1,
) {
  const url = new URL(
    `https://api.adzuna.com/v1/api/jobs/in/search/${page}`
  );

  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("results_per_page", "20");
  url.searchParams.set("what", query);
  url.searchParams.set("where", location);
  url.searchParams.set("content-type", "application/json");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Adzuna API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}