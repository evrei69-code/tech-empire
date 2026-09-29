import {useState} from 'react';
import {DESIGNS,Kind,check} from '../../data/designs';
import {CompanyState,TEST_COST} from '../../game/state';
const ICON=['❌','⚠️','✅'];
export default function Lab({s,update}:{s:CompanyState;update:any}){
 const [kind,setKind]=useState<Kind>('cpu'); const [tested,setTested]=useState<string|null>(null);
 const d=DESIGNS[kind],p=s.params[kind],out=d.calc(p,s.techs),sig=kind+JSON.stringify(p),rows=d.targets.map(t=>({t,st:check(t,out[t.k])}));
 const passed=tested===sig&&rows.every(r=>r.st>0);
 const setP=(k:string,v:number)=>update((g:CompanyState)=>({...g,params:{...g.params,[kind]:{...g.params[kind],[k]:v}}}));
 const test=()=>{if(s.money<TEST_COST)return;update((g:CompanyState)=>({...g,money:g.money-TEST_COST}));setTested(sig)};
 const accept=()=>{const score=Math.round((out.perf+out.rel+Math.max(0,100-out.temp)+Math.max(0,100-out.cost/2))/4);update((g:CompanyState)=>({...g,protos:[...g.protos,{name:`G-${d.name} ${g.protos.filter(x=>x.kind===kind).length+1}`,kind,out,score,createdAt:Date.now()}],logs:[...g.logs,`Прототип ${d.name} принят. Теперь он может стать частью других продуктов.`]}));setTested(null)};
 return <div className="space-y-3"><header><div className="text-mut text-xs">ЛАБОРАТОРИЯ</div><h1 className="text-2xl font-bold">Проектируй технологии</h1></header>
 <div className="flex gap-2">{(Object.keys(DESIGNS) as Kind[]).map(k=><button key={k} onClick={()=>setKind(k)} className={`flex-1 rounded-xl py-2 text-xs ${k===kind?'bg-pri':'bg-card'}`}>{DESIGNS[k].icon} {DESIGNS[k].name}</button>)}</div>
 <section className="card">{d.params.map(pr=><label key={pr.k} className="block mb-3 text-xs text-mut">{pr.label}: <b className="text-white">{p[pr.k]}</b><input className="w-full accent-pri" type="range" min={pr.min} max={pr.max} step={pr.step} value={p[pr.k]} onChange={e=>setP(pr.k,+e.target.value)}/></label>)}
 {d.hints(out,p).map(h=><div key={h} className="text-xs text-warn mb-1">⚠️ {h}</div>)}<button onClick={test} disabled={s.money<TEST_COST} className="btn mt-2 disabled:opacity-40">Тест прототипа · $2 000</button></section>
 {tested===sig&&<section className="card">{rows.map(({t,st})=><div className="row text-sm py-1" key={t.k}><span>{ICON[st]} {t.label}</span><b>{Math.round(out[t.k])} <span className="text-mut">{t.op}{t.v}</span></b></div>)}<button onClick={accept} disabled={!passed} className="btn mt-3 bg-ok text-black disabled:opacity-40">Принять технологию</button>{!passed&&<div className="text-xs text-mut mt-2">Неудачный тест не бесполезен: измени параметры и попробуй снова.</div>}</section>}
 <section className="card"><h2 className="font-semibold">Твои технологии</h2>{s.protos.length?s.protos.map((x,i)=><div className="row text-sm py-2 border-b border-white/5" key={i}><span>{DESIGNS[x.kind].icon} {x.name}</span><span className="text-mut">качество {x.score}</span></div>):<p className="text-sm text-mut mt-1">Пока нет. Создай первую — она станет компонентом будущих продуктов.</p>}</section>
 </div>
}
