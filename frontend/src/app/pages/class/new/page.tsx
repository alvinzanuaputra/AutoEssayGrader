"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import LoadingSpinner from "../../../components/LoadingSpinner";
import toast from "react-hot-toast";
import { HiArrowLeft, HiAcademicCap } from "react-icons/hi";

export default function NewClassPage() {
  return (
    <ProtectedRoute>
      <NewClassContent />
    </ProtectedRoute>
  );
}

function NewClassContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_name: "",
    subject: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.class_name.trim()) {
      toast.error("Nama kelas harus diisi");
      return;
    }

    try {
      setIsLoading(true);

      // Get token from cookies or localStorage
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
      };

      const token = getCookie("token") || localStorage.getItem("token");

      if (!token) {
        toast.error("Token tidak ditemukan. Silakan login kembali.");
        router.push("/pages/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/classes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_name: formData.class_name,
          subject: formData.subject || null,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Gagal membuat kelas");
      }

      const data = await response.json();

      toast.success("Kelas berhasil dibuat!");

      // Redirect to class detail page
      setTimeout(() => {
        router.push(`/pages/class/${data.id}`);
      }, 1000);
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat kelas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#2b2d31]">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pages/home"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Kembali ke Kelas Saya</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <HiAcademicCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Buat Kelas Baru</h1>
              <p className="text-gray-400 mt-1">
                Buat kelas untuk mengelola tugas dan penilaian
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#313338] rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div>
              <label
                htmlFor="class_name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Nama Kelas <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="class_name"
                name="class_name"
                value={formData.class_name}
                onChange={handleChange}
                placeholder="Contoh: Pemrograman Web 2024"
                className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Mata Pelajaran
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Contoh: Teknologi Informasi"
                className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Deskripsi Kelas
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan tentang kelas ini..."
                rows={4}
                className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>💡 Tips:</strong> Kode kelas akan dibuat secara otomatis
                setelah kelas dibuat. Bagikan kode tersebut kepada siswa untuk
                bergabung ke kelas.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Link href="/pages/home" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
              </Link>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Membuat Kelas...</span>
                  </>
                ) : (
                  "Buat Kelas"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
