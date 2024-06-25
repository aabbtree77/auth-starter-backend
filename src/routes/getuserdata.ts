import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

import { orm } from "../db/index";
import { userTable, sessionTable } from "../db/schema";
import { sql } from "drizzle-orm";

import { isSessionExpired } from "../utils/sessionhelpers";

export const getuserdata = async (c: Context) => {
  const sessionId = getCookie(c, "sessionId");

  if (!sessionId) {
    return c.json({ ok: false, error: "No sessionId cookie found" }, 400);
  }

  // Query to get user_id from session table
  try {
    const sessions = await orm
      .select()
      .from(sessionTable)
      .where(sql`${sessionTable.id} = ${sessionId}`)
      .all(); // Use .all() to get an array of results

    if (sessions.length === 0) {
      return c.json({ ok: false, error: "Invalid sessionId" }, 400);
    }

    if (isSessionExpired(sessions[0].expiresAt)) {
      return c.json({ ok: false, error: "Session expired, re-signin." }, 400);
    }
    const userId = sessions[0].userId;

    // Query to get username and user_role from user table
    const users = await orm
      .select({
        userName: userTable.userName,
        userRole: userTable.userRole,
      })
      .from(userTable)
      .where(sql`${userTable.id} = ${userId}`)
      .all(); // Use .all() to get an array of results
    if (users.length === 0) {
      return c.json({ ok: false, error: "User not found" }, 404);
    }

    const userData = users[0];

    return c.json({ ok: true, userData });
  } catch (e) {
    if (e instanceof Error) {
      return c.json({ ok: false, error: e.message }, 400);
    }
    return c.json({ ok: false, error: "Uknown error." }, 500);
  }
};
