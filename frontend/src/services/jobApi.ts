const API_URL = "http://localhost:4000/api/jobs";

type JobFilters = {
  search?: string;
  location?: string;
  source?: string;
  job_type?: string;
  sort?:string,
  page?:number,
  limit?:number,
};

export async function fetchJobs(filters: JobFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.location) {
    params.set("location", filters.location);
  }

  if (filters.source) {
    params.set("source", filters.source);
  }

  if (filters.job_type) {
    params.set("job_type", filters.job_type);
  }
  if (filters.sort) {
  params.set("sort", filters.sort);
}
if(filters.page){
      params.set("page",filters.page.toString());
}
if(filters.limit){
      params.set("limit",filters.limit.toString());
}

  const response = await fetch(
    `${API_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
}
export async function fetchJobById(id: number) {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch job");
  }

  return response.json();
}