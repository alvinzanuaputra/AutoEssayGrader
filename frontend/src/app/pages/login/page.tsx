"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUser, getGoogleAuthUrl, getGithubAuthUrl } from "@/lib/api";
import AuthLayout from "../../components/AuthLayout";
import GuestRoute from "../../components/GuestRoute";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import Alert from "../../components/Alert";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginContent />
    </GuestRoute>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Handle OAuth callback
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Token dari OAuth callback
      toast.success("Login berhasil!");
      localStorage.setItem("token", token);
      setTimeout(() => {
        window.location.href = "/pages/home";
      }, 1500);
    }
  }, [searchParams]);

  // GuestRoute already handles redirect, no need for duplicate check

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Save auth data
      login(response.user, response.access_token, formData.rememberMe);

      // Show success toast
      toast.success("Login berhasil!", {
        duration: 1500,
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });

      // Redirect to home with refresh
      setTimeout(() => {
        window.location.href = "/pages/home";
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.message || "Login gagal";
      setApiError(errorMessage);
      toast.error(errorMessage, {
        duration: 3000,
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error: any) {
      toast.error("Gagal memulai login Google", {
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
    }
  };

  const handleGithubLogin = async () => {
    try {
      const authUrl = await getGithubAuthUrl();
      window.location.href = authUrl;
    } catch (error: any) {
      toast.error("Gagal memulai login GitHub", {
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
    }
  };

  return (
    <AuthLayout>
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Alert type="error" message={apiError} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-6 py-3 bg-white dark:bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-yellow-400 dark:focus:border-gray-400 transition-colors"
            required
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={formData.password}
          placeholder="kata sandi"
          onChange={handleChange}
          error={errors.password}
        />

        <div className="text-right">
          <Link
            href="#"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            Lupa Kata Sandi?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Login
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Atau login dengan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-200"
          >
            <FcGoogle className="w-5 h-5" />
            Google
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm border border-gray-700"
          >
            <FaGithub className="w-5 h-5" />
            GitHub
          </button>
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Belum punya akun?{" "}
          </span>
          <Link
            href="/pages/register"
            className="text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
          >
            Daftar di sini
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
