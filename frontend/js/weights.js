async function loadCriteria() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/criteria`);
    const criteria = await response.json();
    latestCriteria = criteria || [];
    renderWeightInputs(latestCriteria);
    updateWeightSummary();
  } catch (error) {
    console.error("Lỗi khi tải tiêu chí:", error);
    alert("Không tải được tiêu chí từ database.");
  }
}

function renderWeightInputs(criteria, weightMap = null) {
  const grid = document.getElementById("dynamicWeightsGrid");
  grid.innerHTML = "";

  const defaultWeight = criteria.length ? Number((100 / criteria.length).toFixed(2)) : 0;

  criteria.forEach((criterion) => {
    const wrapper = document.createElement("div");
    wrapper.className = "weight-item";
    const hasWeightMap =
      !!weightMap && Object.prototype.hasOwnProperty.call(weightMap, criterion.ten_tieu_chi);
    const value = hasWeightMap ? Number(weightMap[criterion.ten_tieu_chi]) : defaultWeight;

    wrapper.innerHTML = `
      <label for="weight_${criterion.ten_tieu_chi}">${criterion.mo_ta || criterion.ten_tieu_chi}</label>
      <input
        type="number"
        min="0"
        step="0.01"
        id="weight_${criterion.ten_tieu_chi}"
        value="${value}"
      />
    `;

    grid.appendChild(wrapper);
  });

  criteria.forEach((criterion) => {
    const input = document.getElementById(`weight_${criterion.ten_tieu_chi}`);
    input.addEventListener("input", updateWeightSummary);
  });
}

function getWeights() {
  const weights = {};
  latestCriteria.forEach((criterion) => {
    const el = document.getElementById(`weight_${criterion.ten_tieu_chi}`);
    weights[criterion.ten_tieu_chi] = Number(el?.value || 0);
  });
  return weights;
}

function updateWeightSummary() {
  const weights = getWeights();
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  document.getElementById("totalWeightText").textContent = total.toFixed(2);
  document.getElementById("kpiTotalWeight").textContent = `${total.toFixed(2)}%`;

  const message =
    Math.abs(total - 100) < 0.01
      ? "Phân bổ đúng chuẩn. Hệ thống đang tính điểm tối ưu."
      : "Bạn nên điều chỉnh về 100% để kết quả phản ánh đúng ưu tiên.";

  document.getElementById("weightMessage").textContent = message;
  document.getElementById("kpiWeightStatus").textContent =
    Math.abs(total - 100) < 0.01 ? "Phân bổ hợp lệ" : "Chưa chuẩn hóa";
}

function renderTopSupplierCriteriaComparison() {
  const box = document.getElementById("weightComparisonBox");
  if (!box) return;

  if (!latestRanking.length || !latestCriteria.length) {
    box.innerHTML = "Chưa có dữ liệu so sánh tiêu chí.";
    return;
  }

  const ensureSelection = (key, fallbackIndex) => {
    const fallbackSupplier = latestRanking[fallbackIndex] || null;
    const currentId = Number(compareSupplierSelection[key] || 0);
    const exists = latestRanking.some((item) => item.ma_ncc === currentId);
    compareSupplierSelection[key] = exists
      ? currentId
      : fallbackSupplier
        ? fallbackSupplier.ma_ncc
        : null;
  };

  ensureSelection("baseId", 0);
  ensureSelection("compare1Id", 1);
  ensureSelection("compare2Id", 2);

  const top1 = latestRanking.find((item) => item.ma_ncc === compareSupplierSelection.baseId) || null;
  const top2 = latestRanking.find((item) => item.ma_ncc === compareSupplierSelection.compare1Id) || null;
  const top3 = latestRanking.find((item) => item.ma_ncc === compareSupplierSelection.compare2Id) || null;

  const scoreOf = (supplier, criterionKey) => {
    if (!supplier || !Array.isArray(supplier.criterion_scores)) return null;
    const item = supplier.criterion_scores.find((c) => c.key === criterionKey);
    return item ? Number(item.value) : null;
  };

  const rows = latestCriteria
    .map((criterion) => {
      const key = criterion.ten_tieu_chi;
      const label = criterion.mo_ta || key;
      const s1 = scoreOf(top1, key);
      const s2 = scoreOf(top2, key);
      const s3 = scoreOf(top3, key);
      const d12 = s1 === null || s2 === null ? null : s1 - s2;
      const d13 = s1 === null || s3 === null ? null : s1 - s3;

      const d12Class =
        d12 === null ? "delta-neutral" : d12 > 0 ? "delta-positive" : d12 < 0 ? "delta-negative" : "delta-neutral";
      const d13Class =
        d13 === null ? "delta-neutral" : d13 > 0 ? "delta-positive" : d13 < 0 ? "delta-negative" : "delta-neutral";

      return `
        <tr>
          <td>${label}</td>
          <td>${s1 === null ? "-" : s1.toFixed(2)}</td>
          <td>${s2 === null ? "-" : s2.toFixed(2)}</td>
          <td>${s3 === null ? "-" : s3.toFixed(2)}</td>
          <td class="${d12Class}">${d12 === null ? "-" : `${d12 > 0 ? "+" : ""}${d12.toFixed(2)}`}</td>
          <td class="${d13Class}">${d13 === null ? "-" : `${d13 > 0 ? "+" : ""}${d13.toFixed(2)}`}</td>
        </tr>
      `;
    })
    .join("");

  box.innerHTML = `
    <div class="comparison-selectors">
      <div class="comparison-selector-item">
        <label for="compareBaseSupplier">NCC cơ sở</label>
        <select id="compareBaseSupplier">${buildSupplierOptions(compareSupplierSelection.baseId)}</select>
      </div>
      <div class="comparison-selector-item">
        <label for="compareSupplier1">NCC so sánh 1</label>
        <select id="compareSupplier1">${buildSupplierOptions(compareSupplierSelection.compare1Id)}</select>
      </div>
      <div class="comparison-selector-item">
        <label for="compareSupplier2">NCC so sánh 2</label>
        <select id="compareSupplier2">${buildSupplierOptions(compareSupplierSelection.compare2Id)}</select>
      </div>
    </div>
    <div class="muted comparison-note">
      So sánh theo từng tiêu chí giữa NCC cơ sở với hai NCC bạn chọn.
    </div>
    <table class="criteria-score-table">
      <thead>
        <tr>
          <th>Tiêu chí</th>
          <th>Cơ sở${top1 ? ` (${top1.ten_ncc})` : ""}</th>
          <th>So sánh 1${top2 ? ` (${top2.ten_ncc})` : ""}</th>
          <th>So sánh 2${top3 ? ` (${top3.ten_ncc})` : ""}</th>
          <th>Cơ sở - So sánh 1</th>
          <th>Cơ sở - So sánh 2</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  const bindSelect = (elementId, key) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.addEventListener("change", () => {
      compareSupplierSelection[key] = Number(el.value);
      renderTopSupplierCriteriaComparison();
    });
  };

  bindSelect("compareBaseSupplier", "baseId");
  bindSelect("compareSupplier1", "compare1Id");
  bindSelect("compareSupplier2", "compare2Id");
}

function buildSupplierOptions(selectedId) {
  return latestRanking
    .map(
      (supplier, index) =>
        `<option value="${supplier.ma_ncc}" ${Number(selectedId) === supplier.ma_ncc ? "selected" : ""}>
          Top ${index + 1} - ${supplier.ten_ncc}
        </option>`
    )
    .join("");
}

