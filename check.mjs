// Self-check for the game logic in index.html. Run: node game/check.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const src = html.split("/*logic*/")[1].split("/*/logic*/")[0];
const { deal, buildPool, maxImposters, parseCustom, points, turnOrder, CATS, CUSTOM } =
  new Function(src + ";return {deal,buildPool,maxImposters,parseCustom,points,turnOrder,CATS,CUSTOM}")();

assert.deepEqual(points(4, [2], true), [1, 1, 0, 1]);
assert.deepEqual(points(4, [2], false), [0, 0, 2, 0]);
assert.deepEqual(turnOrder(4, 2), [2, 3, 0, 1]);

for (const [c, ws] of Object.entries(CATS)) assert.equal(new Set(ws.map(w => w.toLowerCase())).size, ws.length, `duplicate in ${c}`);

const pool = buildPool(Object.keys(CATS), "");
for (let i = 0; i < 1000; i++) {
  const g = deal(7, 3, pool);
  assert.equal(new Set(g.imposters).size, 3);
  assert.ok(g.imposters.every(x => x >= 0 && x < 7) && g.starter >= 0 && g.starter < 7);
  assert.ok(CATS[g.cat].includes(g.word));
}
assert.equal(maxImposters(3), 1);
assert.equal(deal(3, 5, pool).imposters.length, 1);

const small = [{ cat: "x", word: "a" }, { cat: "x", word: "b" }];
for (let i = 0; i < 50; i++) assert.equal(deal(4, 1, small, ["a"]).word, "b");
assert.ok(["a", "b"].includes(deal(4, 1, small, ["a", "b"]).word));

assert.deepEqual(parseCustom(" chai, chai\nsamosa,, jalebi "), ["chai", "samosa", "jalebi"]);
assert.equal(buildPool([CUSTOM], "a,b").length, 0);
assert.equal(buildPool([CUSTOM], "a,b,c").length, 3);

console.log(`ok — ${pool.length} words in ${Object.keys(CATS).length} categories`);
