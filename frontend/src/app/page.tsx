"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Button from "./components/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#2b2d31] transition-colors duration-300">
      <Navbar />
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6">
              <span className="text-yellow-400">ESSAY</span>
              <br />
              <span className="text-white">GRADER</span>
            </h1>
          </div>

          {/* Right Side - Content */}
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Selamat Datang!
            </h2>
            <p className="text-lg mb-8 leading-relaxed text-gray-300">
              Mengoreksi esai kini tak lagi memakan waktu. Essay Grader adalah
              platform bertenaga AI yang merevolusi cara Anda menilai
              tugas-tugas mahasiswa. Mengoreksi esai tidak pernah secepat ini.
              Dengan teknologi OCR dan LLM, platform kami menilai jawaban
              tulisan tangan secara otomatis dan akurat. Kurangi beban
              administratif, fokus pada pendidikan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/pages/login">
                <Button size="lg" className="min-w-[140px]">
                  Masuk
                </Button>
              </Link>
              <Link href="/pages/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[140px] text-white hover:bg-gray-700"
                >
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
