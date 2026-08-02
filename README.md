# hf_demo_BART

A small Hugging Face Inference demo. The browser calls a `/chat` endpoint on a local
Express server, which talks to the Hugging Face Inference API using an `HF_TOKEN`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell with the "Check HF Token" button |
| `index.css` | Styling |
| `index.js` | Browser code — fetches `/chat` and logs the response |
| `huggingFaceFunction.js` | Server-side Hugging Face `InferenceClient` wrapper |
| `hf-logo.svg` | Hugging Face logo asset |

## Setup

```bash
npm install
export HF_TOKEN=hf_...   # do not commit this
npm start
```

## Status

Work in progress:

- `server.js` (referenced by the `npm start` script and by the `/chat` fetch in
  `index.js`) is not present yet.
- `huggingFaceFunction()` is still an empty stub.
