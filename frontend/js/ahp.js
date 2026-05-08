async function loadAHPMatrix() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ahp/matrix`);
    const data = await response.json();

    latestSavedAHPWeights = data.saved_weights || [];
    ahpMatrixState = data.matrix || {};

    if (!latestCriteria.length) {
      latestCriteria = data.criteria || [];
    }

    renderAHPMatrix();
    renderAHPWeightsSummary(latestSavedAHPWeights);
    renderTopSupplierCriteriaComparison();
  } catch (error) {
    console.error("Lỗi khi tải ma trận AHP:", error);
    document.getElementById("ahpMatrixContainer").innerHTML =
      '<div class="recommendation-box">Không tải được ma trận AHP.</div>';
  }
}

function resetAHPMatrix() {
  const nextMatrix = {};
  latestCriteria.forEach((rowCriterion) => {
    nextMatrix[rowCriterion.ma_tieu_chi] = {};
    latestCriteria.forEach((colCriterion) => {
      nextMatrix[rowCriterion.ma_tieu_chi][colCriterion.ma_tieu_chi] = 1;
    });
  });
  ahpMatrixState = nextMatrix;
  clearAHPResult();
}

function renderAHPMatrix() {
  const container = document.getElementById("ahpMatrixContainer");

  if (!container) return;
  if (!latestCriteria.length) {
    container.innerHTML = '<div class="recommendation-box">Chưa có danh sách tiêu chí.</div>';
    return;
  }

  const headerCells = latestCriteria
    .map((criterion) => `<th>${criterion.mo_ta || criterion.ten_tieu_chi}</th>`)
    .join("");

  const rowsHtml = latestCriteria
    .map((rowCriterion) => {
      const cells = latestCriteria
        .map((colCriterion) => {
          const rowId = String(rowCriterion.ma_tieu_chi);
          const colId = String(colCriterion.ma_tieu_chi);
          const isDiagonal = rowId === colId;
          const value = getAHPValue(rowId, colId);

          if (isDiagonal) {
            return '<td><input class="matrix-input diagonal" type="number" value="1" disabled /></td>';
          }

          return `
            <td>
              <input
                class="matrix-input"
                type="number"
                min="0.111111"
                step="0.111111"
                data-row="${rowId}"
                data-col="${colId}"
                value="${formatMatrixValue(value)}"
              />
            </td>
          `;
        })
        .join("");

      return `
        <tr>
          <th>${rowCriterion.mo_ta || rowCriterion.ten_tieu_chi}</th>
          ${cells}
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <table class="matrix-table">
      <thead>
        <tr>
          <th>Tiêu chí</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;

  container.querySelectorAll(".matrix-input:not(.diagonal)").forEach((input) => {
    input.addEventListener("input", handleAHPMatrixInput);
  });
}

function getAHPValue(rowId, colId) {
  const row = ahpMatrixState[rowId] || ahpMatrixState[Number(rowId)] || {};
  if (Object.prototype.hasOwnProperty.call(row, colId)) {
    return Number(row[colId]);
  }
  if (Object.prototype.hasOwnProperty.call(row, Number(colId))) {
    return Number(row[Number(colId)]);
  }
  return 1;
}

function handleAHPMatrixInput(event) {
  const input = event.target;
  const rowId = input.dataset.row;
  const colId = input.dataset.col;
  const parsedValue = Number(input.value);

  if (!parsedValue || parsedValue <= 0) {
    return;
  }

  setAHPValue(rowId, colId, parsedValue);
  setAHPValue(colId, rowId, 1 / parsedValue);
  renderAHPMatrix();
}

function setAHPValue(rowId, colId, value) {
  if (!ahpMatrixState[rowId]) {
    ahpMatrixState[rowId] = {};
  }
  ahpMatrixState[rowId][colId] = Number(value);
}

function formatMatrixValue(value) {
  const rounded = Number(value);
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }
  return rounded.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

async function saveAHPMatrix() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ahp/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        criteria: latestCriteria,
        matrix: ahpMatrixState,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Không lưu được ma trận AHP.");
    }

    latestSavedAHPWeights = (data.weights || []).map((item, index) => ({
      ten_tieu_chi: latestCriteria[index] ? latestCriteria[index].ten_tieu_chi : "",
      mo_ta: latestCriteria[index] ? latestCriteria[index].mo_ta : "",
      trong_so: item.trong_so,
      phan_tram: item.phan_tram,
    }));

    renderAHPWeightsSummary(latestSavedAHPWeights);
    renderAHPResult(data);
    applySavedAHPWeights();
    updateWeightSummary();
    await loadDashboard();
    alert("Đã lưu ma trận trọng số AHP thành công.");
  } catch (error) {
    console.error("Lỗi khi lưu AHP:", error);
    alert(error.message || "Không lưu được ma trận AHP.");
  }
}

function renderAHPWeightsSummary(weights) {
  const box = document.getElementById("ahpWeightsSummary");
  if (!box) return;

  if (!weights.length) {
    box.innerHTML = "Chưa có trọng số AHP được lưu.";
    return;
  }

  box.innerHTML = `
    <table class="criteria-score-table">
      <thead>
        <tr>
          <th>Tiêu chí</th>
          <th>Trọng số</th>
          <th>Tỷ lệ</th>
        </tr>
      </thead>
      <tbody>
        ${weights
          .map(
            (item) => `
              <tr>
                <td>${item.mo_ta || item.ten_tieu_chi || "-"}</td>
                <td>${Number(item.trong_so || 0).toFixed(6)}</td>
                <td>${Number(item.phan_tram || 0).toFixed(2)}%</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderAHPResult(result) {
  document.getElementById("ahpLambdaMax").textContent = Number(result.lambda_max).toFixed(6);
  document.getElementById("ahpCI").textContent = Number(result.ci).toFixed(6);
  document.getElementById("ahpCR").textContent = Number(result.cr).toFixed(6);
  document.getElementById("ahpConsistencyMessage").textContent =
    Number(result.cr) <= 0.1
      ? "Ma trận đạt độ nhất quán tốt (CR <= 0.1)."
      : "CR > 0.1, bạn nên xem lại các cặp so sánh để tránh xung đột ưu tiên.";
}

function clearAHPResult() {
  document.getElementById("ahpLambdaMax").textContent = "-";
  document.getElementById("ahpCI").textContent = "-";
  document.getElementById("ahpCR").textContent = "-";
  document.getElementById("ahpConsistencyMessage").textContent = "Chưa tính độ nhất quán.";
}

function applySavedAHPWeights() {
  if (!latestSavedAHPWeights.length) {
    alert("Chưa có trọng số AHP để áp dụng.");
    return;
  }

  const weightMap = {};
  latestSavedAHPWeights.forEach((item) => {
    if (item.ten_tieu_chi) {
      weightMap[item.ten_tieu_chi] = Number(item.phan_tram || 0);
    }
  });

  renderWeightInputs(latestCriteria, weightMap);
}

