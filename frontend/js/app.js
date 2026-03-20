const API_BASE_URL = "http://127.0.0.1:5000";

let rankingChartInstance = null;
let radarChartInstance = null;
let latestRanking = [];
let latestCriteria = [];

document.addEventListener("DOMContentLoaded", async () => {
  initTabs();
  initStaticEvents();
  await loadCriteria();
  await loadDashboard();
});

function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

function initStaticEvents() {
  document.getElementById("evaluateBtn").addEventListener("click", loadDashboard);
  document.getElementById("refreshSuppliersBtn").addEventListener("click", loadDashboard);
  document.getElementById("searchInput").addEventListener("input", filterTable);

  document.getElementById("resetWeightsBtn").addEventListener("click", () => {
    renderWeightInputs(latestCriteria, true);
    updateWeightSummary();
    loadDashboard();
  });
}

async function loadCriteria() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/criteria`);
    const criteria = await response.json();
    latestCriteria = criteria || [];
    renderWeightInputs(latestCriteria, true);
    updateWeightSummary();
  } catch (error) {
    console.error("Lỗi khi tải tiêu chí:", error);
    alert("Không tải được tiêu chí từ database.");
  }
}

function renderWeightInputs(criteria) {
  const grid = document.getElementById("dynamicWeightsGrid");
  grid.innerHTML = "";

  const defaultWeight = criteria.length ? Math.round(100 / criteria.length) : 0;

  criteria.forEach((criterion) => {
    const wrapper = document.createElement("div");
    wrapper.className = "weight-item";

    wrapper.innerHTML = `
      <label for="weight_${criterion.ten_tieu_chi}">${criterion.mo_ta || criterion.ten_tieu_chi}</label>
      <input
        type="number"
        min="0"
        id="weight_${criterion.ten_tieu_chi}"
        value="${defaultWeight}"
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

  document.getElementById("totalWeightText").textContent = total;
  document.getElementById("kpiTotalWeight").textContent = `${total}%`;

  const message =
    total === 100
      ? "Phân bổ đúng chuẩn. Hệ thống đang tính điểm tối ưu."
      : "Bạn nên điều chỉnh về 100% để kết quả phản ánh đúng ưu tiên.";

  document.getElementById("weightMessage").textContent = message;
  document.getElementById("kpiWeightStatus").textContent =
    total === 100 ? "Phân bổ hợp lệ" : "Chưa chuẩn hóa";
}

async function loadDashboard() {
  try {
    updateWeightSummary();

    const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        weights: getWeights()
      })
    });

    const data = await response.json();
    latestRanking = data.ranking || [];

    renderKPIs(latestRanking);
    renderBestSupplier(data.best_supplier);
    renderSupplierTable(latestRanking);
    if (latestRanking.length > 0) {
      renderSupplierDetail(latestRanking[0]);
    }
    renderRecommendation(data.best_supplier);
    renderBarChart(latestRanking);
    renderRadarChart(data.best_supplier);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    alert("Không thể kết nối backend hoặc API evaluate bị lỗi.");
  }
}

function renderKPIs(ranking) {
  const best = ranking[0];

  document.getElementById("kpiTotalSuppliers").textContent = ranking.length;
  document.getElementById("kpiBestSupplier").textContent = best ? best.ten_ncc : "-";
  document.getElementById("kpiBestScore").textContent = best ? `Điểm ${Number(best.score).toFixed(1)}/100` : "Chưa có dữ liệu";
  document.getElementById("kpiTopScore").textContent = best ? Number(best.score).toFixed(1) : "-";
}

function renderBestSupplier(supplier) {
  const box = document.getElementById("bestSupplierBox");

  if (!supplier) {
    box.innerHTML = "Chưa có kết quả đánh giá.";
    return;
  }

  const topCriteria = [...(supplier.criterion_scores || [])]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  box.innerHTML = `
    <h3>${supplier.ten_ncc}</h3>
    <p><strong>Mã nhà cung cấp:</strong> ${supplier.ma_ncc}</p>
    <p><strong>Địa chỉ:</strong> ${supplier.dia_chi || "Chưa cập nhật"}</p>
    <p><strong>Số điện thoại:</strong> ${supplier.so_dien_thoai || "Chưa cập nhật"}</p>
    <p><strong>Email:</strong> ${supplier.email || "Chưa cập nhật"}</p>
    <p><strong>Mô tả:</strong> ${supplier.mo_ta || "Chưa có mô tả"}</p>
    <p><strong>Điểm tổng hợp:</strong> ${Number(supplier.score).toFixed(2)}</p>
    <span class="tag tag-success">Nhà cung cấp đề xuất</span>

    <div class="detail-grid">
      ${topCriteria.map(item => `
        <div class="detail-item">
          <strong>${item.label}</strong>
          <span class="score-badge">Điểm: ${item.value}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderSupplierTable(suppliers) {
  const tbody = document.querySelector("#supplierTable tbody");
  tbody.innerHTML = "";

  suppliers.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.ma_ncc}</td>
      <td>${s.ten_ncc}</td>
      <td>${s.dia_chi || "-"}</td>
      <td>${s.so_dien_thoai || "-"}</td>
      <td>${s.email || "-"}</td>
      <td><strong>${Number(s.score).toFixed(2)}</strong></td>
      <td>
        <button class="btn btn-outline btn-detail" data-id="${s.ma_ncc}">
          Xem chi tiết
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-detail").forEach((btn) => {
    btn.addEventListener("click", () => {
      const supplierId = Number(btn.dataset.id);
      const selectedSupplier = latestRanking.find((item) => item.ma_ncc === supplierId);
      renderSupplierDetail(selectedSupplier);
    });
  });
}

function renderSupplierDetail(supplier) {
  const box = document.getElementById("supplierDetailBox");

  if (!supplier) {
    box.innerHTML = "Không tìm thấy thông tin nhà cung cấp.";
    return;
  }

  box.innerHTML = `
    <h3>Chi tiết nhà cung cấp: ${supplier.ten_ncc}</h3>
    <div class="detail-grid">
      <div class="detail-item">
        <strong>Mã nhà cung cấp</strong>
        <div>${supplier.ma_ncc}</div>
      </div>
      <div class="detail-item">
        <strong>Điểm tổng hợp</strong>
        <div>${Number(supplier.score).toFixed(2)}</div>
      </div>
      <div class="detail-item">
        <strong>Địa chỉ</strong>
        <div>${supplier.dia_chi || "Chưa cập nhật"}</div>
      </div>
      <div class="detail-item">
        <strong>Số điện thoại</strong>
        <div>${supplier.so_dien_thoai || "Chưa cập nhật"}</div>
      </div>
      <div class="detail-item">
        <strong>Email</strong>
        <div>${supplier.email || "Chưa cập nhật"}</div>
      </div>
      <div class="detail-item">
        <strong>Mô tả</strong>
        <div>${supplier.mo_ta || "Chưa có mô tả"}</div>
      </div>
    </div>

    <table class="criteria-score-table">
      <thead>
        <tr>
          <th>Tiêu chí</th>
          <th>Điểm</th>
          <th>Trọng số</th>
        </tr>
      </thead>
      <tbody>
        ${(supplier.criterion_scores || []).map(item => `
          <tr>
            <td>${item.label}</td>
            <td>${item.value}</td>
            <td>${item.weight}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function filterTable() {
  const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
  const filtered = latestRanking.filter((s) => {
    return (
      (s.ten_ncc || "").toLowerCase().includes(keyword) ||
      (s.dia_chi || "").toLowerCase().includes(keyword) ||
      (s.email || "").toLowerCase().includes(keyword) ||
      (s.so_dien_thoai || "").toLowerCase().includes(keyword)
    );
  });

  renderSupplierTable(filtered);
}

function renderRecommendation(bestSupplier) {
  const box = document.getElementById("recommendationText");

  if (!bestSupplier) {
    box.innerHTML = "Chưa có dữ liệu đánh giá.";
    return;
  }

  box.innerHTML = `
    <p>
      Dựa trên bộ trọng số hiện tại, hệ thống đề xuất
      <strong>${bestSupplier.ten_ncc}</strong> là nhà cung cấp ưu tiên hàng đầu.
      Ứng viên này đạt <strong>${Number(bestSupplier.score).toFixed(1)}/100</strong>.
    </p>
    <br />
    <p>
      Doanh nghiệp có thể sử dụng kết quả này như một lớp hỗ trợ định lượng trong quá trình mua sắm,
      kết hợp thêm đánh giá định tính, kiểm tra pháp lý, thương lượng điều khoản và khảo sát thực tế
      trước khi ra quyết định cuối cùng.
    </p>
  `;
}

function renderBarChart(ranking) {
  const ctx = document.getElementById("rankingChart");

  if (rankingChartInstance) {
    rankingChartInstance.destroy();
  }

  rankingChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ranking.map((s) => s.ten_ncc),
      datasets: [
        {
          label: "Điểm tổng hợp",
          data: ranking.map((s) => Number(s.score)),
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderRadarChart(bestSupplier) {
  const ctx = document.getElementById("radarChart");

  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  if (!bestSupplier || !bestSupplier.criterion_scores || bestSupplier.criterion_scores.length === 0) return;

  const rawScores = bestSupplier.criterion_scores.map((c) => Number(c.value) || 0);
  const maxScore = Math.max(...rawScores, 1);

  // Chuẩn hóa toàn bộ về thang 0-100 để biểu đồ dễ nhìn
  const normalizedScores = rawScores.map((value) =>
    Number(((value / maxScore) * 100).toFixed(2))
  );

  radarChartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: bestSupplier.criterion_scores.map((c) => shortenLabel(c.label)),
      datasets: [
        {
          label: "Điểm tiêu chí (chuẩn hóa)",
          data: normalizedScores,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const item = bestSupplier.criterion_scores[index];
              return [
                `Điểm gốc: ${item.value}`,
                `Điểm chuẩn hóa: ${normalizedScores[index]}`,
                `Trọng số: ${item.weight}`
              ];
            }
          }
        },
        legend: {
          display: true
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20
          },
          pointLabels: {
            font: {
              size: 12
            }
          }
        }
      }
    }
  });

  renderCriteriaScoreSummary(bestSupplier, normalizedScores);
}

function shortenLabel(label) {
  const map = {
    "Chất lượng": "Chất lượng",
    "Số lượng": "Số lượng",
    "Điều kiện và phương thức thanh toán": "Thanh toán",
    "Khả năng phục vụ và giao tiếp của nhà cung cấp": "Phục vụ & giao tiếp",
    "Uy tín và năng lực của nhà cung cấp": "Uy tín & năng lực",
    "Tính linh hoạt": "Linh hoạt",
    "Tình hình tài chính của nhà cung cấp": "Tài chính",
    "Tình trạng tài sản của nhà cung cấp": "Tài sản",
    "Kết quả kinh doanh và số lượng nhân viên": "KQKD & nhân sự",
    "Giá": "Giá",
    "Thời gian giao hàng": "Giao hàng",
    "Vị trí và kết nối giao thông của nhà cung cấp": "Vị trí & giao thông"
  };

  return map[label] || label;
}

function renderCriteriaScoreSummary(bestSupplier, normalizedScores) {
  const box = document.getElementById("criteriaScoreSummary");

  if (!bestSupplier || !bestSupplier.criterion_scores) {
    box.innerHTML = "Chưa có dữ liệu tiêu chí.";
    return;
  }

  box.innerHTML = `
    <table class="criteria-score-table">
      <thead>
        <tr>
          <th>Tiêu chí</th>
          <th>Điểm gốc</th>
          <th>Điểm chuẩn hóa</th>
          <th>Trọng số</th>
        </tr>
      </thead>
      <tbody>
        ${bestSupplier.criterion_scores.map((item, index) => `
          <tr>
            <td>${item.label}</td>
            <td>${item.value}</td>
            <td>${normalizedScores[index]}</td>
            <td>${item.weight}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}