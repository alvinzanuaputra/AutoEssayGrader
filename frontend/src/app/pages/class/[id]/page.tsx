"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import LoadingSpinner from "../../../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  HiArrowLeft,
  HiUsers,
  HiDocumentText,
  HiClipboardCopy,
  HiPlus,
} from "react-icons/hi";
import Image from "next/image";

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

interface Student {
  id: number;
  user_id: number;
  fullname: string;
  username: string;
  email: string;
  profile_picture: string | null;
  role: string;
  enrolled_at: string;
}

interface Assignment {
  id: number;
  class_id: number;
  title: string;
  description: string | null;
  max_score: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  creator_name: string;
  submission_count: number;
  graded_count: number;
}

export default function ClassDetailPage() {
  return (
    <ProtectedRoute>
      <ClassDetailContent />
    </ProtectedRoute>
  );
}

function ClassDetailContent() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "assignments" | "students"
  >("overview");

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");

  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    max_score: 100,
    deadline: "",
  });

  useEffect(() => {
    if (classId) {
      fetchClassData();
      fetchStudents();
      fetchAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const getToken = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };
    return getCookie("token") || localStorage.getItem("token");
  };

  const fetchClassData = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/pages/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/classes/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch class");

      const data = await response.json();
      setClassData(data);
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error("Gagal memuat data kelas");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8000/api/classes/${classId}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch students");

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8000/api/classes/${classId}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const copyClassCode = () => {
    if (classData) {
      navigator.clipboard.writeText(classData.class_code);
      toast.success("Kode kelas disalin!");
    }
  };

  const handleAddStudent = async () => {
    if (!studentEmail.trim()) {
      toast.error("Masukkan email mahasiswa");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8000/api/classes/${classId}/students`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: studentEmail }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Gagal menambahkan mahasiswa");
      }

      toast.success("Mahasiswa berhasil ditambahkan!");
      setShowAddStudentModal(false);
      setStudentEmail("");
      fetchStudents();
      fetchClassData(); // Refresh student count
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menambahkan mahasiswa"
      );
    }
  };

  const handleAddAssignment = async () => {
    if (!assignmentForm.title.trim()) {
      toast.error("Judul tugas harus diisi");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8000/api/classes/${classId}/assignments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: assignmentForm.title,
            description: assignmentForm.description || null,
            max_score: assignmentForm.max_score,
            deadline: assignmentForm.deadline || null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Gagal membuat tugas");
      }

      toast.success("Tugas berhasil dibuat!");
      setShowAddAssignmentModal(false);
      setAssignmentForm({
        title: "",
        description: "",
        max_score: 100,
        deadline: "",
      });
      fetchAssignments();
      fetchClassData(); // Refresh assignment count
    } catch (error) {
      console.error("Error adding assignment:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat tugas"
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak ada deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isTeacher = classData?.user_role === "teacher";

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

  if (!classData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#2b2d31]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Kelas tidak ditemukan</p>
            <Link href="/pages/home">
              <button className="px-6 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors">
                Kembali ke Beranda
              </button>
            </Link>
          </div>
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
          <Link
            href="/pages/home"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Kembali ke Kelas Saya</span>
          </Link>

          {/* Class Info Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {classData.class_name}
                </h1>
                <p className="text-blue-100 text-lg mb-1">
                  {classData.subject || "Mata Pelajaran"}
                </p>
                <p className="text-blue-200 text-sm">
                  Pengajar: {classData.teacher_name}
                </p>
              </div>

              {isTeacher && (
                <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium">
                  Pengajar
                </span>
              )}
            </div>

            {classData.description && (
              <p className="text-blue-100 mb-6">{classData.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <HiUsers className="w-5 h-5" />
                <span>{classData.student_count} Peserta</span>
              </div>
              <div className="flex items-center gap-2">
                <HiDocumentText className="w-5 h-5" />
                <span>{classData.assignment_count} Tugas</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur">
                  <span className="text-sm font-mono font-semibold tracking-wider">
                    {classData.class_code}
                  </span>
                </div>
                <button
                  onClick={copyClassCode}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur"
                  title="Salin kode kelas"
                >
                  <HiClipboardCopy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 bg-[#313338] rounded-lg p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-yellow-400 text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "assignments"
                  ? "bg-yellow-400 text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Penilaian ({classData.assignment_count})
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "students"
                  ? "bg-yellow-400 text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Peserta ({classData.student_count})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="bg-[#313338] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Selamat Datang!
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#2b2d31] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Informasi Kelas
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p>
                    <strong>Nama:</strong> {classData.class_name}
                  </p>
                  <p>
                    <strong>Mata Pelajaran:</strong> {classData.subject || "-"}
                  </p>
                  <p>
                    <strong>Pengajar:</strong> {classData.teacher_name}
                  </p>
                  <p>
                    <strong>Kode Kelas:</strong> {classData.class_code}
                  </p>
                </div>
              </div>

              <div className="bg-[#2b2d31] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Statistik
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Peserta</span>
                    <span className="text-2xl font-bold text-white">
                      {classData.student_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Tugas</span>
                    <span className="text-2xl font-bold text-white">
                      {classData.assignment_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div>
            {isTeacher && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setShowAddAssignmentModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors"
                >
                  <HiPlus className="w-5 h-5" />
                  <span>Buat Tugas Baru</span>
                </button>
              </div>
            )}

            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="bg-[#313338] rounded-xl p-12 text-center">
                  <HiDocumentText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Belum ada tugas</p>
                  {isTeacher && (
                    <button
                      onClick={() => setShowAddAssignmentModal(true)}
                      className="mt-4 px-6 py-2 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors"
                    >
                      Buat Tugas Pertama
                    </button>
                  )}
                </div>
              ) : (
                assignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/pages/class/${classId}/assignment/${assignment.id}`}
                  >
                    <div className="bg-[#313338] rounded-xl p-6 hover:bg-[#35373c] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {assignment.title}
                          </h3>
                          {assignment.description && (
                            <p className="text-gray-400 mb-4 line-clamp-2">
                              {assignment.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span>Max Nilai: {assignment.max_score}</span>
                            <span>•</span>
                            <span>{formatDate(assignment.deadline)}</span>
                            <span>•</span>
                            <span>
                              {assignment.submission_count} Pengumpulan
                            </span>
                            <span>•</span>
                            <span>{assignment.graded_count} Dinilai</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div>
            {isTeacher && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors"
                >
                  <HiPlus className="w-5 h-5" />
                  <span>Tambah Peserta</span>
                </button>
              </div>
            )}

            <div className="bg-[#313338] rounded-xl overflow-hidden">
              {students.length === 0 ? (
                <div className="p-12 text-center">
                  <HiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Belum ada peserta</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-6 flex items-center gap-4 hover:bg-[#35373c] transition-colors"
                    >
                      {student.profile_picture ? (
                        <Image
                          src={student.profile_picture}
                          alt={student.fullname}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-semibold">
                          {student.fullname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">
                          {student.fullname}
                        </h3>
                        <p className="text-gray-400 text-sm">{student.email}</p>
                      </div>
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                            student.role === "teacher"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {student.role === "teacher"
                            ? "Pengajar"
                            : "Mahasiswa"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#313338] rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Tambah Peserta
            </h2>
            <p className="text-gray-400 mb-6">
              Masukkan email mahasiswa yang ingin ditambahkan
            </p>

            <input
              type="email"
              placeholder="Email mahasiswa"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setStudentEmail("");
                }}
                className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 px-4 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#313338] rounded-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Buat Tugas Baru
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Judul Tugas <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Essay tentang..."
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  placeholder="Jelaskan tugas ini..."
                  value={assignmentForm.description}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nilai Maksimal
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={assignmentForm.max_score}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        max_score: parseInt(e.target.value) || 100,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.deadline}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        deadline: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#2b2d31] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddAssignmentModal(false);
                  setAssignmentForm({
                    title: "",
                    description: "",
                    max_score: 100,
                    deadline: "",
                  });
                }}
                className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddAssignment}
                className="flex-1 px-4 py-3 bg-yellow-400 rounded-lg text-gray-900 font-medium hover:bg-yellow-500 transition-colors"
              >
                Buat Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
