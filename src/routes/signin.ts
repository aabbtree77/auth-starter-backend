import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

import { orm } from "../db/index";
import { userTable, sessionTable } from "../db/schema";
import { sql } from "drizzle-orm";

import { z } from "zod";
import * as argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";

const userSchema = z.object({
  userName: z
    .string()
    .min(1, "Username is required")
    .refine(
      (userName) => userName.trim().length > 0,
      "Username cannot consist solely of spaces"
    ),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signin = async (c: Context) => {
  // Process the POST request for username and password
  const payload = await c.req.json();
  const parsedPayload = userSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return c.json({ ok: false, error: parsedPayload.error.errors }, 400);
  }
  const { userName, password } = parsedPayload.data;
  const hashedPassword = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  try {
    const existingUser = orm
      .select()
      .from(userTable)
      .where(sql`${userTable.userName} = ${userName}`)
      .get();

    if (!existingUser) {
      throw new Error("Incorrect username or password");
    }

    const isPasswordValid = await argon2.verify(
      existingUser.password,
      password
    );

    if (!isPasswordValid) {
      throw new Error("Incorrect username or password");
    }

    // Delete existing sessions (no multiple sessions will be allowed)
    await orm
      .delete(sessionTable)
      .where(sql`${sessionTable.userId} = ${existingUser.id}`)
      .run();

    // Create a new session and a cookie
    const sessionId = uuidv4();

    const ttlSeconds = 300;
    //datetime is text in ISO 8601 format
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    //console.log("Generated expiresAt:", expiresAt);

    const session = {
      id: sessionId,
      expiresAt,
      userId: existingUser.id,
    };

    orm.insert(sessionTable).values(session).run();

    setCookie(c, "sessionId", sessionId, {
      path: "/",
      maxAge: ttlSeconds,
      httpOnly: true,
      sameSite: "Lax", // You can also use 'None' or 'Strict' based on your needs
    });

    return c.json({ ok: true });
  } catch (e) {
    if (e instanceof Error) {
      return c.json({ ok: false, error: e.message }, 400);
    }
    return c.json({ ok: false, error: "Uknown error." }, 500);
  }
};
