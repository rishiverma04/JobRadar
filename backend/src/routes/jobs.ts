
import { Router } from "express";
import { pool } from "../db.js";
import { fetchAdzunaJobs } from "../services/adzuna.js";
import { fetchRemotiveJobs } from "../services/remotive.js";
import { normalizeRemotiveJob,normalizeAdzunaJob } from "../services/jobNormalizer.js";
const router = Router();

// GET all jobs
router.get("/", async (req, res) => {
  try {
   const search=req.query.search?String(req.query.search):""
   const location=req.query.location?String(req.query.location):""
   const source=req.query.source?String(req.query.source):""
   const jobType=req.query.job_type?String(req.query.job_type):""
   const sort=req.query.sort?String(req.query.sort):"newest";
   let orderBy = "created_at DESC";

if (sort === "oldest") {
  orderBy = "created_at ASC";
}
    const page = Math.max(
      1,
      Number.parseInt(String(req.query.page || "1"), 10)
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(String(req.query.limit || "20"), 10)
      )
    );

    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: string[] = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          title ILIKE $${values.length}
          OR company ILIKE $${values.length}
          OR description ILIKE $${values.length}
        )
      `);
    }

    if (location) {
      values.push(`%${location}%`);

      conditions.push(
        `location ILIKE $${values.length}`
      );
    }

    if (source) {
      values.push(source);

      conditions.push(
        `source = $${values.length}`
      );
    }

    if (jobType) {
      values.push(jobType);

      conditions.push(
        `job_type = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM jobs
      ${whereClause}
      `,
      values
    );

    const total = countResult.rows[0].total;

    values.push(String(limit));
    const limitPosition = values.length;

    values.push(String(offset));
    const offsetPosition = values.length;

    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${limitPosition}
      OFFSET $${offsetPosition}
      `,
      values
    );

    res.json({
      status: "OK",
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      count: result.rows.length,
      jobs: result.rows,
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch jobs",
    });
  }
});

router.get("/:id",async(req,res)=>{
  try{
    const id=Number.parseInt(req.params.id,10);

    if(Number.isNaN(id)){
      return res.status(400).json({
        status:"ERROR",
        message:"Invalid job ID",
      });
    }
  const result=await pool.query(
    `SELECT *
    FROM jobs
    WHERE id= $1
    `,[id]
  );
  if(result.rows.length==0){
  return res.status(404).json({
    status:"ERROR",
    message:"Job not found",
  });
  }
  res.json({
    status:"OK",
    job:result.rows[0],
  });
}catch(error){
  console.error("Error fetching job:",error);

  res.status(500).json({
    status:"ERROR",
    message:"Failed to fetch job"
  })
}

// GET jobs from Adzuna + save them to PostgreSQL
router.get("/fetch/adzuna", async (req, res) => {
  try {
    const query = String(req.query.q || "software engineer");
    const location = String(req.query.location || "india");

    const pages = Math.min(
      5,
      Math.max(1, Number.parseInt(String(req.query.pages || "1"), 10))
    );

    let fetched = 0;
    let inserted = 0;
    let skipped = 0;

    for (let page = 1; page <= pages; page++) {
      const data = await fetchAdzunaJobs(query, location, page);

      const jobs = data.results || [];

      fetched += jobs.length;

      for (const job of jobs) {
        const normalizedJob = normalizeAdzunaJob(job);

        const result = await pool.query(
          `
          INSERT INTO jobs
          (
            title,
            company,
            location,
            description,
            skills,
            salary,
            job_type,
            experience,
            source,
            source_url,
            posted_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (source_url) DO NOTHING
          RETURNING id
          `,
          [
            normalizedJob.title,
            normalizedJob.company,
            normalizedJob.location,
            normalizedJob.description,
            normalizedJob.skills,
            normalizedJob.salary,
            normalizedJob.job_type,
            normalizedJob.experience,
            normalizedJob.source,
            normalizedJob.source_url,
            normalizedJob.posted_at,
          ]
        );

        if (result.rowCount && result.rowCount > 0) {
          inserted++;
        } else {
          skipped++;
        }
      }
    }

    res.json({
      status: "OK",
      source: "Adzuna",
      pages,
      fetched,
      inserted,
      skipped,
      message: "Adzuna jobs normalized and saved successfully 🚀",
    });
  } catch (error) {
    console.error("❌ Adzuna fetch error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch and save Adzuna jobs",
    });
  }
});

router.get("/fetch/remotive", async (req, res) => {
  try {
    const query = req.query.q
      ? String(req.query.q)
      : undefined;

    const data = await fetchRemotiveJobs(query);

    const jobs = data.jobs || [];

    let inserted = 0;
    let skipped = 0;

    for (const job of jobs) {
      const normalizedJob = normalizeRemotiveJob(job);

      const result = await pool.query(
        `
        INSERT INTO jobs
        (
          title,
          company,
          location,
          description,
          skills,
          salary,
          job_type,
          experience,
          source,
          source_url,
          posted_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (source_url) DO NOTHING
        RETURNING id
        `,
        [
          normalizedJob.title,
          normalizedJob.company,
          normalizedJob.location,
          normalizedJob.description,
          normalizedJob.skills,
          normalizedJob.salary,
          normalizedJob.job_type,
          normalizedJob.experience,
          normalizedJob.source,
          normalizedJob.source_url,
          normalizedJob.posted_at,
        ]
      );

      if (result.rowCount && result.rowCount > 0) {
        inserted++;
      } else {
        skipped++;
      }
    }

    res.json({
      status: "OK",
      source: "Remotive",
      fetched: jobs.length,
      inserted,
      skipped,
      message: "Remotive jobs fetched and saved successfully 🚀",
    });
  } catch (error: any) {
    console.error("❌ Remotive fetch error:", error);

    res.status(500).json({
      status: "ERROR",
      message: error.message || "Unknown error",
      detail: error.detail || null,
      code: error.code || null,
    });
  }
});
});
export default router;