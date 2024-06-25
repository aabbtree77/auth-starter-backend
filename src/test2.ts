import { Hono } from "hono";
console.log("Testing minimal setup...");

const app = new Hono();
app.get("/", (c) => c.text("Hello, world!"));

app.fire();
