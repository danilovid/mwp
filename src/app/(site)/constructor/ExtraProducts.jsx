"use client";

import Link from 'next/link';
import {ProductImg} from '@/components/ProductImg';
import {Plus,Check,Minus} from './icons';
import {colourChoices} from './colours.js';
import {getEdition,getPrice,orderIssue,previewImage,rubles} from './model.js';

/** Additional published SKUs use the same edition validation and cart as worn items. */
export function ExtraProducts({groups,selections,onChange,onNotice}) {
 const patch=(key,values)=>onChange(prev=>({...prev,[key]:{...prev[key],...values}}));
 const add=(group)=>{
  const issue=orderIssue(group,selections[group.key]);
  if(issue){onNotice(issue);document.getElementById(group.key+'-options')?.querySelector('select')?.focus();return;}
  patch(group.key,{enabled:true});onNotice(group.label+' добавлены в комплект');
 };
 return <section className="extra-products" id="extra-products" aria-labelledby="extra-products-title">
  <div className="extra-heading"><div><h2 id="extra-products-title">Дополнить комплект</h2><p>Аксессуары, запчасти и экипировка вратаря из каталога MWP. Добавляются в общий заказ.</p></div><span>{groups.length} товаров</span></div>
  <div className="extra-grid">{groups.map(group=>{
   const variant=group.variants[0],selection=selections[group.key],exact=getEdition(variant,selection.size,selection.colour,selection.options);
   const choices=colourChoices(variant),image=previewImage(variant,selection.colour);
   return <article className="extra-card" id={group.key} key={group.key}>
    <Link href={'/catalog/'+variant.slug} className="extra-photo"><ProductImg file={image?.file??null} alt={variant.name} sizes="(max-width:620px) 40vw, 220px"/></Link>
    <div className="extra-content"><small>{variant.category?.name??'Каталог MWP'}</small><h3><Link href={'/catalog/'+variant.slug}>{variant.name}</Link></h3>
     <div className="extra-options" id={group.key+'-options'}>{variant.options.filter(o=>o.values.length>1).map(option=>{
      const isColour=option.name==='Цвет';
      const value=isColour?selection.colour:option.name==='Размер'?selection.size:selection.options[option.name]??'';
      return <label key={option.name}>{option.name}<select aria-label={variant.name+' — '+option.name} value={value} onChange={e=>patch(group.key,isColour?{colour:e.target.value}:option.name==='Размер'?{size:e.target.value}:{options:{...selection.options,[option.name]:e.target.value}})}>
       <option value="">Выберите</option>{isColour?choices.map(c=><option key={c.key} value={c.key}>{c.label}</option>):option.values.map(v=><option key={v} value={v}>{v}</option>)}
      </select></label>;
     })}</div>
     {selection.enabled&&!exact&&<p className="field-error">{orderIssue(group,selection)}</p>}
     <div className="extra-actions"><strong>{!exact&&'от '}{rubles(getPrice(variant,selection))}</strong><button className="primary" onClick={()=>add(group)}>{selection.enabled?<><Check size={16}/> Заменить</>:<><Plus size={16}/> Добавить</>}</button>{selection.enabled&&<button className="icon-button" onClick={()=>patch(group.key,{enabled:false})} aria-label={'Убрать из комплекта: '+variant.name}><Minus size={17}/></button>}</div>
    </div>
   </article>;
  })}</div>
 </section>;
}
