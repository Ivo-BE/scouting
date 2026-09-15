import test from 'node:test'
import assert from 'node:assert/strict'
import { derive, ourPlayerAt, oppPlayerAt, emptyScout, rotationStats, nextStep, distribution, benchNext, benchStart } from '../src/lib/scout.js'

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

test('side-out per rotatie', () => {
  // zij serveren; wij winnen (so in rot 0), wij winnen op eigen opslag (break in rot 1), zij winnen (rot 1 break mislukt)
  const sc = { ...emptyScout(), serveFirst: { 0: 'them' }, events: [pt('us'), pt('us'), pt('them'), pt('them')] }
  const rows = rotationStats(match, sc, roster)
  assert.deepEqual([rows[0].recv, rows[0].so], [1, 1])
  assert.deepEqual([rows[1].serve, rows[1].brk], [2, 1])
  assert.deepEqual([rows[1].recv, rows[1].so], [1, 0])
  assert.equal(rows[0].server, '10')
})

test('slim taggen: volgende stap uit de laatste tag', () => {
  assert.deepEqual(nextStep({ team: 'us', act: 'opslag', q: '#' }), { point: 'us' })
  assert.deepEqual(nextStep({ team: 'us', act: 'opslag', q: '=' }), { point: 'them' })
  assert.deepEqual(nextStep({ team: 'us', act: 'opslag', q: '+' }), { pending: { team: 'them', act: 'receptie', zone: null } })
  assert.deepEqual(nextStep({ team: 'them', act: 'receptie', q: '+' }), { pending: { team: 'them', act: 'aanval', zone: null } })
  assert.deepEqual(nextStep({ team: 'them', act: 'aanval', q: '/' }), { askBlock: true })
  assert.deepEqual(nextStep({ team: 'them', act: 'aanval', q: '!' }), { pending: { team: 'us', act: 'verdediging', zone: null } })
  assert.deepEqual(nextStep({ team: 'us', act: 'blok', q: '#' }), { point: 'us' })
})

test('pas taggen: na receptie de pas klaarzetten', () => {
  assert.deepEqual(nextStep({ team: 'us', act: 'receptie', q: '+' }, { tagPas: true }), { pending: { team: 'us', act: 'pas', zone: null } })
  assert.deepEqual(nextStep({ team: 'us', act: 'pas', q: '+' }, { tagPas: true }), { pending: { team: 'us', act: 'aanval', zone: null } })
  assert.deepEqual(nextStep({ team: 'them', act: 'receptie', q: '+' }, { tagPas: true }), { pending: { team: 'them', act: 'aanval', zone: null } })
})
test('spelverdeling per rotatie met split op eerste bal', () => {
  const sc = { ...emptyScout(), events: [
    { type: 'touch', team: 'us', act: 'receptie', q: '+', rotUs: 0 }, { type: 'touch', team: 'us', act: 'aanval', zone: 4, q: '#', rotUs: 0 }, { type: 'point', team: 'us' },
    { type: 'touch', team: 'us', act: 'receptie', q: '-', rotUs: 1 }, { type: 'touch', team: 'us', act: 'pas', q: '!', rotUs: 1 }, { type: 'touch', team: 'us', act: 'aanval', zone: 2, q: '!', rotUs: 1 }, { type: 'point', team: 'them' } ] }
  const d = distribution(sc)
  assert.equal(d[0].zones[4], 1); assert.equal(d[0].good[4], 1)
  assert.equal(d[1].zones[2], 1); assert.equal(d[1].bad[2], 1); assert.deepEqual(d[1].pas, ['!'])
})

test('bankmodus: alleen eigen ploeg, start bij receptie als zij serveren', () => {
  assert.deepEqual(benchStart('them'), { team: 'us', act: 'receptie', zone: null })
  assert.deepEqual(benchStart('us'), { team: 'us', act: 'opslag', zone: 1 })
  assert.deepEqual(benchNext({ act: 'opslag', q: '!' }), { pending: { team: 'us', act: null, zone: null } })
  assert.deepEqual(benchNext({ act: 'aanval', q: '/' }), { point: 'them' })
  assert.deepEqual(benchNext({ act: 'receptie', q: '=' }), { point: 'them' })
})

test('blok: vertraagd -> eigen verdediging, touch out -> punt tegen', () => {
  assert.deepEqual(nextStep({ team: 'us', act: 'blok', q: '+' }), { pending: { team: 'us', act: 'verdediging', zone: null } })
  assert.deepEqual(nextStep({ team: 'us', act: 'blok', q: '-' }), { point: 'them' })
  assert.deepEqual(benchNext({ act: 'blok', q: '+' }), { pending: { team: 'us', act: 'verdediging', zone: null } })
})
