"use client";

import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,Check,Minus,Plus,X,Ruler,Info} from './icons';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useCart} from '@/components/cart';
import {ProductImg} from '@/components/ProductImg';
import {ExtraProducts} from './ExtraProducts';
import styles from './constructor.module.css';
import {createScene,COLOUR_ASSET_URLS} from './figure.js';
import {COLOURS,colourChoices} from './colours.js';
import {initialSelections,getVariant,getEdition,getPrice,heightSuggestions,sizeRows,changeLine,changeVariant,setEnabled,cartItems,orderIssue,previewImage,rubles,visibilityNote,kitLabel,figureSelection,hasCage} from './model.js';

const help={mask:'Выберите S или L по карточке маски и совместимости со своим шлемом. Размер шлема не подставляется автоматически: таблица соответствия в каталоге не задана.',chin:'Подбородочная чашка входит в маску для шлема — отдельно её берут на замену или на шлем без маски. Размерных опций в каталоге нет. Проверьте крепления перед установкой.',neck:'Выберите Детская, Юниор или Взрослая по таблице производителя. Проверьте обхват шеи и посадку воротника. Рост не определяет этот размер автоматически.',helmet:'Измерьте обхват головы над бровями. Размер шлема выбирается по таблице производителя и проверяется при примерке.',chest:'Рост помогает сузить выбор. Учитывайте обхват груди и посадку плечевых чашек. Если подходят два диапазона, сравните оба размера.',elbows:'Рост помогает сузить выбор. Проверьте длину руки и посадку защиты на локте.',gloves:'Измерьте кисть и сравните с таблицей производителя. Рост сам по себе не определяет размер перчаток.',pants:'Измерьте обхват талии. Проверьте длину шорт и посадку с остальной защитой.',groin:'Выберите возрастную категорию и проверьте плотность посадки. Защита надевается под хоккейные шорты.',shins:'Измерьте длину голени от центра колена до верха конька. Ростовая сетка каталога даёт ориентир, но не заменяет примерку.'};

function Modal({title,onClose,children}){
 const ref=useRef(null);
 useEffect(()=>{const previous=document.activeElement;const el=ref.current;el.showModal();return()=>{el.close();previous?.focus();};},[]);
 return <dialog ref={ref} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="dialog-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={22}/></button></div>{children}</dialog>;
}

/** @param {{catalog: import("@/lib/constructor").ConstructorCatalog, extras?: import("@/lib/constructor").ConstructorExtras, embedded?: boolean}} props */
export function Constructor({catalog,extras=[],embedded=false}){
 const router=useRouter();
 const cart=useCart();
 // Warm the cropped colour and CUBE assets at low priority for smooth switching.
 useEffect(()=>{
  for(const src of COLOUR_ASSET_URLS){const image=new window.Image();image.decoding='async';image.fetchPriority='low';image.src=src;}
 },[]);
 const [height,setHeight]=useState(178);
 const [active,setActive]=useState(catalog.find(g=>g.key==='gloves')?.key??catalog[0].key);
 const [selections,setSelections]=useState(()=>initialSelections(catalog,178));
 const extraGroups=useMemo(()=>extras.map(v=>({key:'extra-'+v.id,label:v.name,variants:[v]})),[extras]);
 const [extraSelections,setExtraSelections]=useState(()=>initialSelections(extraGroups));
 const selectedExtras=extraGroups.filter(g=>extraSelections[g.key]?.enabled);
 const [panelOpen,setPanelOpen]=useState(false);
 const [gallery,setGallery]=useState(0);
 const [modal,setModal]=useState(null);
 const [notice,setNotice]=useState('');
 const [sizeError,setSizeError]=useState(false);
 const sizeRef=useRef(null);
 const group=catalog.find(g=>g.key===active),selection=selections[active],variant=getVariant(group,selection);
 const sizes=variant.options.find(o=>o.name==='Размер')?.values??[];
 const recommendations=heightSuggestions(variant,height);
 // Подсказка обещала таблицу — теперь она в ней и есть, собранная из каталога.
 const rows=sizeRows(variant);
 const withHeights=rows.some(r=>r.height);
 const enabled=catalog.filter(g=>selections[g.key].enabled);
 const extraTotal=selectedExtras.reduce((sum,g)=>sum+getPrice(g.variants[0],extraSelections[g.key]),0);
 const total=extraTotal+enabled.reduce((sum,g)=>sum+getPrice(getVariant(g,selections[g.key]),selections[g.key]),0);
 const incomplete=enabled.filter(g=>orderIssue(g,selections[g.key]));
 const incompleteExtras=selectedExtras.filter(g=>orderIssue(g,extraSelections[g.key]));
 const scene=useMemo(()=>createScene({prefix:'player',...figureSelection(catalog,selections)}),[catalog,selections]);
 const images=variant.images;
 const currentImage=images[gallery%images.length];
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape')setPanelOpen(false);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[]);
 const panelRef=useRef(null);
 const drag=useRef(null);
 const dragStart=e=>{const el=panelRef.current;if(!el||getComputedStyle(el).position!=='fixed')return;
  // С липкой шапки тянем всегда — это её ручка. С остального только сверху списка,
  // иначе свайп отбирал бы у карточки обычную прокрутку.
  if(el.scrollTop>0&&!e.target.closest('.panel-top'))return;
  drag.current={y:e.touches[0].clientY,dy:0};};
 const dragMove=e=>{const d=drag.current;if(!d)return;d.dy=e.touches[0].clientY-d.y;panelRef.current.style.transition='none';panelRef.current.style.transform=d.dy>0?'translateY('+d.dy+'px)':'';};
 const dragEnd=()=>{const d=drag.current;if(!d)return;drag.current=null;const el=panelRef.current;el.style.transition='';el.style.transform='';if(d.dy>90)setPanelOpen(false);};
 const patch=values=>setSelections(prev=>({...prev,[active]:{...prev[active],...values}}));
 const choose=key=>{setActive(key);setPanelOpen(true);const v=getVariant(catalog.find(g=>g.key===key),selections[key]);setGallery(Math.max(0,v.images.indexOf(previewImage(v,selections[key].colour))));setSizeError(false);};
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
 // Catalog colour strings and figure keys are resolved through the same vocabulary.
 const hasColourOption=variant.options.some(o=>o.name==='Цвет');
 const swatches=hasColourOption?colourChoices(variant)
  :(variant.slug==='perchatki'&&selection.line==='base'?[{key:'black',...COLOURS.black},{key:'red',...COLOURS.red}]:[]);
 const selectVariant=id=>{const next=changeVariant(group,selection,id),v=getVariant(group,next);if(selection.enabled&&v.includesMask&&selections.mask?.enabled)setNotice('Маска входит в выбранный шлем. Отдельная маска убрана из комплекта.');setSelections(prev=>{const updated={...prev,[active]:changeVariant(group,prev[active],id)};return setEnabled(catalog,updated,active,updated[active].enabled);});setGallery(Math.max(0,v.images.indexOf(previewImage(v,next.colour))));setSizeError(false);};
 const remove=()=>{setSelections(prev=>setEnabled(catalog,prev,active,false));setNotice(group.label+': снято с фигуры и убрано из комплекта');};
 const addNotice=()=>{
  const spare=selections.chin?.enabled?' Защита подбородка входит в маску — отдельная останется запасной.':'';
  if(variant.includesMask)return 'Шлем с маской добавлен за '+rubles(selectedPrice)+'. Отдельная маска убрана из комплекта.'+spare;
  if(active==='mask'&&selections.helmet?.enabled&&getVariant(catalog.find(g=>g.key==='helmet'),selections.helmet).includesMask)return 'Шлем переключён на модель без маски. Маска добавлена отдельной позицией.'+spare;
  if(active==='mask')return 'Маска добавлена в комплект.'+spare;
  if(active==='chin'&&hasCage(catalog,selections))return 'Защита подбородка добавлена запасной: в выбранной маске она уже есть.';
  return group.label+' добавлены в комплект';
 };
 const add=()=>{
  const issue=orderIssue(group,selection);
  if(issue){setSizeError(true);setNotice(issue);sizeRef.current?.focus();return;}
  setSelections(prev=>setEnabled(catalog,prev,active,true));setNotice(addNotice());
 };
 const openCart=()=>{
  if(!cart.ready)return;
  if(!enabled.length&&!selectedExtras.length){setNotice('Добавьте экипировку в комплект');return;}
  if(incomplete.length){const first=incomplete[0];choose(first.key);setSizeError(true);setNotice(orderIssue(first,selections[first.key]));return;}
  const extraIssue=selectedExtras.find(g=>orderIssue(g,extraSelections[g.key]));
  if(extraIssue){setNotice(orderIssue(extraIssue,extraSelections[extraIssue.key]));document.getElementById(extraIssue.key)?.scrollIntoView({behavior:'smooth',block:'center'});return;}
  const items=[...cartItems(catalog,selections),...cartItems(extraGroups,extraSelections)];
  for(const item of items)cart.add(item);
  router.push('/cart');
 };
 const setGlobalLine=value=>{const next=changeLine(group,selection,value),v=getVariant(group,next);setSelections(prev=>Object.fromEntries(catalog.map(g=>[g.key,changeLine(g,prev[g.key],value)])));setGallery(Math.max(0,v.images.indexOf(previewImage(v,next.colour))));setSizeError(false);};
 const dominantLine=Object.values(selections).filter(s=>s.line==='cube').length?'cube':'base';
 const selectedPrice=getPrice(variant,selection);
 const visualNote=visibilityNote(active,selections,catalog);


 return <section className={styles.root+(embedded?' '+styles.embedded:'')}>
  
  <section className="constructor" id="constructor" aria-label="Конструктор экипировки">
   <aside className="profile">
    <div className="control-card height-card"><label htmlFor="height">Рост <strong>{height} см</strong></label><div className="range-row"><button className="icon-button" onClick={()=>applyHeight(h=>Math.max(110,h-1))} aria-label="Уменьшить рост" disabled={height===110}><Minus size={19}/></button><input id="height" type="range" min="110" max="195" value={height} onChange={e=>applyHeight(Number(e.target.value))}/><button className="icon-button" onClick={()=>applyHeight(h=>Math.min(195,h+1))} aria-label="Увеличить рост" disabled={height===195}><Plus size={19}/></button></div><small>Начнём с роста. У каждого предмета — своя мерка.</small></div>
    <div className="control-card"><p className="card-label">Линейка экипировки</p><div className="segmented">{[['base','Базовая'],['cube','CUBE']].map(([key,label])=><button key={key} aria-pressed={dominantLine===key} onClick={()=>setGlobalLine(key)}>{label}</button>)}</div><small>{dominantLine==='cube'?'CUBE для доступных позиций. Для позиций без CUBE сохраняется базовая линейка.':'Надёжная защита. Продуманный комфорт для твоей игры.'}</small></div>
    <div className="control-card accessory-card"><p className="card-label">Голова и шея</p><div className="accessory-list">{catalog.filter(g=>['helmet','mask','chin','neck'].includes(g.key)).map(g=><button key={g.key} onClick={()=>choose(g.key)} aria-pressed={active===g.key}><span>{g.label}</span>{selections[g.key].enabled?<Check size={15}/>:<Plus size={15}/>}</button>)}</div></div>
    <button className="hint-button" onClick={()=>setModal('help')}><Info size={17}/> Как работает подбор</button>
   </aside>
   <div className="stage"><div className="figure" dangerouslySetInnerHTML={{__html:scene}}/>{catalog.map(g=><button key={g.key} className={'hotspot '+(active===g.key?'active':'')+(!selections[g.key].enabled?' removed':'')} style={{left:g.hotspot[0]+'%',top:g.hotspot[1]+'%'}} onClick={()=>choose(g.key)} aria-label={'Выбрать: '+g.label} aria-pressed={active===g.key}><span className="hotspot-label">{g.label}</span></button>)}<span className="stage-caption">Нажми на точку — выбери экипировку</span></div>
   <div className={'panel-backdrop'+(panelOpen?' open':'')} onClick={()=>setPanelOpen(false)}/>
   <aside ref={panelRef} onTouchStart={dragStart} onTouchMove={dragMove} onTouchEnd={dragEnd} onTouchCancel={dragEnd} className={'product-panel'+(panelOpen?' open':'')} aria-label="Варианты экипировки"><div className="panel-top"><span className="panel-grabber" aria-hidden="true"/><div className="panel-heading"><button className="icon-button" onClick={()=>setModal('catalog')} aria-label="Все категории"><ChevronLeft size={19}/></button><span>{group.label}</span><button className="icon-button panel-close" onClick={()=>setPanelOpen(false)} aria-label="Закрыть карточку"><X size={20}/></button></div></div>
    <div className="product-image"><ProductImg file={currentImage?.file??null} alt={variant.name+' — фото из каталога MWP'} sizes="(max-width:620px) 90vw, 415px" eager/>{images.length>1&&<><button className="gallery-prev" aria-label="Предыдущее фото" onClick={()=>setGallery(g=>(g+images.length-1)%images.length)}><ChevronLeft size={19}/></button><button className="gallery-next" aria-label="Следующее фото" onClick={()=>setGallery(g=>(g+1)%images.length)}><ChevronRight size={19}/></button></>}</div><div className="gallery-dots">{images.map((img,i)=><button key={img.src} aria-label={'Фото '+(i+1)} aria-pressed={gallery%images.length===i} onClick={()=>setGallery(i)}/>)}</div>
    <h2>{variant.name.replace(' хоккейные','').replace(' хоккейный','')} <span>MWP</span></h2><p className="product-description">{variant.note||'Защита и комфорт в каждой смене.'}</p>
    {group.variants.length>1&&<div className="product-line"><span>Вариант</span><div className="segmented small product-variants">{group.variants.map(v=><button key={v.id} aria-pressed={v.id===variant.id} onClick={()=>selectVariant(v.id)}>{v.label??(v.line==='cube'?'CUBE':'Базовая')}</button>)}</div></div>}
    {swatches.length>1&&<div className="colour-row"><span>{hasColourOption?'Цвет':'Цвет образа'}</span>{swatches.map(s=><button key={s.key} className={'swatch '+s.key} style={{background:s.css}} aria-label={s.label} aria-pressed={selection.colour===s.key} onClick={()=>colour(s.key)}/>)}<span className="colour-name">{swatches.find(s=>s.key===selection.colour)?.label??''}</span>{!hasColourOption&&<span className="colour-hint">только для образа</span>}</div>}
    {variant.slug==='perchatki'&&selection.colour==='red'&&!variant.options.some(o=>o.name==='Цвет')&&<p className="measure-note">Красный цвет доступен для просмотра. Для заказа уточните его у MWP: цвет ещё не привязан к варианту товара. <Link href={'/catalog/'+variant.slug}>Открыть карточку</Link></p>}
    {variant.includesMask&&<p className="measure-note">Маска уже входит в этот шлем. Отдельная позиция маски исключается из комплекта.</p>}
    {variant.slug==='perchatki-detskie-cube'&&<p className="measure-note">Детская модель CUBE, размеры 8 и 9. На фигуре показан её рисунок; масштаб фигуры не определяет посадку.</p>}
    {active==='mask'&&<p className="measure-note">В маску входит подвижная защита подбородка — отдельно её брать не нужно. Шлем сразу с маской есть в карточке шлема, вариант «С маской».</p>}
    {active==='chin'&&<p className="measure-note">Входит в маску для шлема. Отдельно — на замену или на шлем без маски, {rubles(selectedPrice)}. Размер выбирать не нужно.</p>}
    {visualNote&&<p className="measure-note">{visualNote}{['mask','chin'].includes(active)&&!selections.helmet?.enabled&&!(active==='chin'&&hasCage(catalog,selections))&&<> <button className="inline-link" onClick={()=>choose('helmet')}>Выбрать шлем</button></>}</p>}
    {sizes.length>0&&<div className="size-row"><label htmlFor="size">Размер</label><select ref={sizeRef} id="size" value={selection.size} aria-invalid={sizeError} aria-describedby="size-help" onChange={e=>{patch({size:e.target.value});setSizeError(false);}}><option value="">Выберите размер</option>{sizes.map(size=><option key={size} value={size}>{size}</option>)}</select></div>}
    {variant.options.filter(o=>!['Размер','Цвет'].includes(o.name)).map(o=><div className="size-row" key={o.name}><label htmlFor={'option-'+o.name}>{o.name}</label><select id={'option-'+o.name} value={selection.options[o.name]??''} onChange={e=>{patch({options:{...selection.options,[o.name]:e.target.value}});setSizeError(false);}}><option value="">Выберите</option>{o.values.map(value=><option key={value}>{value}</option>)}</select></div>)}
    {sizeError&&<p className="field-error" role="alert">{orderIssue(group,selection)}</p>}
    {recommendations.length>0&&<div className="recommendation">По сетке роста {height} см: {recommendations.map(size=><button key={size} onClick={()=>{patch({size});setSizeError(false);}}>{size.split(' (')[0]}</button>)}<small>Ориентир из каталога. Проверьте посадку.</small></div>}
    <button className="size-help" id="size-help" onClick={()=>setModal('size')}>{sizes.length?<Ruler size={17}/>:<Info size={17}/>} {sizes.length?'Как выбрать размер':'О подборе и креплении'}</button>
    <div className="panel-footer"><div className="panel-price"><strong>{!getEdition(variant,selection.size,selection.colour,selection.options)&&'от '}{rubles(selectedPrice)}</strong>{active==='groin'&&selections.pants?.enabled&&<small>Надета под шортами</small>}</div><button className={'primary add-button'+(selection.enabled?' worn':'')} aria-pressed={selection.enabled} title={selection.enabled?'Нажмите, чтобы снять':undefined} onClick={()=>selection.enabled?remove():add()}>{selection.enabled?(visualNote?'В комплекте':'Надето'):'Добавить в комплект'} {selection.enabled?<Check size={18}/>:<Plus size={18}/>}</button></div>
   </aside>
  </section>
  <section className="kit" aria-label="Твой комплект"><div className="kit-heading"><h2>Твой комплект</h2><p>{enabled.length} из {catalog.length} позиций{selectedExtras.length>0&&<> + {selectedExtras.length} дополнительных</>}</p></div><div className="kit-products">{catalog.map(g=>{const s=selections[g.key],v=getVariant(g,s);const img=previewImage(v,s.colour);return <button key={g.key} className={'kit-item '+(active===g.key?'active':'')+(!s.enabled?' disabled':'')} onClick={()=>choose(g.key)} aria-pressed={active===g.key}><div className="kit-thumb"><ProductImg file={img?.file??null} alt="" sizes="100px"/>{s.enabled&&!orderIssue(g,s)&&<span className="kit-check"><Check size={12}/></span>}</div><span>{g.label}</span><small>{kitLabel(g,s)}</small></button>;})}{selectedExtras.map(g=>{const s=extraSelections[g.key],v=g.variants[0];return <button key={g.key} className="kit-item" title={v.name} onClick={()=>document.getElementById(g.key)?.scrollIntoView({behavior:'smooth',block:'center'})}><div className="kit-thumb"><ProductImg file={previewImage(v,s.colour)?.file??null} alt="" sizes="100px"/>{!orderIssue(g,s)&&<span className="kit-check"><Check size={12}/></span>}</div><span>{v.name}</span><small>{kitLabel(g,s)}</small></button>;})}</div><div className="kit-total"><small>{incomplete.length||incompleteExtras.length?'Предварительно, от':'Итого'}</small><strong>{rubles(total)}</strong><button className="primary" disabled={!cart.ready} onClick={openCart}>В корзину <ArrowRight size={19}/></button></div></section>
  {extras.length>0&&<ExtraProducts groups={extraGroups} selections={extraSelections} onChange={setExtraSelections} onNotice={setNotice}/>}
  <footer>Визуальный образ помогает собрать комплект. Посадку и размеры проверяйте по меркам.</footer>
  <div className={'toast '+(notice?'visible':'')} role="status">{notice&&<><Check size={18}/><span>{notice}</span><button className="icon-button" onClick={()=>setNotice('')} aria-label="Скрыть уведомление"><X size={16}/></button></>}</div>
  {modal&&<Modal title={modal==='catalog'?'Каталог экипировки':modal==='size'?(sizes.length?'Как выбрать размер':'О подборе и креплении'):modal==='about'?'Экипировка MWP':modal==='contacts'?'Связаться с MWP':'Как работает конструктор'} onClose={()=>setModal(null)}>
   {modal==='catalog'&&<><div className="catalog-grid">{catalog.map(g=><button key={g.key} onClick={()=>{choose(g.key);setModal(null);}}><ProductImg file={g.variants[0].images[0]?.file??null} alt="" sizes="220px"/><span>{g.label}</span></button>)}</div>{extras.length>0&&<button className="primary" onClick={()=>{setModal(null);document.getElementById('extra-products')?.scrollIntoView({behavior:'smooth'});}}>Аксессуары, запчасти и экипировка вратаря ({extras.length}) <ArrowRight size={17}/></button>}</>}
   {modal==='size'&&<div className="help-content"><p><strong>{group.label}: {group.measure}.</strong></p><p>{help[active]}</p>
   {rows.length>0&&<div className="size-table-wrap"><table className="size-table"><thead><tr><th>Размер</th>{withHeights&&<th>Рост, см</th>}<th>Цена</th></tr></thead>
    <tbody>{rows.map(r=><tr key={r.size} className={r.size===selection.size?'current':undefined}><td>{r.label}</td>{withHeights&&<td>{r.height||'—'}</td>}<td>{r.price?rubles(r.price):'—'}</td></tr>)}</tbody></table></div>}
   {recommendations.length>0&&<p>По ростовой сетке каталога при {height} см подходят размеры {recommendations.map(s=>s.split(' (')[0]).join(', ')}.</p>}
   {rows.length>0&&<p>Если нужной мерки нет в таблице, уточните размер у MWP. Рост — ориентир, окончательный выбор проверяется при примерке. Оптовые цены и все исполнения — <Link className="inline-link" href={'/catalog/'+variant.slug}>в карточке товара</Link>.</p>}
   <div className="help-foot"><button className="primary" onClick={()=>setModal(null)}>Понятно</button></div></div>}
   {modal==='help'&&<div className="help-content"><p>Укажи рост, нажми на нужную часть тела и выбери линейку, цвет и размер. Переключатель «Надето» позволяет убрать предмет с фигуры и из комплекта.</p><p>Рост даёт ориентир для нагрудника, налокотников и щитков. Для шлема измерь голову, для перчаток — кисть, для шорт — талию.</p><p>Можно выбрать шлем без маски или готовый шлем с маской. Для готового комплекта маска повторно не начисляется. В саму маску входит подвижная защита подбородка, поэтому отдельную позицию берут только на замену. Маска и защита подбородка показываются на фигуре со шлемом, но могут быть заказаны отдельно. Защита шеи переключается между базовой линейкой и CUBE.</p><p>Защита паха скрывается под шортами. Коньки показаны для завершённого образа и не добавляются в заказ.</p><p>Фотографии и цены берутся из каталога MWP. На фигуре показан иллюстративный образ. Линейка CUBE и цвета шлема и перчаток переключаются на фигуре; точные детали товаров смотрите в галерее. Комплект добавляется в обычную корзину сайта, оформление заявки выполняется там.</p><button className="primary" onClick={()=>setModal(null)}>Собрать комплект</button></div>}
   {modal==='about'&&<div className="help-content"><p>MWP — хоккейная экипировка. Здесь можно собрать защиту из каталога и сравнить базовую линейку с CUBE.</p><button className="primary" onClick={()=>{setModal('catalog');}}>Выбрать экипировку</button></div>}
   {modal==='contacts'&&<div className="help-content"><p>Для консультации по размерам и наличию откройте раздел контактов на сайте MWP.</p><a className="primary" href="https://mwp.135.106.192.220.sslip.io/" target="_blank" rel="noreferrer">Открыть сайт MWP <ArrowRight size={17}/></a></div>}
  </Modal>}
 </section>;
}
