import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:3000", { waitUntil: "load" });
await p.waitForTimeout(4200);
const loc = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y), loc-300); await p.waitForTimeout(800); }
console.log(await p.evaluate(() => {
  const res = [];
  for (const y of [258, 260, 262]) {
    const out = []; let e = document.elementFromPoint(195, y);
    while (e && e !== document.body) { const cs = getComputedStyle(e);
      out.push(`${e.tagName}.${(e.className||"").toString().slice(0,58)} bg=${cs.backgroundColor} bb=${cs.borderBottomWidth} ${cs.borderBottomColor}`);
      e = e.parentElement; }
    res.push(`y=${y}\n  ` + out.join("\n  "));
  }
  return res.join("\n");
}));
await b.close();
