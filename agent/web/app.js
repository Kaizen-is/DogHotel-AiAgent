// Dog Hotel Scope Control: the web page.
// Plain JavaScript, no framework. Each page is one render function.

const ICONS = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.7-4 3-9 3s-9-1.3-9-3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkCircle: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14 9 11"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3" y2="6"/><line x1="3" y1="12" x2="3" y2="12"/><line x1="3" y1="18" x2="3" y2="18"/>',
  trendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  cornerDownRight: '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
};

function icon(name, extra = "") {
  return `<span class="icon${extra ? " " + extra : ""}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg></span>`;
}

// Everything that comes from the server or the AI is escaped before it goes into the page.
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Escaped text with Jira keys (like DHS-101) highlighted. The keys only contain safe characters.
function rich(value) {
  return esc(value).replace(/\b([A-Z][A-Z0-9]{1,9}-\d+)\b/g, '<span class="key">$1</span>');
}

// Plain-English labels for the values the agent returns.
const CLASS = {
  in_scope: { label: "In scope", color: "green", icon: "checkCircle", text: "This fits the release goal." },
  scope_creep: { label: "Scope creep", color: "amber", icon: "alert", text: "This would make the release bigger than planned." },
  out_of_scope: { label: "Out of scope", color: "red", icon: "x", text: "This is not part of this release." },
  needs_clarification: { label: "Needs clarification", color: "blue", icon: "help", text: "We need more details before deciding." },
};
const ADVICE = {
  accept_current_release: "Accept into this release",
  defer_to_backlog: "Move to the backlog",
  raise_change_request: "Raise a change request",
  reject: "Reject",
};
const ADVICE_ICON = {
  accept_current_release: "checkCircle",
  defer_to_backlog: "inbox",
  raise_change_request: "edit",
  reject: "x",
};
const PROBLEM = {
  missing_acceptance_criteria: "No acceptance criteria",
  thin_description: "Description is too short",
  not_estimated: "No estimate",
  too_big: "Too big for one sprint",
  possible_duplicate: "Possible duplicate",
  duplicate: "Possible duplicate",
  added_after_baseline: "Added after the plan",
  ambiguous: "Unclear wording",
  off_goal: "Does not serve the goal",
  unclear_value: "Unclear value",
  hidden_dependency: "Hidden dependency",
  other: "Other",
};
const SEVERITIES = ["high", "medium", "low"];
const WHO = ["Owners", "Team member", "PM / BA", "Other"];
const EXAMPLE_REQUESTS = [
  ["Online payment", "The owners want customers to pay for the hotel stay online with a card when they send the booking request, so that there are fewer no-shows.", "Owners"],
  ["Vaccination questions", "In the booking form we must ask whether the dog is vaccinated (rabies and complex vaccine) and when, because the hotel cannot accept dogs without valid vaccinations.", "Owners"],
  ["Telegram notifications", "Can new booking requests also come to our Telegram? We read it more often than e-mail.", "Owners"],
  ["Dog of the week banner", "Let's add a 'Dog of the week' banner on the home page with one shelter dog. It would look nice.", "Team member"],
];
const EXAMPLE_QUESTIONS = [
  "Is online payment for hotel stays in this release?",
  "Which tasks are about the booking form?",
  "What is blocking the e-mail notifications?",
  "What is the price of grooming?",
];
const PROBLEM_GROUPS_SHOWN = 6;

// What the page remembers while you move between pages.
const memory = {
  state: null,
  who: "Owners",
  requestText: "",
  triage: null,
  triageSaved: false,
  health: null,
  healthFilter: "all",
  answers: [],
  busy: null,
};

// ---------------------------------------------------------------- server calls

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Something went wrong. Please try again.";
    throw new Error(detail);
  }
  return data;
}

const post = (path, body) =>
  api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });

function toast(message, isError = false) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = "toast show" + (isError ? " error" : "");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.className = "toast"), isError ? 5000 : 2600);
}

async function refreshState() {
  memory.state = await api("/api/state");
  const s = memory.state;
  const pill = document.getElementById("dataPill");
  const source = s.source === "sample" ? "Sample data" : esc(s.file_name);
  pill.innerHTML = `<span class="dot${s.tickets ? "" : " off"}"></span>
    <span class="pill-label">Release</span>
    <strong class="pill-release">${esc(s.context.release || "No release chosen")}</strong>
    <span class="pill-source">${source} · ${plural(s.tickets, "task")}</span>`;
  pill.title = "Change project data";

  const ai = document.getElementById("aiStatus");
  if (ai) {
    ai.innerHTML = `<span class="dot${s.ai_ready ? "" : " off"}"></span><span class="ai-text">${s.ai_ready ? "AI is ready" : "AI is not set up"}</span>`;
    ai.title = s.ai_ready ? "The AI is connected and ready" : "The AI is not set up. Only the quick check works.";
  }
}

// ---------------------------------------------------------------- small building blocks

function cap(text) {
  const s = String(text ?? "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function fmtNum(n) {
  return n == null ? "?" : String(Math.round(Number(n) * 10) / 10);
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? String(iso) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function sevClass(severity) {
  return SEVERITIES.includes(severity) ? severity : "low";
}

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToResult(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
}

function pageHead(title, text, actions = "") {
  return `<header class="page-head">
      <div><h1>${title}</h1>${text ? `<p>${text}</p>` : ""}</div>
      ${actions ? `<div class="page-actions">${actions}</div>` : ""}
    </header>`;
}

function loadingCard(title, text) {
  return `<div class="card loading" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <div class="loading-text"><strong>${title}</strong><p>${text}</p>
        <div class="skeleton" aria-hidden="true"><i style="width:92%"></i><i style="width:76%"></i><i style="width:58%"></i></div>
      </div>
    </div>`;
}

function errorCard(message) {
  return `<div class="notice error" role="alert">${icon("alertCircle")}<div><strong>Something went wrong</strong><p>${esc(message)}</p></div></div>`;
}

function emptyState(iconName, title, text, action = "") {
  return `<div class="card empty">
      <div class="empty-icon">${icon(iconName)}</div>
      <strong>${title}</strong><p>${text}</p>
      ${action ? `<div class="empty-action">${action}</div>` : ""}
    </div>`;
}

function kpi(iconName, label, value, unit, hint, tone = "") {
  return `<div class="kpi ${tone}">
      <div class="kpi-label">${icon(iconName)}${label}</div>
      <div class="kpi-value">${value}${unit ? `<small>${unit}</small>` : ""}</div>
      <div class="kpi-hint">${hint}</div>
    </div>`;
}

function loadTone(ratio) {
  if (ratio == null) return "";
  return ratio > 1 ? "red" : ratio > 0.85 ? "amber" : "green";
}

// Planned work against capacity. The line on the bar marks what the team can do.
function workloadStat(facts) {
  const capacity = facts.capacity_points;
  const ratio = facts.load_ratio;
  const tone = loadTone(ratio);
  let meter = '<div class="meter"></div>';
  let hint = "Set the team capacity to compare";
  if (ratio != null) {
    const pct = Math.round(ratio * 100);
    const scale = Math.max(ratio, 1);
    const mark = (1 / scale) * 100;
    const fill = (ratio / scale) * 100;
    meter = `<div class="meter ${tone}" style="--cap:${mark}%" role="img" aria-label="${pct}% of the team capacity">
        <i class="fill" style="width:${fill}%"></i>${ratio > 1 ? `<span class="cap" style="left:${mark}%"></span>` : ""}
      </div>`;
    hint = ratio > 1
      ? `<strong>${pct}%</strong> of team capacity · ${fmtNum(facts.open_points - capacity)} points over`
      : `<strong>${pct}%</strong> of team capacity`;
  }
  return `<div class="kpi ${tone}">
      <div class="kpi-label">${icon("layers")}Planned work</div>
      <div class="kpi-value">${fmtNum(facts.open_points)}<small>/ ${capacity == null ? "?" : fmtNum(capacity)} points</small></div>
      ${meter}
      <div class="kpi-hint">${hint}</div>
    </div>`;
}

function addedStat(facts) {
  const added = facts.added_after_baseline.length;
  const growth = facts.scope_growth_pct;
  return kpi("trendingUp", "Added after the plan", added, added === 1 ? "task" : "tasks",
    growth == null ? "Set the plan date to see this" : `Scope grew by <span class="delta${growth > 0 ? " up" : ""}">${fmtNum(growth)}%</span>`);
}

function scopeStats(facts) {
  return `<div class="kpis">
    ${workloadStat(facts)}
    ${kpi("list", "Open tasks", facts.open_tickets, "", `of ${plural(facts.total_tickets, "task")} in the release`)}
    ${addedStat(facts)}
    ${kpi("alertCircle", "Open bugs", facts.bugs_open, "", `${facts.bugs_closed} already closed`)}
  </div>`;
}

function needsData() {
  if (memory.state && memory.state.tickets) return "";
  return emptyState("database", "No project data yet", "Load the sample data or a Jira export on the Overview page first.",
    `<a class="btn primary" href="#/home">Go to Overview ${icon("arrow")}</a>`);
}

// ---------------------------------------------------------------- Overview

function renderHome() {
  const s = memory.state;
  const c = s.context;
  const f = s.facts;
  const releases = s.releases.map((r) => `<option ${r === c.release ? "selected" : ""}>${esc(r)}</option>`).join("");
  const sourceText = s.source === "sample"
    ? "An invented Jira backlog of a small volunteer dev team, with typical scope problems."
    : s.source === "real" ? "Real project data from the data/real folder." : "Your uploaded Jira export.";

  const days = daysUntil(c.milestone_date);
  const daysText = days == null ? "" : days > 1 ? `${days} days left` : days === 1 ? "1 day left" : days === 0 ? "today" : "passed";

  return `
    ${pageHead("Overview", "Keep every Dog Hotel release the right size: check new requests, find weak tasks, and see if the plan fits the team.")}

    <section class="card release-hero" aria-label="Current release">
      <div class="hero-top">
        <div class="hero-main">
          <div class="eyebrow">Current release</div>
          <h2>${esc(c.release || "No release chosen")}</h2>
          <p class="hero-goal">${c.goal ? esc(c.goal) : "No release goal yet. Add it in the release settings below."}</p>
        </div>
        <dl class="hero-facts">
          <div class="fact">${icon("calendar")}<div><dt>Deadline</dt>
            <dd>${c.milestone_date ? esc(fmtDate(c.milestone_date)) : "Not set"}${daysText ? ` <span>· ${daysText}</span>` : ""}</dd></div></div>
          <div class="fact">${icon("flag")}<div><dt>Plan agreed on</dt>
            <dd>${c.baseline_date ? esc(fmtDate(c.baseline_date)) : "Not set"}</dd></div></div>
          <div class="fact">${icon("users")}<div><dt>Team capacity</dt>
            <dd>${c.capacity_points != null ? `${fmtNum(c.capacity_points)} points` : "Not set"}</dd></div></div>
        </dl>
      </div>
      ${f ? scopeStats(f) + loadAlert(f) : ""}
    </section>

    <section class="card section">
      <h2 class="section-title">What do you want to do?</h2>
      <div class="grid three">
        ${toolCard("#/request", "message", "Check a new request", "Does a new idea fit this release, or is it scope creep?", "Check a request")}
        ${toolCard("#/health", "activity", "Check the release", "Find unclear tasks, too much work and risks.", "Open release health")}
        ${toolCard("#/ask", "help", "Ask a question", "Ask about the scope in normal words.", "Ask a question")}
      </div>
    </section>

    <section class="section cols">
      <div class="card">
        <div class="card-head"><div><h2 class="card-title">Release settings</h2>
          <p class="card-sub">The agent uses these to judge new requests and the plan.</p></div></div>
        <div class="form-grid">
          <label class="field span-2"><span>Release</span><select id="release">${releases}</select></label>
          <label class="field"><span>Deadline</span><input type="date" id="milestone" value="${esc(c.milestone_date ?? "")}"></label>
          <label class="field"><span>Plan agreed on</span><input type="date" id="baseline" value="${esc(c.baseline_date ?? "")}"><small>Tasks created later count as "added after the plan"</small></label>
          <label class="field span-2"><span>Release goal</span><textarea id="goal" placeholder="What must this release achieve? One or two sentences.">${esc(c.goal)}</textarea></label>
          <label class="field"><span>Team capacity (points)</span><input type="number" id="capacity" min="0" step="1" value="${esc(c.capacity_points ?? "")}" placeholder="e.g. 40"><small>Story points the team can finish in this release</small></label>
        </div>
        <div class="card-foot"><button class="btn primary" id="saveContext">${icon("check")}Save settings</button></div>
      </div>

      <div class="card data-card">
        <div class="card-head"><div><h2 class="card-title">Project data</h2>
          <p class="card-sub">The Jira tasks and documents the agent reads.</p></div></div>
        <div class="source-box">${icon("database")}
          <div><strong>${s.source === "sample" ? "Sample data" : esc(s.file_name)}</strong>
            <small>${plural(s.tickets, "task")} · ${s.docs} document sections</small></div>
          <button class="btn" id="useSample">Use sample data</button>
        </div>
        <p class="source-text">${sourceText}</p>
        <label class="drop" id="drop" tabindex="0" role="button" aria-label="Upload a Jira CSV export">
          ${icon("upload")}
          <strong>Upload a Jira export</strong>
          <span>Choose a CSV file or drop it here</span>
          <span>In Jira: Filters → your filter → Export → CSV (all fields)</span>
          <input type="file" id="jiraFile" accept=".csv" hidden>
        </label>
        <p class="docs-line">Optional: add project documents (.md or .txt) so the agent can answer questions from them.
          <label class="link-btn" tabindex="0" role="button" id="docsLabel">Add documents<input type="file" id="docFiles" accept=".md,.txt" multiple hidden></label>
          <span id="docNames"></span></p>
      </div>
    </section>

    <section class="section">
      <div class="card">
        <h2 class="section-title">How it works</h2>
        <div class="how">
          <div class="step"><b>1</b><div><h3>Load the project</h3><p>Use the sample data or upload a Jira CSV export.</p></div></div>
          <div class="step"><b>2</b><div><h3>Get advice</h3><p>Check a new request, the whole release, or ask a question.</p></div></div>
          <div class="step"><b>3</b><div><h3>You decide</h3><p>Accept, edit or reject. Every decision is saved.</p></div></div>
        </div>
        <p class="how-note">The agent reads your Jira tasks. First, simple rules check the facts. Then the AI gives advice in plain words. You make the decision.</p>
      </div>
    </section>`;
}

// One clear sentence about the workload, with the next step.
function loadAlert(f) {
  const r = f.load_ratio;
  if (r == null) {
    return `<div class="hero-alert gray">${icon("info")}<p>Set the team capacity in the release settings to see if the plan fits the team.</p></div>`;
  }
  const pct = Math.round(r * 100);
  if (r > 1) {
    return `<div class="hero-alert red">${icon("alert")}
      <p><strong>Too much work.</strong> The plan has ${fmtNum(f.open_points)} points, but the team can do ${fmtNum(f.capacity_points)}. Cut about ${fmtNum(f.open_points - f.capacity_points)} points or move the deadline.</p>
      <a class="btn" href="#/health">Check the release ${icon("arrow")}</a></div>`;
  }
  if (r > 0.85) {
    return `<div class="hero-alert amber">${icon("alert")}<p><strong>Close to the limit.</strong> The plan uses ${pct}% of what the team can do. Be careful with new requests.</p></div>`;
  }
  return `<div class="hero-alert green">${icon("checkCircle")}<p><strong>The plan fits the team.</strong> It uses ${pct}% of what the team can do.</p></div>`;
}

function toolCard(href, iconName, title, text, cta) {
  return `<a class="card action-card" href="${href}">
      <span class="title-icon">${icon(iconName)}</span>
      <div><h3>${title}</h3><p>${text}</p></div>
      <span class="go">${cta} ${icon("arrow")}</span>
    </a>`;
}

function bindHome() {
  document.getElementById("useSample").onclick = async () => {
    try {
      await post("/api/data/sample");
      resetResults();
      await refreshState();
      render();
      toast("Sample data loaded");
    } catch (e) {
      toast(e.message, true);
    }
  };

  const drop = document.getElementById("drop");
  const file = document.getElementById("jiraFile");
  const docs = document.getElementById("docFiles");
  const docsLabel = document.getElementById("docsLabel");
  docs.onchange = () => {
    document.getElementById("docNames").textContent = docs.files.length ? ` (${docs.files.length} selected)` : "";
  };
  file.onchange = () => file.files[0] && upload(file.files[0], docs.files);
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
  drop.ondragleave = () => drop.classList.remove("over");
  drop.ondrop = (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    if (e.dataTransfer.files[0]) upload(e.dataTransfer.files[0], docs.files);
  };
  // Keyboard users can open the file pickers with Enter or Space.
  const pressToOpen = (target, input) => (target.onkeydown = (e) => {
    if (e.target !== target || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    input.click();
  });
  pressToOpen(drop, file);
  pressToOpen(docsLabel, docs);

  document.getElementById("release").onchange = () => saveContext(false);
  document.getElementById("saveContext").onclick = () => saveContext(true);
}

async function upload(jiraFile, docFiles) {
  const form = new FormData();
  form.append("jira", jiraFile);
  for (const d of docFiles || []) form.append("docs", d);
  try {
    await api("/api/data/upload", { method: "POST", body: form });
    resetResults();
    await refreshState();
    render();
    toast(`Loaded ${memory.state.tickets} tasks. Now check the release settings.`);
  } catch (e) {
    toast(e.message, true);
  }
}

async function saveContext(showToast) {
  const value = (id) => document.getElementById(id).value;
  const body = {
    release: value("release"),
    goal: value("goal"),
    milestone_date: value("milestone") || null,
    baseline_date: value("baseline") || null,
    capacity_points: value("capacity") === "" ? null : Number(value("capacity")),
  };
  try {
    await post("/api/context", body);
    resetResults();
    await refreshState();
    render();
    if (showToast) toast("Settings saved");
  } catch (e) {
    toast(e.message, true);
  }
}

function resetResults() {
  memory.triage = null;
  memory.health = null;
  memory.answers = [];
}

// ---------------------------------------------------------------- Check a request

function renderRequest() {
  const head = pageHead("Check a new request",
    "Write the new idea or request. The agent checks it against the release goal and the team's capacity, and writes a ready task for Jira.");
  if (needsData()) return head + needsData();

  const examples = EXAMPLE_REQUESTS.map(([title], i) => `<button type="button" class="chip" data-example="${i}">${esc(title)}</button>`).join("");
  const who = WHO.map((w) => `<button type="button" class="${w === memory.who ? "on" : ""}" aria-pressed="${w === memory.who}" data-who="${esc(w)}">${esc(w)}</button>`).join("");

  let result = "";
  if (memory.busy === "triage") result = loadingCard("Checking the request…", "Comparing it with the release goal and the team's capacity. This takes about 20 seconds.");
  else if (memory.triage?.error) result = errorCard(memory.triage.error);
  else if (memory.triage) result = triageResult(memory.triage);

  return `${head}
    <section class="card composer">
      <div class="composer-body">
        <label class="field"><span>What is the new request?</span>
          <textarea id="requestText" class="large" placeholder="For example: The owners want online card payment for hotel stays.">${esc(memory.requestText)}</textarea></label>
        <div class="examples"><span class="examples-label">Try an example:</span><div class="chips">${examples}</div></div>
      </div>
      <div class="composer-foot">
        <div class="who"><span class="who-label" id="whoLabel">Who asked for it?</span>
          <div class="segmented" id="who" role="group" aria-labelledby="whoLabel">${who}</div></div>
        <button class="btn primary big" id="runTriage" ${memory.busy ? "disabled" : ""}>${icon("check")}Check request</button>
      </div>
    </section>
    <div class="result stack" id="result">${result}</div>`;
}

function triageResult(r) {
  const a = r.advice;
  const cls = CLASS[a.classification] || CLASS.needs_clarification;
  const risk = SEVERITIES.includes(a.impact.schedule_risk) ? a.impact.schedule_risk : "gray";
  const fit = { high: "High", medium: "Medium", low: "Low", none: "None" }[a.goal_alignment];
  const related = a.related_tickets.length
    ? `<ul class="task-links">${a.related_tickets.map((k) =>
        `<li><span class="key">${esc(k)}</span><span>${esc(titleOf(k, r)) || '<span class="muted">Not found in the export</span>'}</span></li>`).join("")}</ul>`
    : '<p class="muted mt">No related tasks found.</p>';
  const decided = memory.triageSaved
    ? `<div class="notice success">${icon("checkCircle")}<div><strong>Decision saved: ${esc(memory.triageSaved)}.</strong><p>You can see it in <a href="#/history">History</a>.</p></div></div>`
    : `<div class="btn-row">
        <button class="btn green" data-decide="accepted">${icon("check")}Accept advice</button>
        <button class="btn" data-decide="edited">${icon("edit")}Accept with my edits</button>
        <button class="btn red-outline" data-decide="rejected">${icon("x")}Reject advice</button>
      </div>`;

  return `
    <section class="verdict ${cls.color}" id="verdict" aria-label="Verdict">
      <div class="verdict-main">
        <span class="verdict-icon">${icon(cls.icon)}</span>
        <div>
          <div class="eyebrow">Verdict</div>
          <h2>${cls.label}</h2>
          <p class="verdict-text">${cls.text}</p>
          <p class="restated">${esc(a.restated_request)}</p>
          <div class="badges">
            <span class="badge gray">Size: ${esc(a.impact.effort)}</span>
            <span class="badge ${risk}">Risk for the deadline: ${esc(cap(a.impact.schedule_risk))}</span>
            ${fit ? `<span class="badge gray">Fits the goal: ${fit}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="advice-box">
        <div class="eyebrow">Advice</div>
        <div class="advice">${icon(ADVICE_ICON[a.recommendation] || "arrow")}${esc(ADVICE[a.recommendation] || cap(a.recommendation))}</div>
        <p>${rich(a.recommendation_reason)}</p>
      </div>
    </section>

    <div class="cols">
      <div class="stack">
        <section class="card">
          <div class="title-row"><span class="title-icon gray">${icon("info")}</span><h3 class="card-title">Why</h3></div>
          <p class="prose">${rich(a.rationale)}</p>
        </section>
        ${a.trade_off ? `<section class="card tone-card amber">
          <div class="title-row"><span class="title-icon amber">${icon("layers")}</span><h3 class="card-title">To make room</h3></div>
          <p class="prose">${rich(a.trade_off)}</p></section>` : ""}
        <section class="card">
          <div class="title-row"><span class="title-icon blue">${icon("help")}</span><h3 class="card-title">Questions to ask</h3></div>
          ${a.clarifying_questions.length ? `<ol class="numbered">${a.clarifying_questions.map((q) => `<li><span>${rich(q)}</span></li>`).join("")}</ol>` : '<p class="muted mt">No open questions.</p>'}
        </section>
      </div>
      <div class="stack">
        <section class="card">
          <div class="title-row"><span class="title-icon amber">${icon("activity")}</span><h3 class="card-title">Impact</h3></div>
          ${a.impact.affected_areas.length ? `<div class="sub-label" style="margin-top:var(--s5)">Parts of the site affected</div>
            <div class="tags">${a.impact.affected_areas.map((x) => `<span class="tag plain">${esc(x)}</span>`).join("")}</div>` : ""}
          ${a.impact.risks.length ? `<div class="sub-label">Risks</div>
            <ul class="risk-list">${a.impact.risks.map((x) => `<li>${icon("alert")}<span>${rich(x)}</span></li>`).join("")}</ul>` : ""}
        </section>
        <section class="card">
          <div class="title-row"><span class="title-icon">${icon("link")}</span><h3 class="card-title">Related tasks in Jira</h3></div>
          ${related}
        </section>
      </div>
    </div>

    <section class="card">
      <div class="card-head">
        <div class="title-row"><span class="title-icon">${icon("file")}</span>
          <div><h3 class="card-title">Ready task for Jira</h3><p class="card-sub">You can edit the text before you accept it.</p></div></div>
        <button class="btn" id="copyStory">${icon("copy")}Copy</button>
      </div>
      <textarea id="storyText" class="story" aria-label="Ready task for Jira">${esc(r.story_text)}</textarea>
    </section>

    <section class="card decision">
      <div><h3 class="card-title">Your decision</h3><p class="card-sub">The AI only gives advice. You decide, and the decision is saved in History.</p>
        <p class="meta-line mt">${icon("clock")}Answer ready in ${esc(r.seconds)} seconds.</p></div>
      ${decided}
    </section>`;
}

function titleOf(key, r) {
  return (r.titles || {})[key] || "";
}

function bindRequest() {
  if (!document.getElementById("runTriage")) return;
  const text = document.getElementById("requestText");
  text.oninput = () => (memory.requestText = text.value);

  document.querySelectorAll("[data-example]").forEach((b) => (b.onclick = () => {
    const [, request, who] = EXAMPLE_REQUESTS[Number(b.dataset.example)];
    memory.requestText = request;
    memory.who = who;
    render();
  }));
  document.querySelectorAll("[data-who]").forEach((b) => (b.onclick = () => {
    memory.who = b.dataset.who;
    document.querySelectorAll("[data-who]").forEach((x) => {
      x.classList.toggle("on", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
  }));

  document.getElementById("runTriage").onclick = async () => {
    if (!memory.requestText.trim()) return toast("Please write the request first.", true);
    memory.busy = "triage";
    memory.triageSaved = false;
    await render();
    scrollToResult("result");
    try {
      memory.triage = await post("/api/triage", { request: memory.requestText, requester: memory.who });
    } catch (e) {
      memory.triage = { error: e.message };
    }
    memory.busy = null;
    await render();
    if (currentPage() === "request") scrollToResult("result");
  };

  const copy = document.getElementById("copyStory");
  if (copy) copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById("storyText").value);
      toast("Copied. Paste it into Jira.");
    } catch {
      toast("Could not copy. Select the text and copy it by hand.", true);
    }
  };

  document.querySelectorAll("[data-decide]").forEach((b) => (b.onclick = async () => {
    const r = memory.triage;
    const labels = { accepted: "advice accepted", edited: "accepted with your edits", rejected: "advice rejected" };
    document.querySelectorAll("[data-decide]").forEach((x) => (x.disabled = true));
    try {
      await post("/api/decision", {
        tool: "request check",
        decision: b.dataset.decide,
        details: {
          request: memory.requestText,
          verdict: CLASS[r.advice.classification].label,
          advice: ADVICE[r.advice.recommendation],
          final_story: document.getElementById("storyText").value,
        },
      });
      memory.triageSaved = labels[b.dataset.decide];
      render();
      toast("Decision saved");
    } catch (e) {
      document.querySelectorAll("[data-decide]").forEach((x) => (x.disabled = false));
      toast(e.message, true);
    }
  }));
}

// ---------------------------------------------------------------- Release health

function renderHealth() {
  const s = memory.state;
  const disabled = memory.busy ? "disabled" : "";
  const actions = `<button class="btn" id="runQuick" ${disabled}>${icon("zap")}Quick check (facts only)</button>
    <button class="btn primary" id="runHealth" ${disabled}>${icon("activity")}Check the release</button>`;
  const head = pageHead("Release health",
    `Check every task of <strong>${esc(s.context.release || "the release")}</strong>: unclear tasks, too much work, scope growth and risks.`,
    needsData() ? "" : actions);
  if (needsData()) return head + needsData();

  let body = "";
  if (memory.busy === "health") body = loadingCard("Checking the release…", `Reading ${s.release_tickets} tasks. The full check with the AI review takes about one minute.`);
  else if (memory.health?.error) body = errorCard(memory.health.error);
  else if (memory.health) body = healthResult(memory.health);
  else body = emptyState("activity", "Ready when you are",
    "Press <strong>Check the release</strong> for the full check with the AI review (about one minute), or <strong>Quick check</strong> to see only the facts in a few seconds.");

  return `${head}<div class="stack">${body}</div>`;
}

function gauge(score, tone) {
  const r = 50;
  const length = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * length;
  return `<div class="gauge ${tone}" role="img" aria-label="Health score ${score} of 100">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="${r}"/>
        <circle class="value" cx="60" cy="60" r="${r}" stroke-dasharray="${filled} ${length}"/></svg>
      <div class="num"><div>${score}<small>of 100</small></div></div>
    </div>`;
}

// Problems grouped by task: worst first, then the tasks with the most problems.
function groupByTask(findings) {
  const rank = (f) => SEVERITIES.indexOf(sevClass(f.severity));
  const groups = new Map();
  findings.forEach((f) => {
    if (!groups.has(f.ticket_key)) groups.set(f.ticket_key, []);
    groups.get(f.ticket_key).push(f);
  });
  return [...groups.entries()]
    .map(([key, items]) => ({ key, items: items.sort((a, b) => rank(a) - rank(b)), worst: Math.min(...items.map(rank)) }))
    .sort((a, b) => a.worst - b.worst || b.items.length - a.items.length || a.key.localeCompare(b.key, undefined, { numeric: true }));
}

function taskGroup(g, titles, i) {
  const worst = SEVERITIES[g.worst];
  const seen = new Set();
  const tags = g.items.filter((f) => !seen.has(f.type) && seen.add(f.type))
    .map((f) => `<span class="tag sev-${sevClass(f.severity)}">${esc(PROBLEM[f.type] || f.type)}</span>`).join("");
  const issues = g.items.map((f) => `
      <div class="issue">
        <div class="issue-head">
          <span class="badge sev-${sevClass(f.severity)}">${esc(cap(f.severity))}</span>
          <strong>${esc(PROBLEM[f.type] || f.type)}</strong>
          <span class="badge ${f.source === "ai" ? "violet" : "gray"}">${f.source === "ai" ? "AI review" : "Rule"}</span>
        </div>
        <p>${rich(f.explanation)}</p>
        <p class="fix">${icon("arrow")}<span><strong>What to do:</strong> ${rich(f.suggestion)}</span></p>
      </div>`).join("");
  return `<details class="task-group sev-${worst}"${i >= PROBLEM_GROUPS_SHOWN ? " hidden data-extra" : ""}>
      <summary>
        <span class="sev-bar" aria-hidden="true"></span>
        <span class="tg-main">
          <span class="tg-title"><span class="key">${esc(g.key)}</span><span class="tg-name">${esc(titles[g.key] || "")}</span></span>
          <span class="tags">${tags}</span>
        </span>
        <span class="tg-count">${plural(g.items.length, "problem")}</span>
        ${icon("chevronDown", "chev")}
      </summary>
      <div class="tg-body">${issues}</div>
    </details>`;
}

function healthResult(h) {
  const r = h.report;
  const m = r.metrics;
  const review = r.review;
  const tone = r.score >= 70 ? "green" : r.score >= 40 ? "amber" : "red";
  const label = r.score >= 70 ? "Healthy" : r.score >= 40 ? "Some risks" : "Needs attention";
  const scoreText = r.score >= 70 ? "The plan looks good." : r.score >= 40 ? "Fix the risks before they grow." : "Fix the biggest problems first.";

  const counts = { all: r.findings.length, high: 0, medium: 0, low: 0 };
  r.findings.forEach((f) => counts[sevClass(f.severity)]++);
  const shown = r.findings.filter((f) => memory.healthFilter === "all" || f.severity === memory.healthFilter);
  const groups = groupByTask(shown);
  const filters = ["all", ...SEVERITIES].map((k) =>
    `<button type="button" class="${memory.healthFilter === k ? "on" : ""}" aria-pressed="${memory.healthFilter === k}" data-filter="${k}">${k === "all" ? "All" : cap(k)}<span class="count">${counts[k]}</span></button>`).join("");
  const problems = groups.length
    ? `<div class="task-list">${groups.map((g, i) => taskGroup(g, h.titles, i)).join("")}</div>
       ${groups.length > PROBLEM_GROUPS_SHOWN ? `<button type="button" class="btn ghost show-more" id="showAllProblems">${icon("chevronDown")}Show all ${groups.length} tasks</button>` : ""}`
    : '<div class="task-list"><p class="no-problems">No problems at this level.</p></div>';

  let board = "";
  if (review && review.moscow.length) {
    const lanes = [["must", "Must have"], ["should", "Should have"], ["could", "Could have"], ["wont", "Not now"]];
    board = `<section class="card">
      <div class="card-head"><div class="title-row"><span class="title-icon">${icon("layers")}</span>
        <div><h2 class="card-title">Priorities</h2><p class="card-sub">What to keep, and what to cut first if there is too much work.</p></div></div></div>
      <div class="board">${lanes.map(([key, name]) => {
        const items = review.moscow.filter((p) => p.moscow === key);
        return `<div class="lane ${key}"><h4>${name}<span>${items.length}</span></h4>${items.map((p) =>
          `<div class="item" title="${esc(p.reason)}"><span class="key">${esc(p.ticket_key)}</span>${esc(h.titles[p.ticket_key] || "")}</div>`).join("") || '<p class="lane-empty">Nothing here</p>'}</div>`;
      }).join("")}</div></section>`;
  }

  const deps = review && review.dependency_risks.length ? review.dependency_risks : m.open_blockers;
  const depsCard = deps.length ? `<section class="card">
      <div class="title-row"><span class="title-icon gray">${icon("link")}</span>
        <h2 class="card-title">${review && review.dependency_risks.length ? "Dependency risks" : "Blocked tasks"}</h2></div>
      <ul class="dep-list">${deps.map((x) => `<li>${icon("lock")}<span>${rich(x)}</span></li>`).join("")}</ul>
    </section>` : "";

  const next = review ? `
    <div class="cols">
      <section class="card">
        <div class="card-head"><div class="title-row"><span class="title-icon">${icon("flag")}</span>
          <div><h2 class="card-title">What to do next</h2><p class="card-sub">The most important steps first.</p></div></div></div>
        <ol class="actions">${review.top_actions.map((x) => `<li><span>${rich(x)}</span></li>`).join("")}</ol>
      </section>
      <section class="card">
        <h2 class="card-title">Summary</h2>
        <p class="prose">${rich(review.summary)}</p>
        <h3 class="sub-title">Does the plan cover the goal?</h3>
        <p class="prose">${rich(review.goal_coverage)}</p>
      </section>
    </div>`
    : `<div class="notice">${icon("info")}<div><strong>This was a quick check: only the facts.</strong>
        <p>Press "Check the release" to get the AI summary, the priorities and the next steps as well.</p></div></div>`;

  return `
    <section class="card health-top" aria-label="Release health in numbers">
      <div class="score-block ${tone}">
        ${gauge(r.score, tone)}
        <div><div class="eyebrow">Health score</div><div class="score-label">${label}</div><p>${scoreText}</p></div>
      </div>
      <div class="kpis three">
        ${workloadStat(m)}
        ${addedStat(m)}
        ${kpi("lock", "Blocked tasks", m.open_blockers.length, "", `${plural(m.bugs_open, "open bug")} · ${plural(m.unestimated_open, "task")} without estimate`)}
      </div>
    </section>

    ${next}

    <section class="card">
      <div class="card-head wrap">
        <div class="title-row"><span class="title-icon red">${icon("alertCircle")}</span>
          <div><h2 class="card-title">Problems found</h2>
          <p class="card-sub">${plural(shown.length, "problem")} in ${plural(groups.length, "task")}. Open a task to see what to do.</p></div></div>
        <div class="segmented" role="group" aria-label="Show problems by severity">${filters}</div>
      </div>
      ${problems}
    </section>

    ${board}
    ${depsCard}

    <div class="result-foot">
      <p class="meta-line">${h.seconds ? `${icon("clock")}AI review ready in ${esc(h.seconds)} seconds.` : `${icon("zap")}Quick check: facts only, no AI.`}</p>
      <div class="btn-row">
        <a class="btn" href="/api/health/report">${icon("download")}Download report</a>
        <button class="btn green" id="reviewed">${icon("check")}I reviewed this report</button>
      </div>
    </div>`;
}

function bindHealth() {
  const run = async (withAi) => {
    memory.busy = "health";
    memory.healthFilter = "all";
    render();
    try {
      memory.health = await post("/api/health", { with_ai: withAi });
    } catch (e) {
      memory.health = { error: e.message };
    }
    memory.busy = null;
    render();
  };
  const full = document.getElementById("runHealth");
  if (!full) return;
  full.onclick = () => run(true);
  document.getElementById("runQuick").onclick = () => run(false);
  document.querySelectorAll("[data-filter]").forEach((b) => (b.onclick = () => {
    memory.healthFilter = b.dataset.filter;
    render();
  }));
  const more = document.getElementById("showAllProblems");
  if (more) more.onclick = () => {
    document.querySelectorAll(".task-group[data-extra]").forEach((d) => (d.hidden = false));
    more.remove();
  };
  const reviewed = document.getElementById("reviewed");
  if (reviewed) reviewed.onclick = async () => {
    const r = memory.health.report;
    reviewed.disabled = true;
    try {
      await post("/api/decision", { tool: "release check", decision: "reviewed", details: { score: r.score, problems: r.findings.length } });
      reviewed.innerHTML = `${icon("checkCircle")}Saved to History`;
      toast("Saved to History");
    } catch (e) {
      reviewed.disabled = false;
      toast(e.message, true);
    }
  };
}

// ---------------------------------------------------------------- Ask a question

function renderAsk() {
  const head = pageHead("Ask a question",
    "Ask about the scope in normal words. The answer comes only from the project documents and tasks, with the sources.");
  if (needsData()) return head + needsData();

  const examples = EXAMPLE_QUESTIONS.map((q, i) => `<button type="button" class="chip" data-q="${i}">${esc(q)}</button>`).join("");
  const busy = memory.busy === "ask" ? loadingCard("Looking in the project…", "Reading the documents and tasks. This takes a few seconds.") : "";
  const answers = memory.answers.map(answerCard).join("");

  return `${head}
    <section class="card">
      <label class="field-label" for="question">Your question</label>
      <div class="ask-box">${icon("search")}
        <input type="text" id="question" placeholder="For example: Is online payment in this release?" autocomplete="off">
        <button class="btn primary" id="runAsk" ${memory.busy ? "disabled" : ""}>Ask ${icon("send")}</button>
      </div>
      <div class="examples"><span class="examples-label">Try an example:</span><div class="chips">${examples}</div></div>
    </section>
    <div class="qa-list stack">${busy}${answers}</div>`;
}

function sourceChip(source) {
  const label = String(source).replace(/^\[?DOC:\s*/, "").replace(/\]$/, "").trim();
  const isTask = /^[A-Z][A-Z0-9]+-\d+$/.test(label);
  const [doc, ...section] = label.split(" > ");
  const text = section.length
    ? `<span><span class="src-doc">${esc(doc)}</span> <span class="src-sec">› ${esc(section.join(" › "))}</span></span>`
    : `<span class="${isTask ? "key" : "src-doc"}">${esc(label)}</span>`;
  return `<span class="chip static source">${icon(isTask ? "list" : "file")}${text}</span>`;
}

function answerCard(item) {
  const question = `<div class="answer-q"><span class="avatar">${icon("user")}</span>
      <div><div class="eyebrow">Question</div><strong>${esc(item.question)}</strong></div></div>`;
  if (item.error) return `<section class="card answer-card">${question}<div class="answer-body">${errorCard(item.error)}</div></section>`;
  const a = item.answer;
  const status = a.not_found
    ? `<span class="badge amber">${icon("alert")}Not found in the project sources</span>`
    : `<span class="badge green">${icon("checkCircle")}Answer from project sources</span>`;
  const confidence = a.confidence ? `<span class="badge gray">Confidence: ${esc(cap(a.confidence))}</span>` : "";
  const sources = a.sources.length ? a.sources.map(sourceChip).join("") : '<span class="muted">No sources</span>';
  return `<section class="card answer-card">
      ${question}
      <div class="answer-body">
        <div class="badges">${status}${confidence}</div>
        <p class="answer">${rich(a.answer)}</p>
        <div class="sources"><div class="sub-label">Sources</div><div class="chips">${sources}</div></div>
        ${a.follow_up ? `<div class="next-step">${icon("cornerDownRight")}<p><strong>Next step:</strong> ${rich(a.follow_up)}</p></div>` : ""}
      </div>
    </section>`;
}

function bindAsk() {
  const input = document.getElementById("question");
  if (!input) return;
  const ask = async () => {
    const question = input.value.trim();
    if (!question) return toast("Please write a question first.", true);
    memory.busy = "ask";
    render();
    try {
      const result = await post("/api/ask", { question });
      memory.answers.unshift({ question, answer: result.answer });
    } catch (e) {
      memory.answers.unshift({ question, error: e.message });
    }
    memory.busy = null;
    render();
  };
  document.getElementById("runAsk").onclick = ask;
  input.onkeydown = (e) => e.key === "Enter" && !memory.busy && ask();
  document.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => {
    input.value = EXAMPLE_QUESTIONS[Number(b.dataset.q)];
    input.focus();
  }));
}

// ---------------------------------------------------------------- History

const TOOL_ICON = { "request check": "message", "release check": "activity", question: "help" };

async function renderHistory() {
  const head = pageHead("History", "Every piece of advice and every decision, newest first.");
  let events = [];
  try {
    events = await api("/api/history");
  } catch (e) {
    return head + errorCard(e.message);
  }
  if (!events.length) {
    return head + emptyState("clock", "Nothing here yet",
      "Decisions appear here after you accept or reject advice, review a release report, or ask a question.");
  }

  const decisions = events.filter((e) => ["accepted", "edited", "rejected"].includes(e.decision));
  const accepted = decisions.filter((e) => e.decision !== "rejected").length;
  const badge = { accepted: "green", edited: "blue", rejected: "red", reviewed: "gray", asked: "violet" };
  const rows = events.map((e) => {
    const d = e.details || {};
    const what = d.request || d.question || (d.score != null ? `Score ${d.score}/100, ${d.problems} problems` : "");
    const extra = d.verdict ? `<div class="row-sub">${esc(d.verdict)} · ${esc(d.advice)}</div>` : "";
    const [day, time] = String(e.time || "").split("T");
    return `<tr>
      <td><div class="when"><strong>${esc(fmtDate(day))}</strong><span>${esc((time || "").slice(0, 5))}</span></div></td>
      <td><span class="tool-cell">${icon(TOOL_ICON[e.tool] || "file")}${esc(cap(e.tool))}</span></td>
      <td><span class="badge ${badge[e.decision] || "gray"}">${esc(cap(e.decision))}</span></td>
      <td class="what">${esc(what.length > 140 ? what.slice(0, 140) + "…" : what)}${extra}</td></tr>`;
  }).join("");

  return `${head}
    <div class="stack">
      <section class="card flush">
        <div class="kpis three compact">
          ${kpi("clock", "Events", events.length, "", "Everything the agent did")}
          ${kpi("check", "Decisions on advice", decisions.length, "", "Accepted, edited or rejected")}
          ${kpi("checkCircle", "Advice accepted", decisions.length ? Math.round((accepted / decisions.length) * 100) + "%" : "–", "", "Including accepted with edits")}
        </div>
      </section>
      <section class="card flush">
        <table class="history">
          <thead><tr><th style="width:150px">Time</th><th style="width:180px">Tool</th><th style="width:130px">Decision</th><th>What</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    </div>`;
}

// ---------------------------------------------------------------- routing

const PAGES = {
  home: [renderHome, bindHome],
  request: [renderRequest, bindRequest],
  health: [renderHealth, bindHealth],
  ask: [renderAsk, bindAsk],
  history: [renderHistory, () => {}],
};
const PAGE_TITLES = { home: "Overview", request: "Check a request", health: "Release health", ask: "Ask a question", history: "History" };

function currentPage() {
  const name = location.hash.replace("#/", "");
  return PAGES[name] ? name : "home";
}

async function render() {
  const name = currentPage();
  document.querySelectorAll(".nav a").forEach((a) => {
    const on = a.dataset.page === name;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.title = `${PAGE_TITLES[name]} · Dog Hotel Scope Control`;
  const [draw, bind] = PAGES[name];
  const page = document.getElementById("page");
  if (!memory.busy) await refreshState();
  page.innerHTML = await draw();
  bind();
}

window.addEventListener("hashchange", async () => {
  await render();
  window.scrollTo(0, 0);
  document.getElementById("page").focus({ preventScroll: true });
});

document.querySelectorAll("[data-icon]").forEach((el) => (el.outerHTML = icon(el.dataset.icon)));

refreshState()
  .then(render)
  .catch((e) => {
    document.getElementById("page").innerHTML = errorCard("The agent server is not running. Start it with run.bat. (" + e.message + ")");
  });
