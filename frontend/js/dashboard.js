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
    if (selectedSupplierId) {
      const selectedSupplier = latestRanking.find((item) => item.ma_ncc === selectedSupplierId);
      if (selectedSupplier) {
        selectSupplier(selectedSupplier);
      }
    }
    if (!selectedSupplierId && latestRanking.length > 0) {
      selectSupplier(latestRanking[0]);
    }
    renderRecommendationLoading(data.best_supplier);
    initAIPairSelectors();
    renderBarChart(latestRanking);
    renderRadarChart(data.best_supplier);
    renderTopSupplierCriteriaComparison();
    await loadAIRecommendation();
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    alert("Không thể kết nối backend hoặc API evaluate bị lỗi.");
  }
}

function initAIPairSelectors() {
  const selectA = document.getElementById("aiCompareSupplierA");
  const selectB = document.getElementById("aiCompareSupplierB");
  const resultBox = document.getElementById("aiCompareResultBox");
  if (!selectA || !selectB || !resultBox) return;

  if (!latestRanking.length) {
    selectA.innerHTML = "";
    selectB.innerHTML = "";
    resultBox.innerHTML = "Chưa có kết quả so sánh cặp.";
    return;
  }

  const defaultA = latestRanking[0]?.ma_ncc || null;
  const defaultB = latestRanking[1]?.ma_ncc || latestRanking[0]?.ma_ncc || null;
  const existsA = latestRanking.some((s) => s.ma_ncc === Number(aiPairSelection.supplierAId));
  const existsB = latestRanking.some((s) => s.ma_ncc === Number(aiPairSelection.supplierBId));
  aiPairSelection.supplierAId = existsA ? Number(aiPairSelection.supplierAId) : defaultA;
  aiPairSelection.supplierBId = existsB ? Number(aiPairSelection.supplierBId) : defaultB;

  const buildOptions = (selectedId) =>
    latestRanking
      .map(
        (supplier, index) =>
          `<option value="${supplier.ma_ncc}" ${supplier.ma_ncc === Number(selectedId) ? "selected" : ""}>
            Top ${index + 1} - ${supplier.ten_ncc}
          </option>`
      )
      .join("");

  selectA.innerHTML = buildOptions(aiPairSelection.supplierAId);
  selectB.innerHTML = buildOptions(aiPairSelection.supplierBId);

  selectA.onchange = () => {
    aiPairSelection.supplierAId = Number(selectA.value);
  };
  selectB.onchange = () => {
    aiPairSelection.supplierBId = Number(selectB.value);
  };
}

async function loadAIPairComparison() {
  const resultBox = document.getElementById("aiCompareResultBox");
  if (!resultBox) return;

  const supplierAId = Number(document.getElementById("aiCompareSupplierA")?.value || 0);
  const supplierBId = Number(document.getElementById("aiCompareSupplierB")?.value || 0);
  if (!supplierAId || !supplierBId) {
    resultBox.innerHTML = "Vui lòng chọn đủ 2 nhà cung cấp.";
    return;
  }
  if (supplierAId === supplierBId) {
    resultBox.innerHTML = "Vui lòng chọn 2 nhà cung cấp khác nhau để so sánh.";
    return;
  }

  resultBox.innerHTML = "Đang phân tích so sánh cặp bằng AI...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weights: getWeights(),
        supplier_a_id: supplierAId,
        supplier_b_id: supplierBId,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Không thể so sánh cặp NCC.");
    }

    const diffs = Array.isArray(data.criteria_differences) ? data.criteria_differences : [];
    const diffRows = diffs
      .map(
        (item) => `
          <tr>
            <td>${item.criterion || "-"}</td>
            <td>${Number(item.score_a || 0).toFixed(2)}</td>
            <td>${Number(item.score_b || 0).toFixed(2)}</td>
            <td>${Number(item.delta || 0) > 0 ? "+" : ""}${Number(item.delta || 0).toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    const winnerName = data.winner?.ten_ncc || "-";
    const winnerScore = data.winner?.score ?? "-";
    resultBox.innerHTML = `
      <p><strong>Kết luận:</strong> ${data.summary || "-"}</p>
      <p><strong>NCC nhỉnh hơn:</strong> ${winnerName} (${winnerScore}/100)</p>
      <p><strong>Khuyến nghị:</strong> ${data.recommendation || "-"}</p>
      <table class="criteria-score-table">
        <thead>
          <tr>
            <th>Tiêu chí</th>
            <th>NCC A</th>
            <th>NCC B</th>
            <th>A - B</th>
          </tr>
        </thead>
        <tbody>
          ${diffRows || '<tr><td colspan="4">Chưa có dữ liệu chênh lệch.</td></tr>'}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error("Lỗi khi so sánh cặp AI:", error);
    resultBox.innerHTML = `Không thể so sánh cặp NCC: ${error.message || "lỗi không xác định."}`;
  }
}

async function loadAIRecommendation() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weights: getWeights(),
        top_n: 3,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Không tạo được khuyến nghị AI.");
    }

    renderAIRecommendation(data);
  } catch (error) {
    console.error("Lỗi khi tạo khuyến nghị AI:", error);
    const bestSupplier = latestRanking.length ? latestRanking[0] : null;
    renderRecommendationFallback(
      bestSupplier,
      "Tạm thời không lấy được phân tích AI, hệ thống dùng bản giải thích mặc định."
    );
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

function renderRecommendationLoading(bestSupplier) {
  const box = document.getElementById("recommendationText");

  if (!bestSupplier) {
    box.innerHTML = "Chưa có dữ liệu đánh giá.";
    return;
  }

  box.innerHTML = `
    <p>
      Hệ thống đang tạo giải thích AI cho đề xuất
      <strong>${bestSupplier.ten_ncc}</strong> với
      <strong>${Number(bestSupplier.score).toFixed(1)}/100</strong>.
    </p>
    <p>Vui lòng chờ trong giây lát...</p>
  `;
}

function renderRecommendationFallback(bestSupplier, note = "") {
  const box = document.getElementById("recommendationText");

  if (!bestSupplier) {
    box.innerHTML = "Chưa có dữ liệu đánh giá.";
    return;
  }

  box.innerHTML = `
    <p><strong>Tóm tắt:</strong> Đề xuất ưu tiên <strong>${bestSupplier.ten_ncc}</strong> với điểm
    <strong>${Number(bestSupplier.score).toFixed(1)}/100</strong>.</p>
    <p>
      Doanh nghiệp nên kết hợp kết quả này với đánh giá pháp lý, hợp đồng
      và khả năng giao hàng thực tế.
    </p>
    ${note ? `<p><em>${note}</em></p>` : ""}
  `;
}

function renderAIRecommendation(data) {
  const box = document.getElementById("recommendationText");
  const reasons = Array.isArray(data.reasons) ? data.reasons : [];
  const risks = Array.isArray(data.risks) ? data.risks : [];
  const actions = Array.isArray(data.action_plan) ? data.action_plan : [];
  const best = data.best_supplier;

  box.innerHTML = `
    <p><strong>Tóm tắt:</strong> ${data.summary || "-"}</p>
    ${
      best
        ? `<p><strong>Nhà cung cấp đề xuất:</strong> ${best.ten_ncc} (${Number(best.score).toFixed(2)}/100)</p>`
        : ""
    }
    <p><strong>So sánh top 2:</strong> ${data.compare_top2 || "-"}</p>
    <p><strong>Lý do chính:</strong></p>
    <ul>${reasons.map((item) => `<li>${item}</li>`).join("") || "<li>Chưa có dữ liệu.</li>"}</ul>
    <p><strong>Rủi ro cần theo dõi:</strong></p>
    <ul>${risks.map((item) => `<li>${item}</li>`).join("") || "<li>Chưa có dữ liệu.</li>"}</ul>
    <p><strong>Kế hoạch hành động:</strong></p>
    <ul>${actions.map((item) => `<li>${item}</li>`).join("") || "<li>Chưa có dữ liệu.</li>"}</ul>
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

