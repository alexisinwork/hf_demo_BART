const textButton = document.getElementById("generate-btn");
const imageButton = document.getElementById("image-btn");
const output = document.getElementById("output");
const imageOutput = document.getElementById("image-output");

textButton.addEventListener("click", async () => {
  textButton.disabled = true;
  output.textContent = "Thinking…";

  try {
    const res = await fetch("/chat");

    if (!res.ok) {
      console.error("Failed to get api response");
      output.textContent = "Something went wrong. Check the server logs.";
      return;
    }

    // The server already unwrapped choices[0].message.content, so this is the
    // finished line of text — nothing left to dig through.
    const { text } = await res.json();
    console.log("Reply:", text);
    output.textContent = text;
  } finally {
    textButton.disabled = false;
  }
});

imageButton.addEventListener("click", async () => {
  imageButton.disabled = true;
  output.textContent = "Painting… (a few seconds)";

  try {
    const res = await fetch("/image");

    if (!res.ok) {
      console.error("Failed to get image response");
      output.textContent = "Something went wrong. Check the server logs.";
      return;
    }

    // /image responds with raw bytes, so wrap them in an object URL for the <img>.
    // The previous URL is revoked first, otherwise each click leaks one.
    const blob = await res.blob();
    if (imageOutput.src) URL.revokeObjectURL(imageOutput.src);
    imageOutput.src = URL.createObjectURL(blob);
    imageOutput.alt = "Generated portrait";
    output.textContent = "";
  } finally {
    imageButton.disabled = false;
  }
});
