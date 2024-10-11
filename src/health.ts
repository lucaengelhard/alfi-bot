import express from "express";

/**
 * Diese Funktion ist nur dazu da, ein port zu öffnen,
 * da das Hosting regelmäßig checkt ob der Port 8000
 * noch erreichbar ist
 */
export function startHealthChecks() {
  const app = express();

  app.get("/", (req, res) => {
    res.send("healthy");
  });

  app.listen(8000, () => {
    console.log("Server running on port 8000");
  });
}
