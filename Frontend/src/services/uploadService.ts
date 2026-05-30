// ============================================================
// Upload Service
// Handles file upload APIs
// ============================================================

import api from "./api";

class UploadService {
  async uploadToIPFS(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post("/uploads/ipfs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  }

  async uploadToS3(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post("/uploads/s3", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  }

  async getIPFSFile(hash: string): Promise<any> {
    const response = await api.get(`/uploads/${hash}`);
    return response.data.data;
  }

  async deleteS3File(key: string): Promise<void> {
    await api.delete(`/uploads/${key}`);
  }
}

export default new UploadService();
