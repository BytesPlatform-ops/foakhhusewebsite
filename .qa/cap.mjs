import { chromium } from "playwright";
const b = await chromium.launch();
const dir = "/private/tmp/claude-501/-Users-bytes-Documents-GitHub-foakhhusewebsite/7f38e426-b255-47ab-9608-e4468a5be428/scratchpad";
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:3001", { waitUntil: "load" });
await p.waitForTimeout(4000);
for (const name of ["Elegant", "Sonder"]) {
  const y = await p.evaluate((n) => [...document.querySelectorAll("article")]
    .filter(e => new RegExp(n).test(e.getAttribute("aria-label")||"") && e.offsetHeight>0)[0]
    .getBoundingClientRect().top + window.scrollY, name);
  for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y-110), y); await p.waitForTimeout(900); }
  await p.screenshot({ path: `${dir}/cp-${name}.png`, clip:{x:0,y:60,width:390,height:120} });
}
console.log("blur on collection capsules:", await p.evaluate(() =>
  [...document.querySelectorAll('[aria-current], .sticky button')].filter(e=>e.tagName==="BUTTON"&&e.closest(".sticky"))
    .map(e=>`${e.textContent.trim()}:${getComputedStyle(e).backdropFilter}`).join(" | ")));
await b.close();
