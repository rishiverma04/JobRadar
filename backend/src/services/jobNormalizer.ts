import { NormalizedJob } from "../types/jobs";

export  function normalizeRemotiveJob(job:any):NormalizedJob {
      return {
            title:job.title||"Unknown",
            company:job.company_name||"Unknown",
            location:job.candidate?.required_location||null,
            description:job.description||null,
            skills:job.tags||[],
            salary:job.salary||null,
            job_type:job.job_type||null,
            experience:null,
            source:"Remotive",
            source_url:job.url,
            posted_at:job.publication_date||null,
      };
}
export function normalizeAdzunaJob(job:any):NormalizedJob{
      return{
            title:job.title||"Unknown",
            company:job.company?.display_name||"Unknown",
            location:job.location?.display_name||null,
            description:job.description||null,
            skills:[],
            salary:job.salary_min
            ?`${job.salary_min} - ${job.salary_max||""}`:null,
            job_type:null,
            experience:null,
            source:"Adzuna",
            source_url:job.redirect_url||"",
            posted_at:job.posted||null,


      };
}