function sanitizeHTML(str: string): string {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

function getModelVersionId(): number | null {
  const urlParams = new URLSearchParams(window.location.search);
  const queryModelVersionId = urlParams.get("modelVersionId");

  if (queryModelVersionId) {
    return parseInt(queryModelVersionId, 10);
  }

  const nextDataScript = document.getElementById("__NEXT_DATA__");
  if (nextDataScript) {
    try {
      const nextData = JSON.parse(nextDataScript.textContent || "");
      const modelVersionId =
        nextData.props.pageProps.trpcState.json.queries[0].state.data.pages[0]
          .items[0].modelVersionId;
      return modelVersionId;
    } catch (error) {
      console.error("Error parsing __NEXT_DATA__:", error);
    }
  }
  return null;
}

function displayModelVersionId(modelVersionId: number | null) {
  let container = document.getElementById("civitai-model-version-id");
  if (!container) {
    container = document.createElement("div");
    container.id = "civitai-model-version-id";
    Object.assign(container.style, {
      position: "fixed",
      top: "8px",
      right: "8px",
      backgroundColor: "rgb(1, 73, 138)",
      color: "#eee",
      padding: "8px",
      borderRadius: "4px",
      zIndex: "9999",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      maxWidth: "300px",
    });
    document.body.appendChild(container);
  }

  if (modelVersionId !== null) {
    const downloadUrl =
      `https://civitai.com/api/download/models/${modelVersionId}`;
    const safeModelVersionId = sanitizeHTML(modelVersionId.toString());
    const safeDownloadUrl = sanitizeHTML(downloadUrl);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span>Model Version ID: ${safeModelVersionId}</span>
        <span id="close-button" style="cursor: pointer; font-size: 18px; line-height: 1;">×</span>
      </div>
      <div id="download-url-container" style="display: flex; align-items: center; background-color: rgba(255,255,255,0.1); padding: 4px; border-radius: 4px; cursor: pointer;">
        <span style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px;">${safeDownloadUrl}</span>
        <span id="copy-button" style="margin-left: 8px; background-color: #4CAF50; color: white; padding: 2px 6px; border-radius: 2px; font-size: 12px;">Copy</span>
      </div>
    `;

    const downloadUrlContainer = container.querySelector(
      "#download-url-container",
    );
    const copyButton = container.querySelector(
      "#copy-button",
    ) as HTMLSpanElement;
    const closeButton = container.querySelector(
      "#close-button",
    ) as HTMLSpanElement;

    downloadUrlContainer?.addEventListener("click", () => {
      navigator.clipboard.writeText(downloadUrl).then(() => {
        if (copyButton) {
          copyButton.textContent = "Copied!";
          copyButton.style.backgroundColor = "#45a049";
          setTimeout(() => {
            copyButton.textContent = "Copy";
            copyButton.style.backgroundColor = "#4CAF50";
          }, 2000);
        }
      }).catch((err) => {
        console.error("Failed to copy: ", err);
      });
    });

    closeButton?.addEventListener("click", () => {
      if (!container) return;

      container.style.display = "none";
    });
  } else {
    container.textContent = "Model Version ID not found";
  }

  container.style.display = "block";
}

function isValidUrl(): boolean {
  const currentUrl = window.location.href;
  return currentUrl.startsWith("https://civitai.com/models/");
}

function initialize() {
  if (isValidUrl()) {
    const modelVersionId = getModelVersionId();
    displayModelVersionId(modelVersionId);
  } else {
    const container = document.getElementById("civitai-model-version-id");
    if (container) {
      container.style.display = "none";
    }
  }
}

function watchForUrlChanges() {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      initialize();
    }
  }).observe(document, { subtree: true, childList: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
  watchForUrlChanges();
});

if (
  document.readyState === "interactive" || document.readyState === "complete"
) {
  initialize();
  watchForUrlChanges();
}
