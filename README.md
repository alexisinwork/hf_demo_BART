# hf_demo_BART

A small Hugging Face Inference demo. The browser calls a `/chat` endpoint on a local
Express server, which talks to the Hugging Face Inference API using an `HF_TOKEN`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell with the "Check HF Token" button |
| `index.css` | Styling |
| `index.js` | Browser code — fetches `/chat` and logs the response |
| `server.js` | Express server — serves the page and hosts `GET /chat` |
| `huggingFaceFunction.js` | Server-side Hugging Face `InferenceClient` wrapper |
| `hf-logo.svg` | Hugging Face logo asset |

## Setup

```bash
npm install
export HF_TOKEN=hf_...   # do not commit this
npm start
```

Then open http://localhost:3000 and click the button — the summary is logged to the
browser console.

## Model

[`facebook/bart-large-cnn`](https://huggingface.co/facebook/bart-large-cnn) —
406M-parameter seq2seq summarization model, MIT licensed, fine-tuned on
CNN/DailyMail. Called through the `hf-inference` provider, so nothing is
downloaded locally.

`huggingFaceFunction()` takes an optional string argument and falls back to a
built-in sample article, so `GET /chat` works with no request body.

## Status

Working end to end. `GET /chat` returns `{ text: "<summary>" }`, and returns a 500
with a readable message if no token is set.

Possible next steps: send your own text from the page instead of using the built-in
sample, and render the summary in the DOM rather than the console.
