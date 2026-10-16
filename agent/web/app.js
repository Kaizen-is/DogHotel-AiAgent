// Dog Hotel Scope Control: the web page.
// Plain JavaScript, no framework. Each page is one render function.

const ICONS = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.7-4 3-9 3s-9-1.3-9-3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkCircle: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14 9 11"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
};

function icon(name) {
  return `<span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg></span>`;
}

// Everything that comes from the server or the AI is escaped before it goes into the page.
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
  pill.innerHTML = `<span class="dot${s.tickets ? "" : " off"}"></span>${source} · ${esc(s.context.release || "no release")}`;
  pill.title = "Change project data";
}

// ---------------------------------------------------------------- small building blocks

function cap(text) {
  const s = String(text ?? "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function pageHead(title, text) {
  return `<div class="page-head"><h1>${title}</h1><p>${text}</p></div>`;
}

function loadingCard(title, text) {
  return `<div class="card loading"><div class="spinner"></div><div><strong>${title}</strong><span>${text}</span></div></div>`;
}

function errorCard(message) {
  return `<div class="notice error">${esc(message)}</div>`;
}

function workloadStat(facts) {
  const cap = facts.capacity_points;
  const ratio = facts.load_ratio;
  const width = ratio ? Math.min(ratio * 100, 100) : 0;
  const level = ratio == null ? "" : ratio > 1 ? "over" : ratio > 0.85 ? "warn" : "";
  const hint = ratio == null ? "Set the team capacity to compare" : `${Math.round(ratio * 100)}% of what the team can do`;
  return `<div class="card stat">
      <div class="label">Planned work</div>
      <div class="value">${facts.open_points} <small>/ ${cap ?? "?"} points</small></div>
      <div class="bar ${level}"><i style="width:${width}%"></i></div>
      <div class="hint">${hint}</div>
    </div>`;
}

function scopeStats(facts) {
  const growth = facts.scope_growth_pct;
  return `<div class="grid four">
    ${workloadStat(facts)}
    <div class="card stat"><div class="label">Open tasks</div><div class="value">${facts.open_tickets}</div>
      <div class="hint">${facts.total_tickets} tasks in the release</div></div>
    <div class="card stat"><div class="label">Added after the plan</div><div class="value">${facts.added_after_baseline.length}</div>
      <div class="hint">${growth == null ? "Set the plan date to see this" : `Scope grew by ${growth}%`}</div></div>
    <div class="card stat"><div class="label">Open bugs</div><div class="value">${facts.bugs_open}</div>
      <div class="hint">${facts.bugs_closed} already closed</div></div>
  </div>`;
}

function needsData() {
  if (memory.state && memory.state.tickets) return "";
  return `<div class="card empty"><strong>No project data yet</strong>Load the sample data or a Jira export on the Overview page first.
    <div class="mt"><a class="btn primary" href="#/home">Go to Overview</a></div></div>`;
}

// ---------------------------------------------------------------- Overview

function renderHome() {
  const s = memory.state;
  const c = s.context;
  const releases = s.releases.map((r) => `<option ${r === c.release ? "selected" : ""}>${esc(r)}</option>`).join("");
  const sourceText = s.source === "sample"
    ? "Sample data: an invented Jira backlog of a small volunteer dev team, with typical scope problems."
    : s.source === "real" ? "Real project data from the data/real folder." : "Your uploaded Jira export.";

  return `
    ${pageHead("Overview", "Keep every Dog Hotel release the right size: check new requests, find weak tasks, and see if the plan fits the team.")}

    <div class="card hero">
      <h2>How it works</h2>
      <p>The agent reads your Jira tasks. First, simple rules check the facts. Then the AI gives advice in plain words. You make the decision.</p>
      <div class="steps">
        <div class="step"><b>1</b><h3>Load the project</h3><p>Use the sample data or upload a Jira CSV export.</p></div>
        <div class="step"><b>2</b><h3>Get advice</h3><p>Check a new request, the whole release, or ask a question.</p></div>
        <div class="step"><b>3</b><h3>You decide</h3><p>Accept, edit or reject. Every decision is saved.</p></div>
      </div>
    </div>

    <h2 class="section-title">Project data</h2>
    <div class="grid two">
      <div class="card">
        <h3>Loaded now</h3>
        <div class="source-box mt">${icon("database")}
          <div><strong>${s.source === "sample" ? "Sample data" : esc(s.file_name)}</strong>
          <small>${s.tickets} tasks · ${s.docs} document sections</small></div></div>
        <p class="muted mt">${sourceText}</p>
        <div class="btn-row mt"><button class="btn" id="useSample">${icon("database")}Use sample data</button></div>
      </div>
      <div class="card">
        <h3>Upload a Jira export</h3>
        <label class="drop mt" id="drop">
          ${icon("upload")}
          <strong>Choose a CSV file or drop it here</strong>
          <span>In Jira: Filters → your filter → Export → CSV (all fields)</span>
          <input type="file" id="jiraFile" accept=".csv" hidden>
        </label>
        <p class="small muted mt">Optional: add project documents (.md or .txt) so the agent can answer questions from them.
          <label class="link-btn">Add documents<input type="file" id="docFiles" accept=".md,.txt" multiple hidden></label>
          <span id="docNames"></span></p>
      </div>
    </div>

    <h2 class="section-title">Release settings</h2>
    <div class="card">
      <div class="form-grid">
        <label class="field half"><span>Release</span><select id="release">${releases}</select></label>
        <label class="field"><span>Deadline</span><input type="date" id="milestone" value="${c.milestone_date ?? ""}"></label>
        <label class="field"><span>Plan agreed on</span><input type="date" id="baseline" value="${c.baseline_date ?? ""}"><small>Later tasks count as "added after the plan"</small></label>
        <label class="field" style="grid-column: span 3"><span>Release goal</span><textarea id="goal" placeholder="What must this release achieve? One or two sentences.">${esc(c.goal)}</textarea></label>
        <label class="field"><span>Team capacity</span><input type="number" id="capacity" min="0" step="1" value="${c.capacity_points ?? ""}" placeholder="e.g. 40"><small>Story points the team can finish in this release</small></label>
      </div>
      <div class="btn-row mt"><button class="btn primary" id="saveContext">${icon("check")}Save settings</button></div>
    </div>

    <h2 class="section-title">This release at a glance</h2>
    ${s.facts ? scopeStats(s.facts) : ""}

    <h2 class="section-title">What do you want to do?</h2>
    <div class="grid three">
      ${toolCard("#/request", "message", "Check a new request", "Does a new idea fit this release, or is it scope creep?")}
      ${toolCard("#/health", "activity", "Check the release", "Find unclear tasks, too much work and risks.")}
      ${toolCard("#/ask", "help", "Ask a question", "Ask about the scope in normal words.")}
    </div>`;
}

function toolCard(href, iconName, title, text) {
  return `<a class="card" href="${href}" style="display:block">
    <div class="source-box" style="width:max-content;padding:10px">${icon(iconName)}</div>
    <h3 class="mt">${title}</h3><p class="muted" style="margin-top:6px">${text}</p>
    <p class="mt" style="color:var(--primary);font-weight:600;display:flex;align-items:center;gap:6px">Open ${icon("arrow")}</p></a>`;
}

function bindHome() {
  document.getElementById("useSample").onclick = async () => {
    await post("/api/data/sample");
    resetResults();
    await refreshState();
    render();
    toast("Sample data loaded");
  };

  const drop = document.getElementById("drop");
  const file = document.getElementById("jiraFile");
  const docs = document.getElementById("docFiles");
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

  const examples = EXAMPLE_REQUESTS.map(([title], i) => `<button class="chip" data-example="${i}">${esc(title)}</button>`).join("");
  const who = WHO.map((w) => `<button class="${w === memory.who ? "on" : ""}" data-who="${esc(w)}">${esc(w)}</button>`).join("");

  let result = "";
  if (memory.busy === "triage") result = loadingCard("Checking the request…", "Comparing it with the release goal and the team's capacity. This takes about 15 seconds.");
  else if (memory.triage?.error) result = errorCard(memory.triage.error);
  else if (memory.triage) result = triageResult(memory.triage);

  return `${head}
    <div class="card">
      <label class="field"><span>What is the new request?</span>
        <textarea id="requestText" class="large" placeholder="For example: The owners want online card payment for hotel stays.">${esc(memory.requestText)}</textarea></label>
      <div class="mt"><div class="muted small" style="margin-bottom:8px">Try an example:</div><div class="chips">${examples}</div></div>
      <div class="mt"><div style="font-weight:600;margin-bottom:8px">Who asked for it?</div><div class="segmented" id="who">${who}</div></div>
      <div class="btn-row" style="margin-top:22px">
        <button class="btn primary big" id="runTriage" ${memory.busy ? "disabled" : ""}>${icon("check")}Check request</button>
      </div>
    </div>
    <div class="stack" style="margin-top:24px">${result}</div>`;
}

function triageResult(r) {
  const a = r.advice;
  const cls = CLASS[a.classification];
  const related = a.related_tickets.length
    ? a.related_tickets.map((k) => `<span class="chip static"><span class="key">${esc(k)}</span>${esc(titleOf(k, r))}</span>`).join("")
    : '<span class="muted">No related tasks found.</span>';
  const decided = memory.triageSaved
    ? `<div class="notice" style="background:var(--green-soft);color:var(--green);border-color:var(--green-line)">Decision saved: ${esc(memory.triageSaved)}. You can see it in History.</div>`
    : `<div class="btn-row">
        <button class="btn green" data-decide="accepted">${icon("check")}Accept advice</button>
        <button class="btn" data-decide="edited">${icon("edit")}Accept with my edits</button>
        <button class="btn red-outline" data-decide="rejected">${icon("x")}Reject advice</button>
      </div>`;

  return `
    <div class="verdict ${cls.color}">
      ${icon(cls.icon)}
      <div>
        <h2>${cls.label}</h2>
        <p>${esc(a.restated_request)}</p>
        <span class="advice-pill">Advice: ${ADVICE[a.recommendation]}</span>
      </div>
    </div>

    <div class="grid two">
      <div class="card"><h3>Why</h3><p class="mt">${esc(a.rationale)}</p><p class="mt">${esc(a.recommendation_reason)}</p></div>
      <div class="card"><h3>Impact</h3>
        <div class="kv mt"><span class="badge gray">Size: ${esc(a.impact.effort)}</span>
          <span class="badge ${a.impact.schedule_risk}">Risk for the deadline: ${esc(cap(a.impact.schedule_risk))}</span></div>
        ${a.impact.affected_areas.length ? `<p class="muted small">Parts of the site affected</p><ul class="clean">${a.impact.affected_areas.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${a.impact.risks.length ? `<p class="muted small mt">Risks</p><ul class="clean">${a.impact.risks.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      </div>
    </div>

    ${a.trade_off ? `<div class="card" style="border-color:var(--amber-line);background:var(--amber-soft)"><h3>To make room</h3><p class="mt">${esc(a.trade_off)}</p></div>` : ""}

    <div class="grid two">
      <div class="card"><h3>Questions to ask</h3>
        ${a.clarifying_questions.length ? `<ol class="clean mt">${a.clarifying_questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>` : '<p class="muted mt">No open questions.</p>'}</div>
      <div class="card"><h3>Related tasks in Jira</h3><div class="chips mt">${related}</div></div>
    </div>

    <div class="card">
      <div class="card-head"><div><h3>Ready task for Jira</h3><p class="sub">You can edit the text before you accept it.</p></div>
        <button class="btn" id="copyStory">${icon("copy")}Copy</button></div>
      <textarea id="storyText" style="min-height:260px">${esc(r.story_text)}</textarea>
    </div>

    <div class="card"><h3 style="margin-bottom:14px">Your decision</h3>${decided}</div>
    <p class="muted small">Answer ready in ${r.seconds} seconds.</p>`;
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
    document.querySelectorAll("[data-who]").forEach((x) => x.classList.toggle("on", x === b));
  }));

  document.getElementById("runTriage").onclick = async () => {
    if (!memory.requestText.trim()) return toast("Please write the request first.", true);
    memory.busy = "triage";
    memory.triageSaved = false;
    render();
    try {
      memory.triage = await post("/api/triage", { request: memory.requestText, requester: memory.who });
    } catch (e) {
      memory.triage = { error: e.message };
    }
    memory.busy = null;
    render();
  };

  const copy = document.getElementById("copyStory");
  if (copy) copy.onclick = async () => {
    await navigator.clipboard.writeText(document.getElementById("storyText").value);
    toast("Copied. Paste it into Jira.");
  };

  document.querySelectorAll("[data-decide]").forEach((b) => (b.onclick = async () => {
    const r = memory.triage;
    const labels = { accepted: "advice accepted", edited: "accepted with your edits", rejected: "advice rejected" };
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
  }));
}

// ---------------------------------------------------------------- Release health

function renderHealth() {
  const s = memory.state;
  const head = pageHead("Release health",
    `Check every task of <strong>${esc(s.context.release || "the release")}</strong>: unclear tasks, too much work, scope growth and risks.`);
  if (needsData()) return head + needsData();

  let body = "";
  if (memory.busy === "health") body = loadingCard("Checking the release…", `Reading ${s.release_tickets} tasks. This takes about one minute.`);
  else if (memory.health?.error) body = errorCard(memory.health.error);
  else if (memory.health) body = healthResult(memory.health);
  else body = `<div class="card empty"><strong>Ready when you are</strong>Press "Check the release" to start.</div>`;

  return `${head}
    <div class="btn-row" style="margin-bottom:24px">
      <button class="btn primary big" id="runHealth" ${memory.busy ? "disabled" : ""}>${icon("activity")}Check the release</button>
      <button class="btn" id="runQuick" ${memory.busy ? "disabled" : ""}>Quick check (facts only)</button>
    </div>
    <div class="stack">${body}</div>`;
}

function healthResult(h) {
  const r = h.report;
  const m = r.metrics;
  const review = r.review;
  const color = r.score >= 70 ? "var(--green)" : r.score >= 40 ? "#e0a030" : "var(--red)";
  const label = r.score >= 70 ? "Healthy" : r.score >= 40 ? "Some risks" : "Needs attention";

  const counts = { all: r.findings.length, high: 0, medium: 0, low: 0 };
  r.findings.forEach((f) => counts[f.severity]++);
  const shown = r.findings.filter((f) => memory.healthFilter === "all" || f.severity === memory.healthFilter);
  const filters = ["all", "high", "medium", "low"].map((k) =>
    `<button class="${memory.healthFilter === k ? "on" : ""}" data-filter="${k}">${k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)} (${counts[k]})</button>`).join("");
  const problems = shown.map((f) => `
    <div class="problem">
      <div class="meta"><span class="badge ${f.severity}">${cap(f.severity)}</span><span class="badge ${f.source === "ai" ? "violet" : "gray"}">${f.source === "ai" ? "AI review" : "Rule"}</span></div>
      <div><h4><span class="key">${esc(f.ticket_key)}</span> · ${esc(PROBLEM[f.type] || f.type)} <span>· ${esc(h.titles[f.ticket_key] || "")}</span></h4>
        <p>${esc(f.explanation)}</p><p class="fix"><strong>What to do:</strong> ${esc(f.suggestion)}</p></div>
    </div>`).join("") || '<p class="muted">No problems at this level.</p>';

  let board = "";
  if (review && review.moscow.length) {
    const lanes = [["must", "Must have"], ["should", "Should have"], ["could", "Could have"], ["wont", "Not now"]];
    board = `<div class="card"><h3>Priorities</h3><p class="sub">What to keep and what to cut first if there is too much work.</p>
      <div class="board mt">${lanes.map(([key, name]) => {
        const items = review.moscow.filter((p) => p.moscow === key);
        return `<div class="lane"><h4>${name}<span class="muted">${items.length}</span></h4>${items.map((p) =>
          `<div class="item" title="${esc(p.reason)}"><b>${esc(p.ticket_key)}</b> ${esc(h.titles[p.ticket_key] || "")}</div>`).join("")}</div>`;
      }).join("")}</div></div>`;
  }

  return `
    <div class="grid four">
      <div class="card score"><div class="gauge" style="background:conic-gradient(${color} ${r.score * 3.6}deg, var(--bg) 0)"><div>${r.score}</div></div>
        <div><div class="muted small">Health score</div><h3 style="color:${color}">${label}</h3></div></div>
      ${workloadStat(m)}
      <div class="card stat"><div class="label">Added after the plan</div><div class="value">${m.added_after_baseline.length} <small>tasks</small></div>
        <div class="hint">${m.scope_growth_pct == null ? "Set the plan date to see this" : `Scope grew by ${m.scope_growth_pct}%`}</div></div>
      <div class="card stat"><div class="label">Blocked tasks</div><div class="value">${m.open_blockers.length}</div>
        <div class="hint">${plural(m.bugs_open, "open bug")} · ${plural(m.unestimated_open, "task")} without estimate</div></div>
    </div>

    ${review ? `
    <div class="grid two">
      <div class="card"><h3>Summary</h3><p class="mt">${esc(review.summary)}</p>
        <h3 class="mt">Does the plan cover the goal?</h3><p class="mt">${esc(review.goal_coverage)}</p></div>
      <div class="card"><h3>What to do next</h3><ol class="actions mt">${review.top_actions.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div>
    </div>` : `<div class="notice">This was a quick check: only the facts. Use "Check the release" to get the AI review as well.</div>`}

    <div class="card">
      <div class="card-head"><div><h3>Problems found</h3><p class="sub">Each task with a problem, and what to do about it.</p></div>
        <div class="filters">${filters}</div></div>
      ${problems}
    </div>

    ${board}

    ${(review?.dependency_risks?.length || m.open_blockers.length) ? `<div class="card"><h3>Dependency risks</h3><ul class="clean mt">
      ${(review?.dependency_risks || []).map((x) => `<li>${esc(x)}</li>`).join("")}
      ${review ? "" : m.open_blockers.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}

    <div class="btn-row">
      <a class="btn" href="/api/health/report">${icon("download")}Download report</a>
      <button class="btn green" id="reviewed">${icon("check")}I reviewed this report</button>
    </div>
    ${h.seconds ? `<p class="muted small">AI review ready in ${h.seconds} seconds.</p>` : ""}`;
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
  const reviewed = document.getElementById("reviewed");
  if (reviewed) reviewed.onclick = async () => {
    const r = memory.health.report;
    await post("/api/decision", { tool: "release check", decision: "reviewed", details: { score: r.score, problems: r.findings.length } });
    toast("Saved to History");
  };
}

// ---------------------------------------------------------------- Ask a question

function renderAsk() {
  const head = pageHead("Ask a question",
    "Ask about the scope in normal words. The answer comes only from the project documents and tasks, with the sources.");
  if (needsData()) return head + needsData();

  const examples = EXAMPLE_QUESTIONS.map((q, i) => `<button class="chip" data-q="${i}">${esc(q)}</button>`).join("");
  const busy = memory.busy === "ask" ? loadingCard("Looking in the project…", "Reading the documents and tasks. This takes a few seconds.") : "";
  const answers = memory.answers.map((item) => {
    if (item.error) return `<div class="card"><div class="question-line">${esc(item.question)}</div>${errorCard(item.error)}</div>`;
    const a = item.answer;
    const sources = a.sources.length ? a.sources.map((x) => `<span class="chip static">${icon("file")}${esc(x.replace(/^\[?DOC:\s*/, "").replace(/\]$/, ""))}</span>`).join("") : '<span class="muted">No sources</span>';
    return `<div class="card">
      <div class="question-line">${esc(item.question)}</div>
      ${a.not_found ? '<div class="kv"><span class="badge amber">Not found in the project sources</span></div>' : '<div class="kv"><span class="badge green">Answer from project sources</span></div>'}
      <p class="answer">${esc(a.answer)}</p>
      <p class="muted small mt" style="margin-bottom:8px">Sources</p><div class="chips">${sources}</div>
      ${a.follow_up ? `<p class="mt"><strong>Next step:</strong> ${esc(a.follow_up)}</p>` : ""}
    </div>`;
  }).join("");

  return `${head}
    <div class="card">
      <label class="field"><span>Your question</span>
        <input type="text" id="question" placeholder="For example: Is online payment in this release?"></label>
      <div class="mt"><div class="muted small" style="margin-bottom:8px">Try an example:</div><div class="chips">${examples}</div></div>
      <div class="btn-row" style="margin-top:22px"><button class="btn primary big" id="runAsk" ${memory.busy ? "disabled" : ""}>${icon("help")}Ask</button></div>
    </div>
    <div class="qa-list">${busy}${answers}</div>`;
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
  input.onkeydown = (e) => e.key === "Enter" && ask();
  document.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => {
    input.value = EXAMPLE_QUESTIONS[Number(b.dataset.q)];
    input.focus();
  }));
}

// ---------------------------------------------------------------- History

async function renderHistory() {
  const head = pageHead("History", "Every piece of advice and every decision, newest first.");
  let events = [];
  try {
    events = await api("/api/history");
  } catch (e) {
    return head + errorCard(e.message);
  }
  if (!events.length) return head + '<div class="card empty"><strong>Nothing here yet</strong>Decisions appear here after you accept or reject advice.</div>';

  const decisions = events.filter((e) => ["accepted", "edited", "rejected"].includes(e.decision));
  const accepted = decisions.filter((e) => e.decision !== "rejected").length;
  const badge = { accepted: "green", edited: "blue", rejected: "red", reviewed: "gray", asked: "violet" };
  const rows = events.map((e) => {
    const d = e.details || {};
    const what = d.request || d.question || (d.score != null ? `Score ${d.score}/100, ${d.problems} problems` : "");
    const extra = d.verdict ? `<div class="muted small">${esc(d.verdict)} · ${esc(d.advice)}</div>` : "";
    return `<tr><td class="small muted">${esc(e.time.replace("T", " "))}</td><td>${esc(cap(e.tool))}</td>
      <td><span class="badge ${badge[e.decision] || "gray"}">${esc(cap(e.decision))}</span></td>
      <td>${esc(what.length > 140 ? what.slice(0, 140) + "…" : what)}${extra}</td></tr>`;
  }).join("");

  return `${head}
    <div class="grid three" style="margin-bottom:20px">
      <div class="card stat"><div class="label">Events</div><div class="value">${events.length}</div></div>
      <div class="card stat"><div class="label">Decisions on advice</div><div class="value">${decisions.length}</div></div>
      <div class="card stat"><div class="label">Advice accepted</div><div class="value">${decisions.length ? Math.round((accepted / decisions.length) * 100) + "%" : "–"}</div>
        <div class="hint">Including accepted with edits</div></div>
    </div>
    <div class="card"><table class="history"><thead><tr><th>Time</th><th>Tool</th><th>Decision</th><th>What</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// ---------------------------------------------------------------- routing

const PAGES = {
  home: [renderHome, bindHome],
  request: [renderRequest, bindRequest],
  health: [renderHealth, bindHealth],
  ask: [renderAsk, bindAsk],
  history: [renderHistory, () => {}],
};

function currentPage() {
  const name = location.hash.replace("#/", "");
  return PAGES[name] ? name : "home";
}

async function render() {
  const name = currentPage();
  document.querySelectorAll(".sidebar a").forEach((a) => a.classList.toggle("active", a.dataset.page === name));
  const [draw, bind] = PAGES[name];
  const page = document.getElementById("page");
  if (!memory.busy) await refreshState();
  page.innerHTML = await draw();
  bind();
}

window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
});

document.querySelectorAll("[data-icon]").forEach((el) => (el.outerHTML = icon(el.dataset.icon)));

refreshState()
  .then(render)
  .catch((e) => {
    document.getElementById("page").innerHTML = errorCard("The agent server is not running. Start it with run.bat. (" + e.message + ")");
  });
