import { Hono } from "hono";
import { cors } from "hono/cors";

import { signup } from "./routes/signup";
import { signin } from "./routes/signin";
import { signout } from "./routes/signout";
import { checkauth } from "./routes/checkauth";
import { getuserdata } from "./routes/getuserdata";

//console.log("Starting...");

// Hono
const app = new Hono();
//app.use("/*", cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/signup", signup);
app.post("/signin", signin);
app.get("/signout", signout);
app.get("/checkauth", checkauth);
app.get("/getuserdata", getuserdata);

//app.fire();

export default app;
