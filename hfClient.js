import { InferenceClient } from "@huggingface/inference";

// HF_TOKEN is the documented name (see README). HF_PERSONAL_ACCESS_TOKEN is a
// fallback so the server also runs in shells that only export the older name.
const token = process.env.HF_TOKEN ?? process.env.HF_PERSONAL_ACCESS_TOKEN;

// One client shared by every function file, so the token is read in one place.
export const client = new InferenceClient(token);

export function assertToken() {
  if (!token) {
    throw new Error("No Hugging Face token found. Run: export HF_TOKEN=hf_...");
  }
}
