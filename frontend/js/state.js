const API_BASE_URL = "http://127.0.0.1:5000";

let rankingChartInstance = null;
let radarChartInstance = null;
let latestRanking = [];
let latestCriteria = [];
let selectedSupplierId = null;
let latestSavedAHPWeights = [];
let ahpMatrixState = {};
let compareSupplierSelection = {
  baseId: null,
  compare1Id: null,
  compare2Id: null,
};

let aiPairSelection = {
  supplierAId: null,
  supplierBId: null,
};
