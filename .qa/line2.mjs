import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:3000", { waitUntil: "load" });
await p.waitForTimeout(4200);
const g = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
// put the boundary at screen y=300
for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y), g-300); await p.waitForTimeout(900); }
const shot = await p.screenshot();
const res = await p.evaluate(async (url) => {
  const img=new Image(); img.src=url; await img.decode();
  const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
  const x=c.getContext("2d"); x.drawImage(img,0,0);
  const rows=[];
  for(let y=270;y<340;y++){ const d=x.getImageData(150,y,1,1).data; rows.push(`${y}:${d[0]},${d[1]},${d[2]}`); }
  return rows;
}, "data:image/png;base64,"+shot.toString("base64"));
console.log(res.join("  "));
console.log("--- element at the boundary ---");
console.log(await p.evaluate(() => {
  const out=[]; let e=document.elementFromPoint(150,301);
  while(e&&e!==document.body){ const cs=getComputedStyle(e);
    out.push(`${e.tagName}.${(e.className||"").toString().slice(0,55)} bg=${cs.backgroundColor} bt=${cs.borderTopWidth}`); e=e.parentElement;}
  return out.join("\n");
}));
await b.close();
