"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockGetEssayHistory } from "@/lib/mockApi";
import { Essay } from "@/types";
import { getCardColor, formatDate } from "@/lib/constants";
import ProtectedRoute from "../../components/ProtectedRoute";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  HiSearch,
  HiFilter,
  HiPlus,
  HiDocumentText,
  HiDotsVertical,
} from "react-icons/hi";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const essaysResponse = await mockGetEssayHistory();

        if (essaysResponse.success && essaysResponse.data) {
          setEssays(essaysResponse.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEssays = essays.filter(
    (essay) =>
      essay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      essay.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#2b2d31]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Memuat..." />
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-[#2b2d31]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="cursor-not-allowed text-gray-400 hover:text-white pointer-events-none"
              tabIndex={-1}
              aria-disabled="true"
            >
              Semua
            </Link>
            <span className="text-gray-600">{">"}</span>
            <span className="text-white font-medium">Penilaian Saya</span>
          </div>
        </div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">Penilaian Saya</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
              <HiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors">
              <HiFilter className="w-5 h-5" />
            </button>
          </div>
        </div>
        {filteredEssays.length === 0 ? (
          <div className="text-center py-20">
            <Link href="/pages/grading/new">
              <div className="max-w-xs mx-auto p-12 border-2 border-dashed border-gray-600 rounded-2xl hover:border-yellow-400 transition-colors cursor-pointer group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4 group-hover:bg-yellow-400/20 transition-colors">
                    <HiPlus className="w-8 h-8 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <p className="text-white font-medium">Buat Penilaian Baru</p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/pages/grading/new">
              <div className="h-64 p-8 border-2 border-dashed border-gray-600 rounded-2xl hover:border-yellow-400 transition-colors cursor-pointer group flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4 group-hover:bg-yellow-400/20 transition-colors">
                    <HiPlus className="w-8 h-8 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <p className="text-white font-medium">Buat Penilaian Baru</p>
                </div>
              </div>
            </Link>
            {filteredEssays.map((essay, index) => (
              <div
                key={essay.id}
                className={`relative h-64 p-6 rounded-2xl text-white overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02] ${getCardColor(
                  index
                )}`}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <HiDocumentText className="w-6 h-6 text-white" />
                    </div>
                    <button className="text-white hover:bg-white/20 rounded p-1 transition-colors">
                      <HiDotsVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {essay.title}
                  </h3>
                  <div className="mt-auto space-y-1">
                    <p className="text-sm text-white/80">
                      {formatDate(essay.createdAt)} • N Dokumen
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
