import express from "express";
import { chatCompletion } from "./chatCompletion.js";
import { fetchImage } from "./fetchImage.js";
import { huggingFaceFunction } from "./huggingFaceFunction.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Flat layout: index.html, index.js, index.css and the logo all sit at the root.
app.use(express.static("."));

app.get("/chat", async (req, res) => {
  try {
    // chatCompletion() hands back the reply text already unwrapped, so the page
    // gets { text: "..." } rather than the provider's choices array.
    res.json({ text: await chatCompletion() });
  } catch (error) {
    console.error("Chat completion failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/image", async (req, res) => {
  try {
    // Raw image bytes rather than JSON, so the page can point an <img> straight at
    // this route.
    const { buffer, contentType } = await fetchImage();
    res.type(contentType).send(buffer);
  } catch (error) {
    console.error("Image generation failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// The summarize + sentiment demo, kept on its own route.
app.get("/summarize", async (req, res) => {
  try {
    // Already an object: { summary, classification, allLabels }
    res.json(await huggingFaceFunction());
  } catch (error) {
    console.error("Summarization failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
