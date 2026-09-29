import {DESIGNS, Kind, Params, Out} from '../data/designs';

export type ProductKind='phone'|'computer'|'server'|'robot'|'satellite';
export type FactoryKind='electronics'|'components'|'energy'|'robotics'|'telecom'|'space';

export interface TechRequirement{
 key:string;
 name:string;
 level:number;
}

export interface ProductConfig{
 kind:ProductKind;
 name:string;
 previousProduct:ProductKind|null;
 prototypeRequirements:Kind[];
 techRequirements:TechRequirement[];
 factoryRequirements:FactoryKind[];
 launchCost:number;
}

export const PRODUCT_CONFIG:Record<ProductKind,ProductConfig>={
 phone:{
  kind:'phone',
  name:'Смартфон',
  previousProduct:null,
  prototypeRequirements:['cpu','battery'],
  techRequirements:[],
  factoryRequirements:['electronics','components'],
  launchCost:5000
 },
 computer:{
  kind:'computer',
  name:'Компьютер',
  previousProduct:'phone',
  prototypeRequirements:['cpu','gpu'],
  techRequirements:[
   {key:'arch',name:'Архитектура',level:1},
   {key:'semis',name:'Полупроводники',level:1}
  ],
  factoryRequirements:['electronics','components'],
  launchCost:5000
 },
 server:{
  kind:'server',
  name:'Сервер',
  previousProduct:'computer',
  prototypeRequirements:['cpu','gpu'],
  techRequirements:[
   {key:'semis',name:'Полупроводники',level:1},
   {key:'materials',name:'Материалы',level:1},
   {key:'distributedSystems',name:'Распределённые системы',level:1}
  ],
  factoryRequirements:['components','energy'],
  launchCost:5000
 },
 robot:{
  kind:'robot',
  name:'Робот',
  previousProduct:'server',
  prototypeRequirements:['cpu','gpu','battery'],
  techRequirements:[
   {key:'ai',name:'ИИ',level:1},
   {key:'materials',name:'Материалы',level:1}
  ],
  factoryRequirements:['robotics','components','energy'],
  launchCost:5000
 },
 satellite:{
  kind:'satellite',
  name:'Спутник',
  previousProduct:'robot',
  prototypeRequirements:['cpu','battery'],
  techRequirements:[
   {key:'comms',name:'Связь',level:2},
   {key:'orbitalSystems',name:'Орбитальные системы',level:1}
  ],
  factoryRequirements:['space','components','energy','telecom'],
  launchCost:5000
 }
};

export interface Product {
 id:string;
 kind:ProductKind;
 name:string;
 level:number;
 quality:number;
 demand:number;
 units:number;
 sales:number;
 price:number;
 unitCost:number;
 profitPerUnit:number;
 revenue:number;
 enabled:boolean;
}

export interface CompanyState {
 v:3;
 money:number;
 revenue:number;
 expenses:number;
 reputation:number;
 tick:number;
 techs:Record<string,number>;
 params:Record<Kind,Params>;
 protos:Proto[];
 products:Product[];
 factories:Record<string,number>;
 projects:Project[];
 logs:string[];
 unlockedFields:string[];
}

export interface Proto{
 name:string;
 kind:Kind;
 out:Out;
 score:number;
 createdAt:number;
}

export interface Project{
 id:string;
 name:string;
 kind:string;
 progress:number;
 cost:number;
 description:string;
 done:boolean;
}

export const KEY='tech-empire-ts-2';
export const TEST_COST=2000;

export const newGame=():CompanyState=>({
 v:3,
 money:50000,
 revenue:0,
 expenses:0,
 reputation:50,
 tick:0,
 techs:{},
 protos:[],
 params:{
  cpu:{...DESIGNS.cpu.def},
  gpu:{...DESIGNS.gpu.def},
  battery:{...DESIGNS.battery.def}
 },
 products:[],
 factories:{
  electronics:0,
  components:0,
  energy:0,
  robotics:0,
  telecom:0,
  space:0
 },
 projects:[],
 logs:['Компания основана. Начните с продукта, а не с «прохождения уровней».'],
 unlockedFields:['electronics']
});

const PRODUCT_KINDS:ProductKind[]=[
 'phone','computer','server','robot','satellite'
];
const MAX_ECONOMIC_VALUE=Number.MAX_SAFE_INTEGER;

function isRecord(value:unknown):value is Record<string,unknown>{
 return typeof value==='object'&&value!==null&&!Array.isArray(value);
}

function finiteNumber(value:unknown,fallback:number){
 return typeof value==='number'&&Number.isFinite(value)
  ?Math.max(-MAX_ECONOMIC_VALUE,Math.min(MAX_ECONOMIC_VALUE,value))
  :fallback;
}

function nonNegativeNumber(value:unknown,fallback:number){
 return Math.max(0,finiteNumber(value,fallback));
}

function migrateParams(defaults:Params,value:unknown):Params{
 const params={...defaults};
 if(!isRecord(value))return params;
 for(const [key,entry] of Object.entries(value)){
  if(typeof entry==='number'&&Number.isFinite(entry))params[key]=entry;
 }
 return params;
}

function isProductKind(kind:unknown):kind is ProductKind{
 return typeof kind==='string'&&PRODUCT_KINDS.includes(kind as ProductKind);
}

function migrateProduct(value:unknown,index:number):Product|undefined{
 if(!isRecord(value)||!isProductKind(value.kind))return undefined;
 const kind=value.kind;
 const price=nonNegativeNumber(value.price,productReferencePrice(kind));
 const unitCost=nonNegativeNumber(value.unitCost,productBaseCost(kind));
 const units=nonNegativeNumber(value.units,0);
 const sales=nonNegativeNumber(value.sales,0);

 return {
  id:typeof value.id==='string'?value.id:`product-${index}`,
  kind,
  name:typeof value.name==='string'?value.name:kind,
  level:nonNegativeNumber(value.level,1),
  quality:Math.min(100,nonNegativeNumber(value.quality,50)),
  demand:nonNegativeNumber(value.demand,productBaseDemand(kind)),
  units,
  sales,
  price,
  unitCost,
  profitPerUnit:finiteNumber(value.profitPerUnit,price-unitCost),
  revenue:nonNegativeNumber(value.revenue,0),
  enabled:typeof value.enabled==='boolean'?value.enabled:true
 };
}

export function migrate(raw:unknown):CompanyState{
 const initial=newGame();
 if(!isRecord(raw)||(raw.v!==2&&raw.v!==3))return initial;

 const params=isRecord(raw.params)?raw.params:{};
 const factories=isRecord(raw.factories)?raw.factories:{};
 const migratedProducts=Array.isArray(raw.products)
  ?raw.products.map(migrateProduct).filter((p):p is Product=>p!==undefined)
  :[];

 return {
  ...initial,
  money:finiteNumber(raw.money,initial.money),
  revenue:nonNegativeNumber(raw.revenue,initial.revenue),
  expenses:nonNegativeNumber(raw.expenses,initial.expenses),
  reputation:Math.max(0,Math.min(100,finiteNumber(raw.reputation,initial.reputation))),
  tick:nonNegativeNumber(raw.tick,initial.tick),
  techs:isRecord(raw.techs)?raw.techs as Record<string,number>:initial.techs,
  params:{
   cpu:migrateParams(initial.params.cpu,params.cpu),
   gpu:migrateParams(initial.params.gpu,params.gpu),
   battery:migrateParams(initial.params.battery,params.battery)
  },
  protos:Array.isArray(raw.protos)?raw.protos as Proto[]:initial.protos,
  products:migratedProducts,
  factories:{
   ...initial.factories,
   ...Object.fromEntries(
    Object.entries(factories).map(([key,value])=>[
     key,
     nonNegativeNumber(value,0)
    ])
   )
  },
  projects:Array.isArray(raw.projects)?raw.projects as Project[]:initial.projects,
  logs:Array.isArray(raw.logs)
   ?raw.logs.filter((entry):entry is string=>typeof entry==='string')
   :initial.logs,
  unlockedFields:Array.isArray(raw.unlockedFields)
   ?raw.unlockedFields.filter((entry):entry is string=>typeof entry==='string')
   :initial.unlockedFields
 };
}

export const loadGame=():CompanyState=>{
 try{
  return migrate(JSON.parse(localStorage.getItem(KEY)||'null'));
 }catch{
  return newGame();
 }
};

export const saveGame=(s:CompanyState)=>{
 try{
  localStorage.setItem(KEY,JSON.stringify(s));
 }catch{}
};

export function getProto(s:CompanyState,kind:Kind){
 return [...s.protos].reverse().find(x=>x.kind===kind);
}

export function productDependencies(kind:ProductKind){
 return PRODUCT_CONFIG[kind].prototypeRequirements;
}

export function productFactoryDependencies(kind:ProductKind):FactoryKind[]{
 return PRODUCT_CONFIG[kind].factoryRequirements;
}

export function factoryCount(s:CompanyState,kind:FactoryKind){
 return nonNegativeNumber(s.factories[kind],0);
}

export interface ProductAvailability{
 available:boolean;
 missingPreviousProduct:ProductKind|null;
 missingPrototypes:Kind[];
 missingTechs:TechRequirement[];
 missingFactories:FactoryKind[];
 missingMoney:boolean;
}

export function getProductAvailability(
 s:CompanyState,
 kind:ProductKind
):ProductAvailability{
 const config=PRODUCT_CONFIG[kind];
 const missingPreviousProduct=config.previousProduct!==null&&
  !s.products.some(product=>product.kind===config.previousProduct)
  ?config.previousProduct
  :null;
 const missingPrototypes=config.prototypeRequirements.filter(
  required=>!s.protos.some(proto=>proto.kind===required)
 );
 const missingTechs=config.techRequirements.filter(
  required=>{
   const level=s.techs[required.key];
   return !Number.isFinite(level)||level<required.level;
  }
 );
 const missingFactories=config.factoryRequirements.filter(
  required=>factoryCount(s,required)<1
 );
 const missingMoney=!Number.isFinite(s.money)||s.money<config.launchCost;

 return {
  available:missingPreviousProduct===null&&
   missingPrototypes.length===0&&
   missingTechs.length===0&&
   missingFactories.length===0&&
   !missingMoney,
  missingPreviousProduct,
  missingPrototypes,
  missingTechs,
  missingFactories,
  missingMoney
 };
}

export function launchProduct(
 s:CompanyState,
 kind:ProductKind,
 productId:string
):CompanyState{
 const availability=getProductAvailability(s,kind);
 if(!availability.available)return s;

 const config=PRODUCT_CONFIG[kind];
 const quality=productQuality(s,kind);
 const referencePrice=productReferencePrice(kind);
 const unitCost=productUnitCost(s,kind);
 const product:Product={
  id:productId,
  kind,
  name:config.name,
  level:1,
  quality,
  demand:productDemand(s,kind,referencePrice),
  units:0,
  sales:0,
  price:referencePrice,
  unitCost,
  profitPerUnit:referencePrice-unitCost,
  revenue:0,
  enabled:true
 };

 return {
  ...s,
  money:s.money-config.launchCost,
  products:[...s.products,product],
  logs:[...s.logs,`Запущен продукт «${product.name}».`]
 };
}

export function productBaseDemand(kind:ProductKind){
 return {
  phone:80,
  computer:38,
  server:25,
  robot:18,
  satellite:8
 }[kind];
}

export function productReferencePrice(kind:ProductKind){
 return {
  phone:699,
  computer:999,
  server:2499,
  robot:4999,
  satellite:99999
 }[kind];
}

export function productBaseCost(kind:ProductKind){
 return {
  phone:320,
  computer:520,
  server:1350,
  robot:2900,
  satellite:55000
 }[kind];
}

export function productQuality(s:CompanyState,kind:ProductKind){
 const deps=productDependencies(kind);

 if(!deps.length)return 50;

 const scores=deps.map(k=>{
  const p=getProto(s,k);
  return p?Math.max(0,Math.min(100,finiteNumber(p.score,45))):45;
 });

 const average=scores.reduce((a,b)=>a+b,0)/scores.length;

 return Math.max(10,Math.min(100,Math.round(average)));
}

export function productDemand(s:CompanyState,kind:ProductKind,price?:number){
 const quality=productQuality(s,kind);
 const reference=productReferencePrice(kind);
 const actualPrice=nonNegativeNumber(price,reference);

 const qualityFactor=0.55+(quality/100)*0.9;
 const reputationFactor=0.75+Math.max(0,Math.min(100,finiteNumber(s.reputation,50)))/200;

 const priceRatio=reference/Math.max(1,actualPrice);
 const priceFactor=Math.max(
  0.15,
  Math.min(2.2,Math.pow(priceRatio,1.35))
 );

 return Math.max(
  0,
  Math.round(
   productBaseDemand(kind)*
   qualityFactor*
   reputationFactor*
   priceFactor
  )
 );
}

export function productCapacity(s:CompanyState,kind:ProductKind){
 const dependencies=productFactoryDependencies(kind);
 if(dependencies.some(factory=>factoryCount(s,factory)<1))return 0;

 return Math.min(
  ...dependencies.map(
   factory=>Math.min(MAX_ECONOMIC_VALUE,5+factoryCount(s,factory)*12)
  )
 );
}

export function productProductionPerMinute(s:CompanyState,kind:ProductKind){
 return productCapacity(s,kind);
}

export function productSalesPerMinute(s:CompanyState,kind:ProductKind,price?:number){
 const demandPerMinute=productDemand(s,kind,price);
 const capacityPerMinute=productProductionPerMinute(s,kind);

 return Math.min(demandPerMinute,capacityPerMinute);
}

export function productUnitCost(s:CompanyState,kind:ProductKind){
 const base=productBaseCost(kind);
 const dependencies=productFactoryDependencies(kind);
 const averageFactories=dependencies.reduce(
  (total,factory)=>total+factoryCount(s,factory),
  0
 )/dependencies.length;
 const reduction=Math.min(0.35,averageFactories*0.05);

 return Math.round(base*(1-reduction));
}

export function advance(s:CompanyState,seconds=1):CompanyState{
 const elapsed=nonNegativeNumber(seconds,0);
 if(elapsed===0)return s;

 let totalRevenue=0;
 let totalVariableCost=0;

 const products=s.products.map(p=>{
  if(!p.enabled){
   return {...p,revenue:0};
  }

  const price=nonNegativeNumber(p.price,productReferencePrice(p.kind));
  const demandPerMinute=productDemand(s,p.kind,price);
  const production=productProductionPerMinute(s,p.kind)*elapsed/60;
  const inventory=Math.max(
   0,
   nonNegativeNumber(p.units,0)-nonNegativeNumber(p.sales,0)
  );
  const sales=Math.min(demandPerMinute*elapsed/60,inventory+production);

  const unitCost=productUnitCost(s,p.kind);
  const revenue=sales*price;
  const variableCost=sales*unitCost;
  totalRevenue+=revenue/elapsed;
  totalVariableCost+=variableCost/elapsed;

  return {
   ...p,
   quality:productQuality(s,p.kind),
   demand:demandPerMinute,
   units:nonNegativeNumber(p.units,0)+production,
   sales:nonNegativeNumber(p.sales,0)+sales,
   price,
   unitCost,
   profitPerUnit:price-unitCost,
   revenue:revenue/elapsed
  };
 });

 const factoryCost=
  Object.values(s.factories).reduce((a,b)=>a+b,0)*12;

 const projectCost=
  s.projects.reduce(
   (a,p)=>a+(p.done?0:2),
   0
  );

 const expenses=
  factoryCost+
  projectCost+
  totalVariableCost;

 const profit=
  totalRevenue-expenses;

 return {
  ...s,
  tick:nonNegativeNumber(s.tick,0)+elapsed,
  revenue:totalRevenue,
  expenses,
  money:Math.max(
   0,
   nonNegativeNumber(s.money,0)+profit*elapsed
  ),
  products
 };
}