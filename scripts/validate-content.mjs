import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const dir='src/content/nodes'; const validTypes=new Set(['movie','series','book','author','director','person','character','concept','movement','essay','history','technology','culture']);
const errors=[]; const nodes=[];
function parseValue(v){v=v.trim(); if(v==='')return undefined; if(v.startsWith('[')) return [...v.matchAll(/"([^"]+)"|'([^']+)'/g)].map(m=>m[1]||m[2]); if(/^\d+$/.test(v)) return Number(v); return v.replace(/^['"]|['"]$/g,'');}
for(const file of await readdir(dir)){ if(!/\.mdx?$/.test(file)) continue; const text=await readFile(path.join(dir,file),'utf8'); const m=text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/); if(!m){errors.push(`${file}: frontmatter ausente`); continue;} const data={}; for(const line of m[1].split('\n')){ if(!line.trim()||line.trim().startsWith('#')) continue; const i=line.indexOf(':'); if(i<0) continue; data[line.slice(0,i).trim()]=parseValue(line.slice(i+1)); } nodes.push({file,data,body:m[2]});
 for(const k of ['title','slug','type','description','status','createdAt','updatedAt']) if(!data[k]) errors.push(`${file}: falta ${k}`);
 if(data.slug&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) errors.push(`${file}: slug inválido`);
 if(data.type&&!validTypes.has(data.type)) errors.push(`${file}: type inválido ${data.type}`);
 if(data.status&&!['draft','published'].includes(data.status)) errors.push(`${file}: status inválido`);
 for(const k of ['tags','relatedNodes']) if(!Array.isArray(data[k])) errors.push(`${file}: ${k} debe ser lista`);
}
const slugFiles=new Map(); for(const n of nodes){ if(!n.data.slug) continue; if(slugFiles.has(n.data.slug)) errors.push(`slug duplicado "${n.data.slug}": ${slugFiles.get(n.data.slug)} y ${n.file}`); slugFiles.set(n.data.slug,n.file); }
const slugs=new Set(slugFiles.keys());
for(const n of nodes){ for(const rel of n.data.relatedNodes||[]) if(!slugs.has(rel)) errors.push(`${n.file}: relatedNodes apunta a slug inexistente "${rel}"`); for(const match of n.body.matchAll(/\]\((\/archivo\/[^)#?\s]+)[^)]*\)/g)){ const slug=match[1].replace(/^\/archivo\//,'').replace(/\/$/,''); if(!slugs.has(slug)) errors.push(`${n.file}: enlace interno roto ${match[1]}`); }}
if(errors.length){ console.error('Validación de contenido falló:\n- '+errors.join('\n- ')); process.exit(1); }
console.log(`Validación OK: ${nodes.length} nodos, ${slugs.size} slugs únicos.`);
