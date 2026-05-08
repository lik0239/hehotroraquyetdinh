function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");

      if (btn.dataset.tab === "ahp") {
        renderAHPMatrix();
      }
    });
  });
}

function initStaticEvents() {
  document.getElementById("evaluateBtn").addEventListener("click", loadDashboard);
  document.getElementById("refreshSuppliersBtn").addEventListener("click", loadDashboard);
  document.getElementById("searchInput").addEventListener("input", filterTable);

  document.getElementById("resetWeightsBtn").addEventListener("click", () => {
    renderWeightInputs(latestCriteria);
    updateWeightSummary();
    loadDashboard();
  });

  document.getElementById("applyAHPWeightsBtn").addEventListener("click", () => {
    applySavedAHPWeights();
    updateWeightSummary();
    loadDashboard();
  });

  document.getElementById("resetAHPBtn").addEventListener("click", () => {
    resetAHPMatrix();
    renderAHPMatrix();
  });

  document.getElementById("saveAHPBtn").addEventListener("click", saveAHPMatrix);
  document.getElementById("supplierForm").addEventListener("submit", saveSupplierProfile);
  document.getElementById("resetSupplierFormBtn").addEventListener("click", resetSupplierForm);
  document.getElementById("aiCompareBtn").addEventListener("click", loadAIPairComparison);
}
