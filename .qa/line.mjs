import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:3000", { waitUntil: "load" });
await p.waitForTimeout(4200);
const g = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y-500), g); await p.waitForTimeout(900); }
// find the bright row
const shot = await p.screenshot();
const rows = await p.evaluate(async (url) => {
  const img = new Image(); img.src=url; await img.decode();
  const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
  const x=c.getContext("2d"); x.drawImage(img,0,0);
  const out=[];
  for(let y=0;y<img.height;y++){ const d=x.getImageData(150,y,1,1).data; out.push([y,d[0]+d[1]+d[2]]); }
  let best=null;
  for(let i=2;i<out.length-2;i++){ const jump=out[i][1]-((out[i-2][1]+out[i+2][1])/2); if(!best||jump>best[1]) best=[out[i][0],jump]; }
  return best;
}, "data:image/png;base64,"+shot.toString("base64"));
console.log("brightest row vs neighbours:", rows);
console.log(await p.evaluate((y) => {
  const el = document.elementFromPoint(150, y);
  const out=[]; let e=el;
  while(e && e!==document.body){ const cs=getComputedStyle(e);
    out.push(`${e.tagName}.${(e.className||"").toString().slice(0,60)} bg=${cs.backgroundColor} bt=${cs.borderTopWidth} ${cs.borderTopColor} h=${Math.round(e.getBoundingClientRect().height)}`);
    e=e.parentElement; }
  return out.join("\n");
}, rows[0]));
await b.close();
