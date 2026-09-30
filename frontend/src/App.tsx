import { useEffect, useState } from "react";
import { fetchJobs } from "./services/jobApi";
import JobCard from "./components/JobCard";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import JobDetails from "./pages/JobDetails";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string | null;
  source: string;
  salary: string | null;
  source_url: string;
  posted_at: string | null;
};

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [jobType, setJobType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [error, setError] = useState("");

  async function loadJobs(
    searchValue = search,
    locationValue = location,
    sourceValue = source,
    jobTypeValue = jobType,
    pageValue = page,
  ) {
    try {
      setLoading(true);
      setError("");

      const data = await fetchJobs({
        search: searchValue,
        location: locationValue,
        source: sourceValue,
        job_type: jobTypeValue,
        sort: sort,
        page: pageValue,
        limit: limit,
      });

      setJobs(data.jobs);
    } catch (error) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    setPage(1);

    loadJobs(
      search,
      location,
      source,
      jobType,
      1
    );
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);

    loadJobs(
      search,
      location,
      source,
      jobType,
      newPage
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app">
              <div className="header">
                <h1>JobRadar 🚀</h1>
                <p>Find your next opportunity</p>
              </div>

              <form
                onSubmit={handleSearch}
                className="search-form"
              >
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

                <button type="submit">
                  Search
                </button>
              </form>

              <div className="filters">
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                />

                <select
                  value={source}
                  onChange={(event) =>
                    setSource(event.target.value)
                  }
                >
                  <option value="">
                    All Sources
                  </option>

                  <option value="Adzuna">
                    Adzuna
                  </option>

                  <option value="Remotive">
                    Remotive
                  </option>
                </select>

                <input
                  type="text"
                  placeholder="Job Type"
                  value={jobType}
                  onChange={(event) =>
                    setJobType(event.target.value)
                  }
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setPage(1);

                    loadJobs(
                      search,
                      location,
                      source,
                      jobType,
                      1
                    );
                  }}
                >
                  Apply Filters
                </button>
              </div>

              {loading && (
                <p>Loading jobs...</p>
              )}

              {error && (
                <p>{error}</p>
              )}

              {!loading && !error && (
                <>
                  <p className="jobs-count">
                    Jobs found: {jobs.length}
                  </p>

                  {jobs.length === 0 ? (
                    <p className="empty-state">
                      No jobs found. Try a different
                      search or filter.
                    </p>
                  ) : (
                    <div className="jobs-list">
                      {jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                        />
                      ))}
                    </div>
                  )}

                  <div className="pagination">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() =>
                        handlePageChange(page - 1)
                      }
                    >
                      ← Previous
                    </button>

                    <span>
                      Page {page}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(page + 1)
                      }
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </div>
          }
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;