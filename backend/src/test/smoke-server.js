import { app } from "../app.js";

const port = Number(process.env.SMOKE_TEST_PORT || 4173);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Smoke server listening on ${port}`);
});
