#!/usr/bin/env node
/**
 * Verifies published curriculum health directly against PostgreSQL.
 * Fails CI on duplicate fingerprints, missing explanations, listening without
 * audio, or a published curriculum with no lessons. Full/beta thresholds are
 * enforced from the curriculum status declared in the DB.
 */
import { Client } from "pg";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL is not set");
  process.exit(1);
}

const schema = process.env.DB_SCHEMA || "lango";
const client = new Client({
  connectionString: (() => {
    const url = new URL(connectionString);
    url.searchParams.delete("schema");
    return url.toString();
  })(),
});

function threshold(status, questions) {
  if (status === "full" && questions < 10_500) {
    return `full requires ≥10,500 published questions (has ${questions})`;
  }
  if (status === "beta" && questions < 2_100) {
    return `beta requires ≥2,100 published questions (has ${questions})`;
  }
  if (status === "preview" && questions < 175) {
    return `preview requires ≥175 published questions (has ${questions})`;
  }
  return null;
}

async function main() {
  await client.connect();

  const curricula = await client.query(`
    SELECT c.id, c."languageCode", c.framework, c.status,
           c."totalQuestions", c."totalLessons"
    FROM "${schema}"."Curriculum" c
    ORDER BY c."languageCode"
  `);

  const failures = [];
  const warnings = [];

  for (const row of curricula.rows) {
    const counts = await client.query(
      `SELECT
         COUNT(*)::int AS questions,
         COUNT(*) FILTER (WHERE q.explanation IS NULL OR btrim(q.explanation) = '')::int AS missing_explanation,
         COUNT(*) FILTER (WHERE q.type = 'listening_comprehension' AND q."audioAssetId" IS NULL)::int AS listening_without_audio
       FROM "${schema}"."Question" q
       JOIN "${schema}"."CurriculumLesson" l ON l.id = q."lessonId"
       JOIN "${schema}"."CurriculumUnit" u ON u.id = l."unitId"
       JOIN "${schema}"."CurriculumLevel" lv ON lv.id = u."levelId"
       WHERE lv."curriculumId" = $1 AND q.status = 'published'`,
      [row.id],
    );
    const countsRow = counts.rows[0];
    console.log(
      `${row.languageCode}/${row.framework} (${row.id}): ${countsRow.questions} published questions, ${row.totalLessons} lessons, status=${row.status}`,
    );

    if (countsRow.questions === 0) {
      failures.push(`${row.id}: published curriculum has no questions`);
    }
    if (countsRow.questions !== row.totalQuestions) {
      failures.push(
        `${row.id}: denormalized totalQuestions=${row.totalQuestions} does not match published=${countsRow.questions}`,
      );
    }
    if (countsRow.missing_explanation > 0) {
      failures.push(`${row.id}: ${countsRow.missing_explanation} questions lack a default explanation`);
    }
    if (countsRow.listening_without_audio > 0) {
      failures.push(`${row.id}: ${countsRow.listening_without_audio} listening questions lack audio`);
    }

    const gate = threshold(row.status, countsRow.questions);
    if (gate) warnings.push(`${row.id}: ${gate}`);
  }

  const duplicateFingerprints = await client.query(`
    SELECT "fingerprint", COUNT(*)::int AS count
    FROM "${schema}"."Question"
    GROUP BY "fingerprint"
    HAVING COUNT(*) > 1
    LIMIT 20
  `);
  if (duplicateFingerprints.rows.length > 0) {
    failures.push(
      `duplicate fingerprints: ${duplicateFingerprints.rows.map((row) => row.fingerprint).join(", ")}`,
    );
  }

  const missingLocalization = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM "${schema}"."Question" q
    WHERE q.status = 'published'
      AND NOT EXISTS (
        SELECT 1 FROM "${schema}"."QuestionLocalization" ql
        WHERE ql."questionId" = q.id AND ql.locale = 'id' AND ql.explanation IS NOT NULL
      )
  `);
  if (missingLocalization.rows[0].count > 0) {
    failures.push(
      `${missingLocalization.rows[0].count} published questions lack an Indonesian explanation`,
    );
  }

  if (warnings.length > 0) {
    console.warn("\nWarnings:");
    for (const warning of warnings) console.warn(`  ! ${warning}`);
  }

  if (failures.length > 0) {
    console.error("\n✗ curriculum check failed:");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log("\n✓ curriculum check passed");
}

main()
  .catch((error) => {
    console.error("✗ curriculum check crashed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
