"use client";

import { useState } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Assalomu alaykum! Men sizning **«Sinab ko'r»** AI Karyera Maslahatchisiman. ✨\n\nMenga qiziqishlaringiz, sevimli fanlaringiz yoki kelajakda kim bo'lmoqchi ekanligingiz haqida ayting. Sizga eng mos kasb qutisini va 3 kunlik sinov rejasini tavsiya qilaman!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState("Google Gemini AI");

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
          if (data.model) {
            setActiveModel(data.model);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Kechirasiz, javob olishda xatolik yuz berdi.",
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Server bilan aloqa uzildi. Qaytadan urinib ko'ring.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tarmoqda nosozlik yuz berdi." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-amber-600 underline font-bold">$1</a>')
      .replace(/\n/g, "<br />");
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-amber-50/50 via-white to-stone-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">✨</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              ⚡ Google Gemini AI Faol
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
            AI Karyera Maslahatchisi
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
            Qiziqishlaringiz yoki ikkilanishlaringiz haqida yozing. AI sizga eng mos
            kasb to&apos;plamini tavsiya qiladi va 3 kunlik shaxsiy reja tuzib beradi.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chap panel: Tezkor savollar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                <span>⚡</span> Tezkor AI savollari
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => sendMessage("Menga qaysi kasb ko'proq mos keladi?")}
                  className="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-100 transition-all flex items-center gap-2"
                >
                  <span>🎯</span> Menga qaysi kasb mos?
                </button>
                <button
                  onClick={() =>
                    sendMessage(
                      "Dasturchilik to'plami ichida nimalar bor va 3 kunda nima o'rganaman?"
                    )
                  }
                  className="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-100 transition-all flex items-center gap-2"
                >
                  <span>💻</span> Dasturchilik to&apos;plami haqida
                </button>
                <button
                  onClick={() =>
                    sendMessage("Rasm chizish va dizaynga qiziqaman, menga maslahat bering")
                  }
                  className="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-100 transition-all flex items-center gap-2"
                >
                  <span>🎨</span> Dizaynerlik qutisi haqida
                </button>
                <button
                  onClick={() =>
                    sendMessage("Ota-onam boshqa kasbni xohlashyapti, nima qilsam bo'ladi?")
                  }
                  className="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-100 transition-all flex items-center gap-2"
                >
                  <span>👨‍👩‍👧</span> Ota-onalar bilan kelishish
                </button>
                <button
                  onClick={() => sendMessage("To'plamlar narxi va yetkazib berish qanday ishlaydi?")}
                  className="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-100 transition-all flex items-center gap-2"
                >
                  <span>📦</span> Narxlar va buyurtma tartibi
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-3xl text-white shadow-md">
              <div className="text-2xl mb-2">🎁</div>
              <h4 className="font-extrabold text-base mb-1">3 kunlik sinov qutilari</h4>
              <p className="text-xs text-amber-100 mb-4 leading-relaxed">
                Hech qanday oldindan to&apos;lovsiz, uyga yetkazib beriladi. Kasbni tanlashdan oldin amalda sinab ko&apos;ring!
              </p>
              <Link
                href="/kits"
                className="inline-flex items-center gap-2 text-xs font-bold bg-white text-stone-900 px-4 py-2.5 rounded-xl shadow-sm hover:bg-amber-50 transition-all"
              >
                To&apos;plamlar katalogi →
              </Link>
            </div>
          </div>

          {/* O'ng panel: Chat oynasi */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                      Sinab ko&apos;r AI Kouchi
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-stone-500">Model: {activeModel}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setMessages([
                      {
                        role: "assistant",
                        content:
                          "Assalomu alaykum! Suhbat tozalandi. Yangi savolingizni yozing! ✨",
                      },
                    ])
                  }
                  className="text-xs text-stone-400 hover:text-stone-600 font-semibold px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Tarixni tozalash
                </button>
              </div>

              {/* Messages list */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        🤖
                      </div>
                    )}
                    <div
                      className={`text-sm p-4 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none"
                          : "bg-stone-100 text-stone-800 rounded-tl-none"
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
                    />
                    {m.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-stone-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        👤
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      🤖
                    </div>
                    <div className="bg-stone-100 text-stone-400 text-sm p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-stone-100 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Masalan: Men kompyuterda o'tirishni va kod yozishni yaxshi ko'raman..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>{loading ? "O'ylanmoqda..." : "Yuborish"}</span>
                    <span>{loading ? "⏳" : "🚀"}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
