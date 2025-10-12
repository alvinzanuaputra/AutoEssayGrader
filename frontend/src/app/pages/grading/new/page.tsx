"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  HiCloudUpload,
  HiCheckCircle,
  HiDocumentText,
  HiX,
} from "react-icons/hi";

export default function NewGradingPage() {
  return (
    <ProtectedRoute>
      <NewGradingContent />
    </ProtectedRoute>
  );
}

function NewGradingContent() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processedFilename, setProcessedFilename] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.endsWith(".pdf")) {
      setError("Hanya file PDF yang diperbolehkan");
      setSelectedFile(null);
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(
        `Ukuran file melebihi batas 50MB. File Anda berukuran ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError("");
    setSuccess("");
    setOcrResult("");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    setSuccess("");
    setOcrResult("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Silakan pilih file PDF terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Anda harus login terlebih dahulu");
        setIsUploading(false);
        return;
      }

      setUploadProgress(30);

      const response = await fetch("http://localhost:8000/api/ocr/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload gagal");
      }

      const data = await response.json();

      setUploadProgress(100);
      setSuccess("PDF berhasil diproses!");
      setOcrResult(data.result_text || "");
      setProcessedFilename(data.filename || "");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Terjadi kesalahan saat memproses file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    router.push("/pages/home");
  };

  const handleNewUpload = () => {
    setSelectedFile(null);
    setOcrResult("");
    setSuccess("");
    setError("");
    setProcessedFilename("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#2b2d31]">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Upload PDF untuk OCR Processing
          </h1>
          <p className="text-gray-300">
            Upload file PDF Anda untuk diproses dengan teknologi OCR
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">
              Upload File
            </h2>

            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm flex items-center">
                <HiCheckCircle className="w-5 h-5 mr-2" />
                {success}
              </div>
            )}

            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors">
                <HiCloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer inline-flex items-center px-6 py-3 border border-yellow-500 rounded-lg text-white bg-yellow-500/10 hover:bg-yellow-500/20"
                >
                  <HiDocumentText className="w-5 h-5 mr-2" />
                  Pilih File PDF
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <div className="mt-4 text-sm text-gray-400">
                  <p className="font-medium mb-1">Persyaratan:</p>
                  <ul>
                    <li> PDF saja, max 50MB</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-3">
                      <HiDocumentText className="w-8 h-8 text-yellow-400" />
                      <div>
                        <p className="text-white">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {!isUploading && !ocrResult && (
                      <button
                        onClick={handleRemoveFile}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <HiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {isUploading && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Memproses...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {!ocrResult && !isUploading && (
                  <Button
                    onClick={handleUpload}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    <HiCloudUpload className="w-5 h-5 mr-2" />
                    Proses OCR
                  </Button>
                )}

                {ocrResult && (
                  <Button
                    onClick={handleNewUpload}
                    variant="outline"
                    size="md"
                    fullWidth
                  >
                    Upload File Baru
                  </Button>
                )}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Hasil OCR</h2>

            {!ocrResult && !isUploading && (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-lg">
                <div className="text-center text-gray-400">
                  <HiDocumentText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Hasil OCR akan muncul di sini</p>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Memproses OCR..." />
              </div>
            )}

            {ocrResult && (
              <div>
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto mb-4">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap">
                    {ocrResult}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigator.clipboard.writeText(ocrResult)}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(new Blob([ocrResult]));
                      a.download = "hasil_ocr.txt";
                      a.click();
                    }}
                    variant="primary"
                    size="sm"
                    fullWidth
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
