"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockLogin } from "@/lib/mockApi";
import { validateLoginForm } from "@/lib/validation";
import { useAuthForm } from "@/hooks/useAuthForm";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import Alert from "../../components/Alert";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const { formData, errors, isLoading, apiError, handleChange, handleSubmit } =
    useAuthForm({
      initialValues: { emailOrUsername: "", password: "", rememberMe: false },
      validate: (values) =>
        validateLoginForm(values.emailOrUsername, values.password),
      onSubmit: async (values) => {
        const response = await mockLogin(
          values.emailOrUsername,
          values.password
        );
        if (response.success && response.data) {
          login(response.data.user, response.data.token, values.rememberMe);
          router.push("/pages/home");
        }
        return response;
      },
    });

  useEffect(() => {
    if (isAuthenticated) router.push("/pages/home");
  }, [isAuthenticated, router]);

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Alert type="error" message={apiError} />

        <div>
          <label
            htmlFor="emailOrUsername"
            className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            id="emailOrUsername"
            name="emailOrUsername"
            type="text"
            placeholder="nama pengguna"
            value={formData.emailOrUsername}
            onChange={handleChange}
            className="w-full px-6 py-3 bg-white dark:bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-yellow-400 dark:focus:border-gray-400 transition-colors"
            required
          />
          {errors.emailOrUsername && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.emailOrUsername}
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

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-200"
          >
            <FcGoogle className="w-5 h-5" />
            Google
          </button>
          <button
            type="button"
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
