import request from "./request";

export const wordApi = {
  getAll: () => request.get("/words"),
  getOne: (id) => request.get(`/words/${id}`),
  create: (data) => request.post("/words", data),
  update: (id, data) => request.put(`/words/${id}`, data),
  delete: (id) => request.delete(`/words/${id}`),
  generateDetails: (word) => request.post("/words/generate-details", { word }),
  importFromImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return request.post("/words/import-from-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const progressApi = {
  getAll: () => request.get("/progress"),
  getByStatus: (status) => request.get(`/progress/status/${status}`),
  getByWord: (wordId) => request.get(`/progress/word/${wordId}`),
  update: (wordId, data) => request.put(`/progress/word/${wordId}`, data),
  reset: (wordId) => request.delete(`/progress/word/${wordId}`),
  resetAll: () => request.delete("/progress"),
};

export const imageApi = {
  generateByText: (payload) => request.post("/images/generate/text", payload),
  generateByCustom: (payload) => request.post("/images/generate/custom", payload),
  generate: (wordId) => request.post(`/images/generate/${wordId}`),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return request.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
