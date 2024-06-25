import { Hono } from "hono";
import { signup } from "./routes/signup";
import { signin } from "./routes/signin";
import { signout } from "./routes/signout";
import { checkauth } from "./routes/checkauth";
import { getuserdata } from "./routes/getuserdata";
console.log("Starting server setup...");

// Hono
const app = new Hono();
console.log("Hono instance created...");

app.post("/signup", signup);
console.log("Signup route added...");
app.post("/signin", signin);
console.log("Signin route added...");
app.get("/signout", signout);
console.log("Signout route added...");
app.get("/checkauth", checkauth);
console.log("Checkauth route added...");
app.get("/getuserdata", getuserdata);
console.log("Getuserdata route added...");

app.fire();
console.log("Server started...");
