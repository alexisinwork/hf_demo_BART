# hf_demo_BART

A small Hugging Face Inference demo. The browser calls a `/chat` endpoint on a local
Express server, which talks to the Hugging Face Inference API using an `HF_TOKEN`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell with the "Generate Text" and "Generate Image" buttons |
| `index.css` | Styling |
| `index.js` | Browser code — calls the routes and renders the results |
| `server.js` | Express server — serves the page and hosts the three routes |
| `hfClient.js` | Shared `InferenceClient` and token check |
| `chatCompletion.js` | Shakespeare chat completion |
| `fetchImage.js` | Text-to-image generation |
| `huggingFaceFunction.js` | Summarization + sentiment classification |
| `hf-logo.svg` | Hugging Face logo asset |

Each Hugging Face task lives in its own file. They share one `InferenceClient` via
`hfClient.js` so the token is read in a single place.

## Setup

```bash
npm install
export HF_TOKEN=hf_...   # do not commit this
npm start
```

Then open http://localhost:3000 and click **Generate Text** or **Generate Image** —
the result is rendered on the page (text is still logged to the console too).

## Routes

| Route | Function | Returns |
| --- | --- | --- |
| `GET /chat` | `chatCompletion()` | `{ "text": "Verily, good sir…" }` |
| `GET /image` | `fetchImage()` | raw image bytes, with the sniffed `Content-Type` |
| `GET /summarize` | `huggingFaceFunction()` | `{ summary, classification, allLabels }` |

## Chat completion

`chatCompletion()` is what the page uses. Two things are worth calling out.

**Unwrapping the response.** `response.choices` is an *array* of candidate replies,
each one an envelope:

```json
[{ "index": 0,
   "message": { "role": "assistant", "content": "Verily, good sir…" },
   "finish_reason": "stop" }]
```

Returning that whole array leaves the frontend digging through the envelope, so the
function returns `choices[0].message.content` — trimmed, with the wrapping quote
marks the model tends to add stripped off.

**Setting a persona.** The Shakespeare voice comes from a `system` message, which
applies to the whole conversation, rather than a `user` message, which is just the
current question:

```js
messages: [
  { role: "system", content: "You are William Shakespeare. Answer every question in Early Modern English…" },
  { role: "user", content: prompt },
]
```

`chatCompletion()` takes an optional prompt and falls back to "Tell me a fun fact
about the internet", so `GET /chat` works with no request body.

### Model choice

The exercise named `katanemo/Arch-Router-1.5B`, which no longer works — the
hf-inference provider returns `410 The requested model is deprecated and no longer
supported`, and the Hub lists no inference providers for it. It also would not have
suited this task: Arch-Router is a *routing* model that picks a route name for a
query, not a conversational model. `meta-llama/Llama-3.1-8B-Instruct` is used
instead.

## Image generation

`fetchImage()` renders a portrait from a text prompt. The scaffold left two blanks:

- **`methodToChange` is `textToImage`** — the method is named after the task shown on
  the model page.
- **`parameters` alone is not enough.** The call also needs a `model` and the prompt
  itself as `inputs`; without them the provider has nothing to draw.

The prompt describes the painting without naming the sitter, which is the point of
the challenge. Image models key off concrete visual nouns, so it lists what is
actually on the canvas — pose, hands, background, palette, technique — instead of
asking for a famous work by name.

`num_inference_steps: 5` works because the model is `black-forest-labs/FLUX.1-schnell`,
the distilled few-step FLUX. The full `FLUX.1-dev` expects roughly 30 steps and comes
out muddy at 5.

### Content type

`imageBlob.type` cannot be trusted: nscale reports `image/jpeg` while the bytes are
a PNG. `fetchImage()` reads the file's magic number instead and returns
`{ buffer, contentType }`, so the route sends an accurate header rather than a
plausible-looking lie. Browsers sniff content and would have rendered it either way,
which is exactly what makes the bug easy to miss.

## Models

Both run through the `hf-inference` provider, so nothing is downloaded locally,
and both calls are issued in parallel via `Promise.all`.

| Model | Task | Returns |
| --- | --- | --- |
| [`meta-llama/Llama-3.1-8B-Instruct`](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct) | chat completion | an object — `{ choices: [{ message: { content } }, …] }` |
| [`black-forest-labs/FLUX.1-schnell`](https://huggingface.co/black-forest-labs/FLUX.1-schnell) | text to image | a `Blob` of image bytes |
| [`facebook/bart-large-cnn`](https://huggingface.co/facebook/bart-large-cnn) | summarization | an object — `{ summary_text }` |
| [`distilbert/distilbert-base-uncased-finetuned-sst-2-english`](https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english) | text classification | an **array** — `[{ label, score }, …]`, best score first |

The shape difference matters: summarization hands back a single object, while
classification hands back a ranked array, so the top label is `result[0]`.

`huggingFaceFunction()` takes an optional string argument and falls back to a
built-in sample article, so `GET /chat` works with no request body.

## Response from `/summarize`

```json
{
  "summary": "Astronomers pointed the observatory at a young star…",
  "classification": { "label": "NEGATIVE", "score": 0.536 },
  "allLabels": [{ "label": "NEGATIVE", "score": 0.536 },
                { "label": "POSITIVE", "score": 0.464 }]
}
```

Note the near-50/50 split. SST-2 is a *sentence-level* sentiment model trained on
movie reviews, so a neutral multi-sentence news article sits outside its domain and
the score is close to a coin flip. Feed it one opinionated sentence and it is
confident (~0.99). If the goal is to label the article's topic rather than its
sentiment, a zero-shot classifier such as `facebook/bart-large-mnli` is the better
fit.

## Status

Working end to end. All three routes were verified against the live API; each
returns a 500 with a readable message if no token is set.

**Note on quota:** image generation burns Inference credits far faster than text. If
`/image` starts returning *"You have depleted your monthly included credits"*, that
is the account quota rather than a bug — the text routes keep working.

Possible next steps: send your own prompt from the page instead of using the
built-in one, and stream the reply token by token rather than waiting for the whole
response.
