const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'AI Explainer Channel Blueprint';

// ─── COLOR PALETTE ───
const NAVY = "0F172A";
const BLUE = "0EA5E9";
const TEAL = "0D9488";
const WHITE = "FFFFFF";
const LIGHT = "F0F9FF";
const MUTED = "94A3B8";
const ACCENT = "38BDF8";
const GOLD = "F59E0B";

// ─── HELPERS ───
function addHeader(slide, text, isDark = true) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.7,
    fill: { color: isDark ? NAVY : "E0F2FE" },
    line: { color: isDark ? NAVY : "BAE6FD", width: 0 }
  });
  slide.addText(text, {
    x: 0.4, y: 0, w: 9.2, h: 0.7,
    fontSize: 13, fontFace: "Calibri", color: isDark ? ACCENT : "0369A1",
    bold: true, align: "left", valign: "middle", margin: 0
  });
}

function addFooter(slide, pageNum) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.25, w: 10, h: 0.375,
    fill: { color: NAVY }
  });
  slide.addText("AI Explainer Channel Blueprint", {
    x: 0.3, y: 5.25, w: 7, h: 0.375,
    fontSize: 10, fontFace: "Calibri", color: MUTED,
    align: "left", valign: "middle", margin: 0
  });
  slide.addText(`${pageNum}`, {
    x: 9, y: 5.25, w: 0.7, h: 0.375,
    fontSize: 10, fontFace: "Calibri", color: MUTED,
    align: "right", valign: "middle", margin: 0
  });
}

function addTitle(slide, title, subtitle = null) {
  slide.addText(title, {
    x: 0.5, y: subtitle ? 1.3 : 1.8, w: 9, h: subtitle ? 1.2 : 1.8,
    fontSize: subtitle ? 44 : 52, fontFace: "Calibri", color: WHITE,
    bold: true, align: "center", valign: "middle"
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 2.7, w: 9, h: 0.8,
      fontSize: 20, fontFace: "Calibri", color: ACCENT,
      align: "center", valign: "middle"
    });
  }
}

function card(slide, x, y, w, h, title, body, titleColor = BLUE, bgColor = "FFFFFF") {
  const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: bgColor },
    line: { color: "E2E8F0", width: 1 },
    shadow: makeShadow()
  });
  // Accent bar on left
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.06, h,
    fill: { color: titleColor },
    line: { color: titleColor, width: 0 }
  });
  slide.addText(title, {
    x: x + 0.12, y: y + 0.08, w: w - 0.2, h: 0.38,
    fontSize: 14, fontFace: "Calibri", color: titleColor,
    bold: true, valign: "top", margin: 0
  });
  slide.addText(body, {
    x: x + 0.12, y: y + 0.46, w: w - 0.2, h: h - 0.54,
    fontSize: 12, fontFace: "Calibri", color: "334155",
    valign: "top", margin: 0
  });
}

// ─── SLIDE 1: TITLE ───
const s1 = pres.addSlide();
s1.background = { color: NAVY };
// Gradient-like effect with shapes
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: NAVY } });
s1.addShape(pres.shapes.OVAL, {
  x: 6, y: -1.5, w: 6, h: 6,
  fill: { color: "1E3A5F", transparency: 30 },
  line: { color: "1E3A5F", width: 0 }
});
s1.addShape(pres.shapes.OVAL, {
  x: -2, y: 2, w: 5, h: 5,
  fill: { color: "0C4A6E", transparency: 50 },
  line: { color: "0C4A6E", width: 0 }
});

s1.addText("BUILD AN AI EXPLAINER", {
  x: 0.5, y: 0.8, w: 9, h: 0.9,
  fontSize: 36, fontFace: "Calibri", color: ACCENT,
  bold: true, align: "center", charSpacing: 3
});
s1.addText("CHANNEL THAT RUNS ITSELF", {
  x: 0.5, y: 1.65, w: 9, h: 0.9,
  fontSize: 36, fontFace: "Calibri", color: WHITE,
  bold: true, align: "center", charSpacing: 3
});
s1.addShape(pres.shapes.LINE, {
  x: 2, y: 2.7, w: 6, h: 0,
  line: { color: TEAL, width: 2 }
});
s1.addText("Niche Strategy  ·  Content Automation  ·  Monetization Roadmap", {
  x: 0.5, y: 2.9, w: 9, h: 0.5,
  fontSize: 16, fontFace: "Calibri", color: MUTED,
  align: "center"
});
s1.addText("Prepared for Ady  |  March 2026", {
  x: 0.5, y: 4.9, w: 9, h: 0.4,
  fontSize: 12, fontFace: "Calibri", color: "475569",
  align: "center"
});

// ─── SLIDE 2: THE OPPORTUNITY ───
const s2 = pres.addSlide();
s2.background = { color: "F8FAFC" };
addHeader(s2, "THE OPPORTUNITY");
addFooter(s2, "2");

s2.addText("Why AI Explainer Content Is Exploding Right Now", {
  x: 0.5, y: 0.85, w: 9, h: 0.7,
  fontSize: 28, fontFace: "Calibri", color: NAVY,
  bold: true, align: "center"
});

const stats = [
  { num: "40%+", label: "YoY growth in\n'AI explained' searches" },
  { num: "$15-35", label: "CPM advertisers pay\nfor AI content" },
  { num: "500M+", label: "People want to\nunderstand AI but can't" },
  { num: "LOW", label: "Competition for\nquality explainers" },
];

stats.forEach((s, i) => {
  const x = 0.3 + i * 2.35;
  s2.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.7, w: 2.1, h: 2.3,
    fill: { color: i % 2 === 0 ? NAVY : "0C4A6E" },
    line: { color: "1E3A5F", width: 0 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.15 }
  });
  s2.addText(s.num, {
    x, y: 1.9, w: 2.1, h: 0.8,
    fontSize: 32, fontFace: "Calibri", color: ACCENT,
    bold: true, align: "center"
  });
  s2.addText(s.label, {
    x, y: 2.75, w: 2.1, h: 0.9,
    fontSize: 12, fontFace: "Calibri", color: "BAE6FD",
    align: "center"
  });
});

s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.3, y: 4.15, w: 9.4, h: 0.75,
  fill: { color: "E0F2FE" },
  line: { color: "BAE6FD", width: 1 }
});
s2.addText("Most people feel AI is happening TO them, not FOR them. You become the guide who changes that.", {
  x: 0.5, y: 4.2, w: 9, h: 0.65,
  fontSize: 14, fontFace: "Calibri", color: "0369A1",
  bold: true, align: "center", valign: "middle"
});

// ─── SLIDE 3: YOUR NICHE ───
const s3 = pres.addSlide();
s3.background = { color: "F8FAFC" };
addHeader(s3, "YOUR NICHE");
addFooter(s3, "3");

s3.addText("AI Explained Simply", {
  x: 0.5, y: 0.85, w: 9, h: 0.65,
  fontSize: 30, fontFace: "Calibri", color: NAVY,
  bold: true, align: "center"
});
s3.addText("Cleo Abram-style explainer content for AI, ML & emerging tech", {
  x: 0.5, y: 1.5, w: 9, h: 0.45,
  fontSize: 16, fontFace: "Calibri", color: MUTED,
  align: "center"
});

const niches = [
  { title: "Concept Explainers", body: "\"What is a neural network?\"\n\"How does ChatGPT actually work?\"\nSimple analogies, no jargon" },
  { title: "Tool Deep Dives", body: "\"I tested [AI tool] for 30 days\"\nPractical walkthroughs, real results\nHigh affiliate potential" },
  { title: "News Explainers", body: "\"GPT-5 launched — what changes?\"\nTimely content drives traffic spikes\nBuilds authority & trust" },
  { title: "Impact Stories", body: "\"AI is changing healthcare forever\"\nHuman-centered storytelling\nHighest watch time + shares" },
];

niches.forEach((n, i) => {
  const x = 0.3 + (i % 2) * 4.8;
  const y = 2.1 + Math.floor(i / 2) * 1.55;
  const colors = [BLUE, TEAL, "7C3AED", "0369A1"];
  card(s3, x, y, 4.4, 1.35, n.title, n.body, colors[i]);
});

// ─── SLIDE 4: THE CLEO ABRAM FRAMEWORK ───
const s4 = pres.addSlide();
s4.background = { color: NAVY };
addHeader(s4, "CONTENT STRATEGY", false);
addFooter(s4, "4");

s4.addText("The Cleo Abram Formula", {
  x: 0.5, y: 0.85, w: 9, h: 0.65,
  fontSize: 28, fontFace: "Calibri", color: WHITE,
  bold: true, align: "center"
});

const steps = [
  { num: "01", label: "Open With Wonder", body: "Start with a surprising fact or question.\nNEVER: \"Today I'm going to explain...\"" },
  { num: "02", label: "Use Analogies", body: "Compare neural networks to brains.\nMake the unfamiliar feel familiar." },
  { num: "03", label: "Show, Don't Tell", body: "Screen recordings, animations,\nreal-world examples every time." },
  { num: "04", label: "Have a POV", body: "Optimistic about AI, honest\nabout limitations. People follow voices." },
  { num: "05", label: "End With Reflection", body: "\"What does this mean for you?\"\nDrives comments & repeat viewers." },
];

steps.forEach((s, i) => {
  const x = 0.3 + (i % 5) * 1.88;
  s4.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.7, w: 1.7, h: 3.2,
    fill: { color: i % 2 === 0 ? "0C2D48" : "0F3D5C" },
    line: { color: BLUE, width: 1 }
  });
  s4.addText(s.num, {
    x, y: 1.75, w: 1.7, h: 0.55,
    fontSize: 24, fontFace: "Calibri", color: ACCENT,
    bold: true, align: "center"
  });
  s4.addShape(pres.shapes.LINE, {
    x: x + 0.35, y: 2.35, w: 1.0, h: 0,
    line: { color: TEAL, width: 1.5 }
  });
  s4.addText(s.label, {
    x, y: 2.45, w: 1.7, h: 0.55,
    fontSize: 12, fontFace: "Calibri", color: WHITE,
    bold: true, align: "center"
  });
  s4.addText(s.body, {
    x: x + 0.05, y: 3.05, w: 1.6, h: 1.7,
    fontSize: 10.5, fontFace: "Calibri", color: "93C5FD",
    align: "center", valign: "top"
  });
});

// ─── SLIDE 5: AUTOMATION STACK ───
const s5 = pres.addSlide();
s5.background = { color: "F8FAFC" };
addHeader(s5, "AUTOMATION");
addFooter(s5, "5");

s5.addText("The Create-Once, Publish-Everywhere System", {
  x: 0.5, y: 0.85, w: 9, h: 0.65,
  fontSize: 26, fontFace: "Calibri", color: NAVY,
  bold: true, align: "center"
});

// Flow diagram
const flowSteps = [
  { label: "Record 1 Video\n(7-10 min)", color: "1D4ED8" },
  { label: "AI Auto-Edits\n(CapCut/Descript)", color: "0891B2" },
  { label: "Upload\nYouTube", color: "DC2626" },
  { label: "Auto-Post to\nInstagram + TikTok", color: "7C3AED" },
  { label: "Newsletter\nIssue", color: TEAL },
];

flowSteps.forEach((s, i) => {
  const x = 0.3 + i * 1.85;
  s5.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.65, w: 1.65, h: 0.9,
    fill: { color: s.color },
    line: { color: s.color, width: 0 }
  });
  s5.addText(s.label, {
    x, y: 1.65, w: 1.65, h: 0.9,
    fontSize: 11, fontFace: "Calibri", color: WHITE,
    bold: true, align: "center", valign: "middle"
  });
  if (i < flowSteps.length - 1) {
    s5.addShape(pres.shapes.LINE, {
      x: x + 1.65, y: 2.1, w: 0.2, h: 0,
      line: { color: "94A3B8", width: 2 }
    });
  }
});

s5.addText("1 video = 5 pieces of content across 5 platforms", {
  x: 0.3, y: 2.7, w: 9.4, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: "0369A1",
  bold: true, align: "center"
});

const tools = [
  { title: "Scripting (Free)", body: "Claude / ChatGPT writes\nfirst drafts in minutes.\nYou record & refine." },
  { title: "Editing (Free)", body: "CapCut: AI captions,\nfiller removal, auto-zoom.\nGame-changer for beginners." },
  { title: "Thumbnails (Free)", body: "Canva templates — swap\ntext & photo in 10 min.\nFace + bold text = clicks." },
  { title: "Distribution ($25/mo)", body: "Repurpose.io posts to\nInstagram, TikTok, LinkedIn\nauto when YouTube goes live." },
];

tools.forEach((t, i) => {
  const x = 0.3 + (i % 4) * 2.35;
  card(s5, x, 3.2, 2.1, 1.9, t.title, t.body, BLUE);
});

// ─── SLIDE 6: MONETIZATION ───
const s6 = pres.addSlide();
s6.background = { color: "F8FAFC" };
addHeader(s6, "MONETIZATION");
addFooter(s6, "6");

s6.addText("How You'll Actually Make Money", {
  x: 0.5, y: 0.85, w: 9, h: 0.65,
  fontSize: 28, fontFace: "Calibri", color: NAVY,
  bold: true, align: "center"
});

const monetization = [
  { stage: "Month 1+", title: "Affiliate Marketing", body: "AI tools pay 30-45%\nrecurring commissions.\nJasper, Copy.ai, Notion,\nDescript, ConvertKit.", color: TEAL },
  { stage: "Month 2+", title: "Digital Products", body: "AI Prompt Packs ($9-15)\nNotion Templates ($15-25)\nStarter Guides ($5-10)\nCreated in one weekend.", color: BLUE },
  { stage: "Month 3+", title: "Micro-Sponsorships", body: "AI startups actively\nseek small channels.\n500 engaged subs = deals.\n$100-500 per mention.", color: "7C3AED" },
  { stage: "Month 6+", title: "YouTube Ads", body: "1K subs + 4K hours\nunlocks Partner Program.\nAI content earns\n$15-35 CPM (2-3x avg).", color: GOLD },
];

monetization.forEach((m, i) => {
  const x = 0.35 + (i % 4) * 2.35;
  s6.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.65, w: 2.1, h: 3.2,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 }
  });
  s6.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.65, w: 2.1, h: 0.55,
    fill: { color: m.color },
    line: { color: m.color, width: 0 }
  });
  s6.addText(m.stage, {
    x, y: 1.65, w: 2.1, h: 0.55,
    fontSize: 11, fontFace: "Calibri", color: WHITE,
    bold: true, align: "center", valign: "middle"
  });
  s6.addText(m.title, {
    x: x + 0.1, y: 2.28, w: 1.9, h: 0.45,
    fontSize: 14, fontFace: "Calibri", color: m.color,
    bold: true, align: "center"
  });
  s6.addText(m.body, {
    x: x + 0.1, y: 2.75, w: 1.9, h: 2.0,
    fontSize: 12, fontFace: "Calibri", color: "334155",
    align: "center", valign: "top"
  });
});

// ─── SLIDE 7: REALISTIC INCOME PROJECTION ───
const s7 = pres.addSlide();
s7.background = { color: NAVY };
addHeader(s7, "INCOME PROJECTION", false);
addFooter(s7, "7");

s7.addText("Realistic Income by Month 12", {
  x: 0.5, y: 0.85, w: 9, h: 0.65,
  fontSize: 28, fontFace: "Calibri", color: WHITE,
  bold: true, align: "center"
});

const projections = [
  { month: "Month 1", subscribers: "0-50", income: "$0-20", source: "First affiliate clicks" },
  { month: "Month 2", subscribers: "50-200", income: "$30-80", source: "Affiliate + 1st product sale" },
  { month: "Month 3", subscribers: "200-500", income: "$100-250", source: "Affiliate + products + 1st sponsor" },
  { month: "Month 6", subscribers: "500-1,200", income: "$300-600", source: "All streams + YouTube ads" },
  { month: "Month 12", subscribers: "2,000-5,000", income: "$800-2,500", source: "Compound growth, all streams active" },
];

const tableData = [
  [
    { text: "Period", options: { bold: true, color: ACCENT, fontSize: 12, fontFace: "Calibri" } },
    { text: "Subscribers", options: { bold: true, color: ACCENT, fontSize: 12, fontFace: "Calibri" } },
    { text: "Monthly Income", options: { bold: true, color: ACCENT, fontSize: 12, fontFace: "Calibri" } },
    { text: "Primary Sources", options: { bold: true, color: ACCENT, fontSize: 12, fontFace: "Calibri" } },
  ],
  ...projections.map((p, i) => [
    { text: p.month, options: { color: WHITE, fontSize: 12, fontFace: "Calibri", bold: true } },
    { text: p.subscribers, options: { color: "BAE6FD", fontSize: 12, fontFace: "Calibri" } },
    { text: p.income, options: { color: i >= 3 ? GOLD : "93C5FD", fontSize: 12, fontFace: "Calibri", bold: i >= 3 } },
    { text: p.source, options: { color: "94A3B8", fontSize: 11, fontFace: "Calibri" } },
  ])
];

s7.addTable(tableData, {
  x: 0.4, y: 1.65, w: 9.2, h: 3.3,
  border: { pt: 1, color: "1E3A5F" },
  fill: { color: "0C1A2E" },
  colW: [1.5, 1.8, 1.9, 4.0],
  rowH: 0.5
});

s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 5.05, w: 9.2, h: 0.35,
  fill: { color: "0C2D48" },
  line: { color: "1E3A5F", width: 1 }
});
s7.addText("Note: YouTube Partner Program requires 1,000 subscribers + 4,000 watch hours. Affiliate income can start week one.", {
  x: 0.5, y: 5.05, w: 9, h: 0.35,
  fontSize: 10, fontFace: "Calibri", color: "64748B",
  align: "center", valign: "middle"
});

// ─── SLIDE 8: 90-DAY ROADMAP ───
const s8 = pres.addSlide();
s8.background = { color: "F8FAFC" };
addHeader(s8, "90-DAY ROADMAP");
addFooter(s8, "8");

s8.addText("Your First 90 Days — Step by Step", {
  x: 0.5, y: 0.85, w: 9, h: 0.65,
  fontSize: 26, fontFace: "Calibri", color: NAVY,
  bold: true, align: "center"
});

const phases = [
  {
    phase: "Days 1-7: Foundation",
    color: "1D4ED8",
    items: ["Set up YouTube + Instagram", "Design channel art (Canva)", "Record channel trailer", "Sign up for affiliate programs", "Script first 3 videos"]
  },
  {
    phase: "Days 8-30: Launch",
    color: TEAL,
    items: ["Publish Video 1: How ChatGPT Works", "Publish Video 2: AI Tool Test", "Publish Video 3: ML Explained", "Post 3 Reels + 2 carousels", "Create first digital product (Gumroad)"]
  },
  {
    phase: "Days 31-90: Momentum",
    color: "7C3AED",
    items: ["2 videos/week consistently", "Set up Repurpose.io automation", "Start email newsletter", "Reach out to 3 AI companies", "Aim for 500 subscribers"]
  }
];

phases.forEach((phase, i) => {
  const x = 0.3 + i * 3.15;
  s8.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.65, w: 2.95, h: 3.4,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.07 }
  });
  s8.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.65, w: 2.95, h: 0.52,
    fill: { color: phase.color },
    line: { color: phase.color, width: 0 }
  });
  s8.addText(phase.phase, {
    x, y: 1.65, w: 2.95, h: 0.52,
    fontSize: 12, fontFace: "Calibri", color: WHITE,
    bold: true, align: "center", valign: "middle"
  });
  phase.items.forEach((item, j) => {
    s8.addShape(pres.shapes.OVAL, {
      x: x + 0.12, y: 2.28 + j * 0.5, w: 0.18, h: 0.18,
      fill: { color: phase.color },
      line: { color: phase.color, width: 0 }
    });
    s8.addText(item, {
      x: x + 0.38, y: 2.26 + j * 0.5, w: 2.45, h: 0.4,
      fontSize: 11.5, fontFace: "Calibri", color: "334155",
      valign: "middle"
    });
  });
});

// ─── SLIDE 9: TOOLS STACK ───
const s9 = pres.addSlide();
s9.background = { color: "F8FAFC" };
addHeader(s9, "TOOLS STACK");
addFooter(s9, "9");

s9.addText("Your Complete Free & Paid Toolkit", {
  x: 0.5, y: 0.85, w: 9, h: 0.65,
  fontSize: 26, fontFace: "Calibri", color: NAVY,
  bold: true, align: "center"
});

const toolCols = [
  {
    category: "FREE Tools",
    color: TEAL,
    tools: [
      "CapCut — edit + AI captions",
      "Canva — thumbnails + carousels",
      "Perplexity AI — research",
      "Claude / ChatGPT — scripting",
      "OBS Studio — screen record",
      "TubeBuddy — YouTube SEO"
    ]
  },
  {
    category: "PAID Tools (<$50/mo)",
    color: BLUE,
    tools: [
      "Descript $12 — edit by transcript",
      "Buffer $6 — schedule social posts",
      "Repurpose.io $25 — auto-distribute",
      "vidIQ $7 — advanced analytics",
      "ConvertKit $0-9 — email list",
      "Gumroad $0 — sell products"
    ]
  },
  {
    category: "Affiliate Programs",
    color: GOLD,
    tools: [
      "Jasper AI — 30% recurring",
      "Copy.ai — 45% first year",
      "Descript — 15% recurring",
      "Notion — $10/Pro referral",
      "ConvertKit — 30% for life",
      "Midjourney — referral bonuses"
    ]
  }
];

toolCols.forEach((col, i) => {
  const x = 0.3 + i * 3.15;
  s9.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.65, w: 2.95, h: 3.55,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.07 }
  });
  s9.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.65, w: 2.95, h: 0.5,
    fill: { color: col.color },
    line: { color: col.color, width: 0 }
  });
  s9.addText(col.category, {
    x, y: 1.65, w: 2.95, h: 0.5,
    fontSize: 13, fontFace: "Calibri", color: WHITE,
    bold: true, align: "center", valign: "middle"
  });
  col.tools.forEach((tool, j) => {
    s9.addText("• " + tool, {
      x: x + 0.15, y: 2.24 + j * 0.47, w: 2.65, h: 0.42,
      fontSize: 11.5, fontFace: "Calibri", color: "334155",
      valign: "middle"
    });
  });
});

// ─── SLIDE 10: CLOSING ───
const s10 = pres.addSlide();
s10.background = { color: NAVY };
s10.addShape(pres.shapes.OVAL, {
  x: -1.5, y: -1, w: 7, h: 7,
  fill: { color: "0C2D48", transparency: 20 },
  line: { color: "0C2D48", width: 0 }
});
s10.addShape(pres.shapes.OVAL, {
  x: 5, y: 1, w: 6, h: 6,
  fill: { color: "1E3A5F", transparency: 40 },
  line: { color: "1E3A5F", width: 0 }
});

s10.addText("The best time to start was yesterday.", {
  x: 0.5, y: 1.1, w: 9, h: 0.75,
  fontSize: 32, fontFace: "Calibri", color: WHITE,
  bold: true, align: "center"
});
s10.addText("The second best time is today.", {
  x: 0.5, y: 1.85, w: 9, h: 0.75,
  fontSize: 32, fontFace: "Calibri", color: ACCENT,
  bold: true, align: "center"
});
s10.addShape(pres.shapes.LINE, {
  x: 2, y: 2.75, w: 6, h: 0,
  line: { color: TEAL, width: 2 }
});

const nextSteps = [
  "Day 1: Create channel + sign up for 2 affiliate programs",
  "Day 2: Script your first video with AI assistance",
  "Day 3: Record, edit (CapCut), and upload",
  "Week 2: Start Instagram, post first Reel",
  "Month 1: Publish 4 videos and create a digital product",
];

nextSteps.forEach((step, i) => {
  s10.addText(`${i + 1}.  ${step}`, {
    x: 2, y: 3.0 + i * 0.45, w: 6, h: 0.42,
    fontSize: 13, fontFace: "Calibri", color: i === 0 ? GOLD : "BAE6FD",
    bold: i === 0
  });
});

s10.addText("Your audience is waiting. They just don't know you exist yet.", {
  x: 0.5, y: 5.2, w: 9, h: 0.35,
  fontSize: 12, fontFace: "Calibri", color: "475569",
  align: "center", italic: true
});

pres.writeFile({ fileName: './outputs/AI_Channel_Blueprint.pptx' })
  .then(() => console.log('PPTX created successfully'))
  .catch(err => { console.error('Error:', err); process.exit(1); });
