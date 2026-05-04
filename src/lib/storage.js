import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase.js'

// Firestore document path — different per environment
const GAME_DOC = import.meta.env.VITE_ENV === 'staging'
  ? 'game/game-staging'
  : 'game/game-production'

const IDENT_KEY = 'mds-identity'

// ── Shared game state (Firestore) ─────────────────────────────

export async function loadShared() {
  try {
    const snap = await getDoc(doc(db, ...GAME_DOC.split('/')))
    return snap.exists() ? snap.data().state : null
  } catch (e) {
    console.error('loadShared error:', e)
    return null
  }
}

export async function saveShared(data) {
  try {
    await setDoc(doc(db, ...GAME_DOC.split('/')), { state: data })
    return true
  } catch (e) {
    console.error('saveShared error:', e)
    return false
  }
}

// Subscribe to real-time updates — returns unsubscribe fn
export function subscribeShared(callback) {
  return onSnapshot(
    doc(db, ...GAME_DOC.split('/')),
    snap => { if (snap.exists()) callback(snap.data().state) },
    err  => console.error('subscribeShared error:', err)
  )
}

// ── Personal identity (localStorage) ─────────────────────────

export function loadIdentity() {
  try {
    const raw = localStorage.getItem(IDENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveIdentity(data) {
  try {
    if (data === null) localStorage.removeItem(IDENT_KEY)
    else localStorage.setItem(IDENT_KEY, JSON.stringify(data))
  } catch {}
}
