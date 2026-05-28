/**
 * PROJECT   : InkSight AI
 * AUTHOR    : Ronel Jonathan
 * COPYRIGHT : © 2026 Ronel Jonathan. All Rights Reserved.
 * VERSION   : 2.0.0
 * UNAUTHORIZED DISTRIBUTION OR COMMERCIAL REBRANDING IS PROHIBITED.
 *
 * Platform  : Google Apps Script (GAS)
 * Model     : Gemini 2.5 Flash (v1beta)
 * Features  : Creative & Academic Modes, Quick Actions, Custom Prompts,
 *             Insert to Doc, Analytics Engine, Star Rating, Username
 *             Personalisation, Status Ping, Request Tracking
 */

// © Ronel Jonathan — InkSight AI v2.0.0
const EXTENSION_NAME = 'InkSight';
const MODEL_ID       = 'gemini-2.5-flash'; 

// © Ronel Jonathan
const TRACKER_SHEET_ID = 'YOUR_ACTUAL_SHEET_ID_HERE';


// © Ronel Jonathan, InkSight AI v2.0.0


const CREATIVE_ACTIONS = {
  sensory: {
    label:  'Sensory Punch-up',
    prompt: `Rewrite or enhance the provided passage by injecting visceral, hyper-specific sensory details — sight, sound, smell, texture, taste. Make the reader feel physically present in the scene. Do NOT add new plot points or characters. Only deepen the sensory atmosphere. Return only the enhanced passage with zero commentary, preamble, or markdown formatting.`
  },
  tension: {
    label:  'Tension Deepener',
    prompt: `Rewrite the provided passage to maximise psychological tension and raise the stakes. Amplify subtext, internal dread, unspoken threat, and the looming sense of danger. Do NOT resolve anything or introduce new plot elements. Return only the rewritten passage with zero commentary, preamble, or markdown formatting.`
  },
  dialogue: {
    label:  'Dialogue Doctor',
    prompt: `Fix the dialogue in the provided passage. Remove conversational filler, sharpen subtext, and make every line do double duty — reveal character AND advance tension simultaneously. Characters should never say exactly what they mean. Preserve the scene's action beats. Return only the improved passage with zero commentary, preamble, or markdown formatting.`
  },
  cliffhanger: {
    label:  'Cliffhanger Generator',
    prompt: `Based on the provided passage, generate exactly 3 distinct cliffhanger endings or high-stakes plot pivots that would leave the reader unable to stop. Each must be unexpected yet feel inevitable in hindsight. Label them clearly as OPTION A, OPTION B, and OPTION C. Be bold. No markdown formatting.`
  },
  monologue: {
    label:  'Internal Monologue',
    prompt: `Based on the selected passage, generate the raw, unfiltered internal monologue of the point-of-view character during this moment. Capture the emotional subtext, fears, desires, and contradictions they would never say out loud. The voice must feel distinct and human. Do not summarise the scene — inhabit it from the inside. Return only the internal monologue with zero commentary or markdown formatting.`
  },
  pov: {
    label:  'POV Flip',
    prompt: `Rewrite the provided passage from a different point of view. If it is in third-person, shift to intimate first-person. If it is in first-person, shift to a close third. Maintain all story events and details. Return only the rewritten passage with zero commentary or markdown formatting.`
  }
};



const ACADEMIC_ACTIONS = {
  formalizer: {
    label:  'Academic Formalizer',
    prompt: `Transform the selected text into formal, professional, peer-reviewed academic prose. Eliminate all casual language, contractions, and colloquialisms. Improve sentence variety and precision without altering the argument or adding new claims. Do NOT change the meaning — only elevate the register. Return only the formalised passage with zero commentary or markdown formatting.`
  },
  defluffer: {
    label:  'De-Fluffer',
    prompt: `Aggressively edit the selected text to remove wordiness, redundant phrases, filler words, and unnecessary qualifiers. Every word that survives must earn its place. Preserve all core arguments and evidence. The goal is maximum clarity at minimum word count. Return only the tightened passage with zero commentary or markdown formatting.`
  },
  critic: {
    label:  'Critical Reviewer',
    prompt: `Act as an academic peer reviewer. Do NOT rewrite the selected text. Instead, provide exactly 3 bullet points of critical, constructive feedback identifying: (1) a weakness in the argument or evidence, (2) a structural or clarity issue, (3) a specific suggestion for improvement. Be direct and specific. Label each point clearly as POINT 1, POINT 2, POINT 3. No markdown formatting.`
  },
  summarizer: {
    label:  'Source Summarizer',
    prompt: `Condense the selected research text into exactly 3 clear, precise sentences suitable for use as a quick reference summary before citation. Capture the main claim, the key evidence or method, and the significance or conclusion. Do not editorialize or add your own analysis. Return only the 3-sentence summary with zero commentary or markdown formatting.`
  },
  tldr: {
    label:  'TL;DR Generator',
    prompt: `Generate a concise abstract of the selected passage in 2–4 sentences. The abstract should capture: what the section is about, the core argument or finding, and why it matters. Write in formal academic tone. Return only the abstract with zero commentary or markdown formatting.`
  },
  counterarg: {
    label:  'Counter-Argument Generator',
    prompt: `You are a rigorous academic peer reviewer. Analyse the selected thesis or claim and generate 1–2 professional, evidence-based counter-arguments that challenge its logic, assumptions, or scope. Each counter-argument must: identify a specific weakness or limitation, reference the type of evidence or scholarly perspective that would support the opposing view, and be written in formal academic prose. Do NOT rewrite or improve the original claim — only critique it. Label each counter-argument clearly as COUNTER-ARGUMENT 1 and (if applicable) COUNTER-ARGUMENT 2. No markdown formatting.`
  }
};

// © Ronel Jonathan

function getAction(actionKey) {
  return CREATIVE_ACTIONS[actionKey] || ACADEMIC_ACTIONS[actionKey] || null;
}


// © Ronel Jonathan, InkSight AI v2.0.0



function logActivity(actionType, extra) {
  try {
    const sheet     = SpreadsheetApp.openById(TRACKER_SHEET_ID).getActiveSheet();
    const userEmail = Session.getEffectiveUser().getEmail();
    const username  = PropertiesService.getUserProperties().getProperty('INKSIGHT_USERNAME') || userEmail.split('@')[0];
    const timestamp = new Date();
    sheet.appendRow([timestamp, userEmail, username, actionType, extra || '']);
  } catch (e) {
    console.log('InkSight Analytics Ping Failed: ' + e.message);
  }
}


function getRequestCount() {
  try {
    const sheet = SpreadsheetApp.openById(TRACKER_SHEET_ID).getActiveSheet();
    const data  = sheet.getDataRange().getValues();
    
    const count = data.filter(row => row[3] === 'Generated Text').length;
    return count.toString();
  } catch (e) {
    return PropertiesService.getUserProperties().getProperty('REQUEST_COUNT') || '0';
  }
}

// © Ronel Jonathan


function pingStatus() {
  return true; 
}


// © Ronel Jonathan — InkSight AI v2.0.0


function getUsername() {
  const props    = PropertiesService.getUserProperties();
  const stored   = props.getProperty('INKSIGHT_USERNAME');
  const emailFallback = Session.getEffectiveUser().getEmail().split('@')[0];

  if (stored) {
    return { username: stored, isNew: false };
  }

  return { username: emailFallback, isNew: true };
}


function setUsername(name) {
  const clean = (name || '').trim();
  if (!clean) return 'Error: Name cannot be empty.';
  PropertiesService.getUserProperties().setProperty('INKSIGHT_USERNAME', clean);
  logActivity('Set Username', clean);
  return clean;
}


// © Ronel Jonathan

const RATING_FIRST_TRIGGER   = 5;
const RATING_REPEAT_INTERVAL = 20;


function checkRatingTrigger() {
  const props    = PropertiesService.getUserProperties();
  const sessions = parseInt(props.getProperty('SESSION_COUNT') || '0') + 1;
  props.setProperty('SESSION_COUNT', sessions.toString());

  const hasRated = props.getProperty('HAS_RATED') === 'true';

  if (sessions === RATING_FIRST_TRIGGER) return true;
  if (sessions > RATING_FIRST_TRIGGER &&
      (sessions - RATING_FIRST_TRIGGER) % RATING_REPEAT_INTERVAL === 0) {
    return !hasRated;
  }
  return false;
}


function logRating(stars, feedback) {
  PropertiesService.getUserProperties().setProperty('HAS_RATED', 'true');
  const extra = feedback && feedback.trim()
    ? `${stars} stars | ${feedback.trim()}`
    : `${stars} stars`;
  logActivity('User Rating', extra);
  return 'Thank you for your feedback!';
}


// © Ronel Jonathan — InkSight AI

function onOpen() {
  DocumentApp.getUi()
    .createMenu('📖 ' + EXTENSION_NAME)
    .addItem('Open Sidebar', 'showSidebar')
    .addToUi();
}


function showSidebar() {
  logActivity('Opened Sidebar');

  const showRating = checkRatingTrigger();
  PropertiesService.getUserProperties()
    .setProperty('SHOW_RATING_NEXT_LOAD', showRating ? 'true' : 'false');

  const html = HtmlService.createTemplateFromFile('Sidebar')
    .evaluate()
    .setTitle(EXTENSION_NAME)
    .setWidth(360); 
  DocumentApp.getUi().showSidebar(html);
}


function getSidebarInitData() {
  const props      = PropertiesService.getUserProperties();
  const showRating = props.getProperty('SHOW_RATING_NEXT_LOAD') === 'true';
  props.setProperty('SHOW_RATING_NEXT_LOAD', 'false'); 

  const userInfo = getUsername();

  return {
    count:      getRequestCount(),
    showRating: showRating,
    username:   userInfo.username,
    isNewUser:  userInfo.isNew
  };
}


// © Ronel Jonathan — InkSight AI v2.0.0

function saveSettings(key) {
  if (!key || key.trim() === '') return 'Error: No key provided.';
  PropertiesService.getUserProperties().setProperty('GEMINI_API_KEY', key.trim());
  logActivity('Saved API Key');
  return 'Saved successfully.';
}


// © Ronel Jonathan

function incrementCounter() {
  const props = PropertiesService.getUserProperties();
  const count = parseInt(props.getProperty('REQUEST_COUNT') || '0') + 1;
  props.setProperty('REQUEST_COUNT', count.toString());
  return count.toString();
}

// © Ronel Jonathan — InkSight AI v2.0.0

function getSelectedText() {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) return '';

  return selection
    .getRangeElements()
    .map(e => {
      const el = e.getElement();
      if (el.getType() === DocumentApp.ElementType.TEXT) return el.asText().getText();
      if (el.editAsText) return el.asText().getText();
      return '';
    })
    .filter(t => t.trim() !== '')
    .join('\n');
}


function insertTextToDoc(text) {
  try {
    const doc       = DocumentApp.getActiveDocument();
    const body      = doc.getBody();
    const selection = doc.getSelection();

    const cleanAttrs = {
      [DocumentApp.Attribute.BOLD]:             false,
      [DocumentApp.Attribute.ITALIC]:           false,
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#000000'
    };

    const lines = text.split('\n').filter(l => l.trim() !== '');

    if (selection) {
      const elements = selection.getRangeElements();
      const lastEl   = elements[elements.length - 1].getElement();
      let parent     = lastEl;
      while (parent.getParent() &&
             parent.getParent().getType() !== DocumentApp.ElementType.BODY_SECTION) {
        const p = parent.getParent();
        if (!p || p.getType() === DocumentApp.ElementType.BODY_SECTION) break;
        parent = p;
      }
      const idx = body.getChildIndex(parent);
      [...lines].reverse().forEach(line => {
        body.insertParagraph(idx + 1, line).setAttributes(cleanAttrs);
      });
    } else {
      body.appendParagraph('');
      lines.forEach(line => body.appendParagraph(line).setAttributes(cleanAttrs));
    }

    logActivity('Inserted to Doc');
    return 'Inserted successfully.';
  } catch (e) {
    return 'Insert Error: ' + e.toString();
  }
}


// © Ronel Jonathan — InkSight AI v2.0.0



function callQuickAction(actionKey, selectedText) {
  const action = getAction(actionKey);

  if (!action) {
    return { text: '⚠️ Unknown action. Please refresh the sidebar.', count: getRequestCount() };
  }
  
  if (!selectedText || selectedText.trim() === '') {
    return {
      text:  '⚠️ No Selection Detected: Please highlight the passage you want to refine.',
      count: getRequestCount()
    };
  }

  logActivity('Quick Action', action.label);
  return callGemini(action.prompt, '', selectedText);
}



function callGemini(userPrompt, persona, selectedText) {
  const apiKey = PropertiesService.getUserProperties().getProperty('GEMINI_API_KEY');

  if (!apiKey) {
    return {
      text:  '⚠️ No API Key found. Paste your Gemini key in the Configuration panel and hit SAVE KEY.',
      count: getRequestCount()
    };
  }

  // © Ronel Jonathan
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;

  const personaBlock = persona && persona.trim()
    ? `You are: ${persona.trim()}\n\n` : '';
  const contextBlock = selectedText && selectedText.trim()
    ? `Selected passage from document:\n"""\n${selectedText.trim()}\n"""\n\n` : '';

  const fullPrompt = `${personaBlock}${contextBlock}Task: ${userPrompt}`;

  // © Ronel Jonathan 
  const payload = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: { temperature: 0.85, maxOutputTokens: 2048 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  };

  const options = {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  };

  try {
    const response     = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const json         = JSON.parse(response.getContentText());

    incrementCounter(); // © Ronel Jonathan
    const newCount = getRequestCount();

    if (responseCode !== 200) {
      const errMsg = json.error ? json.error.message : 'Unknown Error';
      return { text: `API Error ${responseCode}: ${errMsg}`, count: newCount };
    }

    const candidate = json.candidates && json.candidates[0];
    if (!candidate || !candidate.content ||
        !candidate.content.parts || !candidate.content.parts[0]) {
      return {
        text:  '⚠️ The model returned an empty response. Try rephrasing your prompt.',
        count: newCount
      };
    }

    if (candidate.finishReason === 'SAFETY') {
      return {
        text:  '⚠️ Response blocked by safety filters. Try adjusting your prompt.',
        count: newCount
      };
    }

    // © Ronel Jonathan
    const aiText = candidate.content.parts[0].text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^#+\s/gm, '')
      .replace(/`/g, '')
      .replace(/^>\s/gm, '')
      .replace(/^[-*]\s/gm, '')
      .trim();

    return { text: aiText, count: newCount };

  } catch (e) {
    return { text: 'Connection Error: ' + e.toString(), count: getRequestCount() };
  }
}

// © Ronel Jonathan — InkSight AI v2.0.0
// Unauthorized reproduction, resale, or commercial rebranding of this script is prohibited.
