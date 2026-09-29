import {useState} from 'react';
import {CompanyState,ProductKind,productDependencies,productDemand} from '../../game/state';
import {icon} from '../Company/Company';
const products:[ProductKind,string,string][]=[['phone','Смартфон','CPU + батарея'],['computer','Компьютер','CPU + GPU'],['server','Сервер','CPU + GPU'],['robot','Робот','CPU + GPU + батарея'],['satellite','Спутник','CPU + батарея']];
export default function Empire({s,update}:{s:CompanyState;update:any}){
 const [kind,setKind]=useState<ProductKind>('phone');
 const [name,setName]=useState('Genesis One');
 const deps=productDependencies(kind); const possible=deps.every(k=>s.protos.some(p=>p.kind===k));
 const launch=()=>{if(!possible||s.money<5000)return; const p={id:crypto.randomUUID(),kind,name:name||products.find(x=>x[0]===kind)![1],level:1,quality:Math.round(productDemand(s,kind)),demand:productDemand(s,kind),units:0,revenue:productDemand(s,kind),enabled:true};update((g:CompanyState)=>({...g,money:g.money-5000,products:[...g.products,p],logs:[...g.logs,`Запущен продукт «${p.name}». Его компоненты зависят от твоих технологий.`]}))};
 return <div className="space-y-3"><header><div className="text-mut text-xs">БИЗНЕС И ПРОИЗВОДСТВО</div><h1 className="text-2xl font-bold">Строй цепочку</h1></header>
  <div className="grid grid-cols-2 gap-2">{products.map(x=><button onClick={()=>setKind(x[0])} className={`card text-left ${kind===x[0]?'ring-1 ring-pri':''}`} key={x[0]}><div className="text-2xl">{icon(x[0])}</div><b>{x[1]}</b><div className="text-xs text-mut mt-1">{x[2]}</div></button>)}</div>
  <section className="card"><label className="text-sm text-mut">Название продукта</label><input value={name} onChange={e=>setName(e.target.value)} className="input mt-1"/>
   <div className="mt-3 text-sm"><b>Нужны:</b> {deps.map(k=><span key={k} className={`tag ${s.protos.some(p=>p.kind===k)?'tag-ok':''}`}>{k.toUpperCase()}</span>)}</div>
   <div className="text-sm text-mut mt-2">{possible?'Все необходимые технологии есть.':'Сначала создай недостающие прототипы — или выбери другой продукт.'}</div>
   <button disabled={!possible||s.money<5000} onClick={launch} className="btn mt-3 disabled:opacity-40">Запустить производство · $5 000</button>
  </section>
  <section className="card"><h2 className="font-semibold">Производственные направления</h2><div className="grid grid-cols-3 gap-2 mt-2">{[['electronics','Электроника'],['components','Компоненты'],['robotics','Роботы'],['telecom','Связь'],['space','Космос'],['energy','Энергия']].map(([k,n])=><button key={k} onClick={()=>update((g:CompanyState)=>g.money<10000?g:{...g,money:g.money-10000,factories:{...g.factories,[k]:(g.factories[k]||0)+1},logs:[...g.logs,`Открыто направление: ${n}.`]})} className="bg-black/20 rounded-xl p-3 text-left"><div className="text-xs">{n}</div><b>×{s.factories[k]||0}</b><div className="text-[10px] text-mut">$10k</div></button>)}</div></section>
  {s.products.map(p=><div className="card row" key={p.id}><span>{icon(p.kind)} {p.name}</span><span className="text-mut">{p.units} шт.</span></div>)}
 </div>
}
