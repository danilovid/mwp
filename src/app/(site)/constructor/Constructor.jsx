"use client";

import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,Check,Minus,Plus,X,Ruler,Info} from './icons';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useCart} from '@/components/cart';
import {ProductImg} from '@/components/ProductImg';
import styles from './constructor.module.css';
import {createScene} from './figure.js';
import {initialSelections,getVariant,getEdition,getPrice,heightSuggestions,changeLine,cartItems,orderIssue,previewImage,rubles} from './model.js';

const help={helmet:'Измерьте обхват головы над бровями. Размер шлема выбирается по таблице производителя и проверяется при примерке.',chest:'Рост помогает сузить выбор. Учитывайте обхват груди и посадку плечевых чашек. Если подходят два диапазона, сравните оба размера.',elbows:'Рост помогает сузить выбор. Проверьте длину руки и посадку защиты на локте.',gloves:'Измерьте кисть и сравните с таблицей производителя. Рост сам по себе не определяет размер перчаток.',pants:'Измерьте обхват талии. Проверьте длину шорт и посадку с остальной защитой.',groin:'Выберите возрастную категорию и проверьте плотность посадки. Защита надевается под хоккейные шорты.',shins:'Измерьте длину голени от центра колена до верха конька. Ростовая сетка каталога даёт ориентир, но не заменяет примерку.'};

function Modal({title,onClose,children}){
 const ref=useRef(null);
 useEffect(()=>{const previous=document.activeElement;const el=ref.current;el.showModal();return()=>{el.close();previous?.focus();};},[]);
 return <dialog ref={ref} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="dialog-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={22}/></button></div>{children}</dialog>;
}

/** @param {{catalog: import("@/lib/constructor").ConstructorCatalog}} props */
export function Constructor({catalog}){
 const router=useRouter();
 const cart=useCart();
 const [height,setHeight]=useState(178);
 const [active,setActive]=useState(catalog.find(g=>g.key==='gloves')?.key??catalog[0].key);
 const [selections,setSelections]=useState(()=>initialSelections(catalog,178));
 const [gallery,setGallery]=useState(0);
 const [modal,setModal]=useState(null);
 const [notice,setNotice]=useState('');
 const [sizeError,setSizeError]=useState(false);
 const sizeRef=useRef(null);
 const group=catalog.find(g=>g.key===active),selection=selections[active],variant=getVariant(group,selection);
 const sizes=variant.options.find(o=>o.name==='Размер')?.values??[];
 const recommendations=heightSuggestions(variant,height);
 const enabled=catalog.filter(g=>selections[g.key].enabled);
 const total=enabled.reduce((sum,g)=>sum+getPrice(getVariant(g,selections[g.key]),selections[g.key]),0);
 const incomplete=enabled.filter(g=>orderIssue(g,selections[g.key]));
 const scene=useMemo(()=>createScene({prefix:'player',on:Object.fromEntries(catalog.map(g=>[g.key,selections[g.key].enabled])),colour:selections.gloves?.colour??'black'}),[catalog,selections]);
 const images=variant.images;
 const currentImage=images[gallery%images.length];
 const patch=values=>setSelections(prev=>({...prev,[active]:{...prev[active],...values}}));
 const choose=key=>{setActive(key);const v=getVariant(catalog.find(g=>g.key===key),selections[key]);setGallery(Math.max(0,v.images.indexOf(previewImage(v,selections[key].colour))));setSizeError(false);};
 const colour=value=>{patch({colour:value});setGallery(Math.max(0,variant.images.indexOf(previewImage(variant,value))));setSizeError(false);};
 // Рост уже выбран ползунком. Там, где он зашит в размерную сетку — нагрудник,
 // налокотники, щитки, — размер подставляется сам. Для шлема, перчаток и шорт
 // рост размера не задаёт, там выбор остаётся за человеком.
 const applyHeight=next=>{
  const value=typeof next==='function'?next(height):next;
  setHeight(value);
  setSelections(prev=>{
   let changed=false; const out={...prev};
   for(const g of catalog){
    const fit=heightSuggestions(getVariant(g,prev[g.key]),value);
    if(fit.length===1&&prev[g.key].size!==fit[0]){out[g.key]={...prev[g.key],size:fit[0]};changed=true;}
   }
   return changed?out:prev;
  });
 };
 // Цвета берём из опций товара: у шлема их четыре, и все они заказываемые.
 // У перчаток цвета в каталоге нет — красные показываем как образ и к заказу не пускаем.
 const palette={white:{label:'Белый',css:'#f2f4f7'},black:{label:'Чёрный',css:'#1b2029'},red:{label:'Красный',css:'#d92b3c'},blue:{label:'Синий',css:'#2b63c6'}};
 const colourOption=variant.options.find(o=>o.name==='Цвет');
 const hasColourOption=Boolean(colourOption);
 const swatches=colourOption
  ? colourOption.values.map(value=>{const key=Object.keys(palette).find(k=>palette[k].label===value||palette[k].label.replace('ё','е')===value);return key?{key,...palette[key]}:null;}).filter(Boolean)
  : (active==='gloves'&&selection.line==='base' ? [{key:'black',...palette.black},{key:'red',...palette.red}] : []);
 const line=value=>{setSelections(prev=>({...prev,[active]:changeLine(group,prev[active],value)}));setGallery(0);setSizeError(false);};
 const add=()=>{
  const issue=orderIssue(group,selection);
  if(issue){setSizeError(true);setNotice(issue);sizeRef.current?.focus();return;}
  patch({enabled:true});setNotice(group.label+' добавлены в комплект');
 };
 const openCart=()=>{
  if(!cart.ready)return;
  if(!enabled.length){setNotice('Добавьте экипировку в комплект');return;}
  if(incomplete.length){const first=incomplete[0];choose(first.key);setSizeError(true);setNotice(orderIssue(first,selections[first.key]));return;}
  const items=cartItems(catalog,selections);
  for(const item of items)cart.add(item);
  router.push('/cart');
 };
 const setGlobalLine=value=>{setSelections(prev=>Object.fromEntries(catalog.map(g=>[g.key,changeLine(g,prev[g.key],value)])));setGallery(0);};
 const dominantLine=Object.values(selections).filter(s=>s.line==='cube').length?'cube':'base';
 const selectedPrice=getPrice(variant,selection);


 return <section className={styles.root}>
  
  <section className="constructor" id="constructor" aria-label="Конструктор экипировки">
   <aside className="profile">
    <div className="control-card height-card"><label htmlFor="height">Рост <strong>{height} см</strong></label><div className="range-row"><button className="icon-button" onClick={()=>applyHeight(h=>Math.max(110,h-1))} aria-label="Уменьшить рост" disabled={height===110}><Minus size={19}/></button><input id="height" type="range" min="110" max="195" value={height} onChange={e=>applyHeight(Number(e.target.value))}/><button className="icon-button" onClick={()=>applyHeight(h=>Math.min(195,h+1))} aria-label="Увеличить рост" disabled={height===195}><Plus size={19}/></button></div><small>Начнём с роста. У каждого предмета — своя мерка.</small></div>
    <div className="control-card"><p className="card-label">Линейка экипировки</p><div className="segmented">{[['base','Базовая'],['cube','CUBE']].map(([key,label])=><button key={key} aria-pressed={dominantLine===key} onClick={()=>setGlobalLine(key)}>{label}</button>)}</div><small>{dominantLine==='cube'?'CUBE для доступных позиций. Шлем и защита паха остаются в базовой линейке.':'Надёжная защита. Продуманный комфорт для твоей игры.'}</small></div>
    <button className="hint-button" onClick={()=>setModal('help')}><Info size={17}/> Как работает подбор</button>
   </aside>
   <div className="stage"><div className="figure" dangerouslySetInnerHTML={{__html:scene}}/>{catalog.map(g=><button key={g.key} className={'hotspot '+(active===g.key?'active':'')+(!selections[g.key].enabled?' removed':'')} style={{left:g.hotspot[0]+'%',top:g.hotspot[1]+'%'}} onClick={()=>choose(g.key)} aria-label={'Выбрать: '+g.label} aria-pressed={active===g.key}><span className="hotspot-label">{g.label}</span></button>)}<span className="stage-caption">Нажми на точку — выбери экипировку</span></div>
   <aside className="product-panel" aria-label="Варианты экипировки"><div className="panel-heading"><button className="icon-button" onClick={()=>setModal('catalog')} aria-label="Все категории"><ChevronLeft size={19}/></button><span>{group.label}</span><label className="wear-toggle"><input type="checkbox" checked={selection.enabled} onChange={e=>patch({enabled:e.target.checked})}/><span>{selection.enabled?'Надето':'Снято'}</span></label></div>
    <div className="product-image"><ProductImg file={currentImage?.file??null} alt={variant.name+' — фото из каталога MWP'} sizes="(max-width:620px) 90vw, 415px" eager/>{images.length>1&&<><button className="gallery-prev" aria-label="Предыдущее фото" onClick={()=>setGallery(g=>(g+images.length-1)%images.length)}><ChevronLeft size={19}/></button><button className="gallery-next" aria-label="Следующее фото" onClick={()=>setGallery(g=>(g+1)%images.length)}><ChevronRight size={19}/></button></>}</div><div className="gallery-dots">{images.map((img,i)=><button key={img.src} aria-label={'Фото '+(i+1)} aria-pressed={gallery%images.length===i} onClick={()=>setGallery(i)}/>)}</div>
    <h2>{variant.name.replace(' хоккейные','').replace(' хоккейный','')} <span>MWP</span></h2><p className="product-description">{variant.note||'Защита и комфорт в каждой смене.'}</p>
    {group.variants.length>1&&<div className="product-line"><span>Линейка</span><div className="segmented small">{group.variants.map(v=><button key={v.id} aria-pressed={v.line===selection.line} onClick={()=>line(v.line)}>{v.line==='cube'?'CUBE':'Базовая'}</button>)}</div></div>}
    {swatches.length>1&&<div className="colour-row"><span>{hasColourOption?'Цвет':'Цвет образа'}</span>{swatches.map(s=><button key={s.key} className={'swatch '+s.key} style={{background:s.css}} aria-label={s.label} aria-pressed={selection.colour===s.key} onClick={()=>colour(s.key)}/>)}<span className="colour-name">{swatches.find(s=>s.key===selection.colour)?.label??''}</span>{!hasColourOption&&<span className="colour-hint">только для образа</span>}</div>}
    {active==='gloves'&&selection.colour==='red'&&!variant.options.some(o=>o.name==='Цвет')&&<p className="measure-note">Красный цвет доступен для просмотра. Для заказа уточните его у MWP: цвет ещё не привязан к варианту товара. <Link href={'/catalog/'+variant.slug}>Открыть карточку</Link></p>}
    {active==='helmet'&&<p className="measure-note">На фигуре показан белый шлем. Другие цвета доступны в галерее каталога.</p>}
    {selection.line==='cube'&&<p className="measure-note">Карточка и цена — CUBE. На фигуре пока показана базовая экипировка.</p>}
    {sizes.length>0&&<div className="size-row"><label htmlFor="size">Размер</label><select ref={sizeRef} id="size" value={selection.size} aria-invalid={sizeError} aria-describedby="size-help" onChange={e=>{patch({size:e.target.value});setSizeError(false);}}><option value="">Выберите размер</option>{sizes.map(size=><option key={size} value={size}>{size}</option>)}</select></div>}
    {variant.options.filter(o=>!['Размер','Цвет'].includes(o.name)).map(o=><div className="size-row" key={o.name}><label htmlFor={'option-'+o.name}>{o.name}</label><select id={'option-'+o.name} value={selection.options[o.name]??''} onChange={e=>{patch({options:{...selection.options,[o.name]:e.target.value}});setSizeError(false);}}><option value="">Выберите</option>{o.values.map(value=><option key={value}>{value}</option>)}</select></div>)}
    {sizeError&&<p className="field-error" role="alert">{orderIssue(group,selection)}</p>}
    {recommendations.length>0&&<div className="recommendation">По сетке роста {height} см: {recommendations.map(size=><button key={size} onClick={()=>{patch({size});setSizeError(false);}}>{size.split(' (')[0]}</button>)}<small>Ориентир из каталога. Проверьте посадку.</small></div>}
    <button className="size-help" id="size-help" onClick={()=>setModal('size')}><Ruler size={17}/> Как выбрать размер</button>
    <div className="panel-price"><strong>{!getEdition(variant,selection.size,selection.colour,selection.options)&&'от '}{rubles(selectedPrice)}</strong>{active==='groin'&&selections.pants.enabled&&<small>Надета под шортами</small>}</div><button className="primary add-button" onClick={add}>Добавить в комплект <Plus size={18}/></button>
   </aside>
  </section>
  <section className="kit" aria-label="Твой комплект"><div className="kit-heading"><h2>Твой комплект</h2><p>{enabled.length} из {catalog.length} позиций</p></div><div className="kit-products">{catalog.map(g=>{const s=selections[g.key],v=getVariant(g,s);const img=previewImage(v,s.colour);return <button key={g.key} className={'kit-item '+(active===g.key?'active':'')+(!s.enabled?' disabled':'')} onClick={()=>choose(g.key)} aria-pressed={active===g.key}><div className="kit-thumb"><ProductImg file={img?.file??null} alt="" sizes="100px"/>{s.enabled&&s.size&&<span className="kit-check"><Check size={12}/></span>}</div><span>{g.label}</span><small>{s.enabled?(s.size?s.size.split(' (')[0]:'Укажите размер'):'Не в комплекте'}</small></button>;})}</div><div className="kit-total"><small>{incomplete.length?'Предварительно, от':'Итого'}</small><strong>{rubles(total)}</strong><button className="primary" disabled={!cart.ready} onClick={openCart}>В корзину <ArrowRight size={19}/></button></div></section>
  <footer>Визуальный образ помогает собрать комплект. Посадку и размеры проверяйте по меркам.</footer>
  <div className={'toast '+(notice?'visible':'')} role="status">{notice&&<><Check size={18}/><span>{notice}</span><button className="icon-button" onClick={()=>setNotice('')} aria-label="Скрыть уведомление"><X size={16}/></button></>}</div>
  {modal&&<Modal title={modal==='catalog'?'Каталог экипировки':modal==='size'?'Как выбрать размер':modal==='about'?'Экипировка MWP':modal==='contacts'?'Связаться с MWP':'Как работает конструктор'} onClose={()=>setModal(null)}>
   {modal==='catalog'&&<div className="catalog-grid">{catalog.map(g=><button key={g.key} onClick={()=>{choose(g.key);setModal(null);}}><ProductImg file={g.variants[0].images[0]?.file??null} alt="" sizes="220px"/><span>{g.label}</span></button>)}</div>}
   {modal==='size'&&<div className="help-content"><p><strong>{group.label}: {group.measure}.</strong></p><p>{help[active]}</p>{recommendations.length>0&&<p>По ростовой сетке каталога при {height} см подходят размеры {recommendations.map(s=>s.split(' (')[0]).join(', ')}.</p>}<p>Если нужной мерки нет в таблице, уточните размер у MWP. Рост — ориентир, окончательный выбор проверяется при примерке.</p><button className="primary" onClick={()=>setModal(null)}>Понятно</button></div>}
   {modal==='help'&&<div className="help-content"><p>Укажи рост, нажми на нужную часть тела и выбери линейку, цвет и размер. Переключатель «Надето» позволяет убрать предмет с фигуры и из комплекта.</p><p>Рост даёт ориентир для нагрудника, налокотников и щитков. Для шлема измерь голову, для перчаток — кисть, для шорт — талию.</p><p>Защита паха скрывается под шортами. Коньки показаны для завершённого образа и не добавляются в заказ.</p><p>Фотографии и цены берутся из каталога MWP. На фигуре показано сочетание базовой экипировки. Комплект добавляется в обычную корзину сайта, оформление заявки выполняется там.</p><button className="primary" onClick={()=>setModal(null)}>Собрать комплект</button></div>}
   {modal==='about'&&<div className="help-content"><p>MWP — хоккейная экипировка. Здесь можно собрать защиту из каталога и сравнить базовую линейку с CUBE.</p><button className="primary" onClick={()=>{setModal('catalog');}}>Выбрать экипировку</button></div>}
   {modal==='contacts'&&<div className="help-content"><p>Для консультации по размерам и наличию откройте раздел контактов на сайте MWP.</p><a className="primary" href="https://mwp.135.106.192.220.sslip.io/" target="_blank" rel="noreferrer">Открыть сайт MWP <ArrowRight size={17}/></a></div>}
  </Modal>}
 </section>;
}
