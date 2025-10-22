(function () {
  function initAskCookbook() {
      // It's a public API key, so it's safe to expose it here
      const PUBLIC_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODI2NDYwNmFiYTQyMjdjNzM4OGMzNzUiLCJpYXQiOjE3NDczMzg3NTgsImV4cCI6MjA2MjkxNDc1OH0.t7wQtCXRjmNhfcyrdhVxK2l9kDQJTdUoZm9e87lwIh8";

      let cookbookContainer = document.getElementById("__cookbook");
      if (!cookbookContainer) {
        cookbookContainer = document.createElement("div");
        cookbookContainer.id = "__cookbook";
        cookbookContainer.dataset.apiKey = PUBLIC_API_KEY;
        document.body.appendChild(cookbookContainer);
      }

      let cookbookScript = document.getElementById("__cookbook-script");
      if (!cookbookScript) {
        cookbookScript = document.createElement("script");
        cookbookScript.id = "__cookbook-script";
        cookbookScript.src = "https://cdn.jsdelivr.net/npm/@cookbookdev/docsbot/dist/standalone/index.cjs.js";
        cookbookScript.async = true;
        document.head.appendChild(cookbookScript);
      }


      const keyPressPropagationBlocker = function (e) {
        e.stopPropagation();
      };
      document.addEventListener("cookbook:modal:state:change", function (e) {
        const isOpen = e.detail.isOpen;
        if (isOpen) {
          document.body.addEventListener("keydown", keyPressPropagationBlocker, { capture: true });
        } else {
          document.body.removeEventListener("keydown", keyPressPropagationBlocker, { capture: true });
        }
      });
    }

    if (document.readyState === "complete") {
      initAskCookbook();
    } else {
      window.addEventListener("load", initAskCookbook);
    }
})();
