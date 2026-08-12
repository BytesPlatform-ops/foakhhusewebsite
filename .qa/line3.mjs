import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:3000", { waitUntil: "load" });
await p.waitForTimeout(4200);
const loc = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
for (const off of [-1500, -1100, -750]) {
  for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y), loc+off); await p.waitForTimeout(800); }
  const shot = await p.screenshot();
  const hit = await p.evaluate(async (url) => {
    const img=new Image(); img.src=url; await img.decode();
    const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
    const x=c.getContext("2d"); x.drawImage(img,0,0);
    const lum=[]; for(let y=0;y<img.height;y++){const d=x.getImageData(150,y,1,1).data; lum.push(d[0]+d[1]+d[2]);}
    const out=[];
    for(let y=3;y<lum.length-3;y++){ const nb=(lum[y-3]+lum[y+3])/2; if(lum[y]-nb>60) out.push([y, Math.round(lum[y]-nb)]); }
    return out.slice(0,6);
  }, "data:image/png;base64,"+shot.toString("base64"));
  if (hit.length) {
    console.log(`offset ${off}: bright rows`, JSON.stringify(hit));
    console.log(await p.evaluate((y) => {
      const out=[]; let e=document.elementFromPoint(150,y);
      while(e&&e!==document.body){ const cs=getComputedStyle(e);
        out.push(`${e.tagName}.${(e.className||"").toString().slice(0,60)} bg=${cs.backgroundColor} bt=${cs.borderTopWidth} bb=${cs.borderBottomWidth}`); e=e.parentElement;}
      return out.join("\n");
    }, hit[0][0]));
    break;
  } else console.log(`offset ${off}: none`);
}
await b.close();
