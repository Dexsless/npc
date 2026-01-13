const express = require("express");
const cors = require("cors");
const knexConfig = require("./knexfile");
const knex = require("knex")(knexConfig.development);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Get all components
app.get("/api/components", async (req, res) => {
  try {
    const components = await knex("components").select("*");
    res.json(components);
  } catch (error) {
    console.error("Error fetching components:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all monitors
app.get("/api/monitors", async (req, res) => {
  try {
    const monitors = await knex("monitors").select("*");
    res.json(monitors);
  } catch (error) {
    console.error("Error fetching monitors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
