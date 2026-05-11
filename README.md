# AI Explainer Channel — Strategy Automation Pipeline

> Generate a full YouTube/Instagram channel strategy with one command: strategy doc, slide deck, and 90-day action plan — all automated.

## What This Generates

| File | Description |
|------|-------------|
| `outputs/AI_Channel_Playbook.docx` | Complete strategy guide — niche analysis, content framework, automation stack, monetization roadmap |
| `outputs/AI_Channel_Blueprint.pptx` | 10-slide visual deck — opportunity, content pillars, income projections, 90-day roadmap |
| `outputs/AI_Channel_Action_Plan.xlsx` | 4-sheet spreadsheet — task tracker, 20-video content calendar, monetization tracker, analytics dashboard |

## Niche

**AI Explained Simply** — Cleo Abram-style explainer content for AI, ML, and emerging tech. High demand, low competition, premium CPM ($15–35). Full niche analysis and content strategy included in the generated doc.

## Quick Start

### 1. Install dependencies

```bash
npm install        # installs docx + pptxgenjs
pip install -r requirements.txt   # installs openpyxl
```

### 2. Generate everything

```bash
npm run generate:all
```

Or generate files individually:

```bash
npm run generate:doc      # Word strategy doc
npm run generate:slides   # PowerPoint deck
npm run generate:plan     # Excel action plan
```

All outputs land in the `outputs/` folder.

## Requirements

- Node.js 16+
- Python 3.8+
- npm

## Files

```
ai-channel-playbook/
├── generate_strategy_doc.js   # Generates the Word strategy doc
├── generate_slides.js         # Generates the PowerPoint deck
├── generate_action_plan.py    # Generates the Excel action plan
├── outputs/                   # Pre-generated files (ready to use)
│   ├── AI_Channel_Playbook.docx
│   ├── AI_Channel_Blueprint.pptx
│   └── AI_Channel_Action_Plan.xlsx
├── package.json
├── requirements.txt
└── README.md
```

## Monetization Roadmap (Summary)

| Timeline | Stream | Expected Income |
|----------|--------|----------------|
| Month 1+ | Affiliate marketing (Jasper, Copy.ai, Notion) | $20–80/mo |
| Month 2+ | Digital products (prompt packs, templates) | $50–200/mo |
| Month 3+ | Micro-sponsorships from AI companies | $100–500/video |
| Month 6+ | YouTube Partner Program (ads) | $150–500/mo |

---

Built with [docx](https://github.com/dolanmiu/docx), [pptxgenjs](https://github.com/gitbrent/PptxGenJS), and [openpyxl](https://openpyxl.readthedocs.io/).
