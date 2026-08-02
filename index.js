document.getElementById("generate-btn").addEventListener("click", async () => {
  const res = await fetch("/chat");

  if (!res.ok) {
    console.error("Failed to get api response");
    return;
  }

  const { text } = await res.json();
  console.log(text);
});

