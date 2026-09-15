import test from 'node:test'
import assert from 'node:assert/strict'
import { newSet, lineup, allowedSubs, setWinner, matchState, snap, undo, dispIndex, baseIndex, stats, playedSet } from '../src/lib/volley.js'

const roster = ['a','b','c','d','e','f','g','h','L'].map(id => ({ id, nr: id, name: id, lib: id === 'L' }))
const started = () => ({ ...newSet(), pos: ['a','b','c','d','e','f'], libero: 'L', locked: true })

test('setWinner respecteert 25/2 en 15 in set 5', () => {
  assert.equal(setWinner({ us: '24', them: '24' }, 0), null)
  assert.equal(setWinner({ us: '25', them: '24' }, 0), null)
  assert.equal(setWinner({ us: '26', them: '24' }, 0), 'us')
  assert.equal(setWinner({ us: '15', them: '13' }, 0), null)
  assert.equal(setWinner({ us: '15', them: '13' }, 4), 'us')
})
test('wisselregel: starter eruit, dan alleen starter terug, dan koppel dicht', () => {
  let st = started()
  assert.deepEqual(allowedSubs(st, 0, roster).map(p => p.id), ['g','h'])
  st = { ...st, subs: [{ k: 0, out: 'a', in: 'g' }] }
  assert.deepEqual(allowedSubs(st, 0, roster).map(p => p.id), ['a'])
  assert.deepEqual(allowedSubs(st, 1, roster).map(p => p.id), ['h'])   // g zit in een koppel
  st = { ...st, subs: [...st.subs, { k: 0, out: 'g', in: 'a' }] }
  assert.deepEqual(allowedSubs(st, 0, roster), [])
  assert.deepEqual(lineup(st), ['a','b','c','d','e','f'])
})
test('rotatie is een bijectie en draait in wijzerzin', () => {
  const st = { ...started(), rot: 1 }
  for (let d = 0; d < 6; d++) assert.equal(dispIndex(st, baseIndex(st, d)), d)
  assert.equal(baseIndex(st, 5), 2) // op I staat wie op II startte
})
test('undo herstelt stand, time-out en wissel', () => {
  let st = started()
  st = snap(st, 'punt'); st = { ...st, us: '1' }
  st = snap(st, 'time-out'); st = { ...st, timeouts: ['1-0'] }
  assert.equal(st.hist.length, 2)
  let r = undo(st); assert.equal(r.what, 'time-out'); assert.deepEqual(r.st.timeouts, [])
  r = undo(r.st); assert.equal(r.what, 'punt'); assert.equal(r.st.us, '')
})
test('matchState telt tot 3', () => {
  const m = { sets: [{ us: '25', them: '20' }, { us: '25', them: '20' }, { us: '20', them: '25' }, { us: '25', them: '23' }, { us: '', them: '' }] }
  assert.deepEqual(matchState(m), { w: 3, l: 1, over: true })
})

test('onbevestigde, voorbereide sets tellen niet mee', () => {
  const r = [{ id: 'a', nr: '1', name: 'A' }]
  const played = { ...newSet(), pos: ['a', '', '', '', '', ''], locked: true }
  const prepared = { ...newSet(), pos: ['a', '', '', '', '', ''], locked: false }
  assert.equal(playedSet(played), true); assert.equal(playedSet(prepared), false)
  const st = stats(r, [{ id: 'm', sets: [played, prepared, prepared] }])
  assert.equal(st[0].started, 1)
})
