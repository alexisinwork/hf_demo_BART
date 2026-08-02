import { assertToken, client } from "./hfClient.js";

// The exercise named katanemo/Arch-Router-1.5B, which hf-inference now returns a
// 410 for ("deprecated and no longer supported"). It is also a *routing* model —
// it picks a route name for a query rather than holding a conversation — so it
// could not play a character either way. See the README.
const CHAT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

const DEFAULT_PROMPT = "Tell me a fun fact about the internet";

// Challenge #2: the model has no personality of its own, so the persona is set
// with a `system` message — it applies to the whole conversation, unlike a `user`
// message which is just the current question.
const SHAKESPEARE_SYSTEM_PROMPT = `You are William Shakespeare. Answer every
question in Early Modern English, in the voice of the Bard — thee, thou, hath,
doth — and keep it under 80 words. Never break character.`;

export async function chatCompletion(prompt = DEFAULT_PROMPT) {
  assertToken();

  const response = await client.chatCompletion({
    messages: [
      { role: "system", content: SHAKESPEARE_SYSTEM_PROMPT.replace(/\s+/g, " ").trim() },
      { role: "user", content: prompt },
    ],
    model: CHAT_MODEL,
    max_tokens: 200,
  });

  // Challenge #1: `response.choices` is an ARRAY of candidate replies, each one a
  // wrapper object — [{ index, message: { role, content }, finish_reason, … }].
  // Logging that to the console dumps the whole envelope; the page only wants the
  // text, so reach into the first choice and pull out `message.content`…
  // …then drop the quote marks the model likes to wrap the whole reply in, so the
  // page renders a clean line rather than "…".
  const finalText = response.choices[0]?.message?.content
    ?.trim()
    .replace(/^["“]|["”]$/g, "")
    .trim();

  if (!finalText) {
    throw new Error("The model returned an empty response.");
  }

  return finalText;
}
