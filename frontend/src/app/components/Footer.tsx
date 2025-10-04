import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#23252a] text-white mt-auto border-t border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <span className="text-yellow-400">ESSAY</span> GRADER
            </h3>
            <p className="text-gray-400 text-sm">
              Sistem penilaian esai otomatis yang didukung oleh AI. Dapatkan
              umpan balik instan dan tingkatkan keterampilan menulis Anda.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/about"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Tentang
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/grading/new"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Nilai Esai
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Fitur
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Hubungi Kami</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@autoessaygrader.com</li>
              <li>Telepon: +62 (555) 123-4567</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Auto Essay Grader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
