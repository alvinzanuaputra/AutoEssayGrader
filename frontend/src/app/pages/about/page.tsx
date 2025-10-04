"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Choirul Anam",
      role: "ARTIFICIAL INTELLIGENCE",
      image: "/images/team/anam.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
    {
      name: "Muhammad Azhar Aziz",
      role: "FRONTEND",
      image: "/images/team/azhar.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
    {
      name: "Christoforus Indra Pratama",
      role: "UI/UX DESIGNER",
      image: "/images/team/christo.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
    {
      name: "Nadin Nabil Hafizh Ayyasy",
      role: "FRONTEND",
      image: "/images/team/hafizh.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
    {
      name: "Pramuditya Faiz Ardiansyah",
      role: "BACKEND",
      image: "/images/team/faiz.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
    {
      name: "Alvin Zanua Putra",
      role: "BACKEND",
      image: "/images/team/alvin.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
    {
      name: "Rachmat Ramadhan",
      role: "ARTIFICIAL INTELLIGENCE",
      image: "/images/team/rachmat.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
    {
      name: "Muh. Buyung Saloka",
      role: "ARTIFICIAL INTELLIGENCE",
      image: "/images/team/buyung.jpg",
      instagram: "#",
      linkedin: "#",
      highlight: "yellow",
    },
  ];
  return (
    <div className="min-h-screen bg-[#2b2d31] text-white transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center text-white">
            <span className="text-yellow-400">TENTANG</span> KAMI
          </h2>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-lg text-gray-300">
              Penilaian esai <span className="text-yellow-400">adalah</span>{" "}
              bagian penting dari proses pendidikan, tapi sering kali menjadi
              beban berat bagi guru.{" "}
              <span className="text-yellow-400">Membaca</span> dan{" "}
              <span className="text-yellow-400">menilai</span> esai yang
              beragam, memastikan objektivitas, dan mendeteksi plagiat bisa
              sangat memakan waktu. Kami memahami tantangan ini dan hadir untuk
              mewujudkannya.
            </p>
            <p className="text-lg text-gray-300">
              <span className="text-yellow-400">ESSAY GRADER</span> adalah
              platform AI powered yang merevolusi cara penilaian esai. Kami
              bukan sekedar alat koreksi, melainkan asisten pintar yang dapat{" "}
              <span className="text-yellow-400">menghemat waktu</span> Anda,
              memasukkan akurasi, dan meningkatkan transparansi dalam proses
              penilaian.
            </p>
          </div>
        </section>
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center text-white">
            <span className="text-yellow-400">BAGAIMANA KAMI</span> BEKERJA?
          </h2>
          <div className="max-w-4xl mx-auto text-lg text-gray-300">
            <p className="mb-6">
              Dengan menggabungkan{" "}
              <span className="text-yellow-400 font-semibold">
                empat pilar teknologi AI canggih
              </span>
              , Essay Grader memberikan solusi penilaian yang komprehensif:
            </p>
            <div className="space-y-4">
              <div>
                <span className="text-yellow-400 font-semibold">
                  1. Pengenalan Tulisan Tangan dengan AI
                </span>{" "}
                : Kami mengubah hasil pindaian (scan) tulisan tangan mahasiswa
                menjadi teks digital yang dapat diolah, menghilangkan hambatan
                membaca tulisan yang sulit.
              </div>
              <div>
                <span className="text-yellow-400 font-semibold">
                  2. Penilaian Otomatis
                </span>{" "}
                : Menggunakan model bahasa besar (LLM), sistem kami
                membandingkan jawaban mahasiswa dengan kunci jawaban dan
                memberikan skor yang objektif dan konsisten.
              </div>
            </div>
          </div>
        </section>
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center text-white">
            <span className="text-yellow-400">MISI</span> KAMI
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-300 mb-4">
              Misi kami adalah{" "}
              <span className="text-yellow-400 font-semibold">
                memberdayakan pendidik dengan alat yang efektif dan efisien
              </span>
              . Kami ingin mengurangi beban administratif, memantik diskusi
              lebih produktif dengan mahasiswa, dan mengembangkan kurikulum yang
              lebih canggih. Dengan{" "}
              <span className="text-yellow-400 font-semibold">
                ESSAY GRADER
              </span>
              , penilaian esai menjadi lebih cepat, transparan, dan dapat
              diandalkan.
            </p>
          </div>
        </section>

        {/* Temui Tim Kami Section */}
        <section>
          <h2 className="text-4xl font-bold mb-12 text-center text-white">
            <span className="text-yellow-400">TEMUI TIM</span> KAMI
          </h2>
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-lg text-gray-300 mb-12">
              Kami adalah sekelompok individu bersemangat yang ahli dalam
              pengembangan desain, dan AI. Kami bersatu untuk mewujudkan visi
              Essay Grader, sebuah solusi penilaian esai yang revolusioner.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-6 flex flex-col items-center text-center transition-transform hover:scale-105 ${
                    member.highlight === "yellow"
                      ? "bg-transparent border-2 border-yellow-400"
                      : "bg-transparent border-2 border-gray-600"
                  }`}
                >
                  <div className="w-24 h-24 rounded-full bg-gray-600 mb-4 overflow-hidden flex items-center justify-center relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-white mb-1">{member.name}</h3>
                  {member.role && (
                    <p
                      className={`text-xs mb-4 font-semibold ${
                        member.highlight === "yellow"
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      {member.role}
                    </p>
                  )}
                  <div className="flex gap-3 mt-auto">
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <FaInstagram className="w-5 h-5" />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <FaLinkedinIn className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
