// Gap-free IDs: a new record gets the SMALLEST number that is not used yet.
//   IDs 1, 2, 3, 4 -> delete 2 -> the next new record is ID 2 again (not 5).
//   IDs 1, 2, 3    -> the next new record is ID 4.
// Uploaded files have their own random names, so reusing an ID never mixes up files.
const TABLES = new Set(["Project", "Message"]);

async function nextFreeId(client, table) {
  if (!TABLES.has(table)) throw new Error(`nextFreeId: unsupported table ${table}`);
  const rows = await client.$queryRawUnsafe(
    `SELECT CASE
       WHEN NOT EXISTS (SELECT 1 FROM "${table}" WHERE id = 1) THEN 1
       ELSE (SELECT MIN(t.id + 1) FROM "${table}" t WHERE NOT EXISTS (SELECT 1 FROM "${table}" u WHERE u.id = t.id + 1))
     END AS next`
  );
  return Number(rows[0].next);
}

// Creates a record with the next free ID. If two records are saved at the same moment and pick the
// same ID, the second one simply tries again with the next free number.
async function createWithNextId(client, table, create) {
  for (let attempt = 1; ; attempt += 1) {
    const id = await nextFreeId(client, table);
    try {
      return await create(id);
    } catch (error) {
      // Project and Message have no other unique column, so P2002 here can only be an ID clash.
      if (error.code === "P2002" && attempt < 5) continue;
      throw error;
    }
  }
}

// Keeps SQLite's own counter in line with the highest ID, so records added in Prisma Studio
// continue from the end of the list as well.
function resetSequenceSql(table) {
  if (!TABLES.has(table)) throw new Error(`resetSequenceSql: unsupported table ${table}`);
  return `UPDATE sqlite_sequence SET seq = (SELECT IFNULL(MAX(id), 0) FROM "${table}") WHERE name = '${table}'`;
}

module.exports = { nextFreeId, createWithNextId, resetSequenceSql };
