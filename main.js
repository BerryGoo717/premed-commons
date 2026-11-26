/* ===== Shared data (edit freely) ===== */
const STAGES = [
  { id:"y1", label:"First year" },
  { id:"y2", label:"Second year" },
  { id:"y3", label:"Third year" },
  { id:"y4", label:"Application year" },
  { id:"gap", label:"Gap year" }
];

/* "Why medicine?" reflection prompts. Every prompt is optional. Edit freely. */
const PROMPTS = [
  { key:"moment", title:"A moment that mattered",
    ask:"Think of a moment that made medicine feel real to you. What happened, and what did you notice about yourself?",
    nudge:["I remember when...","What surprised me was...","Afterward, I felt..."] },
  { key:"patients", title:"What you have learned from patients",
    ask:"Describe an interaction with a patient, or with someone you cared for. What did it teach you about people or about care?",
    nudge:["One person I will not forget...","I used to think... but now I see...","Something small that meant a lot..."] },
  { key:"change", title:"Something you would want to change",
    ask:"What problem in healthcare, or in your community, have you seen up close? What would you want to help change?",
    nudge:["I noticed that...","The people most affected were...","If I could change one thing..."] },
  { key:"struggle", title:"A time things did not go as planned",
    ask:"Describe a setback or a hard stretch. How did you respond, and what did it show you?",
    nudge:["The hardest part was...","What helped me keep going...","What I would do differently..."] },
  { key:"becoming", title:"Who you are becoming",
    ask:"What qualities do you want to bring to your patients, and where have you already practiced them?",
    nudge:["I want to be someone who...","I have practiced this when...","A person who showed me this was..."] },
  { key:"why", title:"Why medicine, and not something else",
    ask:"What draws you to medicine in particular? Which other paths did you consider, and what did they teach you?",
    nudge:["Other paths I explored...","What medicine offers that they do not...","What I still want to learn..."] }
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

/* ===== "Why medicine?" reflection builder (resources page) ===== */
(function(){
  const list = $("refList");
  if(!list) return;
  const KEY = "pmc-reflections";
  const status = $("refStatus"), progress = $("refProgress");
  const previous = $("refPrevious"), next = $("refNext"), position = $("refPosition");
  const saved = store.get(KEY);
  const areas = {};
  let activePrompt = 0;

  function words(t){ const m = t.trim().match(/\S+/g); return m ? m.length : 0; }

  PROMPTS.forEach(p => {
    const card = document.createElement("article");
    card.className = "ref-card";
    const id = "ref-" + p.key;
    card.innerHTML =
      '<label for="' + id + '"><span class="ref-title"></span><span class="ref-ask"></span></label>' +
      '<details class="ref-help"><summary>Need a nudge?</summary><ul></ul></details>' +
      '<textarea id="' + id + '" rows="5" placeholder="Write as much or as little as you like, or skip this one."></textarea>' +
      '<div class="ref-count"></div>';
    card.querySelector(".ref-title").textContent = p.title;
    card.querySelector(".ref-ask").textContent = p.ask;
    const ul = card.querySelector("ul");
    p.nudge.forEach(n => { const li = document.createElement("li"); li.textContent = n; ul.appendChild(li); });
    const ta = card.querySelector("textarea");
    if(saved[p.key]) ta.value = saved[p.key];
    ta.addEventListener("input", () => { update(); queueSave(); });
    areas[p.key] = { card: card, ta: ta, count: card.querySelector(".ref-count") };
    list.appendChild(card);
  });

  function showPrompt(index){
    activePrompt = index;
    PROMPTS.forEach((p, i) => { areas[p.key].card.hidden = i !== activePrompt; });
    previous.disabled = activePrompt === 0;
    next.disabled = activePrompt === PROMPTS.length - 1;
    position.textContent = "Prompt " + (activePrompt + 1) + " of " + PROMPTS.length;
  }

  previous.addEventListener("click", () => {
    showPrompt(activePrompt - 1);
    areas[PROMPTS[activePrompt].key].ta.focus();
  });
  next.addEventListener("click", () => {
    showPrompt(activePrompt + 1);
    areas[PROMPTS[activePrompt].key].ta.focus();
  });

  function update(){
    let filled = 0;
    PROMPTS.forEach(p => {
      const a = areas[p.key], n = words(a.ta.value);
      a.count.textContent = n ? n + (n === 1 ? " word" : " words") : "";
      if(n) filled++;
    });
    progress.textContent = filled
      ? "You have reflected on " + filled + " of " + PROMPTS.length + " prompts. There is no right number, and skipping is always fine."
      : "Start with whichever prompt speaks to you. There is no order, and nothing is required.";
  }

  let timer;
  function persist(){
    const data = {};
    PROMPTS.forEach(p => { const v = areas[p.key].ta.value; if(v.trim()) data[p.key] = v; });
    try{
      localStorage.setItem(KEY, JSON.stringify(data));
      status.textContent = "Saved in this browser.";
    }catch(e){
      status.textContent = "Could not save here (your browser may be blocking storage). Download a copy to keep your writing.";
    }
  }
  function queueSave(){ status.textContent = "Saving..."; clearTimeout(timer); timer = setTimeout(persist, 500); }

  $("refDownload").addEventListener("click", () => {
    const parts = [];
    PROMPTS.forEach(p => {
      const v = areas[p.key].ta.value.trim();
      if(v) parts.push(p.title.toUpperCase() + "\n" + p.ask + "\n\n" + v);
    });
    if(!parts.length){ status.textContent = "Nothing to download yet. Write in any prompt first."; return; }
    const head = "My \"Why medicine?\" reflections\nFrom Premed Commons, " + new Date().toLocaleDateString() + "\n\n";
    const blob = new Blob([head + parts.join("\n\n----------\n\n") + "\n"], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "why-medicine-reflections.txt";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "Downloaded.";
  });

  $("refClear").addEventListener("click", () => {
    if(!window.confirm("Clear all of your reflections from this browser? This cannot be undone.")) return;
    PROMPTS.forEach(p => { areas[p.key].ta.value = ""; });
    try{ localStorage.removeItem(KEY); }catch(e){}
    status.textContent = "Cleared.";
    update();
  });

  showPrompt(activePrompt);
  update();
  if(Object.keys(saved).length) status.textContent = "Loaded your saved reflections.";
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
