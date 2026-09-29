import {CompanyState} from '../../game/state';
export default function Company({s,update,reset}:{s:CompanyState;update:any;reset:()=>void}){
 const net=s.revenue-s.expenses;
 return <div className="space-y-3">
  <header className="py-2"><div className="text-mut text-xs">TECH EMPIRE · GENESIS CORPORATION</div><h1 className="text-2xl font-bold">Компания</h1></header>
  <section className="card"><div className="text-mut text-sm">Капитал</div><div className="text-4xl font-bold">${Math.round(s.money).toLocaleString('ru-RU')}</div>
   <div className="grid grid-cols-3 gap-2 mt-4"><Stat label="Доход/сек" v={`$${Math.round(s.revenue)}`}/><Stat label="Расход/сек" v={`$${Math.round(s.expenses)}`}/><Stat label="Репутация" v={`${Math.round(s.reputation)}`}/></div></section>
  <section className="card"><h2 className="font-semibold">Что происходит</h2><p className="text-mut text-sm mt-1">Ты не проходишь уровни — ты сам решаешь, какой бизнес строить и какие технологии связывать.</p>
   <div className="mt-3 space-y-2">{s.products.length===0?<div className="notice">💡 Создай первый продукт в разделе «Бизнес».</div>:s.products.map(p=><div className="row" key={p.id}><span>{icon(p.kind)} {p.name}</span><span className="text-ok">+${Math.round(p.revenue)}/с</span></div>)}</div>
  </section>
  <section className="card"><h2 className="font-semibold">Последние события</h2>{s.logs.slice(-5).reverse().map((x,i)=><div key={i} className="text-sm text-mut py-1 border-b border-white/5">{x}</div>)}</section>
  <button onClick={()=>confirm('Сбросить прогресс?')&&reset()} className="w-full text-xs text-mut py-3">Начать заново</button>
 </div>
}
function Stat({label,v}:{label:string;v:string}){return <div className="bg-black/20 rounded-xl p-2"><div className="text-[11px] text-mut">{label}</div><b>{v}</b></div>}
export function icon(k:string){return ({phone:'📱',computer:'💻',server:'🖥️',robot:'🤖',satellite:'🛰️'} as any)[k]||'⚙️'}
