import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Grammar Coach API çalışıyor");
});

export default app;