import { j } from "@creatures/shared/test";
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

console.log(" This is coming from shared: " + j);

const port = 3000;
app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
