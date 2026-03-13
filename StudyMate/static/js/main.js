document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const inputTextEl = document.getElementById("inputText");
  const levelEl = document.getElementById("level");
  const modeEl = document.getElementById("mode");
  const resultsEl = document.getElementById("results");

  const tabs = document.querySelectorAll(".tabs button");
  const explanationTab = document.getElementById("explanationTab");
  const summaryTab = document.getElementById("summaryTab");
  const quizTab = document.getElementById("quizTab");
  const flashcardsTab = document.getElementById("flashcardsTab");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tabName = btn.dataset.tab;
      [explanationTab, summaryTab, quizTab, flashcardsTab].forEach((el) => {
        el.classList.add("hidden");
      });
      if (tabName === "explanation") explanationTab.classList.remove("hidden");
      if (tabName === "summary") summaryTab.classList.remove("hidden");
      if (tabName === "quiz") quizTab.classList.remove("hidden");
      if (tabName === "flashcards") flashcardsTab.classList.remove("hidden");
    });
  });

  generateBtn.addEventListener("click", async () => {
    const inputText = inputTextEl.value.trim();
    const level = levelEl.value;
    const mode = modeEl.value;

    if (!inputText) {
      alert("Please paste some study material or code first.");
      return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText, level, mode }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        alert(data.error || "Something went wrong.");
        return;
      }

      explanationTab.textContent = data.explanation || "";
      summaryTab.textContent = data.summary || "";
      quizTab.textContent = data.quiz || "";
      flashcardsTab.textContent = data.flashcards || "";

      resultsEl.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      alert("Failed to contact server.");
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "One-Click Study Mode";
    }
  });
});