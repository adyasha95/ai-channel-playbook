const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, Header, Footer, PageNumber, PageBreak, TableOfContents,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');

const BLUE = "1E40AF";
const ACCENT = "0EA5E9";
const DARK = "1E293B";
const LIGHT_BG = "F0F9FF";
const MID_BG = "E0F2FE";

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: BLUE })],
    spacing: { before: 360, after: 180 },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: "0369A1" })],
    spacing: { before: 280, after: 120 },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: DARK })],
    spacing: { before: 200, after: 100 },
  });
}

function p(text, bold = false, color = DARK) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, bold, color })],
    spacing: { before: 80, after: 80 },
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text, font: "Arial", size: 22, color: DARK })],
    spacing: { before: 60, after: 60 },
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    children: [new TextRun({ text, font: "Arial", size: 22, color: DARK })],
    spacing: { before: 60, after: 60 },
  });
}

function callout(label, text) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "BAE6FD" };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: label + " ", font: "Arial", size: 22, bold: true, color: "0369A1" }),
                  new TextRun({ text, font: "Arial", size: 22, color: DARK }),
                ],
                spacing: { before: 0, after: 0 },
              })
            ]
          })
        ]
      })
    ]
  });
}

function twoColTable(col1Header, col2Header, rows, col1Color = "1E40AF") {
  const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "BAE6FD" };
  const hBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };
  const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" };
  const cBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders: hBorders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: "1D4ED8", type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: col1Header, font: "Arial", size: 22, bold: true, color: "FFFFFF" })] })]
      }),
      new TableCell({
        borders: hBorders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: "1D4ED8", type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: col2Header, font: "Arial", size: 22, bold: true, color: "FFFFFF" })] })]
      }),
    ]
  });

  const dataRows = rows.map(([c1, c2], i) => new TableRow({
    children: [
      new TableCell({
        borders: cBorders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? "FFFFFF" : "F8FAFC", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: c1, font: "Arial", size: 20, bold: true, color: DARK })] })]
      }),
      new TableCell({
        borders: cBorders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? "FFFFFF" : "F8FAFC", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: c2, font: "Arial", size: 20, color: DARK })] })]
      }),
    ]
  }));

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [headerRow, ...dataRows]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 80, after: 80 } });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1, format: LevelFormat.BULLET, text: "\u25E6",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: DARK } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "0369A1" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "AI Explainer Channel Playbook", font: "Arial", size: 18, color: "64748B" }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "BAE6FD", space: 1 } }
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Confidential  |  Page ", font: "Arial", size: 16, color: "94A3B8" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "94A3B8" }),
          ],
          alignment: AlignmentType.CENTER
        })]
      })
    },
    children: [
      // ─── COVER ───
      new Paragraph({
        children: [new TextRun({ text: "", font: "Arial", size: 22 })],
        spacing: { before: 1200, after: 0 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "AI EXPLAINER CHANNEL", font: "Arial", size: 52, bold: true, color: BLUE, allCaps: true })],
        spacing: { before: 0, after: 160 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Complete Growth & Monetization Playbook", font: "Arial", size: 32, color: "0369A1" })],
        spacing: { before: 0, after: 320 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "From Zero to Revenue — Automated, Ethical, Scalable", font: "Arial", size: 24, italic: true, color: "64748B" })],
        spacing: { before: 0, after: 600 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Prepared for Ady  |  March 2026", font: "Arial", size: 20, color: "94A3B8" })],
        spacing: { before: 0, after: 0 },
      }),

      pageBreak(),

      // ─── TABLE OF CONTENTS ───
      h1("Table of Contents"),
      new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),

      pageBreak(),

      // ─── SECTION 1: EXECUTIVE SUMMARY ───
      h1("1. Executive Summary"),
      p("You are about to build something genuinely exciting: a YouTube and Instagram channel that explains AI, machine learning, and emerging tech in a way anyone can understand — styled after creators like Cleo Abram. This playbook gives you a complete, step-by-step system to go from zero to a growing, monetized channel with as little friction as possible."),
      spacer(),
      callout("The Core Idea:", "Make AI feel exciting and human — not scary and technical. Your audience is curious people (professionals, students, parents, entrepreneurs) who keep hearing about AI but feel left out. You are their guide."),
      spacer(),
      h2("Why This Niche Is Exceptional Right Now"),
      bullet("AI is the #1 topic on the internet in 2025-2026, but most content is either too technical or too shallow"),
      bullet("Search volume for \"how does AI work\", \"what is machine learning\", \"AI explained\" grows 40%+ year over year"),
      bullet("Advertisers pay premium CPMs for AI-adjacent content (often $15-35 per 1,000 views)"),
      bullet("AI tool companies actively seek small but engaged channels for sponsorships"),
      bullet("The \"explainer\" format performs extremely well on both YouTube and Instagram Reels"),
      spacer(),
      callout("Honest Expectation:", "YouTube Partner Program (ads revenue) requires 1,000 subscribers + 4,000 watch hours. That typically takes 3-6 months. But affiliate income, sponsorships, and digital products can start earning within weeks — and that is the strategy here."),

      pageBreak(),

      // ─── SECTION 2: NICHE ───
      h1("2. Your Niche: AI Explained Simply"),
      p("The specific niche is: 'Complex AI concepts made understandable for curious, non-technical people.' Think Cleo Abram's 'Huge If True' but focused entirely on AI, machine learning, and how these tools are reshaping everyday life."),
      spacer(),
      h2("The Three-Layer Niche Framework"),
      p("Your content lives at the intersection of three high-value audiences:"),
      spacer(),
      twoColTable("Audience Segment", "What They Want", [
        ["Curious Professionals", "Understand AI to stay relevant in their careers — doctors, teachers, marketers, lawyers"],
        ["Entrepreneurs & Freelancers", "Learn which AI tools can save them time and money right now"],
        ["Students & Lifelong Learners", "Grasp the concepts behind AI to engage with the future intelligently"],
      ]),
      spacer(),

      h2("Content Pillars"),
      p("Structure every video around one of these four pillars:"),
      spacer(),
      numbered("Concept Explainers — \"What is [AI concept] actually?\""),
      bullet("Examples: What is a neural network? How does ChatGPT actually work? What does 'training an AI' mean?", 1),
      bullet("Format: 6-10 minute YouTube / 60-90 second Reels version", 1),
      spacer(),
      numbered("Tool Deep Dives — \"This AI tool changed how I [task]\""),
      bullet("Examples: Perplexity vs Google, Midjourney for non-designers, AI tools for writers", 1),
      bullet("Format: Tutorial-style, screen recording + narration", 1),
      spacer(),
      numbered("News Explainers — \"What [AI news story] actually means for you\""),
      bullet("Examples: GPT-5 released — what changes? Meta's new AI — why it matters", 1),
      bullet("Format: Fast-paced, 5-7 minutes, opinion + explanation", 1),
      spacer(),
      numbered("Impact Stories — \"How AI is changing [industry]\""),
      bullet("Examples: How AI is helping doctors, How artists are using AI, AI in education", 1),
      bullet("Format: Human-centered, storytelling-first, longer form 10-12 min", 1),

      pageBreak(),

      // ─── SECTION 3: CHANNEL SETUP ───
      h1("3. Channel Setup & Branding"),
      h2("YouTube Channel Setup"),
      numbered("Channel name: Keep it simple and searchable. Options: 'AI Simply', 'Decoded AI', 'The AI Brief', 'Plain AI', 'AI Translated'"),
      numbered("Channel art: Use Canva — minimalist dark background, your channel name, tagline like 'AI Explained for Everyone'"),
      numbered("Channel description: Include keywords naturally — 'AI explained, machine learning simply, AI tools tutorials'"),
      numbered("About section: Write in first person, warm and approachable, mention upload schedule"),
      numbered("Channel trailer: 60-90 seconds. Script: 'If AI feels overwhelming or confusing, this channel is for you. I break down everything — [examples] — so you don't need a CS degree to understand the future.'"),
      spacer(),
      h2("Instagram Setup"),
      numbered("Username: Match or complement your YouTube handle"),
      numbered("Bio: 'Making AI understandable for everyone | New explainer every week | Link below for full videos'"),
      numbered("Reels strategy: Take every YouTube video and create a 60-90 second 'hook + key insight' version for Reels"),
      numbered("Feed posts: Carousels work extremely well for AI topics — '5 things ChatGPT can do that most people don't know'"),
      spacer(),
      callout("Pro Tip:", "Don't try to make Instagram a separate strategy. Let it be a distribution layer — every YouTube video automatically becomes 1 Reel + 1 carousel post. More on this in the Automation section."),

      pageBreak(),

      // ─── SECTION 4: CONTENT STRATEGY ───
      h1("4. The Content Strategy"),
      h2("The Cleo Abram Framework"),
      p("Cleo Abram's success formula, adapted for your channel:"),
      spacer(),
      bullet("Open with wonder, not explanation — start with a surprising fact or question, never with 'Today I'm going to explain...'"),
      bullet("Use analogies relentlessly — compare neural networks to human brains, compare training AI to teaching a child"),
      bullet("Show, don't just tell — screen recordings, animations (CapCut/Canva has free ones), real-world examples"),
      bullet("Have a distinct point of view — you are optimistic about AI but honest about limitations"),
      bullet("End with a call to reflection — 'What does this mean for you?' or a question that sparks comments"),
      spacer(),
      h2("YouTube SEO Strategy"),
      p("Titles that perform well in this niche follow these patterns:"),
      bullet("'[AI Topic] Explained in [X] Minutes (No Tech Background Needed)'"),
      bullet("'I Tested [AI Tool] for [X Days] — Here's What Actually Happened'"),
      bullet("'Why [AI Concept] Is Simpler Than You Think'"),
      bullet("'The AI Tool Everyone's Talking About — But Does It Work?'"),
      bullet("'How [AI Thing] Actually Works (Animated Explanation)'"),
      spacer(),
      h2("Video Production Workflow (Beginner-Friendly)"),
      p("You do not need expensive equipment to start. Here is the minimum viable setup:"),
      spacer(),
      twoColTable("What You Need", "Free/Affordable Option", [
        ["Camera", "Your smartphone or laptop webcam — quality does not matter early on"],
        ["Lighting", "A window with natural light, or a $20 ring light from Amazon"],
        ["Microphone", "Built-in laptop mic is fine to start; Blue Snowball (~$50) is a big upgrade"],
        ["Video Editing", "CapCut (free) or DaVinci Resolve (free) — both are excellent"],
        ["Screen Recording", "OBS Studio (free) for tutorial/screen-capture videos"],
        ["Thumbnails", "Canva free tier — dozens of YouTube thumbnail templates"],
        ["Script Writing", "Claude or ChatGPT — writes first drafts in minutes"],
      ]),
      spacer(),
      numbered("Research the topic: Use Perplexity AI and YouTube search to find what people are already asking"),
      numbered("Write the script: Use Claude or ChatGPT with this prompt: 'Write a 7-minute YouTube script explaining [topic] for curious non-technical people, in the style of Cleo Abram. Use analogies, start with a surprising hook, and end with a reflection question.'"),
      numbered("Record: Use your phone or laptop webcam. Good lighting (window light or a $20 ring light) matters more than camera quality"),
      numbered("Edit: Use CapCut (free, AI-powered editing) or DaVinci Resolve (free, professional). CapCut's AI auto-captions and removes filler words automatically"),
      numbered("Thumbnail: Use Canva. Use a close-up of your face with an expression + bold text + simple background. This format outperforms every other thumbnail style"),
      numbered("Upload and optimize: Write SEO description with keyword-rich first 2 sentences, add 5-8 tags, use chapters"),

      pageBreak(),

      // ─── SECTION 5: AUTOMATION ───
      h1("5. The Automation Stack"),
      p("The goal is to create ONCE and distribute EVERYWHERE automatically. Here is the full system:"),
      spacer(),
      h2("Content Creation Automation"),
      bullet("Scripting: Claude or ChatGPT writes first drafts — you refine and record. Time saved: ~3 hours per video"),
      bullet("Research: Perplexity AI + YouTube search replaces hours of manual research"),
      bullet("Thumbnails: Canva templates — you just swap text and image. Time: 10 minutes per video"),
      bullet("Captions: CapCut auto-generates captions. Edit once, export"),
      spacer(),
      h2("Distribution Automation"),
      bullet("Repurpose.io or Zapier: Auto-post YouTube videos to Instagram, Facebook, LinkedIn when published"),
      bullet("Buffer or Later: Schedule all social posts a week in advance in one sitting"),
      bullet("TubeBuddy or vidIQ: Automate keyword research and title testing"),
      spacer(),
      h2("Engagement Automation (Ethical)"),
      bullet("Pin a comment on every video within the first hour — ask a question to drive engagement"),
      bullet("Use YouTube's auto-reply feature for common comments"),
      bullet("Set up an email welcome sequence for new subscribers (ConvertKit free tier)"),
      spacer(),
      callout("Weekly Time Budget:", "With full automation: 4-6 hours per video total. Without: 12-15 hours. The AI tools listed here genuinely cut production time by 60-70%."),
      spacer(),
      h2("The One-Video, Many-Platforms System"),
      numbered("Record one 7-10 minute YouTube video"),
      numbered("Export a 60-90 second highlights clip for Instagram Reels / YouTube Shorts"),
      numbered("Extract 3-5 key insights for a carousel post (Instagram/LinkedIn)"),
      numbered("Write a 280-character takeaway tweet/X post"),
      numbered("Turn the script into a newsletter issue (free on Substack or Beehiiv)"),
      p("One piece of content becomes 5 pieces of content across 5 platforms. That is how you grow fast without burning out."),

      pageBreak(),

      // ─── SECTION 6: MONETIZATION ───
      h1("6. Monetization Roadmap"),
      p("Here is the honest, stage-by-stage monetization path. No exaggerations — just what actually works and when."),
      spacer(),
      h2("Stage 1: Month 1-2 — Affiliate Marketing (Start Immediately)"),
      p("This is the fastest legitimate way to earn while your channel is tiny. AI tool companies offer generous affiliate commissions because their products have high lifetime value."),
      spacer(),
      bullet("Jasper AI: 30% recurring commission"),
      bullet("Copy.ai: 45% commission for first year"),
      bullet("Notion: $10 per referred Pro user"),
      bullet("Perplexity Pro: Referral bonuses"),
      bullet("Midjourney: Affiliate program"),
      bullet("Descript: 15% recurring"),
      bullet("ConvertKit: 30% recurring for life"),
      spacer(),
      p("Strategy: Mention 1-2 tools organically in every video. Put affiliate links in description. Even with 200 subscribers, if 10 people sign up through your links per month, that's real income."),
      spacer(),
      h2("Stage 2: Month 2-3 — Digital Products"),
      p("AI explainer channels are perfectly positioned to sell simple digital products:"),
      bullet("AI Prompt Pack: 'The 50 Best ChatGPT Prompts for [Profession]' — Sell for $9-15 on Gumroad"),
      bullet("Notion AI Workspace Template: 'My Complete AI-Powered Productivity Setup' — Sell for $15-25"),
      bullet("Quick Guides: PDF guides like 'AI Tools for Beginners: The Complete Starter Kit' — Sell for $5-10"),
      p("These can be created in a weekend with AI assistance and earn passively forever."),
      spacer(),
      h2("Stage 3: Month 3-6 — Brand Sponsorships"),
      p("AI tool companies actively seek channels with engaged audiences, even small ones. At 500-1,000 subscribers with good engagement (5%+ comment rate), you can approach:"),
      bullet("AI startups directly via LinkedIn or email"),
      bullet("Creator marketplace platforms: Grapevine, AspireIQ, Creator.co"),
      bullet("Typical rates for micro-influencers: $100-500 per dedicated video, $50-150 per mention"),
      spacer(),
      h2("Stage 4: Month 6+ — YouTube Partner Program"),
      p("Once you hit 1,000 subscribers and 4,000 watch hours, you qualify for YouTube ads. AI content typically earns $15-35 CPM (cost per 1,000 views) — significantly above average. At 10,000 monthly views, that is $150-350/month from ads alone. This compounds rapidly as the channel grows."),
      spacer(),
      callout("Realistic Month 6 Scenario:", "1,200 subscribers, 15,000 monthly views. Income: $200 YouTube ads + $300 affiliate commissions + $150 digital products + $200 occasional sponsorship = ~$850/month. By month 12 with consistent posting: 5,000+ subscribers and $2,000-4,000/month is very achievable."),

      pageBreak(),

      // ─── SECTION 7: 90-DAY PLAN ───
      h1("7. Your 90-Day Growth Plan"),
      h2("Days 1-7: Foundation Week"),
      numbered("Set up YouTube channel and Instagram account"),
      numbered("Design channel art and profile picture in Canva (30 min)"),
      numbered("Write and record your channel trailer"),
      numbered("Research and script your first 3 videos"),
      numbered("Sign up for affiliate programs: Jasper, Copy.ai, Notion"),
      numbered("Set up free ConvertKit account for email list"),
      spacer(),
      h2("Days 8-30: Launch Month"),
      numbered("Publish video #1 — Focus on a high-search topic: 'How ChatGPT Actually Works (Simple Explanation)'"),
      numbered("Publish video #2 one week later — Tool tutorial: 'I Used AI for Everything for a Week — Here's What Happened'"),
      numbered("Publish video #3 — Concept explainer: 'What is Machine Learning? (Explained with Everyday Examples)'"),
      numbered("Create Instagram presence — post 3 Reels (repurposed from videos) + 2 carousels"),
      numbered("Create your first digital product (AI Prompt Pack) — list on Gumroad"),
      numbered("Comment on 10-15 videos per day in your niche to build community and visibility"),
      spacer(),
      h2("Days 31-60: Momentum Building"),
      numbered("Publish 2 videos per week minimum — consistency is the #1 growth driver"),
      numbered("Analyze your first month: What got the most views? Create more of that"),
      numbered("Set up Repurpose.io for automatic cross-platform posting"),
      numbered("Reach out to 3 AI tool companies for potential micro-sponsorships"),
      numbered("Start a Substack or Beehiiv newsletter — repurpose video scripts as issues"),
      spacer(),
      h2("Days 61-90: Optimization & Scale"),
      numbered("Double down on your best-performing content formats"),
      numbered("Create a second digital product based on audience feedback"),
      numbered("Aim for 500 subscribers — you need 1,000 for monetization but 500 is a milestone that gets you brand deal conversations"),
      numbered("YouTube Shorts: Take your best moments and make 3-5 Shorts per week — these can go viral and rapidly grow your main channel"),
      numbered("Review analytics every Sunday — watch time, click-through rate, top search terms bringing traffic"),

      pageBreak(),

      // ─── SECTION 8: TOOLS ───
      h1("8. Complete Tools & Resources Guide"),
      h2("Free Tools (Use These First)"),
      bullet("CapCut: Video editing, AI auto-captions, silence removal, auto-zoom — free and incredibly powerful for beginners"),
      bullet("Canva: Thumbnails, carousel posts, channel art — free tier is more than enough"),
      bullet("Perplexity AI: Research assistant, much better than Google for finding specific information"),
      bullet("Claude/ChatGPT: Script writing, title brainstorming, SEO description writing"),
      bullet("OBS Studio: Free screen recording for tutorial videos"),
      bullet("DaVinci Resolve: Free professional video editor if you want more control than CapCut"),
      bullet("TubeBuddy (free tier): YouTube keyword research and optimization"),
      bullet("Substack/Beehiiv: Free newsletter platform — build your email list from day one"),
      spacer(),
      h2("Paid Tools Worth It (When You Have Budget)"),
      bullet("Descript ($12/month): AI-powered editing — edit video by editing the transcript. Game-changer for speed"),
      bullet("Buffer ($6/month): Schedule all social posts in one place"),
      bullet("Repurpose.io ($25/month): Automatically posts your YouTube videos to Instagram, TikTok, LinkedIn"),
      bullet("vidIQ ($7/month): YouTube analytics and keyword research, more powerful than TubeBuddy"),
      spacer(),
      h2("Affiliate Programs to Join"),
      bullet("Jasper AI: jasper.ai/affiliate — 30% recurring commission"),
      bullet("Copy.ai: copy.ai/affiliate — 45% first-year commission"),
      bullet("Descript: descript.com/affiliates — 15% recurring"),
      bullet("Notion: notion.so/affiliates — $10 per Pro referral"),
      bullet("ConvertKit: convertkit.com/affiliate — 30% recurring for life"),
      bullet("Gumroad: gumroad.com — sell your own digital products with zero upfront cost"),
      spacer(),
      h2("Learning Resources"),
      bullet("YouTube Creator Academy (free): Google's official resource for growing a channel"),
      bullet("Ali Abdaal's YouTube course: For understanding the business side of content creation"),
      bullet("Cleo Abram's videos: Study her intro hooks, pace, and how she uses analogies — this is your benchmark"),
      bullet("3Blue1Brown (YouTube): Study how he explains complex math/CS concepts visually — same skill set"),

      spacer(),
      spacer(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "— End of Playbook —", font: "Arial", size: 20, italic: true, color: "94A3B8" })],
        spacing: { before: 400, after: 100 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "The best time to start is today. The second best time is tomorrow.", font: "Arial", size: 22, bold: true, color: "0369A1" })],
        spacing: { before: 0, after: 0 }
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('./outputs/AI_Channel_Playbook.docx', buffer);
  console.log('DOCX created successfully');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
