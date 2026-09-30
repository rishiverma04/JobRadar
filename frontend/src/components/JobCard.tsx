import { Link } from "react-router-dom";
import "../App.css";

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

type JobCardProps = {
  job: Job;
};

function JobCard({ job }: JobCardProps) {
  return (
    <div className="job-card">
      <h2>{job.title}</h2>

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

      <span className="job-source">
        {job.source}
      </span>

      <p>
        <strong>Posted:</strong>{" "}
        {job.posted_at || "Not specified"}
      </p>

      <Link
        className="job-link"
        to={`/jobs/${job.id}`}
      >
        View Details →
      </Link>
    </div>
  );
}

export default JobCard;