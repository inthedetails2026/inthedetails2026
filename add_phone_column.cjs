const postgres = require("postgres");

const connectionString = "postgresql://postgres.ygbsybnshwuxlbqiirck:03895954.com@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true";

async function addPhoneColumn() {
  const sql = postgres(connectionString, { prepare: false });
  try {
    await sql`ALTER TABLE addresses ADD COLUMN IF NOT EXISTS phone text`;
    console.log("✅ SUCCESS: 'phone' column added to addresses table.");
  } catch (err) {
    console.error("❌ FAILED:", err);
  } finally {
    await sql.end();
    process.exit();
  }
}

addPhoneColumn();
