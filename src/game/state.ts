import {DESIGNS, Kind, Params, Out} from '../data/designs';

export type ProductKind='phone'|'computer'|'server'|'robot'|'satellite';
export interface Product { id:string; kind:ProductKind; name:string; level:number; quality:number; demand:number; units:number; revenue:number; enabled:boolean; }
export interface CompanyState {
  v:2; money:number; revenue:number; expenses:number; reputation:number; tick:number;
  techs:Record<string,number>; params:Record<Kind,Params>; protos:Proto[];
  products:Product[]; factories:Record<string,number>; projects:Project[];
  logs:string[]; unlockedFields:string[];
}
export interface Proto{name:string;kind:Kind;out:Out;score:number;createdAt:number}
export interface Project {id:string;name:string;kind:string;progress:number;cost:number;description:string;done:boolean}

export const KEY='tech-empire-ts-2';
export const TEST_COST=2000;

export const newGame=():CompanyState=>({
 v:2,money:50000,revenue:0,expenses:0,reputation:50,tick:0,
 techs:{}, protos:[],
 params:{cpu:{...DESIGNS.cpu.def},gpu:{...DESIGNS.gpu.def},battery:{...DESIGNS.battery.def}},
 products:[], factories:{electronics:0,components:0,energy:0,robotics:0,telecom:0,space:0},
 projects:[],logs:['Компания основана. Начните с продукта, а не с «прохождения уровней».'],
 unlockedFields:['electronics']
});

export function migrate(raw:any):CompanyState {
 if(!raw || raw.v!==1) return raw?.v===2?raw:newGame();
 const n=newGame(); n.money=raw.money??50000;n.techs=raw.techs??{};n.params=raw.params??n.params;n.protos=raw.protos??[];
 return n;
}
export const loadGame=():CompanyState=>{try{return migrate(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return newGame()}};
export const saveGame=(s:CompanyState)=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};

export function getProto(s:CompanyState, kind:Kind){return [...s.protos].reverse().find(x=>x.kind===kind)}
export function productDependencies(kind:ProductKind){
 const map:Record<ProductKind,string[]>={
  phone:['cpu','battery'],computer:['cpu','gpu'],server:['cpu','gpu'],robot:['cpu','battery','gpu'],
  satellite:['cpu','battery']
 }; return map[kind];
}
export function productDemand(s:CompanyState, kind:ProductKind){
 const deps=productDependencies(kind); const quality=deps.reduce((v,k)=>{
  const p=getProto(s,k as Kind); return v*(p?Math.min(1.25,p.score/80):.55)
 },1);
 const base={phone:80,computer:38,server:25,robot:18,satellite:8}[kind];
 return Math.max(0,Math.round(base*quality*(.75+s.reputation/200)));
}
export function advance(s:CompanyState, seconds=1):CompanyState{
 const productIncome=s.products.filter(p=>p.enabled).reduce((sum,p)=>{
   const d=productDemand(s,p.kind); return sum+d*(1+p.level*.08)*.35;
 },0);
 const factoryCost=Object.values(s.factories).reduce((a,b)=>a+b,0)*12;
 const expense=factoryCost+s.projects.reduce((a,p)=>a+(p.done?0:2),0);
 return {...s,tick:s.tick+seconds,revenue:productIncome,expenses:expense,
   money:Math.max(0,s.money+(productIncome-expense)*seconds),
   products:s.products.map(p=>({...p,demand:productDemand(s,p.kind),units:p.units+Math.round(productDemand(s,p.kind)*seconds/60)}))}
}
