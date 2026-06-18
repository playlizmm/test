#!/usr/bin/env node
/* =====================================================================
   build.js — สแกนไฟล์ .html ทั้งหมดใน repo (รวมโฟลเดอร์ย่อย) แล้วสร้าง
   pages.json — ใช้ตอน deploy (Cloudflare Pages build command: "node build.js")
   เพิ่มไฟล์ .html ใหม่เมื่อไหร่ เมนูจะแสดงให้อัตโนมัติ ไม่ต้องแก้โค้ด
   ===================================================================== */
const fs = require('fs');
const path = require('path');

// ไฟล์ที่ไม่ต้องการให้ขึ้นในเมนู (path แบบ relative ใช้ /)
const EXCLUDE = ['index.html'];
// โฟลเดอร์ที่ไม่ต้องสแกน
const SKIP_DIRS = ['.git', 'node_modules', '.github'];

const ICONS = ['⭐','📊','📝','🎬','🎵','🗳️','📅','💬','🏆','🎮','📷','🔔'];

function walk(dir){
  let out = [];
  for(const entry of fs.readdirSync(dir, {withFileTypes:true})){
    if(entry.name.startsWith('.') && entry.isDirectory()) continue;
    if(SKIP_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()){
      out = out.concat(walk(full));
    } else if(entry.name.toLowerCase().endsWith('.html')){
      out.push(full.replace(/^\.\//, ''));
    }
  }
  return out;
}

const files = walk('.')
  .map(f => f.split(path.sep).join('/'))
  .filter(f => !EXCLUDE.includes(f))
  .sort();

const pages = files.map((f, i) => {
  const html = fs.readFileSync(f, 'utf8');
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch  = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const title = titleMatch ? titleMatch[1].split('|')[0].trim() : path.basename(f, '.html');
  return {
    file:  f,
    title: title || f,
    desc:  descMatch ? descMatch[1] : ('ไฟล์ ' + f),
    icon:  ICONS[i % ICONS.length],
    tag:   'Page'
  };
});

fs.writeFileSync('pages.json', JSON.stringify(pages, null, 2));
console.log('✓ Generated pages.json with ' + pages.length + ' page(s):');
pages.forEach(p => console.log('  - ' + p.file + ' → ' + p.title));
