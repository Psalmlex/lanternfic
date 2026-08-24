import React, { useState, useMemo, useRef, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Search, Flame, BookOpen, ChevronLeft, ChevronRight, Bookmark, Star, Clock, List, X, Sun, Moon, Type, Minus, Plus, User, Award, BookMarked, Bell, HelpCircle, LogOut, ChevronRight as ChevronRightIcon, PenSquare, Trash2, Send, Eye, Heart, FileText, Check, Wallet as WalletIcon, DollarSign, Gift, Lock, Unlock, Share2, PlayCircle, TrendingUp, ArrowDownToLine, ShieldCheck, Flag, Users, BarChart3, Ban, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useLocalStorageState } from "./hooks.js";
import { SEED_USERS, findUserByEmail } from "./auth.js";

/* ---------------------------------------------------------
   MOCK DATA
--------------------------------------------------------- */

const GENRES = ["Fantasy", "Xianxia", "LitRPG", "Romance", "Sci-Fi", "Mystery"];

const NOVEL_SEED = [
  {
    id: "n1",
    title: "The Sword That Remembers",
    author: "Wren Castellan",
    genre: "Fantasy",
    cover: "#7C5CBF",
    coverAccent: "#F0C869",
    synopsis:
      "A blade forged from a dead god's spine chooses a new wielder every generation — and it never forgets what the last one did wrong. Kess didn't want the sword. The sword doesn't care.",
    rating: 4.8,
    reads: "2.4M",
    status: "Ongoing",
    chapters: 142,
    updated: "3h ago",
  },
  {
    id: "n2",
    title: "Nine Lives of the Ashfall Sect",
    author: "Bo Lian",
    genre: "Xianxia",
    cover: "#B5482F",
    coverAccent: "#F3ECDD",
    synopsis:
      "Reincarnated for the ninth time with all his memories intact, Ash Wen is done climbing the slow way. Problem is, the mountain remembers him too — and it's still angry.",
    rating: 4.6,
    reads: "5.1M",
    status: "Ongoing",
    chapters: 389,
    updated: "1h ago",
  },
  {
    id: "n3",
    title: "Respawn Protocol",
    author: "Iris Voss",
    genre: "LitRPG",
    cover: "#2E7D6B",
    coverAccent: "#D4A24C",
    synopsis:
      "Every death levels up her stats. Every level costs her a memory. Mara is running out of things she remembers about the world she's trying to save.",
    rating: 4.7,
    reads: "1.8M",
    status: "Ongoing",
    chapters: 96,
    updated: "6h ago",
  },
  {
    id: "n4",
    title: "The Cartographer's Wife",
    author: "Delphine Roux",
    genre: "Romance",
    cover: "#A64D6B",
    coverAccent: "#F3ECDD",
    synopsis:
      "He maps coastlines that don't exist yet. She's the only person who can see them too. A slow-burn romance across a decade of impossible geography.",
    rating: 4.9,
    reads: "3.6M",
    status: "Completed",
    chapters: 214,
    updated: "2d ago",
  },
  {
    id: "n5",
    title: "Signal From the Long Dark",
    author: "Toma Achebe",
    genre: "Sci-Fi",
    cover: "#3B4B7C",
    coverAccent: "#8ED6D0",
    synopsis:
      "A relay station on the edge of the system picks up a transmission in a language humanity hasn't invented yet. It's addressed to someone on the crew, by name.",
    rating: 4.5,
    reads: "980K",
    status: "Ongoing",
    chapters: 61,
    updated: "12h ago",
  },
  {
    id: "n6",
    title: "The Thirteenth Alibi",
    author: "Priya Nandakumar",
    genre: "Mystery",
    cover: "#4A4A4A",
    coverAccent: "#D4A24C",
    synopsis:
      "Twelve suspects, twelve airtight alibis. The detective's problem is that she's starting to believe all twelve of them — and none of them are telling the truth.",
    rating: 4.7,
    reads: "1.2M",
    status: "Ongoing",
    chapters: 58,
    updated: "5h ago",
  },
];

const CHAPTER_TITLES = [
  "The Weight of an Unclaimed Blade",
  "What the Ash Remembers",
  "A Debt Paid in Silence",
  "The Ninth Door",
  "Where the Light Doesn't Reach",
  "A Name Spoken Backward",
  "The Last Honest Room",
  "Something Older Than Fear",
];

function genChapters(novel) {
  return Array.from({ length: Math.min(novel.chapters, 24) }, (_, i) => ({
    num: i + 1,
    title: CHAPTER_TITLES[i % CHAPTER_TITLES.length] + (i >= CHAPTER_TITLES.length ? ` (${i + 1})` : ""),
    words: 1800 + ((i * 137) % 900),
    premium: i >= 5,
    price: 99,
  }));
}

const PARAGRAPHS = [
  "The lantern had burned low by the time she noticed the sword was watching her again. Not with eyes — it had none — but with that particular stillness that meant it was remembering something, and whatever it remembered was about her.",
  "\u201cYou could just tell me,\u201d she said to it, not for the first time. Steel doesn't answer. It never has. But sometimes, in the hour before dawn, she could swear the hilt warmed under her palm like something trying to agree.",
  "Outside, the camp had gone quiet in the particular way that meant everyone was pretending to sleep. She knew that quiet. She'd worn it herself, plenty of nights, back when the sword was someone else's problem.",
  "The fire had burned down to a single stubborn coal, and by its light she could just make out the old nicks along the blade — each one a story the sword refused to tell her, in a language made entirely of consequence.",
  "She thought about the man who'd carried it before her. Thought about the choice he'd made, the one that put the sword back in the ground and put her name in its place. It hadn't been a fair trade. Nothing about this ever was.",
  "Somewhere past the treeline, something that was not the wind moved through the dark, unhurried, patient, the way old things move when they know exactly how much time they have left to spend.",
  "She stood. The sword came with her, the way it always did now, less a weapon than a second spine. \u201cFine,\u201d she said, to the dark, to the coal, to the blade. \u201cShow me, then. Show me what he did.\u201d",
  "And for the first time in three hundred years, it did.",
];

const DRAFT_SAMPLE = `The orchard hadn't grown anything but glass for eleven years, and still old Ren came out every morning to check the branches for fruit.

Nobody in the valley remembered planting it. Nobody remembered a time before it either — which was the sort of detail people mentioned once, uneasily, and then agreed never to bring up again.`;

const initialAuthorWorks = [
  {
    id: "w1",
    title: "The Glass Orchard",
    cover: "#5C7C5C",
    coverAccent: "#F0C869",
    genre: "Fantasy",
    status: "Ongoing",
    views: "142K",
    likes: 3200,
    chapters: [
      { id: 1, title: "Roots", body: DRAFT_SAMPLE, status: "published", words: 1840 },
      { id: 2, title: "Graft", body: "The second cut always heals stranger than the first.", status: "draft", words: 620 },
    ],
    earnings: { adShare: 214.32, tips: 58.0, premiumSales: 96.5 },
  },
  {
    id: "w2",
    title: "Static Between Stations",
    cover: "#3B4B7C",
    coverAccent: "#8ED6D0",
    genre: "Sci-Fi",
    status: "Ongoing",
    views: "38K",
    likes: 890,
    chapters: [{ id: 1, title: "Dead Air", body: "", status: "draft", words: 0 }],
    earnings: { adShare: 41.1, tips: 12.0, premiumSales: 0 },
  },
];

const initialWallet = {
  readerPoints: 240,
  transactions: [
    { id: 1, label: "Watched a rewarded ad", amount: 5, type: "earn" },
    { id: 2, label: "Referral bonus \u2014 @kofi_reads joined", amount: 200, type: "earn" },
    { id: 3, label: "Unlocked Ch. 6 \u2014 The Sword That Remembers", amount: -99, type: "spend" },
  ],
  adsWatchedToday: 2,
  adsDailyLimit: 5,
  referralCode: "MARIN-J82K",
  referralCount: 3,
  referralPoints: 600,
};

const initialAdminUsers = [
  { id: "u1", name: "Marín Osei", handle: "@marin.reads", role: "Reader & Writer", status: "active", joined: "Mar 2024", isAdmin: true },
  { id: "u2", name: "Kofi Boateng", handle: "@kofi_reads", role: "Reader", status: "active", joined: "Jan 2025", isAdmin: false },
  { id: "u3", name: "Priya Nandakumar", handle: "@priya_writes", role: "Writer", status: "active", joined: "Jun 2023", isAdmin: false },
  { id: "u4", name: "Devon Marsh", handle: "@devonm", role: "Reader", status: "suspended", joined: "Feb 2026", isAdmin: false },
  { id: "u5", name: "Lian Zhao", handle: "@lianz", role: "Writer", status: "active", joined: "Sep 2024", isAdmin: false },
];

const initialFlags = [
  {
    id: "f1",
    type: "Chapter",
    title: "Ch. 14 \u2014 The Cartographer's Wife",
    reason: "Reported for plagiarism claim",
    reporter: "@lianz",
    status: "pending",
  },
  {
    id: "f2",
    type: "Comment",
    title: "Comment on Nine Lives of the Ashfall Sect",
    reason: "Reported for harassment",
    reporter: "@kofi_reads",
    status: "pending",
  },
  {
    id: "f3",
    type: "Story",
    title: "Signal From the Long Dark",
    reason: "Reported for copyright concern",
    reporter: "@priya_writes",
    status: "pending",
  },
];

const initialPayoutRequests = [
  { id: "p1", user: "Priya Nandakumar", handle: "@priya_writes", amount: 214.5, method: "PayPal", status: "pending" },
  { id: "p2", user: "Lian Zhao", handle: "@lianz", amount: 96.2, method: "Bank transfer", status: "pending" },
  { id: "p3", user: "Marín Osei", handle: "@marin.reads", amount: 8.4, method: "PayPal", status: "pending" },
];

function wordCount(text) {
  const t = text.trim();
  return t === "" ? 0 : t.split(/\s+/).length;
}

/* ---------------------------------------------------------
   SHARED UI PRIMITIVES
--------------------------------------------------------- */

function StatusPill({ status }) {
  const ongoing = status === "Ongoing";
  return (
    <span
      style={{
        fontSize: 10,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 999,
        fontWeight: 600,
        background: ongoing ? "rgba(212,162,76,0.15)" : "rgba(139,133,163,0.15)",
        color: ongoing ? "#D4A24C" : "#8B85A3",
        border: `1px solid ${ongoing ? "rgba(212,162,76,0.35)" : "rgba(139,133,163,0.3)"}`,
      }}
    >
      {status}
    </span>
  );
}

function Cover({ novel, w = 64, h = 88 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(160deg, ${novel.cover} 0%, ${novel.cover}CC 60%, #14121F 130%)`,
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 30% 20%, ${novel.coverAccent}55, transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: 6,
          right: 6,
          fontFamily: "'Fraunces', serif",
          fontSize: w > 56 ? 11 : 9,
          lineHeight: 1.15,
          color: "#F3ECDD",
          fontWeight: 600,
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}
      >
        {novel.title.split(" ").slice(0, 4).join(" ")}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   DISCOVER (HOME) VIEW
--------------------------------------------------------- */

function Discover({ novels, onOpenNovel, library, toggleLibrary }) {
  const [genre, setGenre] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return novels.filter((n) => {
      const matchesGenre = genre === "All" || n.genre === genre;
      const matchesQuery =
        query.trim() === "" ||
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.author.toLowerCase().includes(query.toLowerCase());
      return matchesGenre && matchesQuery;
    });
  }, [genre, query, novels]);

  const trending = [...novels].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header / hero */}
      <div
        style={{
          padding: "20px 18px 22px",
          background:
            "radial-gradient(120% 100% at 15% 0%, #2A2245 0%, #14121F 55%)",
          borderBottom: "1px solid rgba(212,162,76,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Flame size={20} color="#D4A24C" strokeWidth={2.2} />
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#F3ECDD",
              letterSpacing: "-0.01em",
            }}
          >
            Lanternfic
          </span>
        </div>
        <p style={{ color: "#8B85A3", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
          One chapter left burning. Pick a story and stay up too late.
        </p>

        {/* search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <Search size={16} color="#8B85A3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#F3ECDD",
              fontSize: 14,
              width: "100%",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
      </div>

      {/* genre chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "14px 18px 4px",
          scrollbarWidth: "none",
        }}
      >
        {["All", ...GENRES].map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              border: genre === g ? "1px solid #D4A24C" : "1px solid rgba(255,255,255,0.12)",
              background: genre === g ? "rgba(212,162,76,0.15)" : "transparent",
              color: genre === g ? "#D4A24C" : "#B4AECB",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* trending rail */}
      {genre === "All" && query === "" && (
        <div style={{ padding: "18px 18px 4px" }}>
          <SectionLabel icon={<Flame size={13} color="#D4A24C" />} text="Trending tonight" />
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
            {trending.map((n) => (
              <div
                key={n.id}
                onClick={() => onOpenNovel(n)}
                style={{ cursor: "pointer", width: 96, flexShrink: 0 }}
              >
                <Cover novel={n} w={96} h={132} />
                <div style={{ fontSize: 11, color: "#F3ECDD", marginTop: 6, fontWeight: 500, lineHeight: 1.3 }}>
                  {n.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                  <Star size={10} color="#D4A24C" fill="#D4A24C" />
                  <span style={{ fontSize: 10.5, color: "#8B85A3" }}>{n.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* full list */}
      <div style={{ padding: "18px 18px 0" }}>
        <SectionLabel icon={<BookOpen size={13} color="#D4A24C" />} text={genre === "All" ? "All stories" : genre} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => onOpenNovel(n)}
              style={{
                display: "flex",
                gap: 12,
                cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Cover novel={n} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 15,
                    color: "#F3ECDD",
                    fontWeight: 600,
                    marginBottom: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.title}
                </div>
                <div style={{ fontSize: 11.5, color: "#8B85A3", marginBottom: 6 }}>by {n.author}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <StatusPill status={n.status} />
                  <span style={{ fontSize: 11, color: "#8B85A3", display: "flex", alignItems: "center", gap: 3 }}>
                    <Star size={11} color="#D4A24C" fill="#D4A24C" /> {n.rating}
                  </span>
                  <span style={{ fontSize: 11, color: "#8B85A3" }}>{n.reads} reads</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLibrary(n.id);
                }}
                aria-label={library.includes(n.id) ? "Remove from library" : "Add to library"}
                style={{
                  alignSelf: "flex-start",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <Bookmark
                  size={18}
                  color={library.includes(n.id) ? "#D4A24C" : "#5A5470"}
                  fill={library.includes(n.id) ? "#D4A24C" : "none"}
                />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ color: "#8B85A3", fontSize: 13, padding: "20px 4px", textAlign: "center" }}>
              Nothing matches yet. Try a different search or genre.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      {icon}
      <span
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#B4AECB",
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {text}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------
   NOVEL DETAIL VIEW
--------------------------------------------------------- */

function NovelDetail({ novel, onBack, onReadChapter, library, toggleLibrary, progress, unlockedChapters, onOpenTip }) {
  const chapters = useMemo(() => genChapters(novel), [novel]);
  const lastRead = progress[novel.id];
  const unlocked = unlockedChapters[novel.id] || [];

  return (
    <div style={{ paddingBottom: 40 }}>
      <div
        style={{
          padding: "16px 18px 24px",
          background: `linear-gradient(180deg, ${novel.cover}55 0%, #14121F 85%)`,
        }}
      >
        <button onClick={onBack} style={backBtnStyle}>
          <ChevronLeft size={18} color="#F3ECDD" />
        </button>
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          <Cover novel={novel} w={92} h={128} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 20,
                color: "#F3ECDD",
                margin: "0 0 4px",
                lineHeight: 1.2,
              }}
            >
              {novel.title}
            </h1>
            <div style={{ fontSize: 12.5, color: "#B4AECB", marginBottom: 8 }}>by {novel.author}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <StatusPill status={novel.status} />
              <span style={{ fontSize: 11, color: "#8B85A3", display: "flex", alignItems: "center", gap: 3 }}>
                <Star size={11} color="#D4A24C" fill="#D4A24C" /> {novel.rating}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "#8B85A3" }}>
              {novel.chapters} chapters &middot; {novel.reads} reads &middot; updated {novel.updated}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: "#D9D4E8", lineHeight: 1.6, marginTop: 16 }}>{novel.synopsis}</p>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={() => onReadChapter(novel, chapters[lastRead ? Math.min(lastRead, chapters.length - 1) : 0])}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#D4A24C",
              color: "#14121F",
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <BookOpen size={16} />
            {lastRead ? `Continue Ch. ${lastRead + 1}` : "Start Reading"}
          </button>
          <button
            onClick={() => toggleLibrary(novel.id)}
            style={{
              width: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <Bookmark
              size={18}
              color={library.includes(novel.id) ? "#D4A24C" : "#B4AECB"}
              fill={library.includes(novel.id) ? "#D4A24C" : "none"}
            />
          </button>
          <button
            onClick={() => onOpenTip(novel)}
            style={{
              width: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(212,162,76,0.12)",
              border: "1px solid rgba(212,162,76,0.3)",
              borderRadius: 10,
              cursor: "pointer",
            }}
            aria-label="Tip the author"
          >
            <Gift size={18} color="#D4A24C" />
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 18px 0" }}>
        <SectionLabel icon={<List size={13} color="#D4A24C" />} text={`Chapters (${chapters.length} of ${novel.chapters})`} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {chapters.map((c, i) => {
            const isRead = lastRead !== undefined && i <= lastRead;
            const isLocked = c.premium && !unlocked.includes(c.num);
            return (
              <button
                key={c.num}
                onClick={() => onReadChapter(novel, c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  padding: "12px 2px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  {isLocked && <Lock size={12} color="#D4A24C" style={{ flexShrink: 0 }} />}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: "'Inter', sans-serif",
                        color: isRead ? "#726C8C" : "#F3ECDD",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Ch. {c.num} &middot; {c.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#5A5470", marginTop: 2 }}>{c.words} words</div>
                  </div>
                </div>
                {isLocked ? (
                  <span style={{ fontSize: 11, color: "#D4A24C", fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                    {c.price} pts
                  </span>
                ) : isRead ? (
                  <span style={{ fontSize: 10, color: "#5A5470", flexShrink: 0, marginLeft: 8 }}>read</span>
                ) : (
                  <ChevronRight size={15} color="#5A5470" style={{ flexShrink: 0, marginLeft: 8 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const backBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
};

/* ---------------------------------------------------------
   READER VIEW
--------------------------------------------------------- */

function Reader({ novel, chapter, chapters, onBack, onChangeChapter, markRead, isLocked, walletBalance, onUnlock, preferences, setPreferences, isAuthenticated, onGoToLogin }) {
  const [fontSize, setFontSize] = useState(preferences?.defaultFontSize ?? 17);
  const [night, setNight] = useState(preferences?.defaultNight ?? false);
  const scrollRef = useRef(null);

  const idx = chapters.findIndex((c) => c.num === chapter.num);
  const hasPrev = idx > 0;
  const hasNext = idx < chapters.length - 1;

  useEffect(() => {
    if (!isLocked && isAuthenticated) markRead(novel.id, idx);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [chapter.num, isLocked, isAuthenticated]);

  // Remember the reader's latest font size / night mode choice as their default for next time
  useEffect(() => {
    if (setPreferences) {
      setPreferences((p) => ({ ...p, defaultFontSize: fontSize, defaultNight: night }));
    }
  }, [fontSize, night]);

  const paperBg = night ? "#1A1826" : "#F3ECDD";
  const paperText = night ? "#D9D4E8" : "#2B2440";
  const paperMuted = night ? "#726C8C" : "#8B7F6B";

  if (!isAuthenticated) {
    return (
      <div style={{ background: paperBg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 14px",
            borderBottom: `1px solid ${night ? "rgba(255,255,255,0.08)" : "rgba(43,36,64,0.1)"}`,
          }}
        >
          <button onClick={onBack} style={{ ...backBtnStyle, background: "transparent", border: "none" }}>
            <ChevronLeft size={20} color={paperText} />
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(212,162,76,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Lock size={22} color="#D4A24C" />
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: paperText, marginBottom: 8 }}>
            Sign in to keep reading
          </div>
          <p style={{ fontSize: 13, color: paperMuted, lineHeight: 1.6, marginBottom: 20, maxWidth: 280 }}>
            Create a free account to read {novel.title} and every other story on Lanternfic.
          </p>
          <button
            onClick={onGoToLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#D4A24C",
              color: "#14121F",
              border: "none",
              borderRadius: 10,
              padding: "12px 26px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sign in / Sign up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: paperBg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: `1px solid ${night ? "rgba(255,255,255,0.08)" : "rgba(43,36,64,0.1)"}`,
          position: "sticky",
          top: 0,
          background: paperBg,
          zIndex: 5,
        }}
      >
        <button onClick={onBack} style={{ ...backBtnStyle, background: "transparent", border: "none" }}>
          <ChevronLeft size={20} color={paperText} />
        </button>
        <div style={{ textAlign: "center", flex: 1, minWidth: 0, padding: "0 8px" }}>
          <div
            style={{
              fontSize: 11.5,
              color: paperMuted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {novel.title}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setFontSize((s) => Math.max(14, s - 1))}
            style={iconBtnStyle}
            aria-label="Decrease text size"
          >
            <Minus size={14} color={paperText} />
          </button>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            style={iconBtnStyle}
            aria-label="Increase text size"
          >
            <Plus size={14} color={paperText} />
          </button>
          <button onClick={() => setNight((n) => !n)} style={iconBtnStyle} aria-label="Toggle night mode">
            {night ? <Sun size={15} color={paperText} /> : <Moon size={15} color={paperText} />}
          </button>
        </div>
      </div>

      {/* chapter content */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px 20px 40px" }}>
        <div style={{ fontSize: 11, color: "#D4A24C", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>
          CHAPTER {chapter.num}
        </div>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 22,
            color: paperText,
            margin: "0 0 20px",
            lineHeight: 1.3,
          }}
        >
          {chapter.title}
        </h2>
        {isLocked ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "36px 16px",
              border: `1px dashed ${night ? "rgba(255,255,255,0.15)" : "rgba(43,36,64,0.18)"}`,
              borderRadius: 14,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(212,162,76,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Lock size={20} color="#D4A24C" />
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: paperText, marginBottom: 6 }}>
              This is a premium chapter
            </div>
            <p style={{ fontSize: 12.5, color: paperMuted, lineHeight: 1.6, marginBottom: 18, maxWidth: 280 }}>
              Unlocking spends points from your wallet. Your points balance: {walletBalance} pts.
            </p>
            <button
              onClick={() => onUnlock(novel, chapter)}
              disabled={walletBalance < chapter.price}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#D4A24C",
                color: "#14121F",
                border: "none",
                borderRadius: 10,
                padding: "11px 20px",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                opacity: walletBalance < chapter.price ? 0.45 : 1,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Unlock size={15} /> Unlock for {chapter.price} pts
            </button>
            {walletBalance < chapter.price && (
              <div style={{ fontSize: 11, color: "#D98B76", marginTop: 10 }}>
                Not enough points — earn more from Profile, or watch a rewarded ad.
              </div>
            )}
          </div>
        ) : (
          <>
            {PARAGRAPHS.map((p, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'Source Serif 4', 'Georgia', serif",
                  fontSize,
                  lineHeight: 1.75,
                  color: paperText,
                  marginBottom: 18,
                }}
              >
                {p}
              </p>
            ))}
            <div style={{ fontSize: 12, color: paperMuted, textAlign: "center", marginTop: 20, fontStyle: "italic" }}>
              — end of chapter {chapter.num} —
            </div>
          </>
        )}
      </div>

      {/* nav footer */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 16px",
          borderTop: `1px solid ${night ? "rgba(255,255,255,0.08)" : "rgba(43,36,64,0.1)"}`,
          background: paperBg,
        }}
      >
        <button
          disabled={!hasPrev}
          onClick={() => hasPrev && onChangeChapter(chapters[idx - 1])}
          style={{ ...navBtnStyle(night), opacity: hasPrev ? 1 : 0.35 }}
        >
          <ChevronLeft size={15} /> Prev
        </button>
        <button
          disabled={!hasNext}
          onClick={() => hasNext && onChangeChapter(chapters[idx + 1])}
          style={{ ...navBtnStyle(night, true), opacity: hasNext ? 1 : 0.35 }}
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: 999,
  border: "none",
  background: "rgba(120,110,150,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

function navBtnStyle(night, primary) {
  return {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "11px 0",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    background: primary ? "#D4A24C" : night ? "rgba(255,255,255,0.08)" : "rgba(43,36,64,0.08)",
    color: primary ? "#14121F" : night ? "#D9D4E8" : "#2B2440",
  };
}

/* ---------------------------------------------------------
   LIBRARY VIEW
--------------------------------------------------------- */

function Library({ allNovels, library, onOpenNovel, progress }) {
  const novels = allNovels.filter((n) => library.includes(n.id));
  return (
    <div style={{ padding: "20px 18px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Bookmark size={18} color="#D4A24C" />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F3ECDD", margin: 0 }}>Your Library</h1>
      </div>
      <p style={{ fontSize: 12.5, color: "#8B85A3", margin: "4px 0 20px" }}>
        {novels.length === 0 ? "Nothing saved yet." : `${novels.length} story${novels.length > 1 ? "ies" : ""} saved`}
      </p>
      {novels.length === 0 && (
        <div
          style={{
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "28px 16px",
            textAlign: "center",
            color: "#726C8C",
            fontSize: 13,
          }}
        >
          Tap the bookmark icon on any story to keep it here.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {novels.map((n) => {
          const p = progress[n.id];
          return (
            <div
              key={n.id}
              onClick={() => onOpenNovel(n)}
              style={{
                display: "flex",
                gap: 12,
                cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Cover novel={n} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14.5, color: "#F3ECDD", fontWeight: 600 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 11.5, color: "#8B85A3", margin: "3px 0 8px" }}>by {n.author}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#D4A24C" }}>
                  <Clock size={11} />
                  {p !== undefined ? `Continue Ch. ${p + 1}` : "Not started"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PROFILE VIEW
--------------------------------------------------------- */

const BADGES = [
  { icon: Flame, label: "7-day streak", color: "#D4A24C" },
  { icon: BookMarked, label: "Completionist", color: "#8ED6D0" },
  { icon: Moon, label: "Night Owl", color: "#B5A0E8" },
];

function StatBlock({ value, label }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F3ECDD", fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "#8B85A3", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ToggleSwitch({ on, onClick }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        border: "none",
        background: on ? "#D4A24C" : "rgba(255,255,255,0.15)",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        padding: 0,
      }}
      aria-pressed={on}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#14121F",
          transition: "left 0.15s ease",
        }}
      />
    </button>
  );
}

function SettingsRow({ icon: Icon, label, sublabel, last, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.06)",
        padding: "13px 2px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "rgba(212,162,76,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color="#D4A24C" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: "#F3ECDD", fontWeight: 500 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: "#8B85A3", marginTop: 1 }}>{sublabel}</div>}
      </div>
      <ChevronRightIcon size={16} color="#5A5470" />
    </button>
  );
}

function Profile({ currentUser, onSignOut, onGoToLogin, library, progress, wallet, onOpenWallet, onOpenAdmin, preferences, setPreferences }) {
  const chaptersRead = Object.values(progress).reduce((sum, idx) => sum + idx + 1, 0);
  const [prefsOpen, setPrefsOpen] = useState(false);

  if (!currentUser) {
    return (
      <div style={{ padding: "24px 18px 100px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 80 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(212,162,76,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <User size={24} color="#D4A24C" />
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#F3ECDD", marginBottom: 6 }}>
          Sign in to see your profile
        </div>
        <p style={{ fontSize: 13, color: "#8B85A3", lineHeight: 1.6, marginBottom: 20, maxWidth: 260 }}>
          Track your reading, manage your wallet, and access your account settings.
        </p>
        <button
          onClick={onGoToLogin}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#D4A24C",
            color: "#14121F",
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 18px 100px" }}>
      {/* identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(160deg, #D4A24C 0%, #B5482F 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(212,162,76,0.25)",
          }}
        >
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#14121F" }}>
            {currentUser.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#F3ECDD", fontWeight: 600 }}>
            {currentUser.name}
          </div>
          <div style={{ fontSize: 12, color: "#8B85A3", marginTop: 2 }}>{currentUser.email}</div>
          {currentUser.isAdmin && (
            <div style={{ fontSize: 10.5, color: "#D4A24C", marginTop: 3, fontWeight: 700 }}>ADMIN ACCOUNT</div>
          )}
        </div>
      </div>

      {/* wallet summary */}
      <button
        onClick={onOpenWallet}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          background: "linear-gradient(160deg, rgba(212,162,76,0.16), rgba(212,162,76,0.03))",
          border: "1px solid rgba(212,162,76,0.3)",
          borderRadius: 12,
          padding: "13px 14px",
          marginBottom: 22,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "rgba(212,162,76,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <WalletIcon size={16} color="#D4A24C" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "#F3ECDD", fontWeight: 600 }}>Wallet</div>
          <div style={{ fontSize: 11, color: "#8B85A3", marginTop: 1 }}>{wallet.readerPoints} pts</div>
        </div>
        <ChevronRightIcon size={16} color="#D4A24C" />
      </button>

      {/* stats */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "16px 8px",
          marginBottom: 22,
        }}
      >
        <StatBlock value={chaptersRead} label="Chapters read" />
        <StatBlock value={library.length} label="In library" />
        <StatBlock value="7" label="Day streak" />
      </div>

      {/* badges */}
      <SectionLabel icon={<Award size={13} color="#D4A24C" />} text="Badges" />
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {BADGES.map((b) => (
          <div
            key={b.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "14px 6px",
            }}
          >
            <b.icon size={18} color={b.color} />
            <span style={{ fontSize: 10, color: "#B4AECB", textAlign: "center", lineHeight: 1.3 }}>{b.label}</span>
          </div>
        ))}
      </div>

      {/* settings */}
      <SectionLabel icon={<User size={13} color="#D4A24C" />} text="Account" />
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "2px 12px",
          marginBottom: 20,
        }}
      >
        <SettingsRow
          icon={Bell}
          label="Notifications"
          sublabel={preferences.notifyUpdates ? "Updates for followed stories: On" : "Updates for followed stories: Off"}
          onClick={() => setPreferences((p) => ({ ...p, notifyUpdates: !p.notifyUpdates }))}
        />
        <SettingsRow
          icon={Type}
          label="Reading preferences"
          sublabel={`${preferences.defaultFontSize}px \u00b7 ${preferences.defaultNight ? "Night" : "Day"} mode default`}
          onClick={() => setPrefsOpen((o) => !o)}
        />
        {prefsOpen && (
          <div style={{ padding: "4px 2px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: "#D9D4E8" }}>Default text size</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setPreferences((p) => ({ ...p, defaultFontSize: Math.max(14, p.defaultFontSize - 1) }))}
                  style={{ ...iconBtnStyle, background: "rgba(255,255,255,0.08)" }}
                >
                  <Minus size={12} color="#F3ECDD" />
                </button>
                <span style={{ fontSize: 12, color: "#F3ECDD", width: 20, textAlign: "center" }}>{preferences.defaultFontSize}</span>
                <button
                  onClick={() => setPreferences((p) => ({ ...p, defaultFontSize: Math.min(24, p.defaultFontSize + 1) }))}
                  style={{ ...iconBtnStyle, background: "rgba(255,255,255,0.08)" }}
                >
                  <Plus size={12} color="#F3ECDD" />
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "#D9D4E8" }}>Open chapters in night mode</span>
              <ToggleSwitch
                on={preferences.defaultNight}
                onClick={() => setPreferences((p) => ({ ...p, defaultNight: !p.defaultNight }))}
              />
            </div>
          </div>
        )}
        {currentUser.isAdmin && (
          <SettingsRow icon={ShieldCheck} label="Admin panel" sublabel="Moderation, payouts, users, catalog" onClick={onOpenAdmin} />
        )}
        <SettingsRow
          icon={HelpCircle}
          label="Help & feedback"
          sublabel="Email the Lanternfic team"
          last
          onClick={() => {
            window.location.href = "mailto:support@lanternfic.app?subject=Lanternfic%20feedback";
          }}
        />
      </div>

      <button
        onClick={onSignOut}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: "rgba(181,72,47,0.12)",
          border: "1px solid rgba(181,72,47,0.3)",
          borderRadius: 10,
          padding: "12px 0",
          color: "#D98B76",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <LogOut size={15} /> Sign out
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   AUTHOR STUDIO
--------------------------------------------------------- */

function Studio({ works, onOpenWork, onNewStory, wallet, onOpenWallet, isAuthenticated, onGoToLogin }) {
  const totalViews = works.reduce((sum, w) => sum + parseFloat(w.views), 0);
  const totalDrafts = works.reduce((sum, w) => sum + w.chapters.filter((c) => c.status === "draft").length, 0);
  const writerTotal = works.reduce((sum, w) => sum + w.earnings.adShare + w.earnings.tips + w.earnings.premiumSales, 0);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "24px 18px 100px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 80 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(212,162,76,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <PenSquare size={24} color="#D4A24C" />
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#F3ECDD", marginBottom: 6 }}>
          Sign in to start writing
        </div>
        <p style={{ fontSize: 13, color: "#8B85A3", lineHeight: 1.6, marginBottom: 20, maxWidth: 260 }}>
          Create a free account to publish stories, manage chapters, and track your earnings.
        </p>
        <button
          onClick={onGoToLogin}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#D4A24C",
            color: "#14121F",
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Sign in / Sign up
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 18px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PenSquare size={18} color="#D4A24C" />
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F3ECDD", margin: 0 }}>
            Author Studio
          </h1>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: "#8B85A3", margin: "4px 0 18px" }}>Write, edit, and publish your stories.</p>

      <button
        onClick={onOpenWallet}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          background: "linear-gradient(160deg, rgba(212,162,76,0.16), rgba(212,162,76,0.03))",
          border: "1px solid rgba(212,162,76,0.3)",
          borderRadius: 12,
          padding: "13px 14px",
          marginBottom: 18,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "rgba(212,162,76,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <WalletIcon size={16} color="#D4A24C" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "#F3ECDD", fontWeight: 600 }}>Writer earnings</div>
          <div style={{ fontSize: 11, color: "#8B85A3", marginTop: 1 }}>${writerTotal.toFixed(2)} across all stories</div>
        </div>
        <ChevronRightIcon size={16} color="#D4A24C" />
      </button>

      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "16px 8px",
          marginBottom: 18,
        }}
      >
        <StatBlock value={works.length} label="Stories" />
        <StatBlock value={`${totalViews.toFixed(0)}K`} label="Total views" />
        <StatBlock value={totalDrafts} label="Drafts" />
      </div>

      <button
        onClick={onNewStory}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: "#D4A24C",
          color: "#14121F",
          border: "none",
          borderRadius: 10,
          padding: "13px 0",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          marginBottom: 22,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Plus size={16} /> New story
      </button>

      <SectionLabel icon={<BookOpen size={13} color="#D4A24C" />} text="Your stories" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {works.map((w) => {
          const drafts = w.chapters.filter((c) => c.status === "draft").length;
          return (
            <div
              key={w.id}
              onClick={() => onOpenWork(w)}
              style={{
                display: "flex",
                gap: 12,
                cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Cover novel={w} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14.5, color: "#F3ECDD", fontWeight: 600 }}>
                  {w.title}
                </div>
                <div style={{ fontSize: 11, color: "#8B85A3", margin: "3px 0 8px" }}>
                  {w.chapters.length} chapter{w.chapters.length !== 1 ? "s" : ""} &middot; {w.genre}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#8B85A3", display: "flex", alignItems: "center", gap: 3 }}>
                    <Eye size={11} /> {w.views}
                  </span>
                  <span style={{ fontSize: 11, color: "#8B85A3", display: "flex", alignItems: "center", gap: 3 }}>
                    <Heart size={11} /> {w.likes}
                  </span>
                  {drafts > 0 && (
                    <span style={{ fontSize: 10.5, color: "#D4A24C", fontWeight: 600 }}>{drafts} draft{drafts > 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>
              <ChevronRightIcon size={16} color="#5A5470" style={{ alignSelf: "center", flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkManage({ work, onBack, onNewChapter, onEditChapter, onDeleteChapter }) {
  return (
    <div style={{ paddingBottom: 40 }}>
      <div
        style={{
          padding: "16px 18px 20px",
          background: `linear-gradient(180deg, ${work.cover}55 0%, #14121F 85%)`,
        }}
      >
        <button onClick={onBack} style={backBtnStyle}>
          <ChevronLeft size={18} color="#F3ECDD" />
        </button>
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          <Cover novel={work} w={80} h={110} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: "#F3ECDD", margin: "0 0 6px" }}>
              {work.title}
            </h1>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#8B85A3", display: "flex", alignItems: "center", gap: 3 }}>
                <Eye size={11} /> {work.views}
              </span>
              <span style={{ fontSize: 11, color: "#8B85A3", display: "flex", alignItems: "center", gap: 3 }}>
                <Heart size={11} /> {work.likes}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "#8B85A3" }}>{work.genre} &middot; {work.status}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <SectionLabel icon={<List size={13} color="#D4A24C" />} text={`Chapters (${work.chapters.length})`} />
          <button
            onClick={onNewChapter}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(212,162,76,0.15)",
              border: "1px solid rgba(212,162,76,0.35)",
              color: "#D4A24C",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Plus size={13} /> New chapter
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {work.chapters.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                onClick={() => onEditChapter(c)}
                style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
              >
                <div style={{ fontSize: 13, color: "#F3ECDD", fontWeight: 500, marginBottom: 3 }}>
                  Ch. {c.id} &middot; {c.title || "Untitled"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 700,
                      color: c.status === "published" ? "#7FBF9E" : "#D4A24C",
                    }}
                  >
                    {c.status}
                  </span>
                  <span style={{ fontSize: 10.5, color: "#726C8C" }}>{wordCount(c.body)} words</span>
                </div>
              </div>
              <button
                onClick={() => onEditChapter(c)}
                style={{ ...iconBtnStyle, background: "rgba(212,162,76,0.12)" }}
                aria-label="Edit chapter"
              >
                <PenSquare size={13} color="#D4A24C" />
              </button>
              <button
                onClick={() => onDeleteChapter(c.id)}
                style={{ ...iconBtnStyle, background: "rgba(181,72,47,0.12)" }}
                aria-label="Delete chapter"
              >
                <Trash2 size={13} color="#D98B76" />
              </button>
            </div>
          ))}
          {work.chapters.length === 0 && (
            <div style={{ color: "#726C8C", fontSize: 12.5, textAlign: "center", padding: "20px 4px" }}>
              No chapters yet. Start your first one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Editor({ chapter, onBack, onSave }) {
  const [title, setTitle] = useState(chapter.title || "");
  const [body, setBody] = useState(chapter.body || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div style={{ background: "#F3ECDD", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: "1px solid rgba(43,36,64,0.1)",
          position: "sticky",
          top: 0,
          background: "#F3ECDD",
          zIndex: 5,
        }}
      >
        <button onClick={onBack} style={{ ...backBtnStyle, background: "transparent", border: "none" }}>
          <ChevronLeft size={20} color="#2B2440" />
        </button>
        <div style={{ fontSize: 11.5, color: "#8B7F6B", display: "flex", alignItems: "center", gap: 5 }}>
          {saved ? (
            <>
              <Check size={13} color="#5C7C5C" /> Draft saved
            </>
          ) : (
            `${wordCount(body)} words`
          )}
        </div>
        <button
          onClick={() => {
            onSave({ ...chapter, title, body, status: "draft" });
            setSaved(true);
          }}
          style={{ ...iconBtnStyle, background: "rgba(43,36,64,0.08)" }}
          aria-label="Save draft"
        >
          <FileText size={14} color="#2B2440" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 16px" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter title"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "'Fraunces', serif",
            fontSize: 21,
            fontWeight: 600,
            color: "#2B2440",
            marginBottom: 14,
          }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing..."
          style={{
            width: "100%",
            minHeight: 320,
            border: "none",
            outline: "none",
            resize: "vertical",
            background: "transparent",
            fontFamily: "'Source Serif 4', 'Georgia', serif",
            fontSize: 16.5,
            lineHeight: 1.75,
            color: "#2B2440",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 16px",
          borderTop: "1px solid rgba(43,36,64,0.1)",
          background: "#F3ECDD",
        }}
      >
        <button
          onClick={() => onSave({ ...chapter, title, body, status: "draft" })}
          style={{ ...navBtnStyle(false), }}
        >
          Save draft
        </button>
        <button
          onClick={() => onSave({ ...chapter, title, body, status: "published" })}
          disabled={!title.trim() || !body.trim()}
          style={{ ...navBtnStyle(false, true), opacity: !title.trim() || !body.trim() ? 0.4 : 1 }}
        >
          <Send size={14} /> Publish
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TIP MODAL
--------------------------------------------------------- */

function TipModal({ novel, walletBalance, onClose, onTip }) {
  const [amount, setAmount] = useState(100);
  const presets = [50, 100, 300, 500];
  const insufficient = walletBalance < amount;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,9,16,0.7)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#1A1826",
          borderRadius: "18px 18px 0 0",
          padding: "18px 20px 26px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Gift size={17} color="#D4A24C" />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, color: "#F3ECDD" }}>Tip {novel.author}</span>
          </div>
          <button onClick={onClose} style={{ ...iconBtnStyle, background: "rgba(255,255,255,0.08)" }}>
            <X size={14} color="#F3ECDD" />
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#8B85A3", margin: "4px 0 18px" }}>
          Tips use points from your wallet and go straight to the author, on top of what they already earn from your reads.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 10,
                border: amount === p ? "1px solid #D4A24C" : "1px solid rgba(255,255,255,0.12)",
                background: amount === p ? "rgba(212,162,76,0.15)" : "transparent",
                color: amount === p ? "#D4A24C" : "#B4AECB",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {p} pts
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11.5, color: "#8B85A3", marginBottom: 16 }}>
          Your points balance: {walletBalance} pts
        </div>

        <button
          onClick={() => onTip(novel, amount)}
          disabled={insufficient}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "#D4A24C",
            color: "#14121F",
            border: "none",
            borderRadius: 10,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            opacity: insufficient ? 0.45 : 1,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Gift size={15} /> Send {amount} pts tip
        </button>
        {insufficient && (
          <div style={{ fontSize: 11, color: "#D98B76", marginTop: 10, textAlign: "center" }}>
            Not enough points — earn more from your Wallet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   WALLET VIEW
--------------------------------------------------------- */

function Wallet({ wallet, authorWorks, onBack, onWatchAd, onCopyReferral, onRequestPayout }) {
  const [payoutMsg, setPayoutMsg] = useState(false);
  const writerTotal = authorWorks.reduce(
    (sum, w) => sum + w.earnings.adShare + w.earnings.tips + w.earnings.premiumSales,
    0
  );
  const adsLeft = wallet.adsDailyLimit - wallet.adsWatchedToday;

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px 6px" }}>
        <button onClick={onBack} style={backBtnStyle}>
          <ChevronLeft size={18} color="#F3ECDD" />
        </button>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: "#F3ECDD", margin: 0 }}>Wallet</h1>
      </div>

      <div style={{ padding: "14px 18px 0" }}>
        {/* points balance */}
        <div
          style={{
            background: "linear-gradient(160deg, rgba(212,162,76,0.18), rgba(212,162,76,0.04))",
            border: "1px solid rgba(212,162,76,0.3)",
            borderRadius: 14,
            padding: "16px 14px",
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 10.5, color: "#D4A24C", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your points
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "#F3ECDD", marginTop: 6 }}>
            {wallet.readerPoints} <span style={{ fontSize: 14, color: "#B4AECB" }}>pts</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#726C8C", margin: "0 0 20px" }}>
          Points are for in-app use only — spend them on tips and premium chapters. They can't be withdrawn as cash.
        </p>

        {/* ways to earn (reader) */}
        <SectionLabel icon={<TrendingUp size={13} color="#D4A24C" />} text="Ways to earn points" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(212,162,76,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PlayCircle size={17} color="#D4A24C" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "#F3ECDD", fontWeight: 600 }}>Watch a rewarded ad</div>
            <div style={{ fontSize: 11, color: "#8B85A3", marginTop: 1 }}>
              Earn 5 pts &middot; {adsLeft > 0 ? `${adsLeft} left today` : "come back tomorrow"}
            </div>
          </div>
          <button
            onClick={onWatchAd}
            disabled={adsLeft <= 0}
            style={{
              background: "#D4A24C",
              color: "#14121F",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              opacity: adsLeft <= 0 ? 0.4 : 1,
              flexShrink: 0,
            }}
          >
            Watch
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 14,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(142,214,208,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Share2 size={16} color="#8ED6D0" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "#F3ECDD", fontWeight: 600 }}>Refer a friend</div>
            <div style={{ fontSize: 11, color: "#8B85A3", marginTop: 1 }}>
              {wallet.referralCount} joined &middot; {wallet.referralPoints} pts earned &middot; code {wallet.referralCode}
            </div>
          </div>
          <button
            onClick={onCopyReferral}
            style={{
              background: "rgba(142,214,208,0.15)",
              border: "1px solid rgba(142,214,208,0.35)",
              color: "#8ED6D0",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Copy link
          </button>
        </div>

        {/* writer earnings (real money) */}
        <SectionLabel icon={<PenSquare size={13} color="#D4A24C" />} text="Writer earnings" />
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "16px 14px",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 10.5, color: "#8ED6D0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total across your stories
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: "#F3ECDD", marginTop: 6 }}>
            ${writerTotal.toFixed(2)}
          </div>
        </div>

        <button
          onClick={() => {
            onRequestPayout();
            setPayoutMsg(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 10,
            padding: "12px 0",
            color: "#F3ECDD",
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
            marginBottom: payoutMsg ? 8 : 20,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <ArrowDownToLine size={15} /> Request payout to bank / PayPal
        </button>
        {payoutMsg && (
          <div style={{ fontSize: 11.5, color: "#7FBF9E", marginBottom: 20, textAlign: "center" }}>
            Payout requested — funds typically arrive in 2–3 business days.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {authorWorks.map((w) => {
            const total = w.earnings.adShare + w.earnings.tips + w.earnings.premiumSales;
            return (
              <div
                key={w.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#F3ECDD", fontWeight: 600 }}>{w.title}</span>
                  <span style={{ fontSize: 13, color: "#D4A24C", fontWeight: 700 }}>${total.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: "#8B85A3" }}>
                  <span>Ad share ${w.earnings.adShare.toFixed(2)}</span>
                  <span>Tips ${w.earnings.tips.toFixed(2)}</span>
                  <span>Premium ${w.earnings.premiumSales.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* transactions */}
        <SectionLabel icon={<DollarSign size={13} color="#D4A24C" />} text="Points activity" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {wallet.transactions.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 2px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: 12.5, color: "#D9D4E8" }}>{t.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: t.type === "earn" ? "#7FBF9E" : "#D98B76" }}>
                {t.amount > 0 ? "+" : ""}
                {t.amount} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ADMIN PANEL
--------------------------------------------------------- */

function AdminTabButton({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "10px 4px",
        background: active ? "rgba(212,162,76,0.12)" : "transparent",
        border: "none",
        borderBottom: active ? "2px solid #D4A24C" : "2px solid transparent",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <Icon size={16} color={active ? "#D4A24C" : "#8B85A3"} />
      <span style={{ fontSize: 10, fontWeight: 600, color: active ? "#D4A24C" : "#8B85A3" }}>{label}</span>
      {badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: "28%",
            background: "#B5482F",
            color: "#F3ECDD",
            fontSize: 9,
            fontWeight: 700,
            borderRadius: 999,
            minWidth: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function EditableField({ value, onSave, placeholder, style }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onSave(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(draft);
            setEditing(false);
          }
        }}
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(212,162,76,0.4)",
          borderRadius: 6,
          padding: "4px 6px",
          color: "#F3ECDD",
          fontSize: 12.5,
          fontFamily: "'Inter', sans-serif",
          width: "100%",
          ...style,
        }}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      style={{ cursor: "pointer", borderBottom: "1px dashed rgba(255,255,255,0.25)", ...style }}
      title="Tap to edit"
    >
      {value || placeholder}
    </span>
  );
}

function Admin({
  onBack,
  currentAdmin,
  onSignOut,
  adminUsers,
  setAdminUsers,
  flags,
  setFlags,
  payoutRequests,
  setPayoutRequests,
  authorWorks,
  setAuthorWorks,
  novels,
  setNovels,
  wallet,
}) {
  const [tab, setTab] = useState("overview");

  const pendingFlags = flags.filter((f) => f.status === "pending").length;
  const pendingPayouts = payoutRequests.filter((p) => p.status === "pending").length;
  const totalPlatformEarnings = authorWorks.reduce(
    (sum, w) => sum + w.earnings.adShare + w.earnings.tips + w.earnings.premiumSales,
    0
  );

  const resolveFlag = (id, action) => {
    setFlags((fs) => fs.map((f) => (f.id === id ? { ...f, status: action } : f)));
  };

  const resolvePayout = (id, action) => {
    setPayoutRequests((ps) => ps.map((p) => (p.id === id ? { ...p, status: action } : p)));
  };

  const toggleUserStatus = (id) => {
    setAdminUsers((us) =>
      us.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u))
    );
  };

  const updateUserField = (id, field, value) => {
    setAdminUsers((us) => us.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const toggleUserAdmin = (id) => {
    setAdminUsers((us) => us.map((u) => (u.id === id ? { ...u, isAdmin: !u.isAdmin } : u)));
  };

  const updateNovelField = (id, field, value) => {
    setNovels((ns) => ns.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  };

  const deleteNovel = (id) => {
    setNovels((ns) => ns.filter((n) => n.id !== id));
  };

  const addNovel = () => {
    const id = `n${Date.now()}`;
    const novel = {
      id,
      title: "Untitled Story",
      author: "Unknown Author",
      genre: "Fantasy",
      cover: "#5C7C5C",
      coverAccent: "#F3ECDD",
      synopsis: "Add a synopsis...",
      rating: 0,
      reads: "0",
      status: "Ongoing",
      chapters: 1,
      updated: "just now",
    };
    setNovels((ns) => [novel, ...ns]);
  };

  const deleteAuthorWork = (id) => {
    setAuthorWorks((ws) => ws.filter((w) => w.id !== id));
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={backBtnStyle}>
            <ChevronLeft size={18} color="#F3ECDD" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={17} color="#D4A24C" />
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: "#F3ECDD", margin: 0 }}>Admin Panel</h1>
          </div>
        </div>
        {currentAdmin && (
          <button
            onClick={onSignOut}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(181,72,47,0.12)", border: "1px solid rgba(181,72,47,0.3)", color: "#D98B76", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            <LogOut size={12} /> Sign out
          </button>
        )}
      </div>
      {currentAdmin && (
        <div style={{ padding: "0 18px 14px", fontSize: 11.5, color: "#8B85A3" }}>
          Signed in as <span style={{ color: "#D4A24C", fontWeight: 600 }}>{currentAdmin.name}</span>
        </div>
      )}

      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 18, overflowX: "auto" }}>
        <AdminTabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={BarChart3} label="Overview" />
        <AdminTabButton
          active={tab === "moderation"}
          onClick={() => setTab("moderation")}
          icon={Flag}
          label="Moderation"
          badge={pendingFlags}
        />
        <AdminTabButton
          active={tab === "payouts"}
          onClick={() => setTab("payouts")}
          icon={DollarSign}
          label="Payouts"
          badge={pendingPayouts}
        />
        <AdminTabButton active={tab === "users"} onClick={() => setTab("users")} icon={Users} label="Users" />
        <AdminTabButton active={tab === "catalog"} onClick={() => setTab("catalog")} icon={BookOpen} label="Catalog" />
      </div>

      <div style={{ padding: "0 18px" }}>
        {tab === "overview" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 12px" }}>
                <div style={{ fontSize: 10.5, color: "#8B85A3" }}>Total users</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F3ECDD", marginTop: 4 }}>{adminUsers.length}</div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 12px" }}>
                <div style={{ fontSize: 10.5, color: "#8B85A3" }}>Live stories</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F3ECDD", marginTop: 4 }}>{novels.length + authorWorks.length}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, background: "rgba(212,162,76,0.1)", border: "1px solid rgba(212,162,76,0.3)", borderRadius: 12, padding: "14px 12px" }}>
                <div style={{ fontSize: 10.5, color: "#D4A24C" }}>Platform earnings tracked</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F3ECDD", marginTop: 4 }}>${totalPlatformEarnings.toFixed(2)}</div>
              </div>
              <div style={{ flex: 1, background: "rgba(181,72,47,0.1)", border: "1px solid rgba(181,72,47,0.25)", borderRadius: 12, padding: "14px 12px" }}>
                <div style={{ fontSize: 10.5, color: "#D98B76" }}>Needs attention</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#F3ECDD", marginTop: 4 }}>{pendingFlags + pendingPayouts}</div>
              </div>
            </div>

            <SectionLabel icon={<AlertTriangle size={13} color="#D4A24C" />} text="Needs review" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingFlags === 0 && pendingPayouts === 0 && (
                <div style={{ color: "#726C8C", fontSize: 12.5, textAlign: "center", padding: "16px 4px" }}>
                  Nothing pending — all clear.
                </div>
              )}
              {pendingFlags > 0 && (
                <button
                  onClick={() => setTab("moderation")}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 13, color: "#F3ECDD" }}>{pendingFlags} content report{pendingFlags > 1 ? "s" : ""} pending</span>
                  <ChevronRightIcon size={15} color="#5A5470" />
                </button>
              )}
              {pendingPayouts > 0 && (
                <button
                  onClick={() => setTab("payouts")}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 13, color: "#F3ECDD" }}>{pendingPayouts} payout request{pendingPayouts > 1 ? "s" : ""} pending</span>
                  <ChevronRightIcon size={15} color="#5A5470" />
                </button>
              )}
            </div>
          </>
        )}

        {tab === "moderation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {flags.map((f) => (
              <div key={f.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#D4A24C", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.type}</div>
                    <div style={{ fontSize: 13.5, color: "#F3ECDD", fontWeight: 600, marginTop: 2 }}>{f.title}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: f.status === "pending" ? "#D4A24C" : f.status === "removed" ? "#D98B76" : "#7FBF9E",
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {f.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#B4AECB", marginBottom: 4 }}>{f.reason}</div>
                <div style={{ fontSize: 11, color: "#726C8C", marginBottom: 10 }}>Reported by {f.reporter}</div>
                {f.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => resolveFlag(f.id, "dismissed")}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(127,191,158,0.12)", border: "1px solid rgba(127,191,158,0.3)", color: "#7FBF9E", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <CheckCircle2 size={13} /> Dismiss
                    </button>
                    <button
                      onClick={() => resolveFlag(f.id, "removed")}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(181,72,47,0.12)", border: "1px solid rgba(181,72,47,0.3)", color: "#D98B76", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <XCircle size={13} /> Remove content
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "payouts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11.5, color: "#8B85A3", marginBottom: 2 }}>
              Writer payout requests — real money, reviewed manually.
            </div>
            {payoutRequests.map((p) => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13.5, color: "#F3ECDD", fontWeight: 600 }}>{p.user}</span>
                  <span style={{ fontSize: 15, color: "#D4A24C", fontWeight: 700 }}>${p.amount.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#8B85A3", marginBottom: 10 }}>
                  {p.handle} &middot; {p.method}
                </div>
                {p.status === "pending" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => resolvePayout(p.id, "approved")}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#D4A24C", border: "none", color: "#14121F", borderRadius: 8, padding: "9px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => resolvePayout(p.id, "denied")}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(181,72,47,0.12)", border: "1px solid rgba(181,72,47,0.3)", color: "#D98B76", borderRadius: 8, padding: "9px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      <XCircle size={13} /> Deny
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: p.status === "approved" ? "#7FBF9E" : "#D98B76" }}>
                    {p.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {adminUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", flexDirection: "column", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <EditableField
                      value={u.name}
                      onSave={(v) => updateUserField(u.id, "name", v)}
                      style={{ fontSize: 13, color: "#F3ECDD", fontWeight: 600 }}
                    />
                    <div style={{ fontSize: 11, color: "#8B85A3", marginTop: 2 }}>
                      {u.handle} &middot; {u.role} &middot; joined {u.joined}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: u.status === "active" ? "#7FBF9E" : "#D98B76",
                      flexShrink: 0,
                    }}
                  >
                    {u.status}
                  </span>
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    style={{
                      ...iconBtnStyle,
                      background: u.status === "active" ? "rgba(181,72,47,0.12)" : "rgba(127,191,158,0.12)",
                      flexShrink: 0,
                    }}
                    aria-label={u.status === "active" ? "Suspend user" : "Reactivate user"}
                  >
                    {u.status === "active" ? <Ban size={13} color="#D98B76" /> : <CheckCircle2 size={13} color="#7FBF9E" />}
                  </button>
                </div>
                <button
                  onClick={() => toggleUserAdmin(u.id)}
                  style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: u.isAdmin ? "rgba(212,162,76,0.15)" : "rgba(255,255,255,0.06)",
                    border: u.isAdmin ? "1px solid rgba(212,162,76,0.4)" : "1px solid rgba(255,255,255,0.12)",
                    color: u.isAdmin ? "#D4A24C" : "#B4AECB",
                    borderRadius: 7,
                    padding: "5px 9px",
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <ShieldCheck size={11} /> {u.isAdmin ? "Admin" : "Make admin"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "catalog" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={addNovel}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#D4A24C",
                color: "#14121F",
                border: "none",
                borderRadius: 10,
                padding: "11px 0",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 4,
              }}
            >
              <Plus size={15} /> Add story to catalog
            </button>

            {novels.map((n) => (
              <div key={n.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <Cover novel={n} w={48} h={66} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <EditableField
                      value={n.title}
                      onSave={(v) => updateNovelField(n.id, "title", v)}
                      style={{ fontSize: 13.5, fontWeight: 600, color: "#F3ECDD", display: "block", marginBottom: 4 }}
                    />
                    <EditableField
                      value={n.author}
                      onSave={(v) => updateNovelField(n.id, "author", v)}
                      style={{ fontSize: 11.5, color: "#B4AECB", display: "block", marginBottom: 4 }}
                    />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <select
                        value={n.genre}
                        onChange={(e) => updateNovelField(n.id, "genre", e.target.value)}
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#D9D4E8", borderRadius: 6, fontSize: 10.5, padding: "3px 5px" }}
                      >
                        {GENRES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <select
                        value={n.status}
                        onChange={(e) => updateNovelField(n.id, "status", e.target.value)}
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#D9D4E8", borderRadius: 6, fontSize: 10.5, padding: "3px 5px" }}
                      >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNovel(n.id)}
                    style={{ ...iconBtnStyle, background: "rgba(181,72,47,0.12)", flexShrink: 0, alignSelf: "flex-start" }}
                    aria-label="Delete story"
                  >
                    <Trash2 size={13} color="#D98B76" />
                  </button>
                </div>
                <EditableField
                  value={n.synopsis}
                  onSave={(v) => updateNovelField(n.id, "synopsis", v)}
                  placeholder="Synopsis..."
                  style={{ fontSize: 11.5, color: "#8B85A3", display: "block", width: "100%" }}
                />
              </div>
            ))}

            {authorWorks.length > 0 && (
              <>
                <div style={{ marginTop: 8 }}>
                  <SectionLabel icon={<PenSquare size={13} color="#D4A24C" />} text="Author-published works" />
                </div>
                {authorWorks.map((w) => (
                  <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 12px" }}>
                    <Cover novel={w} w={40} h={56} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <EditableField
                        value={w.title}
                        onSave={(v) => setAuthorWorks((ws) => ws.map((x) => (x.id === w.id ? { ...x, title: v } : x)))}
                        style={{ fontSize: 13, fontWeight: 600, color: "#F3ECDD" }}
                      />
                      <div style={{ fontSize: 11, color: "#8B85A3", marginTop: 2 }}>{w.chapters.length} chapters &middot; {w.genre}</div>
                    </div>
                    <button
                      onClick={() => deleteAuthorWork(w.id)}
                      style={{ ...iconBtnStyle, background: "rgba(181,72,47,0.12)", flexShrink: 0 }}
                      aria-label="Delete story"
                    >
                      <Trash2 size={13} color="#D98B76" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH PAGE (Sign in / Sign up) — /login
--------------------------------------------------------- */

function AuthPage({ users, onSignUp, onSignIn }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name.trim() || !email.trim() || password.length < 6) {
        setError("Fill in your name, email, and a password of at least 6 characters.");
        return;
      }
      if (findUserByEmail(users, email)) {
        setError("An account with that email already exists — try signing in instead.");
        return;
      }
      const result = onSignUp({ name: name.trim(), email: email.trim(), password });
      if (result?.error) {
        setError(result.error);
        return;
      }
      navigate("/");
    } else {
      const result = onSignIn(email.trim(), password);
      if (result?.error) {
        setError(result.error);
        return;
      }
      navigate("/");
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#14121F",
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px 24px 60px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, justifyContent: "center" }}>
        <Flame size={22} color="#D4A24C" strokeWidth={2.2} />
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: "#F3ECDD" }}>
          Lanternfic
        </span>
      </div>
      <p style={{ textAlign: "center", color: "#8B85A3", fontSize: 13, margin: "0 0 28px" }}>
        {mode === "signin" ? "Sign in to read and write on Lanternfic." : "Create a free account to get started."}
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "signup" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            style={authInputStyle}
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={authInputStyle}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={authInputStyle}
        />

        {error && (
          <div style={{ fontSize: 12, color: "#D98B76", background: "rgba(181,72,47,0.1)", border: "1px solid rgba(181,72,47,0.25)", borderRadius: 8, padding: "8px 10px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "#D4A24C",
            color: "#14121F",
            border: "none",
            borderRadius: 10,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            marginTop: 4,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setError("");
        }}
        style={{
          background: "transparent",
          border: "none",
          color: "#B4AECB",
          fontSize: 12.5,
          marginTop: 18,
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>

      {mode === "signin" && (
        <p style={{ fontSize: 10.5, color: "#5A5470", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          Demo accounts: marin@lanternfic.app (admin) or kofi@lanternfic.app — password: password123
        </p>
      )}
    </div>
  );
}

const authInputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#F3ECDD",
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  outline: "none",
};

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

function MainApp() {
  const navigate = useNavigate();
  const [view, setView] = useState("discover"); // discover | detail | reader | library
  const [activeNovel, setActiveNovel] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [library, setLibrary] = useLocalStorageState("lanternfic_library", ["n1", "n3"]);
  const [progress, setProgress] = useLocalStorageState("lanternfic_progress", { n1: 2 });
  const [tab, setTab] = useState("discover");
  const [preferences, setPreferences] = useLocalStorageState("lanternfic_preferences", {
    notifyUpdates: true,
    defaultFontSize: 17,
    defaultNight: false,
  });

  // auth state — shared with /admin and /login via localStorage
  const [users] = useLocalStorageState("lanternfic_users_db", SEED_USERS);
  const [sessionUserId, setSessionUserId] = useLocalStorageState("lanternfic_session", null);
  const currentUser = sessionUserId ? users.find((u) => u.id === sessionUserId) || null : null;
  const isAuthenticated = !!currentUser;
  const goToLogin = () => navigate("/login");
  const signOut = () => {
    setSessionUserId(null);
    setView("discover");
    setTab("discover");
  };

  // novel catalog — shared with the /admin page via localStorage
  const [novels, setNovels] = useLocalStorageState("lanternfic_novels", NOVEL_SEED);

  // author studio state — shared with the /admin page via localStorage
  const [authorWorks, setAuthorWorks] = useLocalStorageState("lanternfic_authorWorks", initialAuthorWorks);
  const [activeWork, setActiveWork] = useState(null);
  const [activeDraft, setActiveDraft] = useState(null);

  // wallet / earnings state — shared with the /admin page via localStorage
  const [wallet, setWallet] = useLocalStorageState("lanternfic_wallet", initialWallet);
  const [unlockedChapters, setUnlockedChapters] = useLocalStorageState("lanternfic_unlocked", { n1: [1, 2, 3, 4, 5] });
  const [tipTarget, setTipTarget] = useState(null);

  const addTransaction = (label, amount, type) => {
    setWallet((w) => ({
      ...w,
      transactions: [{ id: Date.now(), label, amount, type }, ...w.transactions],
    }));
  };

  const watchAd = () => {
    setWallet((w) => {
      if (w.adsWatchedToday >= w.adsDailyLimit) return w;
      return { ...w, readerPoints: w.readerPoints + 5, adsWatchedToday: w.adsWatchedToday + 1 };
    });
    addTransaction("Watched a rewarded ad", 5, "earn");
  };

  const copyReferral = () => {
    const link = `https://lanternfic.app/join?ref=${wallet.referralCode}`;
    if (navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {});
  };

  const requestPayout = () => {
    // Writer payout requests are real money and don't touch the points ledger.
  };

  const unlockChapter = (novel, chapter) => {
    if (wallet.readerPoints < chapter.price) return;
    setWallet((w) => ({ ...w, readerPoints: w.readerPoints - chapter.price }));
    setUnlockedChapters((u) => ({
      ...u,
      [novel.id]: [...(u[novel.id] || []), chapter.num],
    }));
    addTransaction(`Unlocked Ch. ${chapter.num} \u2014 ${novel.title}`, -chapter.price, "spend");
  };

  const tipAuthor = (novel, amount) => {
    if (wallet.readerPoints < amount) return;
    setWallet((w) => ({ ...w, readerPoints: w.readerPoints - amount }));
    addTransaction(`Tipped ${novel.author} \u2014 ${novel.title}`, -amount, "spend");
    setTipTarget(null);
  };

  const openWork = (work) => {
    setActiveWork(work);
    setView("workManage");
  };

  const newStory = () => {
    const id = `w${authorWorks.length + 1}${Date.now() % 1000}`;
    const palette = ["#7C5CBF", "#2E7D6B", "#A64D6B", "#B5482F", "#5C7C5C"];
    const work = {
      id,
      title: "Untitled Story",
      cover: palette[authorWorks.length % palette.length],
      coverAccent: "#F3ECDD",
      genre: "Fantasy",
      status: "Ongoing",
      views: "0",
      likes: 0,
      chapters: [],
      earnings: { adShare: 0, tips: 0, premiumSales: 0 },
    };
    setAuthorWorks((ws) => [...ws, work]);
    setActiveWork(work);
    setView("workManage");
  };

  const newChapter = () => {
    const nextId = activeWork.chapters.length ? Math.max(...activeWork.chapters.map((c) => c.id)) + 1 : 1;
    setActiveDraft({ id: nextId, title: "", body: "", status: "draft" });
    setView("editor");
  };

  const editChapter = (chapter) => {
    setActiveDraft(chapter);
    setView("editor");
  };

  const deleteChapter = (chapterId) => {
    setAuthorWorks((ws) =>
      ws.map((w) => (w.id === activeWork.id ? { ...w, chapters: w.chapters.filter((c) => c.id !== chapterId) } : w))
    );
    setActiveWork((w) => ({ ...w, chapters: w.chapters.filter((c) => c.id !== chapterId) }));
  };

  const saveChapter = (chapter) => {
    setAuthorWorks((ws) =>
      ws.map((w) => {
        if (w.id !== activeWork.id) return w;
        const exists = w.chapters.some((c) => c.id === chapter.id);
        const chapters = exists
          ? w.chapters.map((c) => (c.id === chapter.id ? chapter : c))
          : [...w.chapters, chapter];
        const updated = { ...w, chapters };
        setActiveWork(updated);
        return updated;
      })
    );
    if (chapter.status === "published") setView("workManage");
  };

  const toggleLibrary = (id) => {
    setLibrary((lib) => (lib.includes(id) ? lib.filter((x) => x !== id) : [...lib, id]));
  };

  const markRead = (novelId, idx) => {
    setProgress((p) => ({ ...p, [novelId]: Math.max(p[novelId] ?? -1, idx) }));
  };

  const openNovel = (novel) => {
    setActiveNovel(novel);
    setView("detail");
  };

  const readChapter = (novel, chapter) => {
    setActiveNovel(novel);
    setActiveChapter(chapter);
    setView("reader");
  };

  const chapters = activeNovel ? genChapters(activeNovel) : [];

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#14121F",
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {view === "discover" && <Discover novels={novels} onOpenNovel={openNovel} library={library} toggleLibrary={toggleLibrary} />}
      {view === "library" && <Library allNovels={novels} library={library} onOpenNovel={openNovel} progress={progress} />}
      {view === "profile" && (
        <Profile
          currentUser={currentUser}
          onSignOut={signOut}
          onGoToLogin={goToLogin}
          library={library}
          progress={progress}
          wallet={wallet}
          onOpenWallet={() => setView("wallet")}
          onOpenAdmin={() => navigate("/admin")}
          preferences={preferences}
          setPreferences={setPreferences}
        />
      )}
      {view === "studio" && (
        <Studio
          works={authorWorks}
          onOpenWork={openWork}
          onNewStory={newStory}
          wallet={wallet}
          onOpenWallet={() => setView("wallet")}
          isAuthenticated={isAuthenticated}
          onGoToLogin={goToLogin}
        />
      )}
      {view === "wallet" && (
        <Wallet
          wallet={wallet}
          authorWorks={authorWorks}
          onBack={() => setView(tab)}
          onWatchAd={watchAd}
          onCopyReferral={copyReferral}
          onRequestPayout={requestPayout}
        />
      )}
      {view === "workManage" && activeWork && (
        <WorkManage
          work={activeWork}
          onBack={() => setView("studio")}
          onNewChapter={newChapter}
          onEditChapter={editChapter}
          onDeleteChapter={deleteChapter}
        />
      )}
      {view === "editor" && activeDraft && (
        <Editor chapter={activeDraft} onBack={() => setView("workManage")} onSave={saveChapter} />
      )}
      {view === "detail" && activeNovel && (
        <NovelDetail
          novel={activeNovel}
          onBack={() => setView(tab)}
          onReadChapter={readChapter}
          library={library}
          toggleLibrary={toggleLibrary}
          progress={progress}
          unlockedChapters={unlockedChapters}
          onOpenTip={(novel) => (isAuthenticated ? setTipTarget(novel) : goToLogin())}
        />
      )}
      {view === "reader" && activeNovel && activeChapter && (
        <Reader
          novel={activeNovel}
          chapter={activeChapter}
          chapters={chapters}
          onBack={() => setView("detail")}
          onChangeChapter={setActiveChapter}
          markRead={markRead}
          isLocked={activeChapter.premium && !(unlockedChapters[activeNovel.id] || []).includes(activeChapter.num)}
          walletBalance={wallet.readerPoints}
          onUnlock={unlockChapter}
          preferences={preferences}
          setPreferences={setPreferences}
          isAuthenticated={isAuthenticated}
          onGoToLogin={goToLogin}
        />
      )}
      {tipTarget && (
        <TipModal
          novel={tipTarget}
          walletBalance={wallet.readerPoints}
          onClose={() => setTipTarget(null)}
          onTip={tipAuthor}
        />
      )}

      {/* bottom nav */}
      {view !== "reader" && view !== "editor" && view !== "workManage" && view !== "wallet" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            display: "flex",
            background: "#1A1826",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "10px 0 14px",
          }}
        >
          {[
            { key: "discover", label: "Discover", icon: Flame },
            { key: "library", label: "Library", icon: Bookmark },
            { key: "studio", label: "Write", icon: PenSquare },
            { key: "profile", label: "Profile", icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setView(key);
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Icon size={19} color={tab === key ? "#D4A24C" : "#726C8C"} fill={tab === key && key === "library" ? "#D4A24C" : "none"} />
              <span style={{ fontSize: 10.5, color: tab === key ? "#D4A24C" : "#726C8C", fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   ADMIN PAGE — a separate route (/admin), not part of the
   reader/writer view-switching app above. It reads/writes
   the same localStorage-backed data so actions here (payout
   approvals, moderation, suspensions) are visible back in
   the main app and vice versa.
--------------------------------------------------------- */

function AdminPage() {
  const navigate = useNavigate();
  const [users] = useLocalStorageState("lanternfic_users_db", SEED_USERS);
  const [sessionUserId, setSessionUserId] = useLocalStorageState("lanternfic_session", null);
  const currentUser = sessionUserId ? users.find((u) => u.id === sessionUserId) || null : null;

  const [novels, setNovels] = useLocalStorageState("lanternfic_novels", NOVEL_SEED);
  const [authorWorks, setAuthorWorks] = useLocalStorageState("lanternfic_authorWorks", initialAuthorWorks);
  const [wallet] = useLocalStorageState("lanternfic_wallet", initialWallet);
  const [adminUsers, setAdminUsers] = useLocalStorageState("lanternfic_adminUsers", initialAdminUsers);
  const [flags, setFlags] = useLocalStorageState("lanternfic_flags", initialFlags);
  const [payoutRequests, setPayoutRequests] = useLocalStorageState("lanternfic_payoutRequests", initialPayoutRequests);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const wrapperStyle = {
    fontFamily: "'Inter', sans-serif",
    background: "#14121F",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
  };

  if (!currentUser || !currentUser.isAdmin) {
    const submit = (e) => {
      e.preventDefault();
      setLoginError("");
      const found = findUserByEmail(users, loginEmail);
      if (!found || found.password !== loginPassword) {
        setLoginError("Incorrect email or password.");
        return;
      }
      if (!found.isAdmin) {
        setLoginError("This account doesn't have admin access.");
        return;
      }
      setSessionUserId(found.id);
    };

    return (
      <div style={{ ...wrapperStyle, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, justifyContent: "center" }}>
          <ShieldCheck size={22} color="#D4A24C" strokeWidth={2.2} />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#F3ECDD" }}>
            Admin sign-in
          </span>
        </div>
        <p style={{ textAlign: "center", color: "#8B85A3", fontSize: 13, margin: "0 0 26px" }}>
          This page is restricted to Lanternfic admin accounts.
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Admin email" type="email" style={authInputStyle} />
          <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" type="password" style={authInputStyle} />
          {loginError && (
            <div style={{ fontSize: 12, color: "#D98B76", background: "rgba(181,72,47,0.1)", border: "1px solid rgba(181,72,47,0.25)", borderRadius: 8, padding: "8px 10px" }}>
              {loginError}
            </div>
          )}
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#D4A24C",
              color: "#14121F",
              border: "none",
              borderRadius: 10,
              padding: "13px 0",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              marginTop: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sign in
          </button>
        </form>
        <button
          onClick={() => navigate("/")}
          style={{ background: "transparent", border: "none", color: "#B4AECB", fontSize: 12.5, marginTop: 18, cursor: "pointer", textAlign: "center" }}
        >
          Back to Lanternfic
        </button>
        <p style={{ fontSize: 10.5, color: "#5A5470", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          Demo admin account: marin@lanternfic.app — password: password123
        </p>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <Admin
        onBack={() => navigate("/")}
        currentAdmin={currentUser}
        onSignOut={() => {
          setSessionUserId(null);
          navigate("/");
        }}
        adminUsers={adminUsers}
        setAdminUsers={setAdminUsers}
        flags={flags}
        setFlags={setFlags}
        payoutRequests={payoutRequests}
        setPayoutRequests={setPayoutRequests}
        authorWorks={authorWorks}
        setAuthorWorks={setAuthorWorks}
        novels={novels}
        setNovels={setNovels}
        wallet={wallet}
      />
    </div>
  );
}

function LoginRoute() {
  const [users, setUsers] = useLocalStorageState("lanternfic_users_db", SEED_USERS);
  const [, setSessionUserId] = useLocalStorageState("lanternfic_session", null);
  const [adminUsers, setAdminUsers] = useLocalStorageState("lanternfic_adminUsers", initialAdminUsers);

  const handleSignUp = ({ name, email, password }) => {
    const id = `u${Date.now()}`;
    const newUser = { id, name, email, password, isAdmin: false };
    setUsers((us) => [...us, newUser]);
    // Mirror into the admin-visible user directory too, so new signups show up in /admin → Users
    setAdminUsers((us) => [
      ...us,
      {
        id,
        name,
        handle: `@${name.toLowerCase().replace(/\s+/g, "")}`,
        role: "Reader",
        status: "active",
        joined: new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" }),
        isAdmin: false,
      },
    ]);
    setSessionUserId(id);
    return {};
  };

  const handleSignIn = (email, password) => {
    const found = findUserByEmail(users, email);
    if (!found || found.password !== password) {
      return { error: "Incorrect email or password." };
    }
    setSessionUserId(found.id);
    return {};
  };

  return <AuthPage users={users} onSignUp={handleSignUp} onSignIn={handleSignIn} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/*" element={<MainApp />} />
    </Routes>
  );
}
