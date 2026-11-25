/* ===== Shared data (edit freely) ===== */
const ROADMAP = [
  { id:"y1", label:"First year", sub:"Build a strong foundation and explore.",
    items:["Meet your premed advisor and map out required courses","Build good study habits in your first science courses","Join one or two clubs you actually care about","Start exploring medicine through volunteering or hospital programs","Find a mentor, like an upperclassman or Premed Commons member"] },
  { id:"y2", label:"Second year", sub:"Deepen your experiences.",
    items:["Keep grades strong in core science courses","Look for a regular clinical or community service role","Ask about research opportunities in labs on campus","Begin shadowing physicians in specialties that interest you","Build relationships with professors who may later write letters"] },
  { id:"y3", label:"Third year", sub:"MCAT prep and application planning.",
    items:["Finish most prerequisite courses","Make a realistic MCAT study schedule and take practice exams","Decide on your application timeline, including whether to take a gap year","Ask for letters of recommendation early","Draft your personal statement and activity descriptions","Research medical schools and build a preliminary school list"] },
  { id:"y4", label:"Application year", sub:"Apply carefully and prepare for interviews.",
    items:["Submit primary applications as early as you can","Complete secondary applications promptly","Practice interviews with mentors or peers","Keep your experiences and coursework going","Send updates to schools when something meaningful changes"] },
  { id:"gap", label:"Gap year", sub:"Use the time well.",
    items:["Gain full-time clinical, research, or service experience","Retake or improve the MCAT or coursework only if it makes sense","Strengthen your story: why medicine, and why now","Reapply with a clear plan if this is a second cycle","Take care of your health and avoid burnout"] }
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

/* ===== Copy email ===== */
document.querySelectorAll("[data-copy-email]").forEach(button => {
  button.addEventListener("click", async () => {
    const status = button.nextElementSibling;
    try {
      if(!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(button.dataset.copyEmail);
      status.textContent = "Email copied to clipboard.";
    } catch(err) {
      status.textContent = "Could not copy email. Please copy it manually.";
    }
  });
});

/* ===== Roadmap (resources page) ===== */
(function(){
  const tabs = $("tabs"), panels = $("panels");
  if(!tabs || !panels) return;
  const saved = store.get("pmc-progress");

  function update(panel){
    const boxes = panel.querySelectorAll("input[type=checkbox]");
    const done = [...boxes].filter(b => b.checked).length;
    panel.querySelector(".progress span").textContent = done + " of " + boxes.length + " done";
    panel.querySelector(".progress-bar i").style.width = (done / boxes.length * 100) + "%";
  }

  ROADMAP.forEach((r, i) => {
    const t = document.createElement("button");
    t.className = "tab"; t.id = "tab-" + r.id; t.type = "button";
    t.setAttribute("role","tab");
    t.setAttribute("aria-controls","panel-" + r.id);
    t.setAttribute("aria-selected", i === 0);
    t.tabIndex = i === 0 ? 0 : -1;
    t.textContent = r.label;
    tabs.appendChild(t);

    const p = document.createElement("div");
    p.className = "panel"; p.id = "panel-" + r.id;
    p.setAttribute("role","tabpanel");
    p.setAttribute("aria-labelledby","tab-" + r.id);
    p.hidden = i !== 0;
    p.innerHTML = '<h3></h3><p class="sub"></p><ul class="checks"></ul><div class="progress"><span></span><div class="progress-bar"><i></i></div></div>';
    p.querySelector("h3").textContent = r.label;
    p.querySelector(".sub").textContent = r.sub;
    const ul = p.querySelector(".checks");
    r.items.forEach((text, j) => {
      const key = r.id + "-" + j;
      const li = document.createElement("li"), label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.checked = !!saved[key];
      cb.addEventListener("change", () => { saved[key] = cb.checked; store.set("pmc-progress", saved); update(p); });
      const span = document.createElement("span"); span.textContent = text;
      label.append(cb, span); li.appendChild(label); ul.appendChild(li);
    });
    panels.appendChild(p);
    update(p);
  });

  function select(btn){
    tabs.querySelectorAll(".tab").forEach(b => {
      const on = b === btn;
      b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
      $(b.getAttribute("aria-controls")).hidden = !on;
    });
    btn.focus();
  }
  tabs.addEventListener("click", e => { const b = e.target.closest(".tab"); if(b) select(b); });
  tabs.addEventListener("keydown", e => {
    const list = [...tabs.querySelectorAll(".tab")], i = list.indexOf(document.activeElement);
    if(i < 0) return;
    if(e.key === "ArrowRight"){ e.preventDefault(); select(list[(i+1) % list.length]); }
    if(e.key === "ArrowLeft"){ e.preventDefault(); select(list[(i-1+list.length) % list.length]); }
  });
})();

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
  Object.keys(GROUPS).forEach(k => {
    const o = document.createElement("option");
    o.value = k; o.textContent = ROADMAP.find(r => r.id === k).label;
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
