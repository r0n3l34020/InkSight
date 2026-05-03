# InkSight
InkSight is a free, high-performance AI writing collaborator built directly into Google Docs, designed to transform flat drafts into professional-grade prose, using the Gemini 2.5 Flash engine.🚀
# 📖 InkSight AI — Writing Assistant for Google Docs

> **Built by [Ronel Jonathan](https://github.com/roneljonathan)**
> © 2026 Ronel Jonathan. All Rights Reserved. Unauthorized redistribution or commercial rebranding is prohibited.

---

## ✨ What is InkSight?

InkSight is a **professional-grade AI writing assistant** that lives right inside your Google Docs. Powered by **Gemini 2.5 Flash**, it's built specifically for writers who need real creative firepower — thriller editors, fiction writers, screenwriters, and anyone who's ever stared at a paragraph and thought *"this needs to hit harder."*

It's not just a chatbot slapped into a sidebar. It's a purpose-built tool with:

- 🎯 **Context awareness** — it reads your selected text so it actually knows what you're working on
- ⚡ **One-touch Quick Actions** — sensory rewrite, tension deepening, dialogue repair, cliffhangers, and more
- 🧠 **Custom persona engine** — tell it to think like a gritty noir editor or a YA sensitivity reader
- 📄 **Insert to Doc** — push the AI output directly into your document, formatted clean
- 📊 **Usage analytics** — tracks real usage across all users via Google Sheets
- ⭐ **User rating system** — collects feedback so the tool keeps getting better

---

## 🚀 How to Get It Running (on your own Google Doc)

### Step 1 — Open the Template Doc

Click the link below 👇 to open the shared template. It has all the extension files already inside it.

> 🔗 **[Template Doc Link — paste yours here]**

When it opens, hit **"Use Template"** (or **File → Make a Copy**) to clone it into your own Google Drive. You now own your own copy.

---

### Step 2 — Get Your Free Gemini API Key

This is the part that sounds scary but genuinely takes like 2 minutes. No credit card needed.

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account (same one you use for Docs)
3. Click **"Create API Key"**
4. Copy the key — it looks like a long string of random letters and numbers

> 💡 That's it. Seriously. Google gives you free access to Gemini 2.5 Flash — **10 requests per minute, 250 requests per day** — no billing info required. For a writing session that's more than enough.

---

### Step 3 — Open the Script Editor

Inside your copied Google Doc:

1. Click **Extensions** in the top menu bar
2. Click **Apps Script**
3. A new tab opens — this is where the InkSight code lives
4. You don't need to touch the code at all. Just check it's there.

---

### Step 4 — Deploy the Extension

Still inside Apps Script:

1. Click **"Deploy"** → **"New Deployment"**
2. Click the gear icon ⚙️ next to **"Type"** and select **"Add-on"**
3. Hit **"Deploy"**
4. Google will ask you to authorize the script — click through the permissions (it needs access to your Doc and the internet to call the AI)
5. Once deployed, **close the Apps Script tab** and go back to your Doc

---

### Step 5 — Open InkSight

Back in your Google Doc:

1. Refresh the page
2. You should see **📖 InkSight** in the top menu bar
3. Click it → **"Open Sidebar"**
4. The InkSight panel appears on the right side of your screen

---

### Step 6 — Paste Your API Key

Inside the sidebar:

1. Click **⚙ Configuration** to expand the panel
2. Paste your Gemini API key into the field
3. Hit **"Save Key"**
4. Done — the key is stored securely in your Google Account. You only do this once.

---

### Step 7 — Write Something

- **Highlight any text** in your doc
- Click one of the **Quick Action** buttons
- Read the output in the sidebar
- Hit **"Insert to Doc"** or **"Copy"** — your call

---

## 🛠 Quick Actions — What They Do

| Button | What it does |
|---|---|
| 👁 **Sensory Punch-up** | Injects sight, sound, smell, texture into your passage |
| ⚡ **Tension Deepener** | Amplifies dread, subtext, and psychological stakes |
| 💬 **Dialogue Doctor** | Kills filler lines and sharpens what's left |
| 🪝 **Cliffhanger Generator** | Generates 3 high-stakes plot pivots labeled A, B, C |
| ♻ **Rephrase** | Same meaning, completely different sentence structures |
| 🔄 **POV Flip** | Switches first-person ↔ third-person |

---

## 💥 Known Errors & How to Fix Them

These are the errors that came up during development — so you don't have to go through the same pain.

---

### ❌ `API Error 404: models/gemini-pro is not found`

**What happened:** The model name in the code was pointing to a deprecated model (`gemini-pro`) that Google retired.

**The fix:** The code now uses `gemini-2.5-flash` via the `MODEL_ID` constant. If this ever breaks again in the future (Google loves deprecating things), just update that one constant at the top of `code.gs`.

> ⚠️ **Lesson learned:** Never hardcode model strings. Always use a named constant so you can swap it in one place.

---

### ❌ `API Error 404: models/gemini-1.5-flash-latest is not found`

**What happened:** Same issue — `-latest` aliases stopped resolving on the `v1beta` endpoint after Gemini 1.5 was retired in early 2026.

**The fix:** Switched to `gemini-2.5-flash` (no suffix, no version number). If you see this error yourself, it means Google deprecated the model again — head to [Google AI Studio](https://aistudio.google.com) → "Models" to find the current free-tier model name.

---

### ❌ `MODEL_ID defined but never used` (silent bug)

**What happened:** The constant `MODEL_ID` was declared at the top of the file but the actual API URL inside `callGemini()` was still hardcoded to `gemini-pro`. The constant was completely ignored.

**The fix:** The URL now uses `${MODEL_ID}` interpolation. If you ever add a model switcher or want to test different models, `MODEL_ID` is the only thing you change.

---

### ❌ AI output has random `**bold**` or `# Headings` showing up in the text

**What happened:** Gemini formats its responses in Markdown by default, even when you don't ask for it. This looks terrible inside a literary manuscript.

**The fix:** A post-processing regex chain strips all Markdown before the text hits the sidebar:
```
** → removed (bold)
*  → removed (italics)
#  → removed (headings)
`  → removed (code ticks)
>  → removed (blockquotes)
-  → removed (list markers)
```

---

### ❌ `⚠️ No text selected. Highlight a passage...`

**What's happening:** You clicked a Quick Action without selecting text first. Quick Actions need context — they rewrite *your* passage, not the void.

**The fix:** Highlight some text in your doc, then click the button.

---

### ❌ `Connection Error: ...`

**What's happening:** A network failure between Apps Script and the Gemini API. Usually temporary.

**The fix:** Wait a few seconds and try again. If it persists:
- Check your internet connection
- Check [Google AI Studio status](https://status.cloud.google.com/)
- Make sure your API key didn't expire or hit its quota

---

### ❌ `⚠️ The model returned an empty response`

**What's happening:** The model generated a response but it was empty — usually because the prompt was too vague, too short, or triggered a silent filter.

**The fix:** 
- Select more text before using a Quick Action
- Add more detail to your custom prompt
- Try rephrasing — sometimes a single word triggers a soft block

---

### ❌ Analytics counter shows `0` or `—` even after using the tool

**What's happening:** The `TRACKER_SHEET_ID` hasn't been set yet, so the analytics engine can't reach the Google Sheet.

**The fix:** 
1. Create a Google Sheet
2. Set sharing to **"Anyone with the link can edit"**
3. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
4. Paste it into `code.gs` where it says `'YOUR_ACTUAL_SHEET_ID_HERE'`
5. Redeploy

Until the Sheet ID is set, the counter falls back to the local `UserProperties` counter automatically — so the tool still works, it just won't show global usage.

---

### ❌ `Authorization required` popup when opening the sidebar

**What's happening:** First-time deployment requires Google account permissions. This is normal and expected.

**The fix:** Click through every permission screen. InkSight needs:
- `DocumentApp` — to read your selected text and insert output
- `UrlFetchApp` — to call the Gemini API
- `PropertiesService` — to store your API key securely
- `SpreadsheetApp` — for analytics logging

None of this data goes anywhere except your own Google Account and the Sheet you own.

---

## 🔐 Privacy & Security

- 🔑 Your API key is stored in **`UserProperties`** — it's tied to your Google account and is never visible to the developer or anyone else
- 📊 Analytics only log: timestamp, email, action type, and optional rating feedback
- 🚫 No user document content is ever stored — the selected text is sent directly to the Gemini API and nowhere else
- 💸 InkSight runs entirely on Google's free tier. No subscriptions, no payments, no hidden costs.

---

## 📁 File Structure

```
InkSight/
├── code.gs          # Backend: AI engine, analytics, document utilities
└── Sidebar.html     # Frontend: UI, quick actions, rating modal
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Google Apps Script (V8) |
| AI Model | Gemini 2.5 Flash via Google AI Studio |
| API Endpoint | `v1beta/models/gemini-2.5-flash:generateContent` |
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JS |
| Storage | `PropertiesService` (API key + session data) |
| Analytics | Google Sheets via `SpreadsheetApp` |
| Fonts | Cormorant Garamond, JetBrains Mono, Inter |

---

## 📜 License & Attribution

© 2026 **Ronel Jonathan**. All Rights Reserved.

This project is **source-available but not open-source**. You may:
- ✅ Use it for personal writing projects
- ✅ Fork it for private, non-commercial use
- ✅ Suggest improvements via Issues

You may **not**:
- ❌ Redistribute it under a different name
- ❌ Sell it, rebrand it, or use it commercially
- ❌ Remove author attribution from the source code

---

*Built with way too much Diet Coke and a deep obsession for optimizing productivity.*
