import { assertToken, client } from "./hfClient.js";

const SUMMARY_MODEL = "facebook/bart-large-cnn";
const CLASSIFIER_MODEL = "distilbert/distilbert-base-uncased-finetuned-sst-2-english";

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
  assertToken();

  // Collapse line breaks and runs of spaces. Without this the model can fuse the
  // words either side of a newline ("the\nmass" comes back as "themass").
  const inputs = text.replace(/\s+/g, " ").trim();

  // The two calls are independent, so run them together rather than back to back.
  const [summaryResult, classificationResult] = await Promise.all([
    client.summarization({
      model: SUMMARY_MODEL,
      inputs,
      parameters: {
        max_length: 130,
        min_length: 30,
      },
      provider: "hf-inference",
    }),

    client.textClassification({
      model: CLASSIFIER_MODEL,
      inputs,
      provider: "hf-inference",
    }),
  ]);

  // textClassification resolves to an ARRAY of { label, score }, best score first:
  // [{ label: "POSITIVE", score: 0.9989 }, { label: "NEGATIVE", score: 0.0011 }]
  const [topLabel] = classificationResult;

  return {
    summary: summaryResult.summary_text,
    classification: topLabel,
    allLabels: classificationResult,
  };
}
