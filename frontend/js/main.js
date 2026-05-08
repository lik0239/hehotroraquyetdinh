document.addEventListener("DOMContentLoaded", async () => {
  initTabs();
  initStaticEvents();
  await loadCriteria();
  await loadAHPMatrix();
  await loadDashboard();
});
