"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockSubmitEssay, mockGetGradingCriteria } from "@/lib/mockApi";
import { validateGradingForm } from "@/lib/validation";
import { GradingCriteria } from "@/types";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Textarea from "../../../components/Textarea";
import Button from "../../../components/Button";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { HiCloudUpload, HiCheckCircle } from "react-icons/hi";

export default function NewGradingPage() {
  return (
    <ProtectedRoute>
      <NewGradingContent />
    </ProtectedRoute>
  );
}

function NewGradingContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    content: "",
    criteria: [] as string[],
    file: null as File | null,
  });

  const [availableCriteria, setAvailableCriteria] = useState<GradingCriteria[]>(
    []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(true);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const response = await mockGetGradingCriteria();
        if (response.success && response.data) {
          setAvailableCriteria(response.data);
        }
      } catch (error) {
        console.error("Error fetching criteria:", error);
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    fetchCriteria();
  }, []);

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
    if (apiError) setApiError("");
  };

  const handleCriteriaChange = (criteriaId: string) => {
    setFormData((prev) => {
      const newCriteria = prev.criteria.includes(criteriaId)
        ? prev.criteria.filter((id) => id !== criteriaId)
        : [...prev.criteria, criteriaId];
      return { ...prev, criteria: newCriteria };
    });
    if (errors.criteria) {
      setErrors((prev) => ({ ...prev, criteria: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    const validation = validateGradingForm(
      formData.title,
      formData.topic,
      formData.content,
      formData.criteria
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await mockSubmitEssay(
        formData.title,
        formData.topic,
        formData.content,
        formData.criteria
      );

      if (response.success && response.data) {
        setSuccessMessage(response.message || "Esai berhasil dikirim!");
        setTimeout(() => {
          router.push("/pages/home");
        }, 2000);
      } else {
        setApiError(
          response.error || "Failed to submit essay. Please try again."
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/pages/home");
  };

  if (isLoadingCriteria) {
    return (
      <div className="min-h-screen flex flex-col bg-[#2b2d31] dark:bg-[#2b2d31] bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Memuat..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#2b2d31] dark:bg-[#2b2d31] bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white dark:text-white text-gray-900 mb-2">
            Submit Essay for Grading
          </h1>
          <p className="text-gray-300 dark:text-gray-300 text-gray-600">
            Fill in the details below and submit your essay for automated
            grading
          </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {apiError && (
              <div className="bg-red-900/30 dark:bg-red-900/30 bg-red-100 border border-red-500 dark:border-red-500 border-red-400 text-red-300 dark:text-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-900/30 dark:bg-green-900/30 bg-green-100 border border-green-500 dark:border-green-500 border-green-400 text-green-300 dark:text-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            <Input
              id="title"
              name="title"
              type="text"
              label="Essay Title"
              placeholder="Enter essay title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />
            <Input
              id="topic"
              name="topic"
              type="text"
              label="Topic/Subject"
              placeholder="e.g., Technology, Education, Environment"
              value={formData.topic}
              onChange={handleChange}
              error={errors.topic}
              required
            />
            <div>
              <label className="block text-sm font-medium text-white dark:text-white text-gray-900 mb-3">
                Grading Criteria <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableCriteria.map((criterion) => (
                  <label
                    key={criterion.id}
                    className={`
                      flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors
                      ${
                        formData.criteria.includes(criterion.id)
                          ? "border-blue-500 dark:border-blue-400 bg-blue-900/20 dark:bg-blue-900/20 bg-blue-50"
                          : "border-gray-600 dark:border-gray-600 border-gray-200 hover:border-blue-400 dark:hover:border-blue-400 hover:border-blue-300"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.criteria.includes(criterion.id)}
                      onChange={() => handleCriteriaChange(criterion.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white dark:text-white text-gray-900">
                        {criterion.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400 text-gray-500 mt-1">
                        {criterion.description}
                      </p>
                      <p className="text-xs text-blue-400 dark:text-blue-400 text-blue-600 mt-1">
                        Weight: {criterion.weight}%
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.criteria && (
                <p className="mt-2 text-sm text-red-400 dark:text-red-400 text-red-600">
                  {errors.criteria}
                </p>
              )}
            </div>
            <Textarea
              id="content"
              name="content"
              label="Essay Content"
              placeholder="Paste or type your essay here..."
              value={formData.content}
              onChange={handleChange}
              error={errors.content}
              required
              rows={12}
              showCharCount
              maxLength={10000}
              helperText="Minimum 100 characters"
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Unggah File (Opsional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <HiCloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Pilih File
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                {formData.file && (
                  <p className="mt-2 text-sm text-gray-300 dark:text-gray-300 text-gray-600">
                    Dipilih: {formData.file.name}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-400 text-gray-500">
                  Format yang didukung: TXT, DOC, DOCX, PDF (Maks 100MB)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
              >
                <HiCheckCircle className="w-5 h-5 mr-2" />
                Kirim untuk Dinilai
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
