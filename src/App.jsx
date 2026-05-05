import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Impossible"];
const DIFF_SCORE   = { Easy: 1, Medium: 2, Hard: 3, Impossible: 5 };
const BO_PASSWORD  = "jack";
const BAD_VOTE_THRESHOLD = 2; // mission deleted if this many players vote bad

const APP_VERSION = "1.1.2";
function diffDown(d) { const i = DIFFICULTIES.indexOf(d); return i > 0 ? DIFFICULTIES[i - 1] : d; }

// ─────────────────────────────────────────────────────────────
// DEFAULT MISSIONS  — now with {otherPlayer} template token
// ─────────────────────────────────────────────────────────────
const DEFAULT_MISSIONS = [
{id:"m001",mission:"Go for a high five with {otherPlayer} and deliberately miss — act confused, as if they moved at the last second.",difficulty:"Easy",category:"Social Awkwardness"},
{id:"m002",mission:"Start a conversation with {otherPlayer} by commenting on something that isn't there. Point vaguely and say 'did you see that?' then act like you imagined it.",difficulty:"Medium",category:"Social Awkwardness"},
{id:"m003",mission:"Every time {otherPlayer} asks you a yes/no question today, pause for five full seconds before answering.",difficulty:"Easy",category:"Social Awkwardness"},
{id:"m004",mission:"Wave confidently at {otherPlayer} from across the room as if you haven't seen them in years. Hold eye contact. Do not look away first.",difficulty:"Medium",category:"Social Awkwardness"},
{id:"m005",mission:"Refer to {otherPlayer} in the third person at least three times while talking directly to them. Act as if this is completely normal.",difficulty:"Hard",category:"Social Awkwardness"},
{id:"m006",mission:"Any time {otherPlayer} mentions food today, sigh deeply and say 'yeah…' as if it triggers a distant memory. Don't explain.",difficulty:"Easy",category:"Social Awkwardness"},
{id:"m007",mission:"After {otherPlayer} finishes speaking, slowly and silently nod for an uncomfortably long time — then change the subject entirely.",difficulty:"Medium",category:"Social Awkwardness"},
{id:"m008",mission:"Secretly rearrange one of {otherPlayer}'s belongings — a bag, a mug, a phone — without them noticing. See if they mention it.",difficulty:"Easy",category:"Sneaky Actions"},
{id:"m009",mission:"Swap two of {otherPlayer}'s items on the table while they're not looking. Say nothing. Wait to see if they notice.",difficulty:"Easy",category:"Sneaky Actions"},
{id:"m010",mission:"Leave a cryptic note in {otherPlayer}'s vicinity — something like 'it was never about the keys' — and act completely innocent.",difficulty:"Medium",category:"Sneaky Actions"},
{id:"m011",mission:"Subtly hum a tune every time {otherPlayer} enters the room today. Stop immediately when they look at you. Repeat every time.",difficulty:"Hard",category:"Sneaky Actions"},
{id:"m012",mission:"Pick up something belonging to {otherPlayer} and spend the day acting mildly protective of it — keeping it close, moving it away from people.",difficulty:"Medium",category:"Sneaky Actions"},
{id:"m013",mission:"Steer at least two conversations with {otherPlayer} toward the topic of dreams today. Make it feel natural both times.",difficulty:"Medium",category:"Conversation Steering"},
{id:"m014",mission:"Get {otherPlayer} to bring up the concept of parallel universes without you mentioning it first. You must plant the seed subtly.",difficulty:"Hard",category:"Conversation Steering"},
{id:"m015",mission:"Every time {otherPlayer} complains about something today, redirect it into a positive. Do it at least three times without being preachy.",difficulty:"Medium",category:"Conversation Steering"},
{id:"m016",mission:"Drop a completely random historical fact into at least two conversations with {otherPlayer} today. It must feel organic.",difficulty:"Hard",category:"Conversation Steering"},
{id:"m017",mission:"Steer a conversation with {otherPlayer} toward their childhood memories. Get them talking without revealing that's your goal.",difficulty:"Medium",category:"Conversation Steering"},
{id:"m018",mission:"Find a way to bring up 'the ocean' in at least two conversations with {otherPlayer} today. It cannot be the opening topic.",difficulty:"Hard",category:"Conversation Steering"},
{id:"m019",mission:"Use the word 'apparently' at least five times while talking to {otherPlayer} today. It must fit naturally each time.",difficulty:"Easy",category:"Word Challenge"},
{id:"m020",mission:"Use the word 'technically' at least four times in conversations with {otherPlayer} in situations where it's barely applicable.",difficulty:"Medium",category:"Word Challenge"},
{id:"m021",mission:"Avoid saying 'yes' to {otherPlayer} for the entire day. Use 'absolutely', 'indeed', 'correct' — but never 'yes'.",difficulty:"Hard",category:"Word Challenge"},
{id:"m022",mission:"Use the phrase 'as it happens' at least three times in conversation with {otherPlayer} today. It must sound natural each time.",difficulty:"Medium",category:"Word Challenge"},
{id:"m023",mission:"Work the word 'extraordinary' into at least three conversations with {otherPlayer} today, applied to mundane things.",difficulty:"Easy",category:"Word Challenge"},
{id:"m024",mission:"Use the word 'allegedly' at least four times with {otherPlayer} today when describing things that are absolutely certain.",difficulty:"Medium",category:"Word Challenge"},
{id:"m025",mission:"Give {otherPlayer} three genuine compliments today — only about things they made or did, never about how they look.",difficulty:"Easy",category:"Compliments"},
{id:"m026",mission:"Compliment {otherPlayer} on something specific and unusual — their choice of bag, their handwriting, the way they said something.",difficulty:"Medium",category:"Compliments"},
{id:"m027",mission:"Give {otherPlayer} a compliment so specific and detailed that they look genuinely surprised.",difficulty:"Medium",category:"Compliments"},
{id:"m028",mission:"Compliment {otherPlayer} twice today about two completely different things. Space it out by at least two hours.",difficulty:"Easy",category:"Compliments"},
{id:"m029",mission:"Tell {otherPlayer} something you genuinely admire about them that you have never said before.",difficulty:"Hard",category:"Compliments"},
{id:"m030",mission:"Look up at the ceiling pensively at least three times today while talking to {otherPlayer}. Say nothing about it.",difficulty:"Easy",category:"Odd Behaviour"},
{id:"m031",mission:"Respond to at least three of {otherPlayer}'s questions today with a question of your own — never answer directly.",difficulty:"Medium",category:"Odd Behaviour"},
{id:"m032",mission:"Whenever {otherPlayer} mentions a number today, repeat it quietly under your breath as if double-checking.",difficulty:"Easy",category:"Odd Behaviour"},
{id:"m033",mission:"Pause what you're doing at least twice while with {otherPlayer} today, look around slowly as if you heard something, then carry on.",difficulty:"Easy",category:"Odd Behaviour"},
{id:"m034",mission:"Refer to at least one completely ordinary thing {otherPlayer} does today as 'the incident' — with gravitas.",difficulty:"Medium",category:"Odd Behaviour"},
{id:"m035",mission:"Take an unusually long time to make a trivial decision when with {otherPlayer} today — as if it genuinely matters enormously.",difficulty:"Easy",category:"Odd Behaviour"},
{id:"m036",mission:"While in conversation with {otherPlayer}, stare meaningfully at the nearest exit for five seconds. Say nothing. Return to the conversation.",difficulty:"Medium",category:"Odd Behaviour"},
{id:"m037",mission:"Memorise one new fact about {otherPlayer} from today's interactions. Be ready to report it at the end of the day.",difficulty:"Medium",category:"Observation"},
{id:"m038",mission:"Notice and remember three specific things {otherPlayer} says today word-for-word. Don't tell them — just remember.",difficulty:"Easy",category:"Observation"},
{id:"m039",mission:"Count how many times {otherPlayer} says 'basically' across all conversations today. Report the number at the end.",difficulty:"Easy",category:"Observation"},
{id:"m040",mission:"Track every time {otherPlayer} contradicts themselves today. Keep a mental tally. Do not point it out.",difficulty:"Medium",category:"Observation"},
{id:"m041",mission:"Notice something about {otherPlayer} today that seems slightly off or unusual. Tell no one until the day is over.",difficulty:"Easy",category:"Observation"},
{id:"m042",mission:"Start every conversation with {otherPlayer} today with 'I've been thinking…' then say something completely ordinary.",difficulty:"Easy",category:"Social Experiment"},
{id:"m043",mission:"Agree with everything {otherPlayer} says for a full five minutes — genuinely and enthusiastically.",difficulty:"Medium",category:"Social Experiment"},
{id:"m044",mission:"Speak noticeably slower than usual in every conversation with {otherPlayer} today. See if they start slowing down too.",difficulty:"Medium",category:"Social Experiment"},
{id:"m045",mission:"End every goodbye to {otherPlayer} today with 'take care of yourself' — sincerely, like you mean it.",difficulty:"Easy",category:"Social Experiment"},
{id:"m046",mission:"Be the last person to speak before a silence in at least one conversation with {otherPlayer}. Let it exist. Don't fill it.",difficulty:"Hard",category:"Social Experiment"},
{id:"m047",mission:"Give {otherPlayer} a genuine compliment in front of at least one other person today. Make it specific.",difficulty:"Medium",category:"Personal Challenge"},
{id:"m048",mission:"Ask {otherPlayer} a question today that you've never asked them before. Actually listen to the answer.",difficulty:"Medium",category:"Personal Challenge"},
{id:"m049",mission:"Ask {otherPlayer} for their honest opinion on something and truly listen — no interrupting, no defending.",difficulty:"Medium",category:"Personal Challenge"},
{id:"m050",mission:"Do one small unexpected thing for {otherPlayer} today that they didn't ask for.",difficulty:"Easy",category:"Personal Challenge"},
{id:"m051",mission:"Have a conversation with {otherPlayer} where you ask more questions than you make statements.",difficulty:"Medium",category:"Personal Challenge"},
{id:"m052",mission:"Do not complain about anything in front of {otherPlayer} today — not even small things, not even jokingly.",difficulty:"Hard",category:"Personal Challenge"},
{id:"m053",mission:"Make {otherPlayer} laugh today without saying anything obviously funny — through timing, expression, or delivery alone.",difficulty:"Hard",category:"Personal Challenge"},
{id:"m054",mission:"Find a reason to say 'that is a good point' to {otherPlayer} and mean it at least three times today.",difficulty:"Easy",category:"Personal Challenge"},
{id:"m055",mission:"Do something today in front of {otherPlayer} that slightly scares you — socially or creatively.",difficulty:"Hard",category:"Personal Challenge"},
];

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
function seededRNG(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return h >>> 0;
}
function todayStamp() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function dateLabel() {
  return new Date().toLocaleDateString("en-GB", {weekday:"long",year:"numeric",month:"long",day:"numeric"});
}
function uid() { return Math.random().toString(36).slice(2,10); }
function hashPassword(pw) { return "h" + hashStr("mds-salt-" + pw).toString(36); }

// Resolve {otherPlayer} token in mission text
function resolveMission(missionText, playerName, allPlayers) {
  const others = (allPlayers || []).filter(p => p.name !== playerName);
  if (!others.length) return missionText.replace(/{otherPlayer}/g, "someone");
  const seed = (hashStr(playerName.toLowerCase() + missionText.slice(0,10)) >>> 0);
  const rng  = seededRNG(seed);
  const pick = others[Math.floor(rng() * others.length)];
  return missionText.replace(/{otherPlayer}/g, pick.name);
}

// Pick mission for player, respecting exclusions and overrides
function missionForPlayerDeterministic(name, dateStamp, missions, exclusions) {
  if (!missions?.length) return null;
  const excluded = new Set(exclusions || []);
  const pool = missions.filter(m => !excluded.has(m.id));
  const src  = pool.length > 0 ? pool : missions;
  const seed = (hashStr(name.toLowerCase().trim()) ^ (dateStamp * 2654435761)) >>> 0;
  const rng  = seededRNG(seed);
  rng(); rng(); rng();
  return src[Math.floor(rng() * src.length)];
}

function missionForPlayer(name, dateStamp, missions, overrides, exclusions) {
  const overrideId = overrides?.[`${name}:${dateStamp}`];
  if (overrideId) {
    const m = missions?.find(x => x.id === overrideId);
    if (m) return m;
  }
  return missionForPlayerDeterministic(name, dateStamp, missions, exclusions);
}

// ─────────────────────────────────────────────────────────────
// ADAPTIVE LOGIC — per attempt, immediate
// ─────────────────────────────────────────────────────────────
function applyAdaptiveLogic(game, missionId, completed) {
  // Check bad votes first — threshold reached -> delete mission
  const players  = game.players || [];
  const badVotes = players.filter(p => game.ratings?.[`${p.name}:${missionId}`] === "dislike").length;
  if (badVotes >= BAD_VOTE_THRESHOLD) {
    return { ...game, missions: game.missions.filter(m => m.id !== missionId) };
  }
  // Adjust difficulty immediately based on this player outcome
  const missions = game.missions.map(m => {
    if (m.id !== missionId) return m;
    const newDiff = completed ? diffDown(m.difficulty) : diffUp(m.difficulty);
    console.log(`[MDS] Difficulty update: mission ${missionId} ${m.difficulty} -> ${newDiff} (completed=${completed})`);
    return { ...m, difficulty: newDiff };
  });
  const matched = missions.some(m => m.id === missionId);
  if (!matched) console.warn(`[MDS] applyAdaptiveLogic: missionId ${missionId} not found in missions pool (${missions.length} missions)`);
  return { ...game, missions };
}

// Auto-expire: mark any pending missions as not completed if the date has passed
function autoExpireMissions(game) {
  const today   = todayStamp();
  const players = game.players || [];
  let updated   = { ...game };
  let changed   = false;

  players.forEach(p => {
    Object.keys(updated.todayMissions || {}).forEach(key => {
      const parts = key.split(":");
      const pName = parts[0];
      const date  = parseInt(parts[1], 10);
      if (pName !== p.name || date >= today) return;
      const missionId = updated.todayMissions[key];
      const ck = `${p.name}:${date}:${missionId}`;
      if (!updated.completions?.[ck] && !updated.notCompleted?.[ck]) {
        updated.notCompleted = { ...updated.notCompleted, [ck]: true };
        updated = applyAdaptiveLogic(updated, missionId, false);
        changed = true;
      }
    });
  });

  return changed ? updated : game;
}

// ─────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────
const KEY_GAME     = "mds-game-staging";
const KEY_MISSIONS = "mds-missions-shared"; // shared across all environments
const IS_STAGING   = true;
const KEY_IDENT    = "mds-identity";

async function loadShared() {
  try { const r = await window.storage.get(KEY_GAME, true); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveShared(data) {
  try { await window.storage.set(KEY_GAME, JSON.stringify(data), true); return true; }
  catch { return false; }
}
async function loadMissions() {
  try { const r = await window.storage.get(KEY_MISSIONS, true); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveMissions(missions) {
  try { await window.storage.set(KEY_MISSIONS, JSON.stringify(missions), true); return true; }
  catch { return false; }
}
async function loadIdentity() {
  try { const r = await window.storage.get(KEY_IDENT, false); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveIdentity(data) {
  try { await window.storage.set(KEY_IDENT, JSON.stringify(data), false); }
  catch {}
}

function defaultGame() {
  return {
    missions:         DEFAULT_MISSIONS,
    players:          [],
    completions:      {},
    notCompleted:     {},
    ratings:          {},
    verifications:    {},
    passwords:        {},
    lockedOut:        {},
    missionOverrides: {},
    balances:         {},
    exclusions:       {},
    todayMissions:    {},
  };
}

function migrateGame(g) {
  if (!g.notCompleted)     g.notCompleted     = {};
  if (!g.ratings)          g.ratings          = {};
  if (!g.passwords)        g.passwords        = {};
  if (!g.lockedOut)        g.lockedOut        = {};
  if (!g.missionOverrides) g.missionOverrides = {};
  if (!g.balances)         g.balances         = {};
  if (!g.verifications)    g.verifications    = {};
  if (!g.exclusions)       g.exclusions       = {};
  if (!g.todayMissions)    g.todayMissions    = {};
  return g;
}

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
const C = {
  dark:"#0b0a08", dark2:"#141210", dark3:"#1a1714",
  gold:"#c9a84c", goldDim:"#7a5e25", goldLt:"#e8c96a",
  cream:"#f0e8d5", creamDm:"#9a8e78", red:"#c0392b",
};
const diffStyle = d => ({
  easy:       { border:"rgba(78,158,110,0.45)",  color:"#6ab47a" },
  medium:     { border:"rgba(201,168,76,0.5)",   color:C.gold    },
  hard:       { border:"rgba(192,57,43,0.5)",    color:"#e05a4b" },
  impossible: { border:"rgba(160,40,160,0.5)",   color:"#c070e0" },
}[d?.toLowerCase()] || { border:"rgba(201,168,76,0.5)", color:C.gold });

// ─────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────
function PageWrap({ children, narrow }) {
  return (
    <div style={{ background:C.dark, color:C.cream, minHeight:"100vh" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", background:`radial-gradient(ellipse 60% 40% at 50% 0%,rgba(201,168,76,0.07) 0%,transparent 60%)` }}/>
      <div style={{ position:"relative", zIndex:1, maxWidth:narrow?520:680, margin:"0 auto", padding:"32px 16px 80px" }}>
        {children}
      </div>
    </div>
  );
}

function AppHeader({ sub }) {
  return (
    <header style={{ textAlign:"center", marginBottom:32 }}>
      <p style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.38em", textTransform:"uppercase", color:C.gold, marginBottom:10 }}>Top Secret · Eyes Only</p>
      <h1 style={{ fontFamily:"'Georgia',serif", fontSize:"clamp(1.8rem,6vw,2.7rem)", fontWeight:700, lineHeight:1.1, color:C.cream }}>
        Million Dollar<br/><em style={{ fontStyle:"italic", color:C.gold }}>Secret</em>
      </h1>
      <div style={{ display:"flex", alignItems:"center", gap:12, margin:"14px auto 0", maxWidth:240 }}>
        <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.goldDim},transparent)` }}/>
        <div style={{ width:5, height:5, background:C.gold, transform:"rotate(45deg)" }}/>
        <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.goldDim},transparent)` }}/>
      </div>
      <div style={{ display:"inline-block", marginTop:14, fontFamily:"monospace", fontSize:10, letterSpacing:"0.15em", color:C.creamDm, border:`1px solid rgba(201,168,76,0.2)`, padding:"4px 12px" }}>
        {sub || (IS_STAGING ? "⚗ STAGING — " : "") + dateLabel()}
      </div>
      <div style={{ marginTop:6, fontFamily:"monospace", fontSize:9, letterSpacing:"0.2em", color:C.goldDim, opacity:0.6 }}>
        v{APP_VERSION}
      </div>
    </header>
  );
}

function Btn({ children, onClick, primary, sm, full, ghost, danger, disabled, style:sx }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontFamily:"monospace", textTransform:"uppercase", cursor:disabled?"not-allowed":"pointer", letterSpacing:"0.2em", transition:"all 0.2s", opacity:disabled?0.4:1,
        fontSize:sm?10:11, padding:sm?"7px 14px":"12px 26px",
        display:full?"block":"inline-block", width:full?"100%":undefined, textAlign:full?"center":undefined,
        background:danger?(h?"#c0392b":"transparent"):primary?(h?C.goldLt:C.gold):ghost?"transparent":(h?C.gold:"transparent"),
        color:danger?(h?C.cream:"#e05a4b"):primary?C.dark:ghost?(h?C.cream:C.creamDm):(h?C.dark:C.gold),
        border:danger?`1px solid rgba(192,57,43,0.5)`:primary?"none":`1px solid ${ghost?"rgba(255,255,255,0.18)":C.gold}`,
        ...sx }}>{children}</button>
  );
}

function Tag({ label, type }) {
  const ds = diffStyle(label);
  return <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", padding:"3px 8px", display:"inline-block", margin:"0 3px 3px", ...(type==="diff" ? { border:`1px solid ${ds.border}`, color:ds.color } : { border:`1px solid rgba(201,168,76,0.22)`, color:C.goldDim }) }}>{label}</span>;
}

function SLabel({ children }) {
  return <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:C.gold, marginBottom:12, display:"flex", alignItems:"center", gap:12 }}>{children}<div style={{ flex:1, height:1, background:"rgba(201,168,76,0.2)" }}/></div>;
}

function Card({ children, style:sx }) {
  return (
    <div style={{ background:C.dark2, border:`1px solid rgba(201,168,76,0.2)`, padding:"14px 16px", marginBottom:10, position:"relative", ...sx }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
      {children}
    </div>
  );
}

function NavBar({ active, onNav, onBack }) {
  const tabs = [{ k:"players", label:"Players" }, { k:"missions", label:"Missions" }, { k:"scoreboard", label:"Scoreboard" }];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:0, marginBottom:24, borderBottom:`1px solid rgba(201,168,76,0.15)` }}>
      {tabs.map(({ k, label }) => (
        <button key={k} onClick={() => onNav(k)} style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", padding:"8px 14px", cursor:"pointer", background:"transparent", border:"none", borderBottom:active===k?`2px solid ${C.gold}`:"2px solid transparent", color:active===k?C.gold:C.creamDm, transition:"all 0.2s", marginBottom:-1 }}>
          {label}
        </button>
      ))}
      <div style={{ flex:1 }}/>
      <button onClick={onBack} style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", padding:"8px 14px", cursor:"pointer", background:"transparent", border:"none", borderBottom:"2px solid transparent", color:C.creamDm, transition:"all 0.2s", marginBottom:-1 }}>← Exit</button>
    </div>
  );
}

function PasswordModal({ title, subtitle, onSubmit, onCancel, error }) {
  const [pw, setPw] = useState("");
  function handleSubmit() { onSubmit(pw); }
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(11,10,8,0.95)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:C.dark2, border:`1px solid rgba(201,168,76,0.35)`, padding:"28px 24px", width:"100%", maxWidth:360, position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
        <p style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:C.gold, marginBottom:8 }}>{title}</p>
        <p style={{ fontFamily:"'Georgia',serif", fontSize:14, color:C.creamDm, marginBottom:20, lineHeight:1.6 }}>{subtitle}</p>
        <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Enter password" maxLength={32}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} autoFocus
          style={{ width:"100%", background:"transparent", border:"none", borderBottom:`1px solid rgba(201,168,76,0.3)`, color:C.cream, fontFamily:"'Georgia',serif", fontSize:14, padding:"6px 4px", outline:"none", marginBottom:error?8:16 }}/>
        {error && <p style={{ fontFamily:"monospace", fontSize:10, color:"#e05a4b", marginBottom:12 }}>{error}</p>}
        <div style={{ display:"flex", gap:8 }}>
          <Btn primary sm onClick={handleSubmit}>Confirm</Btn>
          {onCancel && <Btn ghost sm onClick={onCancel}>Cancel</Btn>}
        </div>
      </div>
    </div>
  );
}

function ActionConfirm({ message, onYes, onNo }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(11,10,8,0.92)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:C.dark2, border:`1px solid rgba(201,168,76,0.35)`, padding:"24px 22px", width:"100%", maxWidth:320, position:"relative", textAlign:"center" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
        <p style={{ fontFamily:"'Georgia',serif", fontSize:14, color:C.cream, lineHeight:1.65, marginBottom:22 }}>{message}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Btn primary sm onClick={onYes}>Yes</Btn>
          <Btn ghost sm onClick={onNo}>No</Btn>
        </div>
      </div>
    </div>
  );
}

function Confirm({ title, text, onConfirm, onCancel, label }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(11,10,8,0.92)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <Card style={{ maxWidth:340, width:"100%" }}>
        <SLabel>{title}</SLabel>
        <p style={{ fontFamily:"monospace", fontSize:11, color:C.creamDm, lineHeight:1.7, marginBottom:16 }}>{text}</p>
        <div style={{ display:"flex", gap:8 }}>
          <Btn danger sm onClick={onConfirm}>{label}</Btn>
          <Btn ghost sm onClick={onCancel}>Cancel</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IDENTITY SCREEN
// ─────────────────────────────────────────────────────────────
function IdentityScreen({ players, onSelect }) {
  return (
    <PageWrap narrow>
      <AppHeader/>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <p style={{ fontFamily:"monospace", fontSize:11, color:C.creamDm, lineHeight:1.8 }}>
          Who are you? Tap your name to continue.<br/>
          <span style={{ fontSize:10, opacity:0.6 }}>This device will remember you.</span>
        </p>
      </div>
      {players.length === 0
        ? <p style={{ textAlign:"center", fontFamily:"monospace", fontSize:11, color:C.creamDm, lineHeight:1.8 }}>No players added yet.<br/>Ask the game organiser to add you.</p>
        : <div style={{ display:"grid", gap:10 }}>
            {players.map(p => (
              <button key={p.id} onClick={() => onSelect(p)}
                style={{ background:C.dark2, border:`1px solid rgba(201,168,76,0.25)`, color:C.cream, fontFamily:"'Georgia',serif", fontSize:16, padding:"16px 20px", cursor:"pointer", textAlign:"left", transition:"all 0.2s", position:"relative" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(201,168,76,0.6)"; e.currentTarget.style.background=C.dark3; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(201,168,76,0.25)"; e.currentTarget.style.background=C.dark2; }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
                {p.name}
              </button>
            ))}
          </div>
      }
    </PageWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// SET PASSWORD SCREEN
// ─────────────────────────────────────────────────────────────
function SetPasswordScreen({ player, onSet, onBack }) {
  const [pw, setPw]           = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");

  function submit() {
    if (pw.length < 3) { setError("Password must be at least 3 characters."); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    onSet(pw);
  }

  return (
    <PageWrap narrow>
      <AppHeader/>
      <div style={{ textAlign:"center", marginBottom:12 }}>
        <p style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:C.gold, marginBottom:8 }}>First Time Setup</p>
        <p style={{ fontFamily:"'Georgia',serif", fontSize:16, color:C.cream, marginBottom:8 }}>Welcome, {player.name}</p>
        <p style={{ fontFamily:"monospace", fontSize:11, color:C.creamDm, lineHeight:1.8 }}>Set a password to protect your mission.</p>
      </div>
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", fontFamily:"monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:C.creamDm, cursor:"pointer", opacity:0.5 }}>← Not you? Go back</button>
      </div>
      <Card>
        <SLabel>Choose a Password</SLabel>
        <div style={{ display:"grid", gap:12, marginBottom:16 }}>
          {[["pw", pw, setPw, "Password"], ["confirm", confirm, setConfirm, "Confirm password"]].map(([k, v, fn, ph]) => (
            <input key={k} value={v} onChange={e => fn(e.target.value)} type="password" placeholder={ph} maxLength={32}
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{ background:"transparent", border:"none", borderBottom:`1px solid rgba(201,168,76,0.3)`, color:C.cream, fontFamily:"'Georgia',serif", fontSize:14, padding:"6px 4px", outline:"none", width:"100%" }}/>
          ))}
        </div>
        {error && <p style={{ fontFamily:"monospace", fontSize:10, color:"#e05a4b", marginBottom:12 }}>{error}</p>}
        <Btn primary full onClick={submit}>Set Password & Continue</Btn>
      </Card>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// PLAYER MISSION VIEW
// ─────────────────────────────────────────────────────────────
function PlayerView({ player, game, onSaveGame, onSwitchPlayer }) {
  const today      = todayStamp();
  const myExcl     = game.exclusions?.[player.name] || [];
  const mission    = missionForPlayer(player.name, today, game.missions, game.missionOverrides, myExcl);
  const mId        = mission?.id;
  const ck         = `${player.name}:${today}:${mId}`;
  const allPlayers = game.players || [];

  const missionText = mission ? resolveMission(mission.mission, player.name, allPlayers) : "";

  const alreadyDone = !!game.completions?.[ck];
  const alreadySkip = !!game.notCompleted?.[ck];
  const myRating    = mId ? (game.ratings?.[`${player.name}:${mId}`] || null) : null;

  const [status,        setStatus]        = useState(alreadyDone ? "done" : alreadySkip ? "skipped" : "pending");
  const [rating,        setRating]        = useState(myRating);
  const [saving,        setSaving]        = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Poll Firestore every 30s so difficulty, verifications and other players' statuses update live
  useEffect(() => {
    const interval = setInterval(async () => {
      const [fresh, freshMissions] = await Promise.all([loadShared(), loadMissions()]);
      // SAFETY: only update if we got real data back — never overwrite with a failed read
      if (!fresh) return;
      let migrated = migrateGame(fresh);
      if (freshMissions) migrated.missions = freshMissions;
      const expired = autoExpireMissions(migrated);
      if (expired !== migrated) {
        await saveShared(expired);
        await saveMissions(expired.missions);
        migrated = expired;
      }
      onSaveGame(migrated);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const leaderboard = allPlayers.map(p => {
    const total = game.balances?.[p.name] || 0;
    return { ...p, total };
  }).sort((a, b) => b.total - a.total);

  const todayScores = allPlayers.map(p => {
    // Look up the missionId from the stored record rather than recalculating,
    // so we always match the key that was written when the player responded.
    const storedMissionId = game.todayMissions?.[`${p.name}:${today}`];
    const pm = storedMissionId
      ? game.missions.find(m => m.id === storedMissionId) || missionForPlayer(p.name, today, game.missions, game.missionOverrides, game.exclusions?.[p.name] || [])
      : missionForPlayer(p.name, today, game.missions, game.missionOverrides, game.exclusions?.[p.name] || []);
    const pmId = storedMissionId || pm?.id;
    const pck  = `${p.name}:${today}:${pmId}`;
    const done = !!game.completions?.[pck];
    const skip = !!game.notCompleted?.[pck];
    const iVerified = !!game.verifications?.[`${player.name}:${p.name}:${today}:${pmId}`];
    return { ...p, done, skip, pm, pck, pmId, iVerified };
  });

  async function execRespond(type) {
    if (status !== "pending" || saving || !mId) return;
    setSaving(true);
    const completed = type === "done";
    let updated = { ...game };
    updated.todayMissions = { ...updated.todayMissions, [`${player.name}:${today}`]: mId };
    if (completed) {
      updated.completions = { ...updated.completions, [ck]: true };
      setStatus("done");
    } else {
      updated.notCompleted = { ...updated.notCompleted, [ck]: true };
      setStatus("skipped");
    }
    updated = applyAdaptiveLogic(updated, mId, completed);
    await onSaveGame(updated);
    setSaving(false);
  }

  function respond(type) {
    if (status !== "pending" || saving || !mId) return;
    const pts     = DIFF_SCORE[mission?.difficulty] || 1;
    const message = type === "done"
      ? `Mark mission as completed? You'll earn ${pts} point${pts !== 1 ? "s" : ""} once verified.`
      : `Mark mission as not completed?`;
    setPendingAction({ message, exec: () => execRespond(type) });
  }

  async function execRate(val) {
    if (!mId) return;
    const rk        = `${player.name}:${mId}`;
    const newRating = rating === val ? null : val;
    setRating(newRating);
    let updated = { ...game, ratings: { ...game.ratings } };
    if (newRating) updated.ratings[rk] = newRating;
    else delete updated.ratings[rk];

    if (newRating === "dislike") {
      const excl = [...(updated.exclusions?.[player.name] || [])];
      if (!excl.includes(mId)) excl.push(mId);
      updated.exclusions = { ...updated.exclusions, [player.name]: excl };
    } else if (newRating === null && rating === "dislike") {
      const excl = (updated.exclusions?.[player.name] || []).filter(id => id !== mId);
      updated.exclusions = { ...updated.exclusions, [player.name]: excl };
    }

    // For ratings, only check bad vote threshold — no difficulty change
    updated = applyAdaptiveLogic(updated, mId, status === "done");
    await onSaveGame(updated);
  }

  function rate(val) {
    if (!mId) return;
    if (val === "dislike") {
      setPendingAction({ message:`Vote to remove this mission? You won't receive it again, and if ${BAD_VOTE_THRESHOLD} players vote bad it will be deleted.`, exec: () => execRate(val) });
    } else {
      execRate(val);
    }
  }

  async function verifyPlayer(targetPlayer, pmId) {
    const vk = `${player.name}:${targetPlayer.name}:${today}:${pmId}`;
    const alreadyVerified = Object.keys(game.verifications || {}).some(
      k => k.startsWith(`${targetPlayer.name}:${today}:${pmId}:awarded`)
    );
    let updated = { ...game, verifications: { ...game.verifications, [vk]: true } };
    if (!alreadyVerified) {
      const targetMission = game.missions.find(m => m.id === pmId);
      const pts = DIFF_SCORE[targetMission?.difficulty] || 1;
      const currentBal = updated.balances?.[targetPlayer.name] || 0;
      updated.balances = { ...updated.balances, [targetPlayer.name]: currentBal + pts };
      const awardKey = `${targetPlayer.name}:${today}:${pmId}:awarded`;
      updated.verifications = { ...updated.verifications, [awardKey]: true };
    }
    await onSaveGame(updated);
  }

  const score   = mission ? (DIFF_SCORE[mission.difficulty] || 1) : 0;
  const myScore = leaderboard.find(p => p.name === player.name)?.total || 0;

  return (
    <>
      {pendingAction && (
        <ActionConfirm
          message={pendingAction.message}
          onYes={async () => { await pendingAction.exec(); setPendingAction(null); }}
          onNo={() => setPendingAction(null)}
        />
      )}
      <PageWrap narrow>
        <AppHeader/>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:C.gold, marginBottom:6 }}>Mission for</p>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:"clamp(1.2rem,5vw,1.5rem)", color:C.cream, marginBottom:8 }}>{player.name}</p>

          <div style={{ display:"flex", gap:18, justifyContent:"center", marginBottom:20 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:C.creamDm, marginBottom:3 }}>Score</div>
              <div style={{ fontFamily:"'Georgia',serif", fontSize:22, color:C.gold, fontWeight:700 }}>{myScore}</div>
            </div>
            <div style={{ width:1, background:"rgba(201,168,76,0.2)" }}/>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:C.creamDm, marginBottom:3 }}>Balance</div>
              <div style={{ fontFamily:"'Georgia',serif", fontSize:22, color:"#6ab47a", fontWeight:700 }}>{game.balances?.[player.name] || 0}</div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:16 }}>
            <div style={{ flex:1, maxWidth:50, height:1, background:"rgba(201,168,76,0.3)" }}/>
            <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:C.gold }}>Eyes Only</span>
            <div style={{ flex:1, maxWidth:50, height:1, background:"rgba(201,168,76,0.3)" }}/>
          </div>

          {mission ? (
            <>
              <p style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", fontSize:"clamp(1rem,3.6vw,1.2rem)", lineHeight:1.85, color:C.cream, marginBottom:16, maxWidth:420, margin:"0 auto 16px" }}>
                {missionText}
              </p>
              <div style={{ marginBottom:8 }}>
                <Tag label={mission.difficulty} type="diff"/>
                <Tag label={mission.category} type="cat"/>
                <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.15em", color:C.goldDim, marginLeft:4 }}>+{score} pt{score !== 1 ? "s" : ""}</span>
              </div>
              <p style={{ fontFamily:"monospace", fontSize:10, color:C.red, opacity:0.7, margin:"14px auto", lineHeight:1.6, paddingTop:12, borderTop:`1px solid rgba(192,57,43,0.2)`, maxWidth:300 }}>
                ⚠ Do not reveal this to anyone.
              </p>

              {status === "pending" && (
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginTop:8 }}>
                  <Btn primary onClick={() => respond("done")} disabled={saving}>✓ Completed</Btn>
                  <Btn danger  onClick={() => respond("skip")} disabled={saving}>✗ Not Completed</Btn>
                </div>
              )}
              {status === "done" && (() => {
                const awardKey = `${player.name}:${today}:${mId}:awarded`;
                const pointsAwarded = !!game.verifications?.[awardKey];
                return (
                  <div style={{ marginTop:8 }}>
                    <div style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6ab47a", padding:"12px 24px", border:`1px solid rgba(78,158,110,0.4)`, display:"inline-block" }}>
                      ✓ Mission Completed!
                    </div>
                    <div style={{ fontFamily:"monospace", fontSize:10, color: pointsAwarded ? "#6ab47a" : C.creamDm, marginTop:8, letterSpacing:"0.1em" }}>
                      {pointsAwarded ? `+${score} pt${score !== 1 ? "s" : ""} awarded ✓` : "Waiting for another player to verify…"}
                    </div>
                  </div>
                );
              })()}
              {status === "skipped" && (
                <div style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:C.creamDm, padding:"12px 24px", border:`1px solid rgba(255,255,255,0.1)`, display:"inline-block", marginTop:8 }}>
                  Mission not completed today
                </div>
              )}

              {status !== "pending" && (
                <div style={{ marginTop:24 }}>
                  <p style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:C.creamDm, marginBottom:10 }}>Rate this mission</p>
                  <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
                    {[["like","👍 Good mission"],["dislike","👎 Remove it"]].map(([val, label]) => (
                      <button key={val} onClick={() => rate(val)}
                        style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", padding:"7px 16px", cursor:"pointer", transition:"all 0.2s", background:rating===val?C.gold:"transparent", color:rating===val?C.dark:C.gold, border:`1px solid ${rating===val?C.gold:"rgba(201,168,76,0.4)"}` }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color:C.creamDm, fontFamily:"monospace", fontSize:11 }}>No missions found.</p>
          )}
        </div>

        {allPlayers.length > 0 && (
          <div style={{ marginTop:36 }}>
            <SLabel>Today's Progress</SLabel>
            {todayScores.map(p => {
              const isMe = p.name === player.name;
              return (
                <div key={p.id} style={{ background:C.dark2, border:`1px solid rgba(201,168,76,0.1)`, padding:"10px 14px", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: (!isMe && p.done && !p.iVerified) ? 8 : 0 }}>
                    <span style={{ fontFamily:"'Georgia',serif", fontSize:13, color:C.cream }}>{p.name}{isMe ? " (you)" : ""}</span>
                    <span style={{ fontFamily:"monospace", fontSize:10, color:p.done?"#6ab47a":p.skip?"#e05a4b":C.creamDm }}>
                      {p.done ? "✓ Done" : p.skip ? "✗ Not done" : "Pending"}
                    </span>
                  </div>
                  {!isMe && p.done && (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {p.iVerified ? (
                        <span style={{ fontFamily:"monospace", fontSize:9, color:"#6ab47a", letterSpacing:"0.15em", textTransform:"uppercase" }}>✓ You verified this</span>
                      ) : (
                        <button onClick={() => verifyPlayer(p, p.pmId)}
                          style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", padding:"4px 12px", background:"transparent", border:`1px solid rgba(201,168,76,0.35)`, color:C.gold, cursor:"pointer", transition:"all 0.2s" }}>
                          👁 Verify
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {leaderboard.length > 0 && (
          <div style={{ marginTop:28 }}>
            <SLabel>Leaderboard</SLabel>
            {leaderboard.map((p, i) => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 14px", marginBottom:6, background:C.dark2, border:`1px solid rgba(201,168,76,0.1)` }}>
                <span style={{ fontFamily:"monospace", fontSize:i<3?16:12, color:i===0?C.gold:i===1?"#a8a8a8":i===2?"#cd7f32":C.creamDm, width:28, flexShrink:0 }}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                </span>
                <span style={{ fontFamily:"'Georgia',serif", fontSize:13, color:p.name===player.name?C.gold:C.cream, flex:1 }}>{p.name}{p.name===player.name?" (you)":""}</span>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"monospace", fontSize:12, color:C.gold, fontWeight:700 }}>{p.total}</div>
                  <div style={{ fontFamily:"monospace", fontSize:9, color:"#6ab47a", opacity:0.8 }}>💰 {game.balances?.[p.name] || 0}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:28, textAlign:"center" }}>
          <button onClick={onSwitchPlayer} style={{ background:"transparent", border:"none", fontFamily:"monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:C.creamDm, cursor:"pointer", opacity:0.5 }}>
            Not {player.name}? Switch player
          </button>
        </div>
      </PageWrap>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// BACK OFFICE — PLAYERS TAB
// ─────────────────────────────────────────────────────────────
function PlayersTab({ game, onSave }) {
  const [players, setPlayers] = useState(game.players);
  const [newName, setNewName] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState(null);
  const dirty = JSON.stringify(players) !== JSON.stringify(game.players);

  function add() {
    const n = newName.trim();
    if (!n || players.find(p => p.name.toLowerCase() === n.toLowerCase())) return;
    setPlayers(prev => [...prev, { id:uid(), name:n }]);
    setNewName("");
  }
  async function save() { setSaving(true); await onSave({ ...game, players }); setSaving(false); }

  async function clearPassword(playerId) {
    const newPw = { ...game.passwords }; delete newPw[playerId];
    const newLO = { ...game.lockedOut, [playerId]: true };
    await onSave({ ...game, players, passwords:newPw, lockedOut:newLO });
    setConfirm(null);
  }

  async function resetMission(player) {
    const today   = todayStamp();
    const current = missionForPlayer(player.name, today, game.missions, game.missionOverrides, game.exclusions?.[player.name]);
    if (!current) return;
    const pool = game.missions.filter(m => m.id !== current.id);
    if (pool.length === 0) return;
    const seed       = (hashStr(player.name.toLowerCase() + today + "reset") ^ (today * 1234567)) >>> 0;
    const rng        = seededRNG(seed);
    const newMission = pool[Math.floor(rng() * pool.length)];
    const oldCk      = `${player.name}:${today}:${current.id}`;
    const nc         = { ...game.notCompleted }; delete nc[oldCk];
    const co         = { ...game.completions  }; delete co[oldCk];
    const overrides  = { ...game.missionOverrides, [`${player.name}:${today}`]: newMission.id };
    await onSave({ ...game, completions:co, notCompleted:nc, missionOverrides:overrides });
    setConfirm(null);
  }

  return (
    <div>
      {confirm?.type === "clearPassword" && (
        <Confirm title="Clear Password" text={`Force ${players.find(p=>p.id===confirm.playerId)?.name} to set a new password. Score preserved.`}
          onConfirm={() => clearPassword(confirm.playerId)} onCancel={() => setConfirm(null)} label="Clear Password"/>
      )}
      {confirm?.type === "resetMission" && (
        <Confirm title="Reset Today's Mission" text={`Reset ${confirm.player.name}'s mission response for today. Points earned will be removed.`}
          onConfirm={() => resetMission(confirm.player)} onCancel={() => setConfirm(null)} label="Reset Mission"/>
      )}
      <SLabel>Players ({players.length})</SLabel>
      {players.length === 0 && <p style={{ fontFamily:"monospace", fontSize:11, color:C.creamDm, marginBottom:16, lineHeight:1.7 }}>No players yet.</p>}
      {players.map(p => {
        const today     = todayStamp();
        const mission   = missionForPlayer(p.name, today, game.missions, game.missionOverrides, game.exclusions?.[p.name]);
        const ck        = `${p.name}:${today}:${mission?.id}`;
        const doneToday = !!game.completions?.[ck];
        const skipToday = !!game.notCompleted?.[ck];
        const hasPw     = !!(game.passwords?.[p.id]);
        return (
          <Card key={p.id}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontFamily:"'Georgia',serif", fontSize:14, color:C.cream }}>{p.name}</span>
                  {doneToday && <span style={{ fontFamily:"monospace", fontSize:8, padding:"2px 6px", background:"rgba(78,158,110,0.12)", border:`1px solid rgba(78,158,110,0.4)`, color:"#6ab47a" }}>✓ Done</span>}
                  {skipToday && <span style={{ fontFamily:"monospace", fontSize:8, padding:"2px 6px", background:"rgba(192,57,43,0.1)", border:`1px solid rgba(192,57,43,0.3)`, color:"#e05a4b" }}>✗ Not done</span>}
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Btn sm ghost onClick={() => setConfirm({ type:"clearPassword", playerId:p.id })} style={{ fontSize:9, padding:"4px 10px", opacity:hasPw?1:0.4 }}>
                    🔑 {hasPw ? "Clear Password" : "No Password"}
                  </Btn>
                  <Btn sm ghost onClick={() => setConfirm({ type:"resetMission", player:p })} style={{ fontSize:9, padding:"4px 10px", opacity:(doneToday||skipToday)?1:0.35 }}>
                    ↺ Reset Mission
                  </Btn>
                </div>
              </div>
              <button onClick={() => setPlayers(prev => prev.filter(x => x.id !== p.id))} style={{ background:"transparent", border:"none", color:C.creamDm, fontSize:18, cursor:"pointer", opacity:0.4, lineHeight:1, flexShrink:0 }}>×</button>
            </div>
          </Card>
        );
      })}
      <Card style={{ marginTop:8 }}>
        <SLabel>Add Player</SLabel>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Player name" maxLength={24}
            style={{ flex:1, minWidth:130, background:"transparent", border:"none", borderBottom:`1px solid rgba(201,168,76,0.3)`, color:C.cream, fontFamily:"'Georgia',serif", fontSize:14, padding:"6px 4px", outline:"none" }}/>
          <Btn primary sm onClick={add}>Add</Btn>
        </div>
      </Card>
      {dirty && <div style={{ marginTop:14 }}><Btn primary full onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn></div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BACK OFFICE — MISSIONS TAB
// ─────────────────────────────────────────────────────────────
function MissionsTab({ game, onSave }) {
  const [missions,     setMissions]     = useState(game.missions);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState({ mission:"", difficulty:"Medium", category:"" });
  const [filter,       setFilter]       = useState("");
  const [saving,        setSaving]       = useState(false);
  const [importStatus,  setImportStatus] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const fileInputRef = useRef(null);

  const dirty  = JSON.stringify(missions) !== JSON.stringify(game.missions);
  const cats   = [...new Set(missions.map(m => m.category))].sort();
  const filtered = missions.filter(m => !filter || m.mission.toLowerCase().includes(filter.toLowerCase()) || m.category.toLowerCase().includes(filter.toLowerCase()));

  function badVoteCount(mId) {
    return (game.players || []).filter(p => game.ratings?.[`${p.name}:${mId}`] === "dislike").length;
  }

  const totalBadVotes   = missions.reduce((acc, m) => acc + badVoteCount(m.id), 0);
  const atRiskMissions  = missions.filter(m => badVoteCount(m.id) >= BAD_VOTE_THRESHOLD - 1 && badVoteCount(m.id) < BAD_VOTE_THRESHOLD).length;
  const willDeleteCount = missions.filter(m => badVoteCount(m.id) >= BAD_VOTE_THRESHOLD).length;

  function startNew()   { setForm({ mission:"", difficulty:"Medium", category:"" }); setEditing("new"); }
  function startEdit(m) { setForm({ mission:m.mission, difficulty:m.difficulty, category:m.category }); setEditing(m.id); }
  function saveEdit()   {
    if (!form.mission.trim() || !form.category.trim()) return;
    if (editing === "new") setMissions(prev => [...prev, { id:"m"+uid(), ...form }]);
    else setMissions(prev => prev.map(m => m.id === editing ? { ...m, ...form } : m));
    setEditing(null);
  }
  async function saveAll() { setSaving(true); await onSave({ ...game, missions }); setSaving(false); }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array of missions.");
        // Validate each mission has required fields
        const invalid = parsed.filter(m => !m.mission || !m.difficulty || !m.category);
        if (invalid.length > 0) throw new Error(`${invalid.length} mission(s) missing required fields (mission, difficulty, category).`);
        // Validate difficulties
        const badDiff = parsed.filter(m => !DIFFICULTIES.includes(m.difficulty));
        if (badDiff.length > 0) throw new Error(`Invalid difficulty in ${badDiff.length} mission(s). Must be: ${DIFFICULTIES.join(", ")}.`);
        // Merge — assign new IDs to any without one, skip exact ID duplicates
        const existingIds = new Set(missions.map(m => m.id));
        let added = 0, skipped = 0;
        const toAdd = [];
        parsed.forEach(m => {
          const id = m.id && !existingIds.has(m.id) ? m.id : "m" + uid();
          if (m.id && existingIds.has(m.id)) { skipped++; return; }
          toAdd.push({ id, mission: m.mission, difficulty: m.difficulty, category: m.category });
          added++;
        });
        setMissions(prev => [...prev, ...toAdd]);
        setImportStatus({ type:"success", message:`Imported ${added} mission${added !== 1 ? "s" : ""}${skipped > 0 ? `, skipped ${skipped} duplicate ID${skipped !== 1 ? "s" : ""}` : ""}. Save to confirm.` });
      } catch (err) {
        setImportStatus({ type:"error", message:`Import failed: ${err.message}` });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display:"none" }}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:importStatus?8:14, flexWrap:"wrap", gap:10 }}>
        <SLabel>Missions ({missions.length})</SLabel>
        <div style={{ display:"flex", gap:8 }}>
          <Btn danger sm onClick={() => setConfirmDeleteAll(true)}>🗑 Delete All</Btn>
          <Btn ghost sm onClick={() => fileInputRef.current?.click()}>⬆ Import JSON</Btn>
          <Btn primary sm onClick={startNew}>+ Add Mission</Btn>
        </div>
      </div>
      {confirmDeleteAll && (
        <Confirm
          title="Delete All Missions"
          text={`This will permanently delete all ${missions.length} missions. Cannot be undone. Import a fresh set afterwards.`}
          onConfirm={() => { setMissions([]); setConfirmDeleteAll(false); setImportStatus({ type:"success", message:"All missions deleted. Import a new set and save to confirm." }); }}
          onCancel={() => setConfirmDeleteAll(false)}
          label="Delete All"
        />
      )}
      {importStatus && (
        <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", padding:"8px 14px", marginBottom:14,
          background: importStatus.type === "success" ? "rgba(78,158,110,0.1)" : "rgba(192,57,43,0.1)",
          border: `1px solid ${importStatus.type === "success" ? "rgba(78,158,110,0.4)" : "rgba(192,57,43,0.4)"}`,
          color: importStatus.type === "success" ? "#6ab47a" : "#e05a4b",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <span>{importStatus.type === "success" ? "✓" : "✗"} {importStatus.message}</span>
          <button onClick={() => setImportStatus(null)} style={{ background:"transparent", border:"none", color:"inherit", cursor:"pointer", fontSize:14, lineHeight:1, opacity:0.6 }}>×</button>
        </div>
      )}
      {editing && (
        <Card style={{ marginBottom:16, border:`1px solid rgba(201,168,76,0.45)` }}>
          <SLabel>{editing === "new" ? "New Mission" : "Edit Mission"}</SLabel>
          <textarea value={form.mission} onChange={e => setForm(f => ({ ...f, mission:e.target.value }))} placeholder="Use {otherPlayer} as a placeholder for another player's name." rows={3}
            style={{ width:"100%", background:C.dark3, border:`1px solid rgba(201,168,76,0.25)`, color:C.cream, fontFamily:"'Georgia',serif", fontSize:13, padding:"8px 10px", outline:"none", resize:"vertical", lineHeight:1.6, marginBottom:10 }}/>
          <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontFamily:"monospace", fontSize:9, color:C.creamDm, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>Difficulty</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, difficulty:d }))}
                    style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", padding:"5px 10px", cursor:"pointer", transition:"all 0.2s", background:form.difficulty===d?C.gold:"transparent", color:form.difficulty===d?C.dark:C.gold, border:`1px solid ${form.difficulty===d?C.gold:"rgba(201,168,76,0.35)"}` }}>{d}</button>
                ))}
              </div>
            </div>
            <div style={{ flex:1, minWidth:140 }}>
              <div style={{ fontFamily:"monospace", fontSize:9, color:C.creamDm, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>Category</div>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))} placeholder="e.g. Social Awkwardness" list="cats"
                style={{ width:"100%", background:C.dark3, border:`1px solid rgba(201,168,76,0.25)`, color:C.cream, fontFamily:"'Georgia',serif", fontSize:13, padding:"5px 8px", outline:"none" }}/>
              <datalist id="cats">{cats.map(c => <option key={c} value={c}/>)}</datalist>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}><Btn primary sm onClick={saveEdit}>Save</Btn><Btn ghost sm onClick={() => setEditing(null)}>Cancel</Btn></div>
        </Card>
      )}
      {totalBadVotes > 0 && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
          <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", padding:"7px 14px", background:"rgba(192,57,43,0.08)", border:`1px solid rgba(192,57,43,0.25)`, color:"#e05a4b" }}>
            👎 {totalBadVotes} bad vote{totalBadVotes !== 1 ? "s" : ""} total
          </div>
          {atRiskMissions > 0 && (
            <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", padding:"7px 14px", background:"rgba(201,168,76,0.07)", border:`1px solid rgba(201,168,76,0.25)`, color:C.gold }}>
              ⚠ {atRiskMissions} mission{atRiskMissions !== 1 ? "s" : ""} close to deletion
            </div>
          )}
          {willDeleteCount > 0 && (
            <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", padding:"7px 14px", background:"rgba(192,57,43,0.12)", border:`1px solid rgba(192,57,43,0.5)`, color:"#e05a4b" }}>
              🗑 {willDeleteCount} mission{willDeleteCount !== 1 ? "s" : ""} queued for deletion
            </div>
          )}
        </div>
      )}
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter missions…"
        style={{ width:"100%", background:C.dark2, border:`1px solid rgba(201,168,76,0.2)`, color:C.cream, fontFamily:"monospace", fontSize:11, padding:"8px 12px", outline:"none", marginBottom:12 }}/>
      <div style={{ maxHeight:400, overflowY:"auto" }}>
        {filtered.map(m => {
          const bv = badVoteCount(m.id);
          return (
            <div key={m.id} style={{ background:C.dark2, border:`1px solid ${bv >= BAD_VOTE_THRESHOLD - 1 ? "rgba(192,57,43,0.3)" : "rgba(201,168,76,0.1)"}`, padding:"10px 12px", marginBottom:7, display:"flex", gap:10, alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", fontSize:12, color:C.cream, lineHeight:1.6, marginBottom:5 }}>{m.mission}</p>
                <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  <Tag label={m.difficulty} type="diff"/>
                  <Tag label={m.category} type="cat"/>
                  <span style={{ fontFamily:"monospace", fontSize:9, color:C.creamDm }}>+{DIFF_SCORE[m.difficulty]||1}pt</span>
                  {bv > 0 && (
                    <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.1em", color: bv >= BAD_VOTE_THRESHOLD ? "#e05a4b" : C.creamDm, background:"rgba(192,57,43,0.1)", border:`1px solid rgba(192,57,43,0.25)`, padding:"2px 7px" }}>
                      👎 {bv} bad vote{bv !== 1 ? "s" : ""}{bv >= BAD_VOTE_THRESHOLD ? " — will delete" : ""}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                <button onClick={() => startEdit(m)} style={{ background:"transparent", border:`1px solid rgba(201,168,76,0.3)`, color:C.gold, fontFamily:"monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 8px", cursor:"pointer" }}>Edit</button>
                <button onClick={() => setMissions(prev => prev.filter(x => x.id !== m.id))} style={{ background:"transparent", border:`1px solid rgba(192,57,43,0.3)`, color:"#e05a4b", fontFamily:"monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 8px", cursor:"pointer" }}>Del</button>
              </div>
            </div>
          );
        })}
      </div>
      {dirty && <div style={{ marginTop:14 }}><Btn primary full onClick={saveAll} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn></div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BACK OFFICE — SCOREBOARD TAB
// ─────────────────────────────────────────────────────────────
function ScoreboardTab({ game, onSave }) {
  const today     = todayStamp();
  const [confirm, setConfirm] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const scores = (game.players || []).map(p => {
    const total     = game.balances?.[p.name] || 0;
    const mission   = missionForPlayer(p.name, today, game.missions, game.missionOverrides, game.exclusions?.[p.name]);
    const ck        = `${p.name}:${today}:${mission?.id}`;
    const doneToday = !!game.completions?.[ck];
    const skipToday = !!game.notCompleted?.[ck];
    const verifsReceived = Object.keys(game.verifications || {}).filter(k => {
      const parts = k.split(":");
      return parts[1] === p.name && parts[2] === String(today);
    }).length;
    return { ...p, total, doneToday, skipToday, verifsReceived };
  }).sort((a, b) => b.total - a.total);

  const doneToday = scores.filter(s => s.doneToday).length;

  async function reset() {
    setSaving(true);
    await onSave({ ...game, completions:{}, notCompleted:{}, ratings:{}, balances:{}, verifications:{}, exclusions:{} });
    setSaving(false);
    setConfirm(false);
  }

  return (
    <div>
      {confirm && <Confirm title="Reset Everything" text="Clears all completions, ratings, verifications, scores and balances. Cannot be undone." onConfirm={reset} onCancel={() => setConfirm(false)} label="Reset Everything"/>}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div style={{ fontFamily:"monospace", fontSize:11, color:C.creamDm }}>{doneToday} of {game.players.length} completed today</div>
        <Btn danger sm onClick={() => setConfirm(true)}>Reset All</Btn>
      </div>
      <SLabel>Leaderboard</SLabel>
      {scores.length === 0 && <p style={{ fontFamily:"monospace", fontSize:11, color:C.creamDm, lineHeight:1.7 }}>No players yet.</p>}
      {scores.map((p, i) => (
        <Card key={p.id}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ fontFamily:"monospace", fontSize:i<3?20:13, color:i===0?C.gold:i===1?"#a8a8a8":i===2?"#cd7f32":C.creamDm, width:34, textAlign:"center", flexShrink:0 }}>
              {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                <span style={{ fontFamily:"'Georgia',serif", fontSize:15, color:C.cream }}>{p.name}</span>
                {p.doneToday  && <span style={{ fontFamily:"monospace", fontSize:8, padding:"2px 7px", background:"rgba(78,158,110,0.12)",  border:`1px solid rgba(78,158,110,0.4)`,  color:"#6ab47a" }}>✓ Today</span>}
                {p.skipToday  && <span style={{ fontFamily:"monospace", fontSize:8, padding:"2px 7px", background:"rgba(192,57,43,0.1)",    border:`1px solid rgba(192,57,43,0.3)`,   color:"#e05a4b" }}>✗ Not done</span>}
                {p.verifsReceived > 0 && <span style={{ fontFamily:"monospace", fontSize:8, padding:"2px 7px", background:"rgba(201,168,76,0.1)", border:`1px solid rgba(201,168,76,0.3)`, color:C.gold }}>👁 {p.verifsReceived} verified</span>}
              </div>
              <div style={{ fontFamily:"monospace", fontSize:10, color:C.creamDm }}>{p.total} point{p.total!==1?"s":""} · 💰 {game.balances?.[p.name] || 0} balance</div>
            </div>
            <div style={{ fontFamily:"'Georgia',serif", fontSize:26, color:C.gold, fontWeight:700 }}>{p.total}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BACK OFFICE SHELL
// ─────────────────────────────────────────────────────────────
function BackOffice({ game, onSave, onExit }) {
  const [tab, setTab] = useState("players");
  return (
    <PageWrap>
      <AppHeader sub="Back Office"/>
      <NavBar active={tab} onNav={setTab} onBack={onExit}/>
      {tab === "players"    && <PlayersTab    game={game} onSave={onSave}/>}
      {tab === "missions"   && <MissionsTab   game={game} onSave={onSave}/>}
      {tab === "scoreboard" && <ScoreboardTab game={game} onSave={onSave}/>}
    </PageWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTH GATES
// ─────────────────────────────────────────────────────────────
function BackOfficeGate({ onSuccess, onCancel }) {
  const [error, setError] = useState("");
  function submit(typed) {
    if (typed === BO_PASSWORD) onSuccess();
    else setError("Incorrect password.");
  }
  return <PasswordModal title="Back Office" subtitle="Enter the back office password to continue." onSubmit={submit} onCancel={onCancel} error={error}/>;
}

function EnterPasswordGate({ player, game, onSuccess, onCancel }) {
  const [error, setError] = useState("");
  function submit(typed) {
    if (hashPassword(typed) === game.passwords?.[player.id]) onSuccess();
    else setError("Incorrect password. Try again.");
  }
  return <PasswordModal title={`Welcome back, ${player.name}`} subtitle="Enter your password to see your mission." onSubmit={submit} onCancel={onCancel} error={error}/>;
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
const M = { LOADING:"loading", IDENTIFY:"identify", SET_PW:"set_pw", ENTER_PW:"enter_pw", PLAYER:"player", BO_GATE:"bo_gate", BO:"bo" };

export default function App() {
  const [game,     setGame]     = useState(null);
  const [identity, setIdentity] = useState(null);
  const [mode,     setMode]     = useState(M.LOADING);
  const [prevMode, setPrevMode] = useState(M.IDENTIFY);
  const tapRef   = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => {
    Promise.all([loadShared(), loadIdentity(), loadMissions()]).then(([g, ident, sharedMissions]) => {
      // SAFETY: if Firestore returned nothing, use defaultGame but DO NOT save it back —
      // we never want to overwrite real data with defaults due to a read failure.
      const isNewGame = !g;
      let game = migrateGame(g || defaultGame());

      if (sharedMissions) {
        game.missions = sharedMissions;
      } else if (isNewGame) {
        // Only seed shared missions if this is genuinely a brand new game
        saveMissions(game.missions);
      }

      // Auto-expire only if we loaded real data from Firestore
      if (!isNewGame) {
        const expired = autoExpireMissions(game);
        if (expired !== game) {
          game = expired;
          saveShared(game);
          saveMissions(game.missions);
        }
      }

      setGame(game);
      if (ident && game.players.find(p => p.id === ident.id)) {
        setIdentity(ident);
        const lockedOut = !!game.lockedOut?.[ident.id];
        const hasPw     = !!game.passwords?.[ident.id];
        const verified  = !!ident.verified;
        if (lockedOut || !hasPw) setMode(M.SET_PW);
        else if (verified)       setMode(M.PLAYER);
        else                     setMode(M.ENTER_PW);
      } else {
        setMode(M.IDENTIFY);
      }
    });
  }, []);

  async function saveGame(g) {
    setGame(g);
    await saveShared(g);
    // Always keep shared missions in sync
    if (g.missions) await saveMissions(g.missions);
  }

  function selectPlayer(player) {
    setIdentity(player);
    saveIdentity(player);
    const lockedOut = !!game.lockedOut?.[player.id];
    const hasPw     = !!game.passwords?.[player.id];
    if (!hasPw || lockedOut) setMode(M.SET_PW);
    else setMode(M.ENTER_PW);
  }

  async function setPassword(pw) {
    const hashed  = hashPassword(pw);
    const newLO   = { ...game.lockedOut }; delete newLO[identity.id];
    const newGame = { ...game, passwords:{ ...game.passwords, [identity.id]:hashed }, lockedOut:newLO };
    await saveGame(newGame);
    await saveIdentity({ ...identity, verified:true });
    setMode(M.PLAYER);
  }

  async function onPasswordSuccess() {
    await saveIdentity({ ...identity, verified:true });
    setMode(M.PLAYER);
  }

  function switchPlayer() { setIdentity(null); saveIdentity(null); setMode(M.IDENTIFY); }

  function handleHeaderTap() {
    if (mode === M.BO) return;
    tapRef.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapRef.current = 0; }, 2000);
    if (tapRef.current >= 5) {
      tapRef.current = 0;
      clearTimeout(tapTimer.current);
      setPrevMode(mode);
      setMode(M.BO_GATE);
    }
  }

  const wrap = content => (
    <div onClick={e => { if (e.target.closest("header")) handleHeaderTap(); }}>{content}</div>
  );

  if (mode === M.LOADING) return (
    <div style={{ background:C.dark, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.3em", textTransform:"uppercase", color:C.goldDim }}>Loading…</span>
    </div>
  );

  if (mode === M.BO)       return wrap(<BackOffice game={game} onSave={saveGame} onExit={() => setMode(prevMode)}/>);
  if (mode === M.BO_GATE)  return (<><div style={{background:C.dark,minHeight:"100vh"}}/><BackOfficeGate onSuccess={() => setMode(M.BO)} onCancel={() => setMode(prevMode)}/></>);
  if (mode === M.IDENTIFY) return wrap(<IdentityScreen players={game?.players||[]} onSelect={selectPlayer}/>);
  if (mode === M.SET_PW)   return wrap(<SetPasswordScreen player={identity} onSet={setPassword} onBack={switchPlayer}/>);
  if (mode === M.ENTER_PW) return (<><div style={{background:C.dark,minHeight:"100vh"}}/><EnterPasswordGate player={identity} game={game} onSuccess={onPasswordSuccess} onCancel={switchPlayer}/></>);
  if (mode === M.PLAYER)   return wrap(<PlayerView player={identity} game={game} onSaveGame={saveGame} onSwitchPlayer={switchPlayer}/>);
  return null;
}
