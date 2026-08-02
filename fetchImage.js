import { assertToken, client } from "./hfClient.js";

// FLUX.1-schnell is the distilled, few-step member of the FLUX family, which is why
// the scaffold's `num_inference_steps: 5` is enough here — the full FLUX.1-dev
// wants ~30 and would look muddy at 5.
const IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";

// Challenge: describe the painting without naming the sitter. Text-to-image models
// key off concrete visual nouns, so the prompt lists what is actually on the canvas
// — pose, background, palette, technique — rather than asking for a famous work.
const MONA_LISA_PROMPT = `Renaissance oil portrait of a woman, half-length, cropped
at the waist and filling the frame, chest and shoulders facing the viewer, torso
angled very slightly to one side, head turned straight to the viewer, eyes meeting
the viewer, calm faint half-smile, centre-parted long brown hair falling loose under
a thin transparent dark veil, dark olive-brown gown with gathered sleeves, her right
hand resting over her left on a chair armrest in the lower foreground, low stone
parapet behind her, hazy distant landscape of blue-grey mountains, a winding river
and a small stone bridge, soft atmospheric perspective, sfumato, warm golden brown
palette, aged cracked varnish, 16th century Florentine painting`;

export async function fetchImage(prompt = MONA_LISA_PROMPT) {
  assertToken();

  const imageBlob = await client.textToImage({
    model: IMAGE_MODEL,
    inputs: prompt.replace(/\s+/g, " ").trim(),
    parameters: { num_inference_steps: 5 },
  });

  // Convert Blob → ArrayBuffer → Buffer
  const arrayBuffer = await imageBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { buffer, contentType: detectImageType(buffer) };
}

// nscale mislabels its blobs: `imageBlob.type` says image/jpeg while the bytes are
// actually PNG. Browsers sniff and render it anyway, but the header would be a lie,
// so read the magic number instead of trusting the provider.
function detectImageType(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg";
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  return "application/octet-stream";
}
