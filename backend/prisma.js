// One reusable Prisma Client instance for the whole backend.
const { PrismaClient } = require("@prisma/client");
const { timeText } = require("./src/utils/time");

// Models that have an `updatedAt` column. Dates are readable text (see src/utils/time.js), so the
// time of every change is filled in here instead of by Prisma's @updatedAt.
const HAS_UPDATED_AT = new Set(["Admin", "Project", "PortfolioSettings", "Message"]);

// Adds the current time to `updatedAt`, but only when something is really being changed
// (an empty update such as "make sure the settings row exists" keeps the old time).
function withUpdatedAt(model, data) {
  if (!HAS_UPDATED_AT.has(model) || !data || data.updatedAt !== undefined) return data;
  if (Object.keys(data).length === 0) return data;
  return { ...data, updatedAt: timeText() };
}

let baseClient;
try {
  baseClient = new PrismaClient();
} catch (error) {
  if (/did not initialize yet/i.test(error.message)) {
    console.error('\nPrisma Client has not been generated yet. In the backend folder run:\n  npm run prisma:generate\n');
    process.exit(1);
  }
  throw error;
}

const prisma = baseClient.$extends({
  query: {
    $allModels: {
      update({ model, args, query }) {
        return query({ ...args, data: withUpdatedAt(model, args.data) });
      },
      updateMany({ model, args, query }) {
        return query({ ...args, data: withUpdatedAt(model, args.data) });
      },
      upsert({ model, args, query }) {
        return query({ ...args, update: withUpdatedAt(model, args.update) });
      },
    },
  },
});

module.exports = prisma;
