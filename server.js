import express from "express";
import { huggingFaceFunction } from "./huggingFaceFunction.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Flat layout: index.html, index.js, index.css and the logo all sit at the root.
app.use(express.static("."));

app.get("/chat", async (req, res) => {
  try {
    const text = await huggingFaceFunction();
    res.json({ text });
  } catch (error) {
    console.error("Summarization failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
