import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await p.goto("http://localhost:3000", { waitUntil: "load" });
await p.waitForTimeout(4200);
const loc = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y), loc-420); await p.waitForTimeout(800); }
await p.screenshot({ path: "/private/tmp/claude-501/-Users-bytes-Documents-GitHub-foakhhusewebsite/7f38e426-b255-47ab-9608-e4468a5be428/scratchpad/look.png", clip: { x: 0, y: 240, width: 390, height: 340 } });
await b.close();
