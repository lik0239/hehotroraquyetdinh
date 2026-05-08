function renderSupplierTable(suppliers) {
  const tbody = document.querySelector("#supplierTable tbody");
  tbody.innerHTML = "";

  suppliers.forEach((s) => {
    const tr = document.createElement("tr");
    if (s.ma_ncc === selectedSupplierId) {
      tr.classList.add("selected-row");
    }
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
      if (selectedSupplier) {
        selectSupplier(selectedSupplier);
      }
    });
  });
}

function selectSupplier(supplier) {
  selectedSupplierId = supplier.ma_ncc;
  renderSupplierTable(latestRanking);
  renderSupplierDetail(supplier);
  populateSupplierForm(supplier);
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
        ${(supplier.criterion_scores || [])
          .map(
            (item) => `
          <tr>
            <td>${item.label}</td>
            <td>${item.value}</td>
            <td>${item.weight}</td>
          </tr>
        `
          )
          .join("")}
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

function populateSupplierForm(supplier) {
  document.getElementById("supplierIdInput").value = supplier.ma_ncc;
  document.getElementById("supplierNameInput").value = supplier.ten_ncc || "";
  document.getElementById("supplierPhoneInput").value = supplier.so_dien_thoai || "";
  document.getElementById("supplierAddressInput").value = supplier.dia_chi || "";
  document.getElementById("supplierEmailInput").value = supplier.email || "";
  document.getElementById("supplierDescriptionInput").value = supplier.mo_ta || "";
  document.getElementById("supplierFormTitle").textContent = `Đang chỉnh sửa: ${supplier.ten_ncc}`;
  document.getElementById("supplierFormMessage").textContent =
    "Cập nhật hồ sơ liên hệ, mô tả và thông tin hiển thị của nhà cung cấp.";
}

function resetSupplierForm() {
  selectedSupplierId = null;
  document.getElementById("supplierForm").reset();
  document.getElementById("supplierIdInput").value = "";
  document.getElementById("supplierFormTitle").textContent = "Chưa chọn nhà cung cấp";
  document.getElementById("supplierFormMessage").textContent =
    "Chọn một dòng trong bảng để nạp thông tin và chỉnh sửa.";
  renderSupplierTable(latestRanking);
}

async function saveSupplierProfile(event) {
  event.preventDefault();

  const supplierId = Number(document.getElementById("supplierIdInput").value);
  if (!supplierId) {
    alert("Vui lòng chọn một nhà cung cấp trước khi lưu.");
    return;
  }

  const payload = {
    ten_ncc: document.getElementById("supplierNameInput").value.trim(),
    so_dien_thoai: document.getElementById("supplierPhoneInput").value.trim(),
    dia_chi: document.getElementById("supplierAddressInput").value.trim(),
    email: document.getElementById("supplierEmailInput").value.trim(),
    mo_ta: document.getElementById("supplierDescriptionInput").value.trim(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/suppliers/${supplierId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Không lưu được thông tin nhà cung cấp.");
    }

    selectedSupplierId = supplierId;
    document.getElementById("supplierFormMessage").textContent =
      "Đã lưu thông tin nhà cung cấp thành công.";
    await loadDashboard();
  } catch (error) {
    console.error("Lỗi khi lưu nhà cung cấp:", error);
    alert(error.message || "Không lưu được thông tin nhà cung cấp.");
  }
}
