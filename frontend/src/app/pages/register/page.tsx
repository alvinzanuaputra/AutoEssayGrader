"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockRegister } from "@/lib/mockApi";
import { validateRegisterForm, checkPasswordStrength } from "@/lib/validation";
import { useAuthForm } from "@/hooks/useAuthForm";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import Alert from "../../components/Alert";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    formData,
    errors,
    isLoading,
    apiError,
    successMessage,
    handleChange,
    handleSubmit,
  } = useAuthForm({
    initialValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    validate: (values) =>
      validateRegisterForm(
        values.fullName,
        values.email,
        values.username,
        values.password,
        values.confirmPassword,
        values.acceptTerms
      ),
    onSubmit: async (values) =>
      mockRegister(
        values.fullName,
        values.email,
        values.username,
        values.password
      ),
    redirectPath: "/pages/login",
  });

  const passwordStrength = formData.password
    ? checkPasswordStrength(formData.password)
    : null;

  useEffect(() => {
    if (isAuthenticated) router.push("/pages/home");
  }, [isAuthenticated, router]);

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Alert type="error" message={apiError} />
        <Alert type="success" message={successMessage} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-6 py-3 bg-white dark:bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-colors"
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
          onChange={handleChange}
          error={errors.password}
          showStrength={true}
          strength={passwordStrength}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi Password"
          value={formData.confirmPassword}
          placeholder="konfirmasi password"
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Register
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
            Sudah punya akun?{" "}
          </span>
          <Link
            href="/pages/login"
            className="text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
          >
            Login di sini
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
