import { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

import { orm } from "../db/index";
import { userTable, sessionTable } from "../db/schema";
import { sql } from "drizzle-orm";

export const signout = async (c: Context) => {
  const sessionId = getCookie(c, "sessionId");
  if (!sessionId) {
    return c.json({ ok: false, error: "No session cookie." }, 401);
  }

  try {
    await orm
      .delete(sessionTable)
      .where(sql`${sessionTable.id} = ${sessionId}`)
      .run();

    // Clear the sessionId cookie
    /*
    setCookie(c, "sessionId", "", {
      path: "/",
      maxAge: 0, // Expire the cookie immediately
      httpOnly: true,
      sameSite: "Lax", // You can also use 'None' or 'Strict' based on your needs
    });
    */
    deleteCookie(c, "sessionId");

    return c.json({ ok: true });
  } catch (error) {
    // Handle potential errors
    console.error("Error deleting session:", error);
    return c.json({ ok: false, error: "Internal server error" }, 500);
  }
};
