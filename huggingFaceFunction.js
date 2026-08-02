import { InferenceClient } from "@huggingface/inference";

// HF_TOKEN is the documented name (see README). HF_PERSONAL_ACCESS_TOKEN is a
// fallback so the server also runs in shells that only export the older name.
const token = process.env.HF_TOKEN ?? process.env.HF_PERSONAL_ACCESS_TOKEN;

const client = new InferenceClient(token);

const MODEL = "facebook/bart-large-cnn";

// bart-large-cnn was fine-tuned on CNN/DailyMail, so news-style prose is what it
// handles best. Swap this out to summarize something else.
const SAMPLE_ARTICLE = `The James Webb Space Telescope has captured the clearest
image yet of a planet forming around a distant star. Astronomers pointed the
observatory at a young star roughly 400 light years from Earth and found a gap in
the surrounding disc of gas and dust, carved out by a planet still gathering
material. The observation confirms a decades-old prediction about how planetary
systems assemble themselves, but had never been seen in this level of detail. The
team behind the work said the planet appears to be a gas giant several times the
mass of Jupiter, and that it is still growing. Follow-up observations are planned
for later this year, when the telescope will attempt to measure the temperature of
the forming world and the composition of the gas falling onto it.`;

export async function huggingFaceFunction(text = SAMPLE_ARTICLE) {
  if (!token) {
    throw new Error("No Hugging Face token found. Run: export HF_TOKEN=hf_...");
  }

  // Collapse line breaks and runs of spaces. Without this the model can fuse the
  // words either side of a newline ("the\nmass" comes back as "themass").
  const inputs = text.replace(/\s+/g, " ").trim();

  const result = await client.summarization({
    model: MODEL,
    inputs,
    parameters: {
      max_length: 130,
      min_length: 30,
    },
  });

  return result.summary_text;
}
