#!/usr/bin/env node
// 허들링 디자인 하네스 판정 스크립트 (judge). 외부 패키지 없음.
// 사용법:
//   node scripts/judge.js ref <id>          S1 후 G-ref
//   node scripts/judge.js spec <id>         S2 후 G-spec
//   node scripts/judge.js system            S3 system-builder 후 G-token (system/components.html)
//   node scripts/judge.js screen <id>       S4 G-token · G-N1 · G-N2 · G1 · G-field
//   node scripts/judge.js snapshot          에이전트 호출 전 파일 해시 기록
//   node scripts/judge.js boundary <agent>  에이전트 호출 후 편집 폴더 밖 변경 검사
//   node scripts/judge.js --selftest        V1·V2 자기 테스트
// 종료 코드: 0 통과, 1 실패, 2 사용법 오류
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(p, 'utf8');
const loadRules = root => JSON.parse(read(path.join(root, 'rules/rules.json')));
const result = violations => ({ pass: violations.length === 0, violations });

// ---------- HTML 파서 (최소) ----------
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

function parseAttrs(s) {
  const attrs = {};
  const re = /([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(s))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}

function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null };
  const styles = [];
  html = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => { styles.push(css); return ''; })
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g;
  let cur = root;
  let m;
  while ((m = re.exec(html))) {
    if (m[4] !== undefined) { cur.children.push({ tag: '#text', text: m[4], parent: cur }); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) {
      let n = cur;
      while (n !== root && n.tag !== tag) n = n.parent;
      if (n !== root) cur = n.parent;
      continue;
    }
    const selfClose = /\/\s*$/.test(m[3]);
    const node = { tag, attrs: parseAttrs(m[3].replace(/\/\s*$/, '')), children: [], parent: cur };
    cur.children.push(node);
    if (!VOID.has(tag) && !selfClose) cur = node;
  }
  return { root, styles };
}

function elements(root) {
  const out = [];
  (function walk(n) { for (const c of n.children) if (c.tag !== '#text') { out.push(c); walk(c); } })(root);
  return out;
}
const textOf = n => (n.tag === '#text' ? n.text : n.children.map(textOf).join(''));
function closest(n, pred) {
  for (let p = n; p && p.tag !== '#root'; p = p.parent) if (pred(p)) return p;
  return null;
}
const label = n => `<${n.tag}${n.attrs['data-component'] ? ` data-component="${n.attrs['data-component']}"` : ''}>`;

// ---------- CSS ----------
function cssDecls(css, origin) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim();
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':');
      if (i < 0) continue;
      out.push({
        selector, origin,
        prop: d.slice(0, i).trim().toLowerCase(),
        value: d.slice(i + 1).trim().toLowerCase().replace(/\s*!important$/, ''),
      });
    }
  }
  return out;
}

// 로컬 스타일시트를 못 찾으면 조용히 넘기지 않고 missing에 담는다.
function collectDecls(htmlPath, doc) {
  const decls = [];
  const missing = [];
  doc.styles.forEach(css => decls.push(...cssDecls(css, path.basename(htmlPath))));
  for (const n of elements(doc.root)) {
    if (n.tag === 'link' && /stylesheet/i.test(n.attrs.rel || '') && n.attrs.href && !/^(https?:)?\/\//.test(n.attrs.href)) {
      const href = n.attrs.href.replace(/[?#].*$/, '');
      const p = href.startsWith('/') ? path.join(ROOT, href) : path.resolve(path.dirname(htmlPath), href);
      if (fs.existsSync(p)) decls.push(...cssDecls(read(p), path.relative(ROOT, p)));
      else missing.push(n.attrs.href);
    }
    if (n.attrs.style) decls.push(...cssDecls(`[inline] { ${n.attrs.style} }`, `inline ${label(n)}`).map(d => ({ ...d, node: n })));
  }
  return { decls, missing };
}

// 선택자 목록(a, b)을 나눠서 본다. 그룹 선택자 하나로 예외가 번지지 않게.
const selectorParts = s => s.split(',').map(x => x.trim()).filter(Boolean);
const matchesComp = (d, c) => d.node?.attrs['data-component'] === c;
const anyPartHas = (d, comps) => comps.some(c => matchesComp(d, c)) || selectorParts(d.selector).some(p => comps.some(c => p.includes(c)));
const everyPartHas = (d, comps) => comps.some(c => matchesComp(d, c)) || selectorParts(d.selector).every(p => comps.some(c => p.includes(c)));

const NAMED_COLORS = new Set(['black', 'white', 'red', 'blue', 'green', 'gray', 'grey', 'yellow', 'orange', 'purple', 'pink', 'silver', 'navy', 'teal', 'maroon', 'lime', 'aqua', 'fuchsia', 'olive', 'brown', 'cyan', 'magenta']);
const normHex = h => (h.length === 4 ? '#' + [...h.slice(1)].map(c => c + c).join('') : h);

function colorsIn(value) {
  const v = value.replace(/url\([^)]*\)/g, '');
  const out = [...v.matchAll(/#[0-9a-f]{3,8}\b/g)].map(m => normHex(m[0]));
  out.push(...[...v.matchAll(/rgba?\([^)]*\)/g)].map(m => m[0].replace(/\s+/g, '')));
  for (const w of v.split(/[\s,()"']+/)) if (NAMED_COLORS.has(w)) out.push(w);
  return out;
}

// var()는 정의하는 곳에서 검사하므로 사용처에서는 뺀다.
const numbers = value => [...value.replace(/var\([^)]*\)/g, '').matchAll(/(-?\d*\.?\d+)(px|rem|em|%|vh|vw|pt)?/g)]
  .map(m => ({ n: parseFloat(m[1]), unit: m[2] || '' }));

const isRadius = p => p.includes('radius');
const isFontSize = p => p === 'font-size' || /^--(font-size|fs)/.test(p);
const isFontWeight = p => p === 'font-weight' || /^--(font-weight|fw)/.test(p);
const isSpacing = p => /^(margin|padding)(-|$)|^(gap|row-gap|column-gap)$|^--(space|spacing)/.test(p);
const isShadow = (p, v) => p === 'box-shadow' || p === 'text-shadow' || /^--shadow/.test(p) || /drop-shadow/.test(v);

// ---------- 게이트 ----------
function gateToken(htmlPath, doc, rules) {
  const v = [];
  const allowColors = new Set(rules.color_allow.map(c => c.toLowerCase()));
  const accent = rules.accent;
  const { decls, missing } = collectDecls(htmlPath, doc);
  for (const href of missing) v.push(`스타일시트를 찾을 수 없음: ${href}`);

  // 액센트를 가리키는 변수 이름을 별칭까지 따라가며 모은다 (--brand: var(--color-accent) 등).
  const accentVars = new Set(accent.vars);
  const refsAccent = val => colorsIn(val).includes(accent.hex) || [...accentVars].some(name => val.includes(`var(${name}`));
  for (let grew = true; grew;) {
    grew = false;
    for (const d of decls) if (d.prop.startsWith('--') && !accentVars.has(d.prop) && refsAccent(d.value)) { accentVars.add(d.prop); grew = true; }
  }

  for (const d of decls) {
    const where = `${d.origin} ${d.selector} { ${d.prop} }`;
    for (const c of colorsIn(d.value)) if (!allowColors.has(c)) v.push(`허용 밖 색 ${c} — ${where}`);

    if (d.prop === 'font') v.push(`font 단축 속성 금지 (판정 불가) — ${where}`);
    if (isRadius(d.prop)) for (const { n, unit } of numbers(d.value)) {
      const ok = n === 0 || (unit === 'px' && rules.radius_allow_px.includes(n)) || (unit === '%' && rules.radius_allow_pct.includes(n));
      if (!ok) v.push(`허용 밖 모서리 ${n}${unit} — ${where}`);
    }
    if (isFontSize(d.prop)) for (const { n, unit } of numbers(d.value)) {
      if (!(unit === 'px' && rules.font_size_allow_px.includes(n))) v.push(`허용 밖 글자 크기 ${n}${unit} — ${where}`);
    }
    if (isFontWeight(d.prop)) {
      const w = { normal: 400, bold: 700 }[d.value] ?? Number(d.value);
      if (!d.value.startsWith('var(') && !rules.font_weight_allow.includes(w)) v.push(`허용 밖 굵기 ${d.value} — ${where}`);
    }
    if (isSpacing(d.prop)) for (const { n, unit } of numbers(d.value)) {
      const ok = n === 0 || unit === '%' || (unit === 'px' && rules.spacing_allow_px.includes(n));
      if (!ok) v.push(`허용 밖 간격 ${n}${unit} — ${where}`);
    }
    if (d.prop === 'line-height' && /(^|[\s,>+~])h[1-6]\b|heading|display/.test(d.selector) && !d.value.startsWith('var(')) {
      if (!rules.heading_line_height.includes(Number(d.value))) v.push(`헤딩 행간 ${d.value} — ${where}`);
    }
    if (d.prop === 'letter-spacing' && !['0', '0px', '0em', 'normal'].includes(d.value)) v.push(`letter-spacing ${d.value} — ${where}`);
    if (d.prop === 'text-transform' && d.value === 'uppercase') v.push(`대문자 변환 — ${where}`);
    if (isShadow(d.prop, d.value) && !['none', '0', 'initial'].includes(d.value) && !everyPartHas(d, rules.shadow.allowed_components)) {
      v.push(`그림자 금지 — ${where}`);
    }
    if (refsAccent(d.value) && !d.prop.startsWith('--')) {
      if (anyPartHas(d, accent.forbidden_components)) v.push(`액센트 금지 컴포넌트 — ${where}`);
      else if (!everyPartHas(d, accent.components)) v.push(`액센트는 ${accent.components.join('/')} 전용 — ${where}`);
    }
  }

  const els = elements(doc.root);
  const accentEls = els.filter(n => accent.components.includes(n.attrs['data-component']));
  if (accentEls.length > accent.max_per_screen) v.push(`액센트 요소 ${accentEls.length}개 > ${accent.max_per_screen}`);

  const mk = rules.marking;
  for (const n of els) {
    if (n.tag === 'section' && !(mk.section_attr in n.attrs)) v.push(`마킹 누락: <section>에 ${mk.section_attr} 없음`);
    if (mk.control_tags.includes(n.tag) && n.attrs.type !== 'hidden' && !closest(n, p => mk.control_attr in p.attrs)) {
      v.push(`마킹 누락: <${n.tag}>에 ${mk.control_attr} 없음`);
    }
  }
  return result(v);
}

function roleOk(n, rules) {
  const holder = closest(n, p => 'data-role-only' in p.attrs);
  if (!holder) return false;
  const roles = holder.attrs['data-role-only'].split(/[\s,]+/).filter(Boolean);
  return roles.length > 0 && roles.every(r => rules.N1.allowed_roles.includes(r));
}

function gateN1(doc, rules) {
  const v = [];
  for (const n of elements(doc.root)) {
    const ownText = n.children.filter(c => c.tag === '#text').map(c => c.text).join('');
    const hit = rules.N1.texts.find(t => ownText.includes(t)) || rules.N1.values.find(val => n.attrs.value === val);
    if (hit && !roleOk(n, rules)) v.push(`"${hit}"가 ${rules.N1.allowed_roles.join('/')} 전용 표시(data-role-only) 없이 노출 — ${label(n)}`);
  }
  return result(v);
}

function gateN2(doc, rules) {
  const v = [];
  const { field, private_value: pv, private_label: pl } = rules.N2;
  const isPrivate = n => n.attrs.value === pv || n.attrs['data-value'] === pv || textOf(n).trim() === pl;
  const els = elements(doc.root);
  // data-field 마킹이 빠져도 공개 범위 값(private/member_only/sale_requested)을 가진 컨트롤이면 검사한다.
  const isVisValue = n => rules.N2.option_values.includes(n.attrs.value ?? n.attrs['data-value']);
  const inField = n => closest(n, p => p.attrs['data-field'] === field);

  for (const sel of els.filter(n => n.tag === 'select')) {
    const opts = elements(sel).filter(n => n.tag === 'option');
    if (!inField(sel) && !opts.some(isVisValue)) continue;
    const chosen = opts.find(o => 'selected' in o.attrs) || opts[0];
    if (!chosen || !isPrivate(chosen)) v.push(`${field} 기본 선택이 "${chosen ? textOf(chosen).trim() : '없음'}" (≠ ${pl})`);
  }
  const radios = els.filter(n => ((n.tag === 'input' && n.attrs.type === 'radio') || n.attrs.role === 'radio') && (inField(n) || isVisValue(n)));
  const groups = new Map();
  for (const r of radios) {
    const key = r.attrs.name || closest(r, p => p.attrs.role === 'radiogroup') || inField(r) || 'default';
    groups.set(key, [...(groups.get(key) || []), r]);
  }
  for (const group of groups.values()) {
    const checked = group.filter(n => 'checked' in n.attrs || n.attrs['aria-checked'] === 'true');
    if (checked.length !== 1 || !isPrivate(checked[0])) v.push(`${field} 라디오 기본 선택이 ${pl} 1개가 아님`);
  }
  return result(v);
}

function gateG1(doc, rules) {
  const v = [];
  const refs = elements(doc.root).filter(n => n.tag === 'section' && n.attrs['data-ref']).map(n => n.attrs['data-ref']);
  if (!refs.length) return result(['data-ref가 달린 섹션 0개']);
  const counts = {};
  for (const r of refs) counts[r] = (counts[r] || 0) + 1;
  const own = rules.G1.own_value;
  const external = Object.keys(counts).filter(r => r !== own);
  for (const r of external) {
    const share = counts[r] / refs.length;
    if (share > rules.G1.max_share_one_ref) v.push(`${r} 비율 ${Math.round(share * 100)}% > ${rules.G1.max_share_one_ref * 100}%`);
  }
  if (external.length < rules.G1.refs_used_min) v.push(`사용한 ref ${external.length}개 < ${rules.G1.refs_used_min}`);
  return result(v);
}

function sectionItems(md, heading) {
  const part = md.split(new RegExp(`^## ${heading}\\s*$`, 'm'))[1];
  if (part === undefined) return null;
  return part.split(/^## /m)[0].split('\n')
    .map(l => l.match(/^\s*[-*]\s+(.+)$/)).filter(Boolean).map(m => m[1].replace(/`/g, '').trim());
}
const specFields = md => (sectionItems(md, '필드') || []).map(s => (s.match(/[A-Z][A-Za-z]*\.[a-z_]+/) || [])[0]).filter(Boolean);

function gateField(doc, specMd) {
  const present = new Set(elements(doc.root).map(n => n.attrs['data-field']).filter(Boolean));
  const fields = specFields(specMd);
  if (!fields.length) return result(['spec에 ## 필드 항목 0개']);
  return result(fields.filter(f => !present.has(f)).map(f => `data-field="${f}" 누락`));
}

function prdModel(root) {
  const md = read(path.join(root, 'docs/prd.md'));
  const sec = (md.split(/^## 8\./m)[1] || '').split(/^## 9\./m)[0];
  const model = {};
  for (const part of sec.split(/^### /m).slice(1)) {
    const head = part.split('\n')[0];
    if (/Phase|미사용/.test(head)) continue;
    const block = (part.match(/```txt\n([\s\S]*?)```/) || [])[1] || '';
    model[head.trim().split(/\s/)[0]] = new Set(block.split('\n').map(l => l.trim())
      .filter(l => l && !l.startsWith('#')).map(l => l.split(':')[0].trim()));
  }
  return model;
}

function gateSpec(specMd, rules, root) {
  const v = [];
  const model = prdModel(root);
  const fields = specFields(specMd);
  if (!fields.length) v.push('## 필드 항목 0개');
  for (const f of fields) {
    const [ent, name] = f.split('.');
    if (!model[ent]) v.push(`${f}: MVP 데이터 모델에 ${ent} 없음`);
    else if (!model[ent].has(name)) v.push(`${f}: prd.md §8 ${ent}에 없는 필드`);
  }
  const enumAll = new Set(Object.values(rules.status_enum).flat());
  for (const s of sectionItems(specMd, '상태') || []) if (!enumAll.has(s)) v.push(`상태 라벨 "${s}"는 status_enum 밖`);
  return result(v);
}

function gateRef(refsMd, rules) {
  const v = [];
  const g = rules.G_ref;
  const refs = (sectionItems(refsMd, '레퍼런스') || []).map(s => s.split('|').map(x => x.trim()));
  const ids = new Set(refs.map(r => r[0]));
  if (refs.length < g.refs_min) v.push(`레퍼런스 ${refs.length}개 < ${g.refs_min}`);
  const apps = new Set(refs.map(r => (r[1] || '').toLowerCase()).filter(Boolean));
  if (apps.size < g.distinct_apps_min) v.push(`서로 다른 앱 ${apps.size}개 < ${g.distinct_apps_min}`);
  for (const r of refs) {
    if (!/^R\d+$/.test(r[0] || '')) v.push(`레퍼런스 ID 형식 오류: "${r.join(' | ')}"`);
    if (!(r[2] || '').includes(g.url_must_contain)) v.push(`${r[0]}: ${g.url_must_contain} URL 없음`);
  }
  const patterns = (sectionItems(refsMd, '패턴') || []).map(s => s.split('|').map(x => x.trim()));
  if (!patterns.length) v.push('## 패턴 항목 0개');
  for (const p of patterns) {
    const cited = (p[1] || '').split(/[\s,]+/).filter(Boolean);
    if (!cited.length) v.push(`${p[0]}: 출처 ref ID 없음`);
    for (const c of cited) if (!ids.has(c)) v.push(`${p[0]}: 없는 ref ${c}`);
  }
  return result(v);
}

function screenGates(htmlPath, specMd, rules) {
  const doc = parseHtml(read(htmlPath));
  return {
    'G-token': gateToken(htmlPath, doc, rules),
    'G-N1': gateN1(doc, rules),
    'G-N2': gateN2(doc, rules),
    'G1': gateG1(doc, rules),
    'G-field': gateField(doc, specMd),
  };
}

// ---------- 폴더 경계 ----------
const SKIP = new Set(['.git', 'node_modules', 'state', 'reports', '.DS_Store']);
function hashTree(root) {
  const out = {};
  (function rec(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) rec(p);
      else out[path.relative(root, p)] = crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
    }
  })(root);
  return out;
}

function boundaryCheck(before, after, folder) {
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(f => before[f] !== after[f]);
  return result(changed.filter(f => !f.startsWith(folder + '/') || f === 'system/APPROVED').map(f => `편집 폴더(${folder}/) 밖 변경: ${f}`));
}

// ---------- 출력 ----------
function writeReport(id, gates) {
  const file = path.join(ROOT, 'reports', `${id}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(read(file)) : { id, gates: {} };
  Object.assign(prev.gates, gates);
  prev.updated_at = new Date().toISOString();
  prev.pass = Object.values(prev.gates).every(g => g.pass);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(prev, null, 2) + '\n');
}

function print(id, gates) {
  let ok = true;
  for (const [name, g] of Object.entries(gates)) {
    ok = ok && g.pass;
    console.log(`${g.pass ? '✅' : '❌'} ${name} ${id}${g.pass ? '' : ` — 위반 ${g.violations.length}건`}`);
    g.violations.slice(0, 5).forEach(x => console.log(`   · ${x}`));
  }
  return ok;
}

function need(p) {
  if (!fs.existsSync(p)) { console.error(`파일 없음: ${path.relative(ROOT, p)}`); process.exit(2); }
  return p;
}

// ---------- 자기 테스트 (V1·V2) ----------
function selftest() {
  const rules = loadRules(ROOT);
  const fx = path.join(ROOT, 'tests/fixtures');
  const specMd = read(path.join(fx, 'spec.md'));
  const expected = JSON.parse(read(path.join(fx, 'expected.json')));
  let bad = 0;
  const check = (name, gotFails, wantFails) => {
    const same = gotFails.length === wantFails.length && gotFails.every(g => wantFails.includes(g));
    if (!same) bad++;
    console.log(`${same ? '✅' : '❌'} ${name}: 실패 게이트 [${gotFails.join(', ')}]${same ? '' : ` — 기대 [${wantFails.join(', ')}]`}`);
  };

  for (const [file, want] of Object.entries(expected.screens)) {
    const gates = screenGates(path.join(fx, file), specMd, rules);
    check(file, Object.keys(gates).filter(k => !gates[k].pass), want);
  }
  for (const [file, want] of Object.entries(expected.refs)) {
    check(file, gateRef(read(path.join(fx, file)), rules).pass ? [] : ['G-ref'], want);
  }
  for (const [file, want] of Object.entries(expected.specs)) {
    check(file, gateSpec(read(path.join(fx, file)), rules, ROOT).pass ? [] : ['G-spec'], want);
  }

  // V2: 임시 폴더에서 경계 검사
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-'));
  fs.mkdirSync(path.join(tmp, 'specs'));
  fs.mkdirSync(path.join(tmp, 'screens'));
  fs.writeFileSync(path.join(tmp, 'specs/a.md'), 'a');
  fs.writeFileSync(path.join(tmp, 'screens/a.html'), 'a');
  let snap = hashTree(tmp);
  fs.writeFileSync(path.join(tmp, 'screens/a.html'), 'changed by planner');
  check('boundary: planner가 screens/ 수정', boundaryCheck(snap, hashTree(tmp), rules.boundary.planner).pass ? [] : ['boundary'], ['boundary']);
  snap = hashTree(tmp);
  fs.writeFileSync(path.join(tmp, 'specs/b.md'), 'b');
  check('boundary: planner가 specs/ 추가', boundaryCheck(snap, hashTree(tmp), rules.boundary.planner).pass ? [] : ['boundary'], []);
  fs.rmSync(tmp, { recursive: true, force: true });

  console.log(bad ? `\n자기 테스트 실패 ${bad}건` : '\n자기 테스트 전부 통과');
  return bad === 0;
}

// ---------- CLI ----------
function main() {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === '--selftest') process.exit(selftest() ? 0 : 1);

  const rules = loadRules(ROOT);
  const needId = () => {
    if (!arg) { console.error(`사용법: judge.js ${cmd} <id>`); process.exit(2); }
    if (!rules.screens.includes(arg)) { console.error(`모르는 화면 ID: ${arg} (rules.json screens 참고)`); process.exit(2); }
    return arg;
  };
  let id;
  let gates;
  switch (cmd) {
    case 'ref':
      id = needId();
      gates = { 'G-ref': gateRef(read(need(path.join(ROOT, 'refs', `${id}.md`))), rules) };
      break;
    case 'spec':
      id = needId();
      gates = { 'G-spec': gateSpec(read(need(path.join(ROOT, 'specs', `${id}.md`))), rules, ROOT) };
      break;
    case 'system': {
      id = 'system';
      const p = need(path.join(ROOT, 'system/components.html'));
      gates = { 'G-token': gateToken(p, parseHtml(read(p)), rules) };
      break;
    }
    case 'screen':
      id = needId();
      gates = screenGates(need(path.join(ROOT, 'screens', `${id}.html`)), read(need(path.join(ROOT, 'specs', `${id}.md`))), rules);
      break;
    case 'snapshot': {
      const file = path.join(ROOT, 'state/.snapshot.json');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(hashTree(ROOT)));
      console.log('snapshot 저장: state/.snapshot.json');
      return;
    }
    case 'boundary': {
      const folder = rules.boundary[arg];
      if (!folder) { console.error(`사용법: judge.js boundary <${Object.keys(rules.boundary).join('|')}>`); process.exit(2); }
      const before = JSON.parse(read(need(path.join(ROOT, 'state/.snapshot.json'))));
      const g = boundaryCheck(before, hashTree(ROOT), folder);
      process.exit(print(arg, { boundary: g }) ? 0 : 1);
    }
    default:
      console.error('사용법: judge.js ref|spec|screen <id> · system · snapshot · boundary <agent> · --selftest');
      process.exit(2);
  }
  writeReport(id, gates);
  process.exit(print(id, gates) ? 0 : 1);
}

main();
