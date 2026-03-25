"use client";
import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Ocorreu um erro. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 rounded-xl shadow-lg w-full max-w-md text-center bg-white">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Email enviado!</h2>
          <p className="text-gray-600 text-sm">
            Se o email existir na nossa base de dados, receberás um link para redefinir a senha.
          </p>
          <Link href="/login" className="mt-6 inline-block text-blue-600 hover:underline text-sm">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Recuperar senha</h1>
        <p className="text-gray-600 text-sm mb-6">
          Insere o teu email e enviaremos um link para redefinires a senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teu@email.com"
              className="w-full px-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "A enviar..." : "Enviar link de recuperação"}
          </button>
        </form>

        <Link href="/login" className="mt-4 inline-block text-gray-500 hover:text-gray-700 text-sm">
          ← Voltar ao login
        </Link>
      </div>
    </div>
  );
}