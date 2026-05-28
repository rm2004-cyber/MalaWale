import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { feedbackService } from "../utils/service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feedback {
  _id: string;
  // API returns name directly at root (not nested in user object)
  name?: string;
  // Some variants may still nest it
  user?: { name?: string; phone?: string };
  message: string;
  createdAt: string;
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-stone-200" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-28 bg-stone-200 rounded-full" />
          <div className="h-3 w-20 bg-stone-100 rounded-full" />
        </div>
      </div>
      <div className="h-3 w-24 bg-stone-100 rounded-full" />
    </div>
    <div className="space-y-2 mt-4">
      <div className="h-3 w-full bg-stone-100 rounded-full" />
      <div className="h-3 w-5/6 bg-stone-100 rounded-full" />
      <div className="h-3 w-3/4 bg-stone-100 rounded-full" />
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    </div>
    <p className="text-stone-800 font-semibold text-base">No feedback yet</p>
    <p className="text-stone-400 text-sm mt-1">Customer feedback will appear here once submitted.</p>
  </div>
);

// ─── Feedback Card ────────────────────────────────────────────────────────────

const FeedbackCard = ({ feedback, index }: { feedback: Feedback; index: number }) => {
  // API returns name at root level; fallback to user.name for legacy shape
  const name = feedback.name?.trim() || feedback.user?.name?.trim() || "Anonymous";
  const phone = feedback.user?.phone?.trim() || null;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = new Date(feedback.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Cycle through subtle avatar bg colors
  const avatarColors = [
    "bg-amber-100 text-amber-700",
    "bg-stone-200 text-stone-700",
    "bg-orange-100 text-orange-700",
    "bg-yellow-100 text-yellow-700",
    "bg-red-100 text-red-700",
  ];
  const avatarColor = avatarColors[index % avatarColors.length];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm transition-all duration-200">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${avatarColor}`}>
            {initials}
          </div>
          {/* Name + phone */}
          <div className="min-w-0">
            <p className="text-stone-800 font-semibold text-sm leading-tight truncate">{name}</p>
            {phone && (
              <p className="text-stone-400 text-xs mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {phone}
              </p>
            )}
          </div>
        </div>

        {/* Date badge */}
        <span className="flex-shrink-0 text-xs text-stone-400 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
          {formattedDate}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-100 mb-4" />

      {/* Message */}
      <p className="text-stone-900 text-sm leading-relaxed whitespace-pre-wrap break-words">
        {feedback.message}
      </p>
    </div>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const FeedbackScreen = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const response = await feedbackService.getAllFeedbacks();
        if (response?.data?.success) {
          setFeedbacks(response.data.feedbacks || []);
        } else {
          setFeedbacks([]);
          toast.error("Failed to load feedback.");
        }
      } catch (err) {
        console.error("[FeedbackScreen] fetch error:", err);
        toast.error("Something went wrong while fetching feedback.");
        setFeedbacks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filtered = feedbacks.filter((f) => {
    const q = search.toLowerCase();
    return (
      !q ||
      f.name?.toLowerCase().includes(q) ||
      f.user?.name?.toLowerCase().includes(q) ||
      f.user?.phone?.includes(q) ||
      f.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-stone-50 min-h-screen p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Customer Feedback</h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {isLoading ? "Loading…" : `${feedbacks.length} submission${feedbacks.length !== 1 ? "s" : ""} received`}
            </p>
          </div>

          {/* Search */}
          {!isLoading && feedbacks.length > 0 && (
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, message…"
                className="pl-9 pr-4 py-2 text-sm text-stone-800 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition w-64 placeholder:text-stone-400"
              />
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        {!isLoading && feedbacks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Feedback", value: feedbacks.length },
              {
                label: "This Month",
                value: feedbacks.filter((f) => {
                  const d = new Date(f.createdAt);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length,
              },
              {
                label: "With Contact",
                value: feedbacks.filter((f) => f.user?.phone).length,
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
                <p className="text-stone-500 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-stone-900 text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200">
            <EmptyState />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((feedback, i) => (
              <FeedbackCard key={feedback._id} feedback={feedback} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default FeedbackScreen;