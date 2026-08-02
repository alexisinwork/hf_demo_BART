import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

// Challenge
// Check your token is correctly stored in your env vars by logging it to the runner.

// It should have the following format : {accessToken: "hf_...", defaultOptions: {}}

export async function huggingFaceFunction() {
};
