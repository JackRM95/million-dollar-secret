import { useState, useEffect, useRef } from "react";
import { loadShared, saveShared, loadIdentity, saveIdentity, subscribeShared } from "./lib/storage.js";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Impossible"];
const DIFF_SCORE   = { Easy: 1, Medium: 2, Hard: 3, Impossible: 5 };
const BO_PASSWORD  = "jack";

function diffUp(d)   { const i = DIFFICULTIES.indexOf(d); return i < DIFFICULTIES.length - 1 ? DIFFICULTIES[i + 1] : d; }
function diffDown(d) { const i = DIFFICULTIES.indexOf(d); return i > 0 ? DIFFICULTIES[i - 1] : d; }

// ─────────────────────────────────────────────────────────────
// DEFAULT MISSIONS
// ─────────────────────────────────────────────────────────────
const DEFAULT_MISSIONS = [
  {id:"m001",mission:"Go for a high five with someone and deliberately miss — act confused, as if they moved at the last second.",difficulty:"Easy",category:"Social Awkwardness"},
  {id:"m002",mission:"Start at least two conversations today by commenting on something that isn't there. Point vaguely and say 'did you see that?' then act like you imagined it.",difficulty:"Medium",category:"Social Awkwardness"},
  {id:"m003",mission:"Every time someone asks you a yes/no question, pause for five full seconds before answering.",difficulty:"Easy",category:"Social Awkwardness"},
  {id:"m004",mission:"Wave confidently at someone who clearly doesn't know you. Hold eye contact. Do not look away first.",difficulty:"Medium",category:"Social Awkwardness"},
  {id:"m005",mission:"Refer to yourself in the third person at least three times in conversation today.",difficulty:"Hard",category:"Social Awkwardness"},
  {id:"m006",mission:"Any time someone mentions food, sigh deeply and say 'yeah...' as if it triggers a distant memory. Don't explain.",difficulty:"Easy",category:"Social Awkwardness"},
  {id:"m007",mission:"After someone finishes speaking, slowly nod for an uncomfortably long time — then change the subject entirely.",difficulty:"Medium",category:"Social Awkwardness"},
  {id:"m008",mission:"Rearrange one small object in a shared space without anyone noticing. See if it gets mentioned.",difficulty:"Easy",category:"Sneaky Actions"},
  {id:"m009",mission:"Swap the position of two items on a table or shelf while no one is looking. Say nothing. Wait.",difficulty:"Easy",category:"Sneaky Actions"},
  {id:"m010",mission:"Leave a cryptic note somewhere it will be found — something like 'it was never about the keys' — and act completely innocent.",difficulty:"Medium",category:"Sneaky Actions"},
  {id:"m011",mission:"Subtly hum a tune whenever a specific person enters the room. Stop immediately when they look at you.",difficulty:"Hard",category:"Sneaky Actions"},
  {id:"m012",mission:"Pick a mundane object and spend the day acting mildly protective of it — keep it close, move it away from people.",difficulty:"Medium",category:"Sneaky Actions"},
  {id:"m013",mission:"Steer at least two separate conversations toward the topic of dreams. Make it feel natural both times.",difficulty:"Medium",category:"Conversation Steering"},
  {id:"m014",mission:"Bring up parallel universes naturally in conversation. You cannot initiate — wait for an opening.",difficulty:"Hard",category:"Conversation Steering"},
  {id:"m015",mission:"Redirect any complaint you hear today into a positive. Do it at least three times without being preachy.",difficulty:"Medium",category:"Conversation Steering"},
  {id:"m016",mission:"Bring up a random historical fact in at least two conversations today. It must feel organic.",difficulty:"Hard",category:"Conversation Steering"},
  {id:"m017",mission:"Steer at least one conversation toward childhood memories — get someone else talking about theirs.",difficulty:"Medium",category:"Conversation Steering"},
  {id:"m018",mission:"Find a way to bring up 'the ocean' in at least three conversations today. It cannot be the opening topic.",difficulty:"Hard",category:"Conversation Steering"},
  {id:"m019",mission:"Use the word 'apparently' at least five times today. It must fit naturally each time.",difficulty:"Easy",category:"Word Challenge"},
  {id:"m020",mission:"Use the word 'technically' at least four times in situations where it's barely applicable.",difficulty:"Medium",category:"Word Challenge"},
  {id:"m021",mission:"Avoid saying 'yes' for the entire day. Use 'absolutely', 'indeed', 'correct' — but never 'yes'.",difficulty:"Hard",category:"Word Challenge"},
  {id:"m022",mission:"Use the phrase 'as it happens' at least three times today. It must sound natural each time.",difficulty:"Medium",category:"Word Challenge"},
  {id:"m023",mission:"Work the word 'extraordinary' into conversation at least three times, applied to mundane things.",difficulty:"Easy",category:"Word Challenge"},
  {id:"m024",mission:"Use the word 'allegedly' at least four times today when describing things that are absolutely certain.",difficulty:"Medium",category:"Word Challenge"},
  {id:"m025",mission:"Give three genuine compliments today — only about things people made or built, never about looks.",difficulty:"Easy",category:"Compliments"},
  {id:"m026",mission:"Compliment a stranger on something unusual — their choice of bag, their handwriting, how they ordered coffee.",difficulty:"Medium",category:"Compliments"},
  {id:"m027",mission:"Give someone a compliment so specific and detailed that they look genuinely surprised.",difficulty:"Medium",category:"Compliments"},
  {id:"m028",mission:"Compliment the same person twice today about two completely different things. Space it out by two hours.",difficulty:"Easy",category:"Compliments"},
  {id:"m029",mission:"Tell someone something you genuinely admire about them that you have never said before.",difficulty:"Hard",category:"Compliments"},
  {id:"m030",mission:"Look up at the ceiling pensively at least three times today during unrelated conversations.",difficulty:"Easy",category:"Odd Behaviour"},
  {id:"m031",mission:"Respond to at least three questions today with a question of your own — never answer directly.",difficulty:"Medium",category:"Odd Behaviour"},
  {id:"m032",mission:"Whenever anyone mentions a number today, repeat it quietly under your breath as if double-checking.",difficulty:"Easy",category:"Odd Behaviour"},
  {id:"m033",mission:"Pause what you're doing at least twice today, look around slowly as if you heard something, then carry on.",difficulty:"Easy",category:"Odd Behaviour"},
  {id:"m034",mission:"Refer to at least one completely ordinary event today as 'the incident' — with gravitas.",difficulty:"Medium",category:"Odd Behaviour"},
  {id:"m035",mission:"Take an unusually long time to make a trivial decision today — as if it genuinely matters enormously.",difficulty:"Easy",category:"Odd Behaviour"},
  {id:"m036",mission:"Stare meaningfully at an exit for five seconds during a conversation. Say nothing. Return to the conversation.",difficulty:"Medium",category:"Odd Behaviour"},
  {id:"m037",mission:"Memorise one new fact about each person you interact with today. List them all at end of day.",difficulty:"Medium",category:"Observation"},
  {id:"m038",mission:"Notice and remember something specific each person you talk to is wearing. Don't mention it.",difficulty:"Easy",category:"Observation"},
  {id:"m039",mission:"Count how many times someone says 'basically' across all conversations today.",difficulty:"Easy",category:"Observation"},
  {id:"m040",mission:"Track every time someone contradicts themselves today. Keep a mental tally. Do not point it out.",difficulty:"Medium",category:"Observation"},
  {id:"m041",mission:"Notice three things today that are slightly out of place. Tell no one until the day is over.",difficulty:"Easy",category:"Observation"},
  {id:"m042",mission:"Start every interaction today with 'I've been thinking...' then say something completely ordinary.",difficulty:"Easy",category:"Social Experiment"},
  {id:"m043",mission:"Agree with everything the first person you speak to says for a full five minutes — genuinely.",difficulty:"Medium",category:"Social Experiment"},
  {id:"m044",mission:"Speak noticeably slower than usual for one full conversation. See if the other person slows down too.",difficulty:"Medium",category:"Social Experiment"},
  {id:"m045",mission:"End every goodbye today with 'take care of yourself' — sincerely, like you mean it each time.",difficulty:"Easy",category:"Social Experiment"},
  {id:"m046",mission:"Be the last person to speak before a silence in at least one conversation. Let it exist. Don't fill it.",difficulty:"Hard",category:"Social Experiment"},
  {id:"m047",mission:"Go the entire day without checking your phone for more than one minute at a time when in company.",difficulty:"Hard",category:"Personal Challenge"},
  {id:"m048",mission:"Introduce yourself to one person you don't know today. Find out one thing that surprises you.",difficulty:"Medium",category:"Personal Challenge"},
  {id:"m049",mission:"Ask someone for their honest opinion on something and truly listen — no interrupting, no defending.",difficulty:"Medium",category:"Personal Challenge"},
  {id:"m050",mission:"Do one small thing for someone today that they didn't ask for and won't expect.",difficulty:"Easy",category:"Personal Challenge"},
  {id:"m051",mission:"Have a conversation where you ask more questions than you make statements.",difficulty:"Medium",category:"Personal Challenge"},
  {id:"m052",mission:"Avoid complaining about anything today — not even small things, not even jokingly.",difficulty:"Hard",category:"Personal Challenge"},
  {id:"m053",mission:"Make someone laugh today without saying anything obviously funny — through timing or expression alone.",difficulty:"Hard",category:"Personal Challenge"},
  {id:"m054",mission:"Find a reason to say 'that is a good point' and mean it at least three times today.",difficulty:"Easy",category:"Personal Challenge"},
  {id:"m055",mission:"Do something today that slightly scares you — socially, creatively, or otherwise.",difficulty:"Hard",category:"Personal Challenge"},
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

function missionForPlayerDeterministic(name, dateStamp, missions) {
  if (!missions?.length) return null;
  const seed = (hashStr(name.toLowerCase().trim()) ^ (dateStamp * 2654435761)) >>> 0;
  const rng = seededRNG(seed);
  rng(); rng(); rng();
  return missions[Math.floor(rng() * missions.length)];
}

function missionForPlayer(name, dateStamp, missions, overrides) {
  // If a back-office override exists for this player+date, use that mission
  const overrideId = overrides?.[`${name}:${dateStamp}`];
  if (overrideId) {
    const m = missions?.find(x => x.id === overrideId);
    if (m) return m;
  }
  return missionForPlayerDeterministic(name, dateStamp, missions);
}

// ─────────────────────────────────────────────────────────────
// ADAPTIVE MISSION LOGIC
// runs after all players have responded (completed or not) for a given mission+day
// ─────────────────────────────────────────────────────────────
function applyAdaptiveLogic(game, missionId, dateStamp) {
  const players = game.players || [];
  if (players.length === 0) return game;

  // Check all players have responded
  const responses = players.map(p => {
    const ck  = `${p.name}:${dateStamp}:${missionId}`;
    const done = !!game.completions?.[ck];
    const skip = !!game.notCompleted?.[ck];
    return { done, skip, responded: done || skip };
  });

  const allResponded = responses.every(r => r.responded);
  if (!allResponded) return game;

  const allDone   = responses.every(r => r.done);
  const noneDone  = responses.every(r => r.skip);

  // Ratings: if ALL players disliked → delete mission
  const dislikes = players.filter(p => game.ratings?.[`${p.name}:${missionId}`] === "dislike").length;
  if (dislikes === players.length) {
    return { ...game, missions: game.missions.filter(m => m.id !== missionId) };
  }

  // Difficulty adjustment
  let missions = game.missions;
  if (allDone) {
    missions = missions.map(m => m.id === missionId ? { ...m, difficulty: diffDown(m.difficulty) } : m);
  } else if (noneDone) {
    missions = missions.map(m => m.id === missionId ? { ...m, difficulty: diffUp(m.difficulty) } : m);
  }

  return { ...game, missions };
}

// ─────────────────────────────────────────────────────────────
// STORAGE  (see src/lib/storage.js)
// ─────────────────────────────────────────────────────────────
const IS_STAGING = import.meta.env.VITE_ENV === 'staging';

function defaultGame() {
  return {
    missions: DEFAULT_MISSIONS,
    players: [],
    completions: {},      // { "name:date:missionId": true }
    notCompleted: {},     // { "name:date:missionId": true }
    ratings: {},          // { "name:missionId": "like"|"dislike" }
    passwords: {},
    lockedOut: {},
    missionOverrides: {}, // { "name:date": missionId } — assigned after back-office reset
    balances: {},         // { playerName: number } — spendable currency, separate from score
  };
}

function migrateGame(g) {
  if (!g.notCompleted)      g.notCompleted = {};
  if (!g.ratings)           g.ratings = {};
  if (!g.passwords)         g.passwords = {};
  if (!g.lockedOut)         g.lockedOut = {};
  if (!g.missionOverrides)  g.missionOverrides = {};
  if (!g.balances)          g.balances = {};
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
    </header>
  );
}

function Btn({ children, onClick, primary, sm, full, ghost, danger, disabled, style:sx }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily:"monospace", textTransform:"uppercase", cursor:disabled?"not-allowed":"pointer",
        letterSpacing:"0.2em", transition:"all 0.2s", opacity:disabled?0.4:1,
        fontSize:sm?10:11, padding:sm?"7px 14px":"12px 26px",
        display:full?"block":"inline-block", width:full?"100%":undefined, textAlign:full?"center":undefined,
        background:danger?(h?"#c0392b":"transparent"):primary?(h?C.goldLt:C.gold):ghost?"transparent":(h?C.gold:"transparent"),
        color:danger?(h?C.cream:"#e05a4b"):primary?C.dark:ghost?(h?C.cream:C.creamDm):(h?C.dark:C.gold),
        border:danger?`1px solid rgba(192,57,43,0.5)`:primary?"none":`1px solid ${ghost?"rgba(255,255,255,0.18)":C.gold}`,
        ...sx
      }}>{children}</button>
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
      <button onClick={onBack} style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", padding:"8px 14px", cursor:"pointer", background:"transparent", border:"none", borderBottom:"2px solid transparent", color:C.creamDm, transition:"all 0.2s", marginBottom:-1 }}>
        ← Exit
      </button>
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
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)"; e.currentTarget.style.background = C.dark3; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)"; e.currentTarget.style.background = C.dark2; }}>
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
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (pw.length < 3) { setError("Password must be at least 3 characters."); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    onSet(pw);
  }

  return (
    <PageWrap narrow>
      <AppHeader/>
      <div style={{ textAlign:"center", marginBottom:28 }}>
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
        <Btn primary full onClick={submit}>Set Password &amp; Continue</Btn>
      </Card>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// PLAYER MISSION VIEW
// ─────────────────────────────────────────────────────────────
function PlayerView({ player, game, onSaveGame, onSwitchPlayer }) {
  const today   = todayStamp();
  const mission = missionForPlayer(player.name, today, game.missions, game.missionOverrides);
  const mId     = mission?.id;
  const ck      = `${player.name}:${today}:${mId}`;

  const alreadyDone = !!game.completions?.[ck];
  const alreadySkip = !!game.notCompleted?.[ck];
  const myRating    = mId ? (game.ratings?.[`${player.name}:${mId}`] || null) : null;

  const [status,  setStatus]  = useState(alreadyDone ? "done" : alreadySkip ? "skipped" : "pending");
  const [rating,  setRating]  = useState(myRating);
  const [saving,  setSaving]  = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type, label, message, exec }

  // Scoreboard data
  const allPlayers  = game.players || [];
  const todayScores = allPlayers.map(p => ({
    ...p,
    done:    !!game.completions?.[`${p.name}:${today}:${missionForPlayer(p.name, today, game.missions, game.missionOverrides)?.id}`],
    skipped: !!game.notCompleted?.[`${p.name}:${today}:${missionForPlayer(p.name, today, game.missions, game.missionOverrides)?.id}`],
  }));
  const leaderboard = allPlayers.map(p => {
    const total = Object.keys(game.completions || {}).filter(k => k.startsWith(p.name + ":")).reduce((acc, k) => {
      const parts = k.split(":");
      const mid   = parts[2];
      const m     = game.missions.find(x => x.id === mid);
      return acc + (m ? (DIFF_SCORE[m.difficulty] || 1) : 1);
    }, 0);
    return { ...p, total };
  }).sort((a, b) => b.total - a.total);

  async function execRespond(type) {
    if (status !== "pending" || saving || !mId) return;
    setSaving(true);
    let updated = { ...game };
    if (type === "done") {
      // Award points to both score (via completions) and balance
      const pts = DIFF_SCORE[mission.difficulty] || 1;
      const currentBal = updated.balances?.[player.name] || 0;
      updated.completions = { ...updated.completions, [ck]: true };
      updated.balances = { ...updated.balances, [player.name]: currentBal + pts };
      setStatus("done");
    } else {
      updated.notCompleted = { ...updated.notCompleted, [ck]: true };
      setStatus("skipped");
    }
    updated = applyAdaptiveLogic(updated, mId, today);
    await onSaveGame(updated);
    setSaving(false);
  }

  function respond(type) {
    if (status !== "pending" || saving || !mId) return;
    const label   = type === "done" ? "Mark as Completed" : "Mark as Not Completed";
    const message = type === "done"
      ? `Confirm you completed today's mission? You'll earn ${DIFF_SCORE[mission?.difficulty] || 1} point${(DIFF_SCORE[mission?.difficulty] || 1) !== 1 ? "s" : ""}.`
      : "Confirm you did not complete today's mission?";
    setPendingAction({ type, label, message, exec: () => execRespond(type) });
  }

  async function execRate(val) {
    if (!mId) return;
    const rk = `${player.name}:${mId}`;
    const newRating = rating === val ? null : val;
    setRating(newRating);
    let updated = { ...game, ratings: { ...game.ratings } };
    if (newRating) updated.ratings[rk] = newRating;
    else delete updated.ratings[rk];
    updated = applyAdaptiveLogic(updated, mId, today);
    await onSaveGame(updated);
  }

  function rate(val) {
    if (!mId) return;
    if (val === "dislike") {
      setPendingAction({ type:"rate-dislike", label:"Remove it", message:"Vote to remove this mission from the pool? If all players vote to remove it, it will be deleted.", exec: () => execRate(val) });
    } else {
      execRate(val); // likes don't need confirmation
    }
  }

  const score = mission ? (DIFF_SCORE[mission.difficulty] || 1) : 0;

  return (
    <>
    {pendingAction && (
      <ActionConfirm
        message={pendingAction.message}
        onYes={() => { pendingAction.exec(); setPendingAction(null); }}
        onNo={() => setPendingAction(null)}
      />
    )}
    <PageWrap narrow>
      <AppHeader/>

      {/* Mission card */}
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.4em", textTransform:"uppercase", color:C.gold, marginBottom:6 }}>Mission for</p>
        <p style={{ fontFamily:"'Georgia',serif", fontSize:"clamp(1.2rem,5vw,1.5rem)", color:C.cream, marginBottom:8 }}>{player.name}</p>
        <div style={{ display:"flex", gap:18, justifyContent:"center", marginBottom:20 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:C.creamDm, marginBottom:3 }}>Score</div>
            <div style={{ fontFamily:"'Georgia',serif", fontSize:22, color:C.gold, fontWeight:700 }}>{leaderboard.find(p => p.name === player.name)?.total || 0}</div>
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
              {mission.mission}
            </p>
            <div style={{ marginBottom:8 }}>
              <Tag label={mission.difficulty} type="diff"/>
              <Tag label={mission.category} type="cat"/>
              <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.15em", color:C.goldDim, marginLeft:4 }}>+{score} pt{score !== 1 ? "s" : ""}</span>
            </div>

            <p style={{ fontFamily:"monospace", fontSize:10, color:C.red, opacity:0.7, margin:"14px auto", lineHeight:1.6, paddingTop:12, borderTop:`1px solid rgba(192,57,43,0.2)`, maxWidth:300 }}>
              ⚠ Do not reveal this to anyone.
            </p>

            {/* Complete / Not completed */}
            {status === "pending" && (
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginTop:8 }}>
                <Btn primary onClick={() => respond("done")} disabled={saving}>✓ Completed</Btn>
                <Btn danger onClick={() => respond("skip")} disabled={saving}>✗ Not Completed</Btn>
              </div>
            )}
            {status === "done" && (
              <div style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6ab47a", padding:"12px 24px", border:`1px solid rgba(78,158,110,0.4)`, display:"inline-block", marginTop:8 }}>
                ✓ Mission Completed! +{score} pt{score !== 1 ? "s" : ""}
              </div>
            )}
            {status === "skipped" && (
              <div style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:C.creamDm, padding:"12px 24px", border:`1px solid rgba(255,255,255,0.1)`, display:"inline-block", marginTop:8 }}>
                Mission not completed today
              </div>
            )}

            {/* Rating */}
            {status !== "pending" && (
              <div style={{ marginTop:24, textAlign:"center" }}>
                <p style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:C.creamDm, marginBottom:10 }}>Rate this mission</p>
                <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
                  {[["like", "👍 Good mission"], ["dislike", "👎 Remove it"]].map(([val, label]) => (
                    <button key={val} onClick={() => rate(val)}
                      style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", padding:"7px 16px", cursor:"pointer", transition:"all 0.2s", background:rating===val?C.gold:"transparent", color:rating===val?C.dark:C.gold, border:`1px solid ${rating===val?C.gold:"rgba(201,168,76,0.4)"}` }}>
                      {label}
                    </button>
                  ))}
                </div>
                {rating === "dislike" && (
                  <p style={{ fontFamily:"monospace", fontSize:9, color:C.creamDm, marginTop:8, opacity:0.7 }}>
                    If all players dislike this mission it will be removed from the pool.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <p style={{ color:C.creamDm, fontFamily:"monospace", fontSize:11 }}>No missions found.</p>
        )}
      </div>

      {/* Today's progress */}
      {allPlayers.length > 0 && (
        <div style={{ marginTop:36 }}>
          <SLabel>Today's Progress</SLabel>
          {todayScores.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", marginBottom:6, background:C.dark2, border:`1px solid rgba(201,168,76,0.1)` }}>
              <span style={{ fontFamily:"'Georgia',serif", fontSize:13, color:C.cream }}>{p.name}</span>
              <span style={{ fontFamily:"monospace", fontSize:10, color:p.done?"#6ab47a":p.skipped?"#e05a4b":C.creamDm }}>
                {p.done ? "✓ Done" : p.skipped ? "✗ Not done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div style={{ marginTop:28 }}>
          <SLabel>Leaderboard</SLabel>
          {leaderboard.map((p, i) => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 14px", marginBottom:6, background:C.dark2, border:`1px solid rgba(201,168,76,0.1)` }}>
              <span style={{ fontFamily:"monospace", fontSize:i < 3 ? 16 : 12, color:i===0?C.gold:i===1?"#a8a8a8":i===2?"#cd7f32":C.creamDm, width:28, flexShrink:0 }}>
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


// Lightweight inline action confirm — used for player page CTAs
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
    const current = missionForPlayer(player.name, today, game.missions, game.missionOverrides);
    if (!current) return;

    // Pick a different mission — deterministically step through pool until we find one not equal to current
    const pool = game.missions.filter(m => m.id !== current.id);
    if (pool.length === 0) return; // only one mission in pool, can't reassign
    const seed = (hashStr(player.name.toLowerCase() + today + "reset") ^ (today * 1234567)) >>> 0;
    const rng  = seededRNG(seed);
    const newMission = pool[Math.floor(rng() * pool.length)];

    // Clear old response keys
    const oldCk = `${player.name}:${today}:${current.id}`;
    const nc = { ...game.notCompleted }; delete nc[oldCk];
    const co = { ...game.completions  }; delete co[oldCk];

    // Store override so player gets the new mission
    const overrides = { ...game.missionOverrides, [`${player.name}:${today}`]: newMission.id };

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
        <Confirm title="Reset Today's Mission" text={`Reset ${confirm.player.name}'s mission response for today. Any points earned will be removed.`}
          onConfirm={() => resetMission(confirm.player)} onCancel={() => setConfirm(null)} label="Reset Mission"/>
      )}

      <SLabel>Players ({players.length})</SLabel>
      {players.length === 0 && <p style={{ fontFamily:"monospace", fontSize:11, color:C.creamDm, marginBottom:16, lineHeight:1.7 }}>No players yet.</p>}
      {players.map(p => {
        const today    = todayStamp();
        const mission  = missionForPlayer(p.name, today, game.missions, game.missionOverrides);
        const ck       = `${p.name}:${today}:${mission?.id}`;
        const doneToday = !!game.completions?.[ck];
        const skipToday = !!game.notCompleted?.[ck];
        const hasPw    = !!(game.passwords?.[p.id]);
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

// Reusable confirm dialog
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
// BACK OFFICE — MISSIONS TAB
// ─────────────────────────────────────────────────────────────
function MissionsTab({ game, onSave }) {
  const [missions, setMissions] = useState(game.missions);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ mission:"", difficulty:"Medium", category:"" });
  const [filter,   setFilter]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const dirty = JSON.stringify(missions) !== JSON.stringify(game.missions);
  const cats  = [...new Set(missions.map(m => m.category))].sort();
  const filtered = missions.filter(m => !filter || m.mission.toLowerCase().includes(filter.toLowerCase()) || m.category.toLowerCase().includes(filter.toLowerCase()));

  function startNew()  { setForm({ mission:"", difficulty:"Medium", category:"" }); setEditing("new"); }
  function startEdit(m){ setForm({ mission:m.mission, difficulty:m.difficulty, category:m.category }); setEditing(m.id); }
  function saveEdit()  {
    if (!form.mission.trim() || !form.category.trim()) return;
    if (editing === "new") setMissions(prev => [...prev, { id:"m"+uid(), ...form }]);
    else setMissions(prev => prev.map(m => m.id === editing ? { ...m, ...form } : m));
    setEditing(null);
  }
  async function saveAll() { setSaving(true); await onSave({ ...game, missions }); setSaving(false); }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <SLabel>Missions ({missions.length})</SLabel>
        <Btn primary sm onClick={startNew}>+ Add Mission</Btn>
      </div>
      {editing && (
        <Card style={{ marginBottom:16, border:`1px solid rgba(201,168,76,0.45)` }}>
          <SLabel>{editing === "new" ? "New Mission" : "Edit Mission"}</SLabel>
          <textarea value={form.mission} onChange={e => setForm(f => ({ ...f, mission:e.target.value }))} placeholder="Describe the mission..." rows={3}
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
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter missions…"
        style={{ width:"100%", background:C.dark2, border:`1px solid rgba(201,168,76,0.2)`, color:C.cream, fontFamily:"monospace", fontSize:11, padding:"8px 12px", outline:"none", marginBottom:12 }}/>
      <div style={{ maxHeight:400, overflowY:"auto" }}>
        {filtered.map(m => (
          <div key={m.id} style={{ background:C.dark2, border:`1px solid rgba(201,168,76,0.1)`, padding:"10px 12px", marginBottom:7, display:"flex", gap:10, alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", fontSize:12, color:C.cream, lineHeight:1.6, marginBottom:5 }}>{m.mission}</p>
              <Tag label={m.difficulty} type="diff"/>
              <Tag label={m.category} type="cat"/>
              <span style={{ fontFamily:"monospace", fontSize:9, color:C.creamDm, marginLeft:6 }}>+{DIFF_SCORE[m.difficulty]||1}pt</span>
            </div>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              <button onClick={() => startEdit(m)} style={{ background:"transparent", border:`1px solid rgba(201,168,76,0.3)`, color:C.gold, fontFamily:"monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 8px", cursor:"pointer" }}>Edit</button>
              <button onClick={() => setMissions(prev => prev.filter(x => x.id !== m.id))} style={{ background:"transparent", border:`1px solid rgba(192,57,43,0.3)`, color:"#e05a4b", fontFamily:"monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 8px", cursor:"pointer" }}>Del</button>
            </div>
          </div>
        ))}
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
    const total = Object.keys(game.completions || {}).filter(k => k.startsWith(p.name + ":")).reduce((acc, k) => {
      const mid = k.split(":")[2];
      const m   = game.missions.find(x => x.id === mid);
      return acc + (m ? (DIFF_SCORE[m.difficulty] || 1) : 1);
    }, 0);
    const mission   = missionForPlayer(p.name, today, game.missions, game.missionOverrides);
    const ck        = `${p.name}:${today}:${mission?.id}`;
    const doneToday = !!game.completions?.[ck];
    const skipToday = !!game.notCompleted?.[ck];
    return { ...p, total, doneToday, skipToday };
  }).sort((a, b) => b.total - a.total);

  const doneToday = scores.filter(s => s.doneToday).length;

  async function reset() {
    setSaving(true);
    await onSave({ ...game, completions:{}, notCompleted:{}, ratings:{}, balances:{} });
    setSaving(false);
    setConfirm(false);
  }

  return (
    <div>
      {confirm && <Confirm title="Reset Everything" text="This clears all completions, ratings, and scores permanently. Cannot be undone." onConfirm={reset} onCancel={() => setConfirm(false)} label="Reset Everything"/>}
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
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                <span style={{ fontFamily:"'Georgia',serif", fontSize:15, color:C.cream }}>{p.name}</span>
                {p.doneToday && <span style={{ fontFamily:"monospace", fontSize:8, padding:"2px 7px", background:"rgba(78,158,110,0.12)", border:`1px solid rgba(78,158,110,0.4)`, color:"#6ab47a" }}>✓ Today</span>}
                {p.skipToday && <span style={{ fontFamily:"monospace", fontSize:8, padding:"2px 7px", background:"rgba(192,57,43,0.1)", border:`1px solid rgba(192,57,43,0.3)`, color:"#e05a4b" }}>✗ Not done</span>}
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
    // Load identity from localStorage synchronously
    const ident = loadIdentity();

    // Subscribe to real-time Firestore updates
    const unsub = subscribeShared(incoming => {
      const g = migrateGame(incoming || defaultGame());
      setGame(prev => {
        // On first load, also determine the mode
        if (prev === null) {
          if (ident && g.players.find(p => p.id === ident.id)) {
            setIdentity(ident);
            const lockedOut = !!g.lockedOut?.[ident.id];
            const hasPw     = !!g.passwords?.[ident.id];
            const verified  = !!ident.verified;
            if (lockedOut || !hasPw) setMode(M.SET_PW);
            else if (verified)       setMode(M.PLAYER);
            else                     setMode(M.ENTER_PW);
          } else {
            setMode(M.IDENTIFY);
          }
        }
        return g;
      });
    });

    // Fallback: if Firestore is empty / first load, initialise with defaults
    loadShared().then(g => {
      if (!g) {
        const fresh = defaultGame();
        saveShared(fresh);
      }
    });

    return () => unsub();
  }, []);

  async function saveGame(g) { setGame(g); await saveShared(g); }

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
    saveIdentity({ ...identity, verified:true });
    setMode(M.PLAYER);
  }

  async function onPasswordSuccess() {
    saveIdentity({ ...identity, verified:true });
    setMode(M.PLAYER);
  }

  function switchPlayer() { setIdentity(null); saveIdentity(null); setMode(M.IDENTIFY); }

  function handleHeaderTap() {
    if (mode === M.BO) return; // already in back office — do nothing
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
