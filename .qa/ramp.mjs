import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:3000", { waitUntil: "load" });
await p.waitForTimeout(4200);
const loc = await p.evaluate(() => document.getElementById("location").getBoundingClientRect().top + window.scrollY);
for (let k=0;k<2;k++){ await p.evaluate(y=>window.scrollTo(0,y), loc-260); await p.waitForTimeout(800); }
const shot = await p.screenshot();
console.log(await p.evaluate(async (url) => {
  const img=new Image(); img.src=url; await img.decode();
  const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
  const x=c.getContext("2d"); x.drawImage(img,0,0);
  const at=y=>{const d=x.getImageData(10,y*2,1,1).data; return `${d[0]},${d[1]},${d[2]}`;};
  return [240,270,300,340,380,420,460,500].map(y=>`y${y}=${at(y)}`).join("  ");
}, "data:image/png;base64,"+shot.toString("base64")));
await p.screenshot({ path: "/private/tmp/claude-501/-Users-bytes-Documents-GitHub-foakhhusewebsite/7f38e426-b255-47ab-9608-e4468a5be428/scratchpad/ramp.png", clip: {x:0,y:220,width:390,height:360} });
await b.close();
