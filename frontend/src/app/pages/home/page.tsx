"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/api";
import toast from "react-hot-toast";
import {
  HiSearch,
  HiPlus,
  HiDotsVertical,
  HiUsers,
  HiDocumentText,
  HiAcademicCap,
} from "react-icons/hi";

interface ClassData {
  id: number;
  class_name: string;
  subject: string | null;
  description: string | null;
  class_code: string;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  student_count: number;
  assignment_count: number;
  user_role: string;
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // Handle OAuth callback BEFORE ProtectedRoute
  useEffect(() => {
    const token = searchParams.get("token");

    if (token && !isAuthenticated && !isProcessingOAuth) {
      setIsProcessingOAuth(true);

      const handleOAuthLogin = async () => {
        try {
          console.log("📡 Processing OAuth token...");
          const userData = await getCurrentUser(token);
          console.log("👤 User data:", userData);

          if (userData) {
            login(userData, token, true);
            toast.success(`Selamat datang, ${userData.fullname}!`, {
              duration: 2000,
            });

            // Remove token from URL and refresh page
            setTimeout(() => {
              window.location.href = "/pages/home";
            }, 1500);
          }
        } catch (error) {
          console.error("❌ OAuth error:", error);
          toast.error("Gagal login dengan OAuth");
          setIsProcessingOAuth(false);
          router.push("/pages/login");
        }
      };

      handleOAuthLogin();
    }
  }, [searchParams, login, router, isAuthenticated, isProcessingOAuth]);

  // Show loading while processing OAuth
  if (isProcessingOAuth) {
    return <LoadingSpinner fullScreen text="Memproses login..." />;
  }

  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClasses = async () => {
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }

      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Gagal memuat kelas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      toast.error("Masukkan kode kelas");
      return;
    }

    try {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
      };

      const token = getCookie("token") || localStorage.getItem("token");

      // Use the correct endpoint without class_id
      const response = await fetch(`http://localhost:8000/api/classes/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ class_code: classCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Gagal bergabung ke kelas");
      }

      toast.success("Berhasil bergabung ke kelas!");
      setShowJoinModal(false);
      setClassCode("");
      fetchClasses();
    } catch (error) {
      console.error("Error joining class:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal bergabung ke kelas"
      );
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClassColor = (index: number) => {
    const colors = [
      "from-blue-600 to-blue-700",
      "from-green-600 to-green-700",
      "from-purple-600 to-purple-700",
      "from-orange-600 to-orange-700",
      "from-pink-600 to-pink-700",
      "from-teal-600 to-teal-700",
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#2b2d31]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Memuat kelas..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#2b2d31]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">Kelas Saya</h1>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari kelas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
              <HiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-yellow-400 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors"
              >
                <HiPlus className="w-5 h-5" />
                <span>Gabung Kelas</span>
              </button>

              <Link href="/pages/class/new">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors">
                  <HiPlus className="w-5 h-5" />
                  <span>Buat Kelas</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-700 flex items-center justify-center">
                <HiAcademicCap className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Belum Ada Kelas
              </h3>
              <p className="text-gray-400 mb-8">
                {searchQuery
                  ? "Tidak ada kelas yang cocok dengan pencarian"
                  : "Buat kelas baru atau bergabung dengan kelas yang ada"}
              </p>

              {!searchQuery && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="px-6 py-3 bg-transparent border border-yellow-400 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                  >
                    Gabung Kelas
                  </button>
                  <Link href="/pages/class/new">
                    <button className="px-6 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors">
                      Buat Kelas Baru
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls, index) => (
              <Link key={cls.id} href={`/pages/class/${cls.id}`}>
                <div
                  className={`relative h-64 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] shadow-lg bg-gradient-to-br ${getClassColor(
                    index
                  )}`}
                >
                  {/* Header Section */}
                  <div className="relative z-10 p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1 line-clamp-2">
                          {cls.class_name}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {cls.subject || "Mata Pelajaran"}
                        </p>
                        <p className="text-white/70 text-xs mt-1">
                          {cls.teacher_name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: Show class options menu
                        }}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                      >
                        <HiDotsVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-auto">
                      <div className="flex items-center gap-4 text-white/90 text-sm">
                        <div className="flex items-center gap-1">
                          <HiUsers className="w-4 h-4" />
                          <span>{cls.student_count} peserta</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HiDocumentText className="w-4 h-4" />
                          <span>{cls.assignment_count} tugas</span>
                        </div>
                      </div>

                      {cls.user_role === "teacher" && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs text-white font-medium">
                            Pengajar
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#313338] rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Gabung Kelas</h2>
            <p className="text-gray-400 mb-6">
              Masukkan kode kelas yang diberikan oleh pengajar
            </p>

            <input
              type="text"
              placeholder="Kode Kelas (contoh: ABC123XY)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors mb-6"
              maxLength={8}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setClassCode("");
                }}
                className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleJoinClass}
                className="flex-1 px-4 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors"
              >
                Gabung
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
