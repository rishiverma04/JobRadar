import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchJobById } from "../services/jobApi";
import { Link } from "react-router-dom";
type Job = {
  id: number;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  skills: string[];
  salary: string | null;
  job_type: string | null;
  experience: string | null;
  source: string;
  source_url: string;
  posted_at: string | null;
};

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        if (!id) return;

        const data = await fetchJobById(Number(id));
        setJob(data.job);
      } catch (error) {
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id]);

  if (loading) {
    return <p>Loading job...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!job) {
    return <p>Job not found</p>;
  }

  return (
      <div className="job-details">
    <Link to="/" className="back-link">
      ← Back to Jobs
    </Link>

   
      <h1>{job.title}</h1>

      <p>
        <strong>Company:</strong> {job.company}
      </p>

      <p>
        <strong>Location:</strong>{" "}
        {job.location || "Not specified"}
      </p>

      <p>
        <strong>Salary:</strong>{" "}
        {job.salary || "Not specified"}
      </p>

      <p>
        <strong>Job Type:</strong>{" "}
        {job.job_type || "Not specified"}
      </p>

      <p>
        <strong>Experience:</strong>{" "}
        {job.experience || "Not specified"}
      </p>

      <p>
        <strong>Source:</strong> {job.source}
      </p>
<h2>Skills</h2>

<div className="skills-list">
  {job.skills.length > 0 ? (
    job.skills.map((skill) => (
      <span className="skill-tag" key={skill}>
        {skill}
      </span>
    ))
  ) : (
    <p>No skills specified</p>
  )}
</div>
      <h2>Description</h2>

      <p>
        {job.description || "No description available"}
      </p>

      <a
        href={job.source_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Apply / View Original Job →
      </a>
    </div>
  );
}

export default JobDetails;