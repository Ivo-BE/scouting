import test from 'node:test'
import assert from 'node:assert/strict'
import { derive, ourPlayerAt, oppPlayerAt, emptyScout } from '../src/lib/scout.js'

const roster = [1, 3, 5, 7, 8, 10, 12, 14].map(n => ({ id: 'p' + n, nr: String(n), name: 'S' + n }))
// POS-volgorde IV,III,II,V,VI,I  -> IV=1 III=3 II=5 V=7 VI=8 I=10
const match = { sets: [{ pos: ['p1', 'p3', 'p5', 'p7', 'p8', 'p10'], libero: 'p14', subs: [{ k: 0, in: 'p12', out: 'p1', score: '1-0' }] }] }
const pt = (team) => ({ type: 'point', set: 0, team })

test('side-out laat de ontvangende ploeg doordraaien en past wissel toe', () => {
  const sc = { ...emptyScout(), serveFirst: { 0: 'them' }, events: [pt('us')] }
  const d = derive(match, sc, 0)
  assert.deepEqual([d.us, d.them, d.serve, d.rotUs, d.rotThem], [1, 0, 'us', 1, 0])
  assert.equal(d.lineup[0], 'p12')                                  // wissel bij 1-0
  assert.equal(ourPlayerAt(match, roster, sc, 0, d, 1).nr, '5')     // II -> I
  assert.equal(ourPlayerAt(match, roster, sc, 0, d, 3).nr, '12')    // IV -> III, met wissel
  assert.equal(ourPlayerAt(match, roster, sc, 0, d, 5, { libFor: 'p8' }).nr, '14')  // 8 staat achter -> libero
})
test('eigen punt op eigen opslag: geen rotatie', () => {
  const sc = { ...emptyScout(), serveFirst: { 0: 'us' }, events: [pt('us'), pt('us')] }
  const d = derive(match, sc, 0); assert.equal(d.rotUs, 0); assert.equal(d.serve, 'us')
})
test('tegenstander: opslagvolgorde geeft rotatie', () => {
  const sc = { ...emptyScout(), serveFirst: { 0: 'them' }, oppServers: { 0: ['9', '4', '6'] }, oppFirstRot: { 0: 0 } }
  let d = derive(match, sc, 0)
  assert.equal(oppPlayerAt(sc, 0, d, 1).nr, '9'); assert.equal(oppPlayerAt(sc, 0, d, 2).nr, '4')
  sc.events = [pt('us'), pt('them')]                // zij verliezen, winnen terug -> zij draaien
  d = derive(match, sc, 0); assert.equal(d.rotThem, 1)
  assert.equal(oppPlayerAt(sc, 0, d, 1).nr, '4')    // #4 serveert nu
})
