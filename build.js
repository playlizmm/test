#!/usr/bin/env node
/* =====================================================================
   build.js — สแกนไฟล์ .html ทั้งหมดใน repo แล้วสร้าง pages.json
   ใช้ตอน deploy (Cloudflare Pages build command: "node build.js")
   เพิ่มไฟล์ .html ใหม่เมื่อไหร่ เมนูจะแสดงให้อัตโนมัติ ไม่ต้องแก้โค้ด
   ===================================================================== */
const fs = require('fs');

// ไฟล์ที่ไม่ต้องการให้ขึ้นในเมนู
const EXCLUDE = ['index.html'];

const ICONS = ['⭐','📊','📝','🎬','🎵','🗳️','📅','💬','🏆','🎮','📷','🔔'];

const files = fs.readdirSync('.')
  .filter(f => f.toLowerCase().endsWith('.html') && !EXCLUDE.includes(f))
  .sort();

const pages = files.map((f, i) => {
  const html = fs.readFileSync(f, 'utf8');
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch  = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const title = titleMatch ? titleMatch[1].split('|')[0].trim() : f.replace(/\.html$/i, '');
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
