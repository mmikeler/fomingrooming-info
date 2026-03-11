"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail, VerifyEmailResult } from "./actions/verify-email";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [result, setResult] = useState<VerifyEmailResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const doVerify = async () => {
      if (!token) {
        if (!cancelled) {
          setResult({
            success: false,
            message: "Отсутствует токен подтверждения",
          });
          setLoading(false);
        }
        return;
      }

      const verificationResult = await verifyEmail(token);

      if (!cancelled) {
        setResult(verificationResult);
        setLoading(false);
      }
    };

    doVerify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Подтверждение email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {result?.success ? (
          <>
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Email подтвержден
            </h1>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Ошибка подтверждения
            </h1>
          </>
        )}

        <p className="mb-6 text-gray-600">{result?.message}</p>

        <Link
          href="/auth/signin"
          className="inline-block rounded-lg bg-blue-500 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-600"
        >
          Войти в систему
        </Link>
      </div>
    </div>
  );
}
