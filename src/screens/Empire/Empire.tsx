import {useState} from 'react';
import {
  CompanyState,
  FactoryKind,
  ProductKind,
  PRODUCT_CONFIG,
  getProductAvailability,
  launchProduct,
  productDemand,
  productProductionPerMinute,
  factoryCount,
  productQuality,
  productReferencePrice,
  productSalesPerMinute,
  productUnitCost
} from '../../game/state';
import {Kind} from '../../data/designs';
import {icon} from '../Company/Company';

const products:[ProductKind,string,string][]=[
  ['phone',PRODUCT_CONFIG.phone.name,'CPU + батарея'],
  ['computer',PRODUCT_CONFIG.computer.name,'CPU + GPU'],
  ['server',PRODUCT_CONFIG.server.name,'CPU + GPU'],
  ['robot',PRODUCT_CONFIG.robot.name,'CPU + GPU + батарея'],
  ['satellite',PRODUCT_CONFIG.satellite.name,'CPU + батарея']
];

const factories:{kind:FactoryKind;name:string}[]=[
  {kind:'electronics',name:'Электроника'},
  {kind:'components',name:'Компоненты'},
  {kind:'robotics',name:'Робототехника'},
  {kind:'telecom',name:'Связь'},
  {kind:'space',name:'Космос'},
  {kind:'energy',name:'Энергия'}
];

const factoryNames:Record<FactoryKind,string>={
  electronics:'Электроника',
  components:'Компоненты',
  energy:'Энергия',
  robotics:'Робототехника',
  telecom:'Связь',
  space:'Космос'
};

const FACTORY_PRICE=10000;

export default function Empire({
  s,
  update
}:{
  s:CompanyState;
  update:(f:(g:CompanyState)=>CompanyState)=>void;
}){
  const [kind,setKind]=useState<ProductKind>('phone');
  const selected=s.products.find(p=>p.kind===kind);
  const availability=getProductAvailability(s,kind);
  const quality=productQuality(s,kind);
  const referencePrice=productReferencePrice(kind);
  const price=selected?.price??referencePrice;
  const demand=productDemand(s,kind,price);
  const productionPerMinute=productProductionPerMinute(s,kind);
  const unitCost=productUnitCost(s,kind);
  const profit=price-unitCost;

  const launch=()=>{
    const productId=crypto.randomUUID();
    update(g=>launchProduct(g,kind,productId));
  };

  const toggleProduct=(productId:string)=>{
    update(g=>({
      ...g,
      products:g.products.map(product=>
        product.id===productId
          ?{...product,enabled:!product.enabled}
          :product
      )
    }));
  };

  const changePrice=(value:number)=>{
    if(!selected)return;
    const safePrice=Number.isFinite(value)?Math.max(0,value):referencePrice;

    update(g=>({
      ...g,
      products:g.products.map(p=>
        p.id===selected.id
          ?{
            ...p,
            price:safePrice,
            demand:productDemand(g,p.kind,safePrice),
            profitPerUnit:safePrice-p.unitCost
          }
          :p
      )
    }));
  };

  return (
    <div className="space-y-3">
      <header>
        <div className="text-mut text-xs">БИЗНЕС И ПРОИЗВОДСТВО</div>
        <h1 className="text-2xl font-bold">Рынок</h1>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {products.map(x=>{
          const launched=s.products.some(product=>product.kind===x[0]);
          const productAvailability=getProductAvailability(s,x[0]);
          return (
            <button
              key={x[0]}
              onClick={()=>setKind(x[0])}
              className={`card text-left ${kind===x[0]?'ring-1 ring-pri':''}`}
            >
              <div className="text-2xl">{icon(x[0])}</div>
              <b>{x[1]}</b>
              <div className="text-xs text-mut mt-1">{x[2]}</div>
              {!launched&&(
                <div className={`text-xs mt-1 ${productAvailability.available?'text-ok':'text-warn'}`}>
                  {productAvailability.available?'Доступен':'Заблокирован'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!selected?(
        <section className="card">
          <h2 className="font-semibold">Новый продукт</h2>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Stat label="Качество" value={`${quality}/100`}/>
            <Stat label="Цена" value={`$${referencePrice}`}/>
            <Stat label="Себестоимость" value={`$${unitCost}`}/>
            <Stat label="Прибыль / шт." value={`$${profit}`}/>
          </div>

          <ProductRequirements s={s} kind={kind}/>

          <div className="text-sm text-mut mt-3">
            {availability.available
              ?`Спрос: ${demand} шт./мин. Все требования выполнены.`
              :'Выполни требования для запуска продукта.'}
          </div>

          <button
            disabled={!availability.available}
            onClick={launch}
            className="btn mt-3 disabled:opacity-40"
          >
            Запустить · ${PRODUCT_CONFIG[kind].launchCost.toLocaleString('ru-RU')}
          </button>
        </section>
      ):(
        <section className="card">
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-mut">ПРОДУКТ</div>
              <h2 className="text-lg font-semibold">{selected.name}</h2>
            </div>
            <div className="text-2xl">{icon(selected.kind)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Stat label="Качество" value={`${selected.quality}/100`}/>
            <Stat label="Цена" value={`$${Math.round(selected.price)}`}/>
            <Stat label="Себестоимость" value={`$${Math.round(unitCost)}`}/>
            <Stat label="Прибыль / шт." value={`$${Math.round(selected.price-unitCost)}`}/>
            <Stat label="Спрос" value={`${Math.round(demand)} шт./мин.`}/>
            <Stat label="Производство" value={`${Math.round(productionPerMinute)} шт./мин.`}/>
            <Stat label="Продано всего" value={`${Math.round(selected.sales)} шт.`}/>
            <Stat
              label="Фактические продажи"
              value={`${Math.round(selected.enabled?productSalesPerMinute(s,selected.kind,selected.price):0)} шт./мин.`}
            />
            <Stat label="Доход" value={`$${Math.round(selected.enabled?selected.revenue:0)}/сек`}/>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-mut">
              <span>Цена</span>
              <b className="text-white">${Math.round(selected.price)}</b>
            </div>
            <input
              className="w-full accent-pri"
              type="range"
              min={Math.round(referencePrice*0.5)}
              max={Math.round(referencePrice*2)}
              step={10}
              value={selected.price}
              onChange={e=>changePrice(+e.target.value)}
            />
          </div>

          <div className="notice mt-3">💡 Цена влияет на спрос.</div>
        </section>
      )}

      <section className="card">
        <h2 className="font-semibold">Производство</h2>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {factories.map(({kind:factory,name})=>(
            <div
              key={factory}
              className="bg-black/20 rounded-xl p-3"
            >
              <div className="flex justify-between gap-2">
                <span className="text-xs font-medium">{name}</span>
                <b>×{factoryCount(s,factory)}</b>
              </div>
              <p className="text-[10px] text-mut mt-2">
                Каждая фабрика добавляет +12 шт./мин. выпуска продуктам, которым нужно это направление.
              </p>
              <p className="text-[10px] text-mut mt-1">
                Вклад в общую скидку на себестоимость (максимум 35%).
              </p>
              <p className="text-[10px] text-mut mt-1">
                Следующая фабрика: ${FACTORY_PRICE.toLocaleString('ru-RU')}
              </p>
              <button
                type="button"
                disabled={s.money<FACTORY_PRICE}
                onClick={()=>
                  update(g=>
                    g.money<FACTORY_PRICE
                      ?g
                      :{
                        ...g,
                        money:g.money-FACTORY_PRICE,
                        factories:{
                          ...g.factories,
                          [factory]:(g.factories[factory]||0)+1
                        },
                        logs:[...g.logs,`Открыта фабрика «${name}».`]
                      }
                  )
                }
                className="smallbtn mt-2 w-full disabled:opacity-40"
              >
                Купить фабрику
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Запущенные продукты</h2>
        {s.products.length===0
          ?<p className="text-sm text-mut">Запусти продукт, чтобы начать продажи.</p>
          :s.products.map(p=>(
            <div className="border-b border-white/5 pb-3 last:border-0" key={p.id}>
              <div className="flex justify-between">
                <span>{icon(p.kind)} {p.name}</span>
                <span className={p.enabled?'text-ok':'text-mut'}>
                  {p.enabled?`+$${Math.round(p.revenue)}/с`:'$0/с'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 gap-3">
                <span className={`text-xs ${p.enabled?'text-ok':'text-mut'}`}>
                  {p.enabled?'Работает':'Остановлен'}
                </span>
                <button
                  type="button"
                  onClick={()=>toggleProduct(p.id)}
                  className="smallbtn"
                >
                  {p.enabled?'Остановить':'Запустить'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <div className="text-mut">Цена</div>
                  <b>${Math.round(p.price)}</b>
                </div>
                <div>
                  <div className="text-mut">Продано всего</div>
                  <b>{Math.round(p.sales)} шт.</b>
                </div>
                <div>
                  <div className="text-mut">Продажи</div>
                  <b>{Math.round(p.enabled?productSalesPerMinute(s,p.kind,p.price):0)} шт./мин.</b>
                </div>
                <div>
                  <div className="text-mut">Прибыль</div>
                  <b className={p.profitPerUnit<0?'text-red-400':''}>
                    ${Math.round(p.profitPerUnit)}
                  </b>
                </div>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}

function Stat({label,value}:{label:string;value:string}){
  return (
    <div className="bg-black/20 rounded-xl p-2">
      <div className="text-[11px] text-mut">{label}</div>
      <b>{value}</b>
    </div>
  );
}

function ProductRequirements({s,kind}:{s:CompanyState;kind:ProductKind}){
  const config=PRODUCT_CONFIG[kind];
  const availability=getProductAvailability(s,kind);
  const prototypes:Record<Kind,string>={
    cpu:'CPU',
    gpu:'GPU',
    battery:'Батарея'
  };
  const requirementRows=[
    ...(config.previousProduct?[{
      label:`${PRODUCT_CONFIG[config.previousProduct].name} запущен`,
      met:availability.missingPreviousProduct===null
    }]:[]),
    ...config.prototypeRequirements.map(prototype=>({
      label:prototypes[prototype],
      met:!availability.missingPrototypes.includes(prototype)
    })),
    ...config.factoryRequirements.map(factory=>({
      label:factoryNames[factory],
      met:!availability.missingFactories.includes(factory)
    })),
    ...config.techRequirements.map(tech=>({
      label:`${tech.name} Lv.${tech.level}`,
      met:!availability.missingTechs.some(missing=>missing.key===tech.key)
    })),
    {
      label:`$${config.launchCost.toLocaleString('ru-RU')}`,
      met:!availability.missingMoney
    }
  ];

  return (
    <div className="mt-3 rounded-xl bg-black/20 p-3">
      <b className="text-sm">Требования для запуска</b>
      <div className="mt-2 space-y-1">
        {requirementRows.map(({label,met},index)=>(
          <div className="flex justify-between text-xs" key={`${label}-${index}`}>
            <span>{label}</span>
            <span className={met?'text-ok':'text-warn'}>
              {met?'✓':'✗'}
            </span>
          </div>
        ))}
      </div>
      {!availability.available&&(
        <p className="text-xs text-warn mt-2">
          Требования не выполнены — запуск недоступен.
        </p>
      )}
    </div>
  );
}
