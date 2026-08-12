import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:3000", { waitUntil: "load" });
await p.waitForTimeout(4200);
const loc = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
for (const off of [-1600, -1250, -900, -600, -300]) {
  for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y), loc+off); await p.waitForTimeout(750); }
  const shot = await p.screenshot();
  const hit = await p.evaluate(async (url) => {
    const img=new Image(); img.src=url; await img.decode();
    const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
    const x=c.getContext("2d"); x.drawImage(img,0,0);
    const rowAvg=(y)=>{const d=x.getImageData(0,y,img.width,1).data; let s=0,n=0,mn=999,mx=-1;
      for(let i=0;i<d.length;i+=8){const v=d[i]+d[i+1]+d[i+2]; s+=v;n++; if(v<mn)mn=v; if(v>mx)mx=v;} return [s/n, mx-mn];};
    const out=[];
    for(let y=90;y<img.height-6;y++){ const [a,spread]=rowAvg(y);
      const [b1]=rowAvg(y-4), [b2]=rowAvg(y+4);
      if(spread<90 && a-(b1+b2)/2>45) out.push([y, Math.round(a-(b1+b2)/2)]); }
    return out.slice(0,4);
  }, "data:image/png;base64,"+shot.toString("base64"));
  console.log(`offset ${off}:`, hit.length?JSON.stringify(hit):"none");
  if (hit.length) {
    console.log(await p.evaluate((y) => {
      const out=[]; let e=document.elementFromPoint(195,y);
      while(e&&e!==document.body){ const cs=getComputedStyle(e);
        out.push(`${e.tagName}.${(e.className||"").toString().slice(0,62)} bg=${cs.backgroundColor} bt=${cs.borderTopWidth} bb=${cs.borderBottomWidth} ${cs.borderTopColor}`); e=e.parentElement;}
      return out.join("\n");
    }, hit[0][0]));
    break;
  }
}
await b.close();
