import postgres, { Sql } from "postgres";
import { env } from "@/env";

declare global {
  var __employeeDb: Sql<Record<string, unknown>> | undefined;
}

const createClient = () =>
  postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
    prepare: true,
  });

export const db = global.__employeeDb ?? createClient();

if (!global.__employeeDb) {
  global.__employeeDb = db;
}
