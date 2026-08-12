import { chromium } from "playwright";
const b = await chromium.launch();
for (const dpr of [2, 3]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dpr });
  await p.goto("http://localhost:3000", { waitUntil: "load" });
  await p.waitForTimeout(4200);
  const loc = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
  for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y), loc-300); await p.waitForTimeout(800); }
  const shot = await p.screenshot();
  const hit = await p.evaluate(async ({url, dpr}) => {
    const img=new Image(); img.src=url; await img.decode();
    const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
    const x=c.getContext("2d"); x.drawImage(img,0,0);
    const rowAvg=(y)=>{const d=x.getImageData(0,y,img.width,1).data; let s=0,n=0;
      for(let i=0;i<d.length;i+=16){s+=d[i]+d[i+1]+d[i+2];n++;} return s/n;};
    const out=[];
    const around = Math.round(300*dpr);
    for(let y=around-40*dpr;y<around+40*dpr;y++){
      const a=rowAvg(y), b1=rowAvg(y-3), b2=rowAvg(y+3);
      if(a-(b1+b2)/2>25) out.push([y, Math.round(a-(b1+b2)/2)]);
    }
    return out.slice(0,5);
  }, {url: "data:image/png;base64,"+shot.toString("base64"), dpr});
  console.log(`DPR ${dpr}:`, hit.length ? JSON.stringify(hit) : "no seam");
  await p.close();
}
await b.close();
