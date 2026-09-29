import {
 CompanyState,
 productProductionPerMinute,
 productSalesPerMinute
} from '../../game/state';

export default function Company({
 s,
 reset
}:{
 s:CompanyState;
 update:(f:(g:CompanyState)=>CompanyState)=>void;
 reset:()=>void;
}){
 const net=s.revenue-s.expenses;
 const activeProducts=s.products.filter(p=>p.enabled);
 const productionPerSecond=activeProducts.reduce(
  (total,p)=>total+productProductionPerMinute(s,p.kind)/60,
  0
 );
 const salesPerSecond=activeProducts.reduce(
  (total,p)=>total+productSalesPerMinute(s,p.kind,p.price)/60,
  0
 );
 const producedTotal=s.products.reduce((total,p)=>total+p.units,0);
 const soldTotal=s.products.reduce((total,p)=>total+p.sales,0);

 return (
  <div className="space-y-3">
   <header className="py-2">
    <div className="text-mut text-xs">TECH EMPIRE · GENESIS CORPORATION</div>
    <h1 className="text-2xl font-bold">Компания</h1>
   </header>

   <section className="card">
    <div className="text-mut text-sm">Текущий капитал</div>
    <div className="text-4xl font-bold">{money(s.money)}</div>
    <div className="grid grid-cols-2 gap-2 mt-4">
     <Stat label="Доход/сек" v={money(s.revenue)}/>
     <Stat label="Расходы/сек" v={money(s.expenses)}/>
     <Stat label="Чистая прибыль/сек" v={money(net)} positive={net>=0}/>
     <Stat label="Репутация" v={`${Math.round(s.reputation)}`}/>
     <Stat label="Производство/сек" v={`${rate(productionPerSecond)} шт.`}/>
     <Stat label="Продажи/сек" v={`${rate(salesPerSecond)} шт.`}/>
     <Stat label="Произведено всего" v={`${quantity(producedTotal)} шт.`}/>
     <Stat label="Продано всего" v={`${quantity(soldTotal)} шт.`}/>
    </div>
   </section>

   <section className="card">
    <h2 className="font-semibold">Активные продукты</h2>
    {activeProducts.length===0
     ?<div className="notice mt-3">💡 Создай первый продукт в разделе «Бизнес».</div>
     :<div className="mt-3 space-y-3">
       {activeProducts.map(p=>(
        <div className="border-b border-white/5 pb-3 last:border-0" key={p.id}>
         <div className="flex justify-between gap-2">
          <b>{icon(p.kind)} {p.name}</b>
          <span className="text-mut">{money(p.revenue)}/с</span>
         </div>
         <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <ProductStat label="Цена" value={money(p.price)}/>
          <ProductStat
            label="Производство/сек"
            value={`${rate(productProductionPerMinute(s,p.kind)/60)} шт.`}
           />
           <ProductStat
            label="Продажи/сек"
            value={`${rate(productSalesPerMinute(s,p.kind,p.price)/60)} шт.`}
           />
           <ProductStat
            label="Продажи/мин"
            value={`${quantity(productSalesPerMinute(s,p.kind,p.price))} шт.`}
          />
          <ProductStat label="Продано всего" value={`${quantity(p.sales)} шт.`}/>
          <ProductStat label="Доход/сек" value={`${money(p.revenue)}/с`}/>
          <ProductStat
           label="Прибыль/шт"
           value={money(p.profitPerUnit)}
           positive={p.profitPerUnit>=0}
          />
         </div>
        </div>
       ))}
      </div>
    }
   </section>

   <section className="card">
    <h2 className="font-semibold">Последние события</h2>
    {s.logs.slice(-5).reverse().map((entry,index)=>(
     <div key={`${entry}-${index}`} className="text-sm text-mut py-1 border-b border-white/5">
      {entry}
     </div>
    ))}
   </section>

   <button
    onClick={()=>confirm('Сбросить прогресс?')&&reset()}
    className="w-full text-xs text-mut py-3"
   >
    Начать заново
   </button>
  </div>
 );
}

function Stat({label,v,positive=true}:{label:string;v:string;positive?:boolean}){
 return (
  <div className="bg-black/20 rounded-xl p-2">
   <div className="text-[11px] text-mut">{label}</div>
   <b className={positive?'':'text-red-400'}>{v}</b>
  </div>
 );
}

function ProductStat({label,value,positive=true}:{label:string;value:string;positive?:boolean}){
 return (
  <div>
   <div className="text-xs text-mut">{label}</div>
   <b className={positive?'':'text-red-400'}>{value}</b>
  </div>
 );
}

function money(value:number){
 return `$${Math.round(value).toLocaleString('ru-RU')}`;
}

function quantity(value:number){
 return Math.round(value).toLocaleString('ru-RU');
}

function rate(value:number){
 return value.toLocaleString('ru-RU',{minimumFractionDigits:1,maximumFractionDigits:1});
}

export function icon(k:string){
 return ({phone:'📱',computer:'💻',server:'🖥️',robot:'🤖',satellite:'🛰️'} as Record<string,string>)[k]||'⚙️';
}
