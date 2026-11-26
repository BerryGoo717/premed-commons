/* ===== Shared data (edit freely) ===== */
const STAGES = [
  { id:"y1", label:"First year" },
  { id:"y2", label:"Second year" },
  { id:"y3", label:"Third year" },
  { id:"y4", label:"Application year" },
  { id:"gap", label:"Gap year" }
];

/* Activity balance tool: common starting ranges (hours), based on rough advising guidance.
   Not requirements. Edit the numbers or hints freely. */
const BENCH = [
  { key:"clinical", label:"Clinical", low:100, high:200, eg:"Patient-facing work: hospital or clinic volunteering, scribing, EMT, CNA" },
  { key:"research", label:"Research", low:100, high:300, eg:"Lab, clinical, or any hypothesis-driven research in any field" },
  { key:"nonclinical", label:"Non-clinical volunteering", low:100, high:200, eg:"Service to your community outside of healthcare settings" },
  { key:"shadowing", label:"Shadowing", low:25, high:75, eg:"Observing physicians, in one or several specialties" }
];

/* Sample entries: replace with your own guides and links. Add  url:"https://..."  to make a card clickable. */
const RESOURCES = [
  { tag:"MCAT", title:"MCAT study planner", text:"A week-by-week template for building your study schedule." },
  { tag:"Application", title:"Personal statement guide", text:"How to find your story and structure a clear first draft." },
  { tag:"Experiences", title:"How to find shadowing", text:"Who to ask, what to say, and how to follow up." },
  { tag:"Application", title:"Activities section tips", text:"Describe your experiences in a way that shows impact." },
  { tag:"Interviews", title:"Interview practice questions", text:"Common formats and questions to rehearse with a friend." },
  { tag:"Experiences", title:"Getting into research", text:"Cold emailing professors and what to expect in a lab." },
  { tag:"MCAT", title:"Choosing practice materials", text:"What to look for and how to review your mistakes." },
  { tag:"Wellbeing", title:"Avoiding premed burnout", text:"Habits for staying healthy during a demanding stretch." }
];

const GROUPS = {
  y1:{ title:"First-year circle", text:"A relaxed space to ask basic questions, compare classes, and figure out how to start." },
  y2:{ title:"Second-year circle", text:"Swap tips on finding clinical roles and research, and keep each other accountable." },
  y3:{ title:"MCAT and application circle", text:"Study together, share schedules, and review drafts as you prepare to apply." },
  y4:{ title:"Applicant circle", text:"Support through secondaries and interview prep from people going through it with you." },
  gap:{ title:"Gap-year circle", text:"Connect with others making the most of their time between college and medical school." }
};

/* ===== Helpers ===== */
const store = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)) || {}; }catch(e){ return {}; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const $ = id => document.getElementById(id);

/* ===== Mobile menu ===== */
(function(){
  const btn = $("menuBtn"), nav = $("nav");
  if(!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", e => {
    if(e.target.tagName === "A"){ nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); }
  });
})();

/* ===== Footer year ===== */
if($("year")) $("year").textContent = new Date().getFullYear();

/* ===== Resource cards (home shows a few, resources page shows all with filters) ===== */
(function(){
  const cards = $("cards");
  if(!cards) return;
  const limit = parseInt(cards.dataset.limit || "0", 10);
  const list = limit ? RESOURCES.slice(0, limit) : RESOURCES;

  list.forEach(r => {
    const c = document.createElement(r.url ? "a" : "article");
    c.className = "card"; c.dataset.tag = r.tag;
    if(r.url){ c.href = r.url; c.style.textDecoration = "none"; c.style.color = "inherit"; }
    c.innerHTML = '<div class="tag"></div><h3></h3><p></p>';
    c.querySelector(".tag").textContent = r.tag;
    c.querySelector("h3").textContent = r.title;
    c.querySelector("p").textContent = r.text;
    cards.appendChild(c);
  });

  const filters = $("filters");
  if(!filters) return;
  const tags = ["All", ...new Set(RESOURCES.map(r => r.tag))];
  tags.forEach((tag, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = tag;
    b.setAttribute("aria-pressed", i === 0);
    b.addEventListener("click", () => {
      filters.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === b));
      cards.querySelectorAll(".card").forEach(c => { c.hidden = !(tag === "All" || c.dataset.tag === tag); });
    });
    filters.appendChild(b);
  });
})();

/* ===== Community group finder ===== */
(function(){
  const sel = $("stage"), out = $("finderOut");
  if(!sel || !out) return;
  STAGES.forEach(s => {
    const o = document.createElement("option");
    o.value = s.id; o.textContent = s.label;
    sel.appendChild(o);
  });
  sel.addEventListener("change", () => {
    out.textContent = "";
    const g = GROUPS[sel.value];
    if(!g) return;
    const h = document.createElement("h3"), p = document.createElement("p"), a = document.createElement("a");
    h.textContent = g.title; p.textContent = g.text;
    a.className = "btn"; a.href = "index.html#join"; a.textContent = "Join this circle";
    out.append(h, p, a);
  });
})();

/* ===== Activity balance tool (resources page) ===== */
(function(){
  const wrap = $("balInputs"), chart = $("balChart");
  if(!wrap || !chart) return;
  const summary = $("balSummary"), status = $("balStatus"), clearBtn = $("balClear");
  const KEY = "pmc-balance";
  const saved = store.get(KEY);
  const inputs = {};

  BENCH.forEach(b => {
    const row = document.createElement("div");
    row.className = "bal-row";
    const id = "bal-" + b.key;
    row.innerHTML = '<label for="' + id + '"></label><div class="bal-field"><input type="number" id="' + id + '" min="0" max="10000" step="1" inputmode="numeric" placeholder="0"><span>hours</span></div><p class="hint"></p><p class="result" id="res-' + b.key + '"></p>';
    row.querySelector("label").textContent = b.label;
    row.querySelector(".hint").textContent = b.eg + ". Common starting range: " + b.low + " to " + b.high + " hours.";
    const input = row.querySelector("input");
    if(saved[b.key]) input.value = saved[b.key];
    input.addEventListener("input", () => { render(); queueSave(); });
    inputs[b.key] = input;
    wrap.appendChild(row);
  });

  function val(key){
    const v = parseFloat(inputs[key].value);
    return isFinite(v) && v > 0 ? Math.min(v, 10000) : 0;
  }

  const CX = 220, CY = 195, R = 120;
  function pt(i, r){
    const a = (-90 + i * 90) * Math.PI / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }
  function poly(rs){ return rs.map((r, i) => pt(i, r).map(n => n.toFixed(1)).join(",")).join(" "); }
  function path(rs){ return "M" + rs.map((r, i) => pt(i, r).map(n => n.toFixed(1)).join(",")).join(" L") + " Z"; }

  function render(){
    const vals = BENCH.map(b => val(b.key));
    const axisMax = BENCH.map(b => b.high * 1.5);
    const rUser = vals.map((v, i) => Math.min(v / axisMax[i], 1) * R);
    const rLow = BENCH.map((b, i) => b.low / axisMax[i] * R);
    const rHigh = BENCH.map((b, i) => b.high / axisMax[i] * R);

    let svg = '<svg viewBox="-20 0 480 400" role="img" aria-label="Radar chart of your hours compared with common starting ranges">';
    [1/3, 2/3, 1].forEach(f => { svg += '<polygon class="grid" points="' + poly(BENCH.map(() => R * f)) + '"/>'; });
    for(let i = 0; i < 4; i++){
      const p = pt(i, R);
      svg += '<line class="axis" x1="' + CX + '" y1="' + CY + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>';
    }
    svg += '<path class="band" fill-rule="evenodd" d="' + path(rHigh) + " " + path(rLow) + '"/>';
    if(vals.some(v => v > 0)){
      svg += '<polygon class="you" points="' + poly(rUser) + '"/>';
      rUser.forEach((r, i) => { if(vals[i] > 0){ const p = pt(i, r); svg += '<circle class="dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5"/>'; } });
    }
    const lab = [
      { x: CX, y: CY - R - 34, anchor: "middle" },
      { x: CX + R + 14, y: CY - 6, anchor: "start" },
      { x: CX, y: CY + R + 28, anchor: "middle" },
      { x: CX - R - 14, y: CY - 6, anchor: "end" }
    ];
    BENCH.forEach((b, i) => {
      const l = lab[i];
      svg += '<text class="lbl" text-anchor="' + l.anchor + '"><tspan x="' + l.x + '" y="' + l.y + '">' + b.label + '</tspan><tspan class="hrs" x="' + l.x + '" y="' + (l.y + 17) + '">' + vals[i] + ' hrs</tspan></text>';
    });
    svg += '</svg>';
    chart.innerHTML = svg;

    const under = [];
    let reached = 0;
    BENCH.forEach((b, i) => {
      const v = vals[i], out = $("res-" + b.key);
      if(v === 0){ out.textContent = "Not started yet, and that is okay."; under.push(b.label.toLowerCase()); }
      else if(v < b.low){ out.textContent = "Room to grow. Many students build this up over a few semesters."; under.push(b.label.toLowerCase()); }
      else if(v <= b.high){ out.textContent = "Right in the common starting range."; reached++; }
      else { out.textContent = "Plenty here. What you learned matters more than extra hours."; reached++; }
    });

    if(vals.every(v => v === 0)){
      summary.textContent = "Enter your hours and your chart will fill in. Rough numbers are fine, and you can update them any time.";
    } else {
      let list = under.length > 1 ? under.slice(0, -1).join(", ") + " and " + under[under.length - 1] : under[0];
      summary.textContent = "You are in or past the common starting range in " + reached + " of 4 areas. " +
        (under.length ? "Areas where a little more time could help: " + list + ". This is a snapshot, not a verdict, and most students build these gradually." :
                        "That is a well-rounded picture. Keep reflecting on what each experience has taught you.");
    }
  }

  let timer;
  function persist(){
    const data = {};
    BENCH.forEach(b => { const v = val(b.key); if(v) data[b.key] = v; });
    try{
      localStorage.setItem(KEY, JSON.stringify(data));
      status.textContent = "Saved in this browser.";
    }catch(e){
      status.textContent = "Could not save here (your browser may be blocking storage). The chart still works.";
    }
  }
  function queueSave(){ status.textContent = "Saving..."; clearTimeout(timer); timer = setTimeout(persist, 400); }

  clearBtn.addEventListener("click", () => {
    BENCH.forEach(b => { inputs[b.key].value = ""; });
    try{ localStorage.removeItem(KEY); }catch(e){}
    status.textContent = "Cleared.";
    render();
  });

  render();
  if(Object.keys(saved).length) status.textContent = "Loaded your saved hours.";
})();

/* ===== Sign-up form (Formspree) ===== */
(function(){
  const form = $("joinForm"), status = $("status");
  if(!form || !status) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if(form.action.includes("YOUR_FORM_ID")){
      status.textContent = "The sign-up form is not connected yet. Add your Formspree form ID in index.html.";
      return;
    }
    status.textContent = "Sending...";
    try{
      const res = await fetch(form.action, { method:"POST", body:new FormData(form), headers:{Accept:"application/json"} });
      if(res.ok){ form.reset(); status.textContent = "Thanks for signing up. We will email you soon."; }
      else{ status.textContent = "Something went wrong. Please try again or email us directly."; }
    }catch(err){ status.textContent = "Could not send. Check your connection and try again."; }
  });
})();
