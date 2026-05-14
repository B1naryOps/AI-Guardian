import apiClient from './apiClient';

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authService = {
  async login(email: string, mot_de_passe: string) {
    const response = await apiClient.post('/auth/login', { email, mot_de_passe });
    return response.data; // { access_token, token_type }
  },

  async register(payload: {
    email: string;
    mot_de_passe: string;
    nom: string;
    prenoms: string;
    role?: string;
    invite_code?: string;
  }) {
    const response = await apiClient.post('/users/', payload);
    return response.data; // UserResponse
  },
};

// ─── User ────────────────────────────────────────────────────────────────────

export const userService = {
  async getMe() {
    const response = await apiClient.get('/users/me');
    return response.data; // UserResponse
  },

  async listUsers() {
    const response = await apiClient.get('/users/');
    return response.data; // UserResponse[]
  },
};

// ─── Analysis ────────────────────────────────────────────────────────────────

export const analysisService = {
  async analyze(content: string) {
    const response = await apiClient.post('/analysis/ml', { content });
    return response.data; // { is_phishing, probability, confidence }
  },
  async getHistory() {
    const response = await apiClient.get('/analysis/history');
    return response.data; // MLHistoryResponse[]
  },
  async reportPhishing() {
    const response = await apiClient.post('/analysis/report');
    return response.data;
  },
  async sandbox(url: string) {
    const response = await apiClient.post('/analysis/sandbox', { url });
    return response.data;
  },
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/analysis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ─── Departments ─────────────────────────────────────────────────────────────

export const departmentService = {
  async list() {
    const response = await apiClient.get('/departments/');
    return response.data;
  },
  async create(payload: any) {
    const response = await apiClient.post('/departments/', payload);
    return response.data;
  },
  async delete(id: number) {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },
};

// ─── Simulations ─────────────────────────────────────────────────────────────

export const simulationService = {
  async list() {
    const response = await apiClient.get('/simulations/');
    return response.data;
  },
  async create(payload: any) {
    const response = await apiClient.post('/simulations/', payload);
    return response.data;
  },
  async getStats(id: number) {
    const response = await apiClient.get(`/simulations/${id}/stats`);
    return response.data;
  },
  async delete(id: number) {
    const response = await apiClient.delete(`/simulations/${id}`);
    return response.data;
  },
  async sync() {
    const response = await apiClient.get('/simulations/sync');
    return response.data;
  },
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const auditService = {
  async list() {
    const response = await apiClient.get('/audit-logs/');
    return response.data;
  },
};

// ─── Settings ───────────────────────────────────────────────────────────────

export const settingsService = {
  async get() {
    const response = await apiClient.get('/settings/');
    return response.data;
  },
  async update(payload: any) {
    const response = await apiClient.patch('/settings/', payload);
    return response.data;
  },
  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/settings/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ─── Remediation ────────────────────────────────────────────────────────────

export const remediationService = {
  async getStatus() {
    const response = await apiClient.get('/remediation/status');
    return response.data;
  },
  async complete() {
    const response = await apiClient.post('/remediation/complete');
    return response.data;
  }
};

// ─── Legacy export (compatibility) ───────────────────────────────────────────

export const apiService = {
  analyze: (content: string) => analysisService.analyze(content),
};
