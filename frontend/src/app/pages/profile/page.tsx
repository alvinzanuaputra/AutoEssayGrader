"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
function ProfileContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    bio: "",
    phone: "",
    institution: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        username: user.username || "",
        bio: "",
        phone: "",
        institution: "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (!formData.fullName.trim()) {
      setErrors({ fullName: "Nama lengkap wajib diisi" });
      return;
    }

    if (!formData.email.trim()) {
      setErrors({ email: "Email wajib diisi" });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage("Profil berhasil diperbarui!");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error memperbarui:", error);
      setErrors({ general: "Gagal memperbarui profil. Silakan coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (!passwordData.currentPassword) {
      setErrors({ currentPassword: "Kata sandi saat ini wajib diisi" });
      return;
    }

    if (!passwordData.newPassword) {
      setErrors({ newPassword: "Kata sandi baru wajib diisi" });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrors({ newPassword: "Kata sandi minimal 8 karakter" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: "Kata sandi tidak cocok" });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage("Kata sandi berhasil diubah!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Password change error:", error);
      setErrors({ general: "Gagal mengubah kata sandi. Silahkan coba lagi !" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/pages/home");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#2b2d31]">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit profil</h1>
          <p className="text-gray-300">
            Ganti informasi pribadi kamu dan pengaturan
          </p>
        </div>
        {successMessage && (
          <div className="mb-6 bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Informasi Profil
            </h2>
            <p className="text-sm text-gray-400">
              Ubah akun kamu & infromasi profil disini
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Foto profil
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.fullName.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors text-sm font-medium"
                  >
                    Ganti gambar
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="fullName"
                name="fullName"
                type="text"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />
              <Input
                id="username"
                name="username"
                type="text"
                label="Nama Pengguna"
                placeholder="Masukkan nama pengguna"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                disabled
              />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              label="Alamat Email"
              placeholder="Masukkan email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Nomor Telepon"
                placeholder="Masukkan nomor telepon"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <Input
                id="institution"
                name="institution"
                type="text"
                label="Institusi"
                placeholder="Masukkan institusi"
                value={formData.institution}
                onChange={handleChange}
                error={errors.institution}
              />
            </div>
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-white mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="Ceritakan tentang diri kamu..."
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors resize-none"
              />
              {errors.bio && (
                <p className="mt-2 text-sm text-red-400">{errors.bio}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Simpan Perubahan
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
        <Card className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Ubah Kata Sandi
            </h2>
            <p className="text-sm text-gray-400">
              Perbarui kata sandi untuk menjaga keamanan akun kamu
            </p>
          </div>
          {!showPasswordSection ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowPasswordSection(true)}
            >
              Ubah Kata Sandi
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                label="Kata Sandi Saat Ini"
                placeholder="Masukkan kata sandi saat ini"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={errors.currentPassword}
                required
              />
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                label="Kata Sandi Baru"
                placeholder="Masukkan kata sandi baru"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={errors.newPassword}
                helperText="Kata sandi minimal 8 karakter"
                required
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Konfirmasi Kata Sandi Baru"
                placeholder="Konfirmasi kata sandi baru"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={errors.confirmPassword}
                required
              />
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Ganti kata sandi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setErrors({});
                  }}
                  disabled={isLoading}
                >
                  Batalkan
                </Button>
              </div>
            </form>
          )}
        </Card>
        <Card className="mt-6 border-2 border-red-500/30">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Zona Berbahaya
            </h2>
            <p className="text-sm text-gray-400">
              Tindakan yang tidak dapat diubah dan bersifat merusak
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-900/10 rounded-lg border border-red-500/20">
            <div>
              <h3 className="font-medium text-white mb-1">Hapus Akun</h3>
              <p className="text-sm text-gray-400">
                Setelah akun kamu dihapus, tidak dapat dikembalikan lagi
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Hapus Akun
            </button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
