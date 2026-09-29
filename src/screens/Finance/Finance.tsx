import {CompanyState} from '../../game/state';

const PRODUCT_LAUNCH_INVESTMENT=5000;
const FACTORY_INVESTMENT=10000;

export default function Finance({s}:{s:CompanyState}){
 const netFlow=s.revenue-s.expenses;
 const factoryCount=Object.values(s.factories).reduce(
  (total,count)=>total+Math.max(0,count),
  0
 );
 const productAssets=s.products.length*PRODUCT_LAUNCH_INVESTMENT;
 const factoryAssets=factoryCount*FACTORY_INVESTMENT;
 const assets=productAssets+factoryAssets;
 const valuation=s.money+assets;

 return (
  <div className="space-y-3">
   <header>
    <div className="text-mut text-xs">ФИНАНСЫ</div>
    <h1 className="text-2xl font-bold">Финансовая панель</h1>
   </header>

   <section className="card">
    <div className="text-mut text-sm">Общая оценка компании</div>
    <div className="text-3xl font-bold">{money(valuation)}</div>
   </section>

   <section className="card space-y-3">
    <Metric label="Баланс" value={money(s.money)}/>
    <Metric label="Доход/сек" value={money(s.revenue)}/>
    <Metric label="Расходы/сек" value={money(s.expenses)}/>
    <Metric
     label="Чистый денежный поток/сек"
     value={money(netFlow)}
     positive={netFlow>=0}
    />
    <Metric label="Стоимость активов" value={money(assets)}/>
   </section>

   <section className="card">
    <h2 className="font-semibold">Оценка активов</h2>
    <div className="space-y-2 mt-3 text-sm">
     <Metric label="Запущенные продуктовые линии" value={money(productAssets)}/>
     <Metric label="Фабрики" value={money(factoryAssets)}/>
    </div>
    <p className="text-xs text-mut mt-3">
     Оценка основана на стоимости запуска продуктовых линий и приобретения фабрик.
    </p>
   </section>
  </div>
 );
}

function Metric({
 label,
 value,
 positive=true
}:{
 label:string;
 value:string;
 positive?:boolean;
}){
 return (
  <div className="row">
   <span className="text-mut">{label}</span>
   <b className={positive?'':'text-red-400'}>{value}</b>
  </div>
 );
}

function money(value:number){
 return `$${Math.round(value).toLocaleString('ru-RU')}`;
}
