const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const fallback = err.error || `Request failed: ${res.status}`;
    throw new Error(err.detail ? `${fallback}: ${err.detail}` : fallback);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  health: () => request('/health'),

  getRecords: () => request('/records'),

  // `getRecords()` omits `imgs` to keep the list light; fetch the full
  // record (with images) only when actually opening/printing one job.
  getRecord: (id) => request(`/records/${id}`),

  createRecord: (record) =>
    request('/records', { method: 'POST', body: JSON.stringify(record) }),

  bulkImportRecords: (records) =>
    request('/records/bulk', { method: 'POST', body: JSON.stringify({ records }) }),

  deleteRecord: (id) => request(`/records/${id}`, { method: 'DELETE' }),

  updateRecord: (id, record) =>
    request(`/records/${id}`, { method: 'PUT', body: JSON.stringify(record) }),

  getMaster: () => request('/master'),

  saveMaster: (data) =>
    request('/master', { method: 'PUT', body: JSON.stringify(data) }),
};

export async function migrateFromLocalStorage(defaultMaster) {
  let localRecords = [];
  let localMaster = null;

  try {
    const savedRecords = localStorage.getItem('acRec3');
    if (savedRecords) localRecords = JSON.parse(savedRecords);
  } catch {
    /* ignore */
  }

  try {
    const savedMaster = localStorage.getItem('acMaster');
    if (savedMaster) localMaster = JSON.parse(savedMaster);
  } catch {
    /* ignore */
  }

  const serverRecords = await api.getRecords();
  const serverMaster = await api.getMaster();

  if (serverRecords.length === 0 && localRecords.length > 0) {
    await api.bulkImportRecords(localRecords);
  }

  if (!serverMaster && localMaster) {
    await api.saveMaster(localMaster);
  } else if (!serverMaster && defaultMaster) {
    await api.saveMaster(defaultMaster);
  }

  return {
    migratedRecords: serverRecords.length === 0 && localRecords.length > 0,
    migratedMaster: !serverMaster && !!localMaster,
  };
}
