import {CompanyState} from '../../game/state';
const fields=[
 ['arch','Архитектура процессоров','Улучшает производительность CPU'],
 ['semis','Полупроводники','Снижает стоимость CPU/GPU'],
 ['materials','Новые материалы','Улучшает охлаждение и надёжность'],
 ['battery','Химия батарей','Повышает ёмкость'],
 ['comms','Связь','Основа спутниковой сети'],
 ['ai','ИИ','Улучшает продукты и роботов'],
 ['distributedSystems','Распределённые системы','Необходимы для серверов'],
 ['orbitalSystems','Орбитальные системы','Необходимы для спутников']
] as const;
export default function Science({
 s,
 update
}:{
 s:CompanyState;
 update:(f:(g:CompanyState)=>CompanyState)=>void;
}){
 return <div className="space-y-3"><header><div className="text-mut text-xs">НАУКА</div><h1 className="text-2xl font-bold">Решай реальные проблемы</h1></header>
 <div className="notice">Наука здесь не «уровень 7». Она меняет формулы технологий. Исследование можно выбирать по своему пути.</div>
 {fields.map(([id,n,d])=>{const lvl=s.techs[id]||0,cost=5000*(lvl+1);return <section className="card row" key={id}><div><b>{n}</b><div className="text-xs text-mut mt-1">{d} · уровень {lvl}</div></div><button disabled={s.money<cost||lvl>=5} onClick={()=>update((g:CompanyState)=>({...g,money:g.money-cost,techs:{...g.techs,[id]:lvl+1},logs:[...g.logs,`Исследование «${n}» дало практический результат.`]}))} className="smallbtn disabled:opacity-40">{lvl>=5?'MAX':`$${(cost/1000).toFixed(0)}k`}</button></section>})}
 </div>
}
