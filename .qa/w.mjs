import { chromium } from "playwright";
const b = await chromium.launch();
const dir = "/private/tmp/claude-501/-Users-bytes-Documents-GitHub-foakhhusewebsite/7f38e426-b255-47ab-9608-e4468a5be428/scratchpad";
for (const w of [320, 390, 430, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: w<500?2:1 });
  const errs=[]; p.on("pageerror",e=>errs.push(String(e).slice(0,50)));
  await p.goto("http://localhost:3000", { waitUntil: "load" });
  await p.waitForTimeout(3400);
  const H=await p.evaluate(()=>document.body.scrollHeight); let ov=0;
  for (let y=0;y<H;y+=560){ await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(14);
    const o=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth); if(o>ov) ov=o; }
  const m=await p.evaluate(()=>[...document.querySelectorAll("span[aria-hidden='true']")]
    .filter(x=>getComputedStyle(x).writingMode.includes("vertical")&&x.offsetWidth>0)
    .slice(0,2).map(x=>`${x.textContent}:${Math.round(parseFloat(getComputedStyle(x).fontSize))}px`).join(" "));
  console.log(`${String(w).padStart(4)}px ov=${ov} ${m||"-"} err=${errs.length?errs[0]:"none"}`);
  if (w===390){ const y=await p.evaluate(()=>[...document.querySelectorAll("article")].filter(e=>/Duplex/.test(e.getAttribute("aria-label")||"")&&e.offsetHeight>0)[0].getBoundingClientRect().top+window.scrollY);
    for(let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y-60), y); await p.waitForTimeout(800);} 
    await p.screenshot({ path: `${dir}/big.png`, clip:{x:0,y:120,width:390,height:700} }); }
  await p.close();
}
await b.close();
