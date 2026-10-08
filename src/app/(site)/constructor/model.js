import {colourKey,colourValue,normaliseColour} from './colours.js';
export function initialSelections(catalog, height) {
  return Object.fromEntries(catalog.map(group => {
    // Хоккеист начинает раздетым: посетитель сам набирает комплект.
    const line = group.variants.find(v => v.line === 'base')?.line ?? group.variants[0].line;
    const variant = group.variants.find(v => v.line === line) ?? group.variants[0];
    // Если рост известен и однозначно задаёт размер — подставляем сразу, не заставляя выбирать дважды.
    const fit = height ? heightSuggestions(variant, height) : [];
    return [group.key, {
      enabled:false, line, variantId:variant.id,
      size: fit.length === 1 ? fit[0] : '',
      colour: group.key === 'helmet' ? 'white' : 'black', options:{}
    }];
  }));
}
export function getVariant(group,selection) {
  return group.variants.find(v=>v.id===selection.variantId&&v.line===selection.line) ?? group.variants.find(v=>v.line===selection.line) ?? group.variants[0];
}
// Опция с единственным значением выбора не даёт — подставляем её, и цвет здесь не исключение:
// у CUBE-перчаток расцветка одна, свотчей для неё не показывается, выбирать нечего.
// Там, где значений несколько, цвет по-прежнему берётся только из явного выбора.
const selectedValues = (variant,size,colour,options={}) => Object.fromEntries(variant.options.map(option=>[
  option.name,
  option.values.length===1?option.values[0]
  :option.name==='Размер'?size
  :option.name==='Цвет'?colourValue(variant,colour)
  :(options[option.name]??'')
]));
export function getEdition(variant,size,colour,options={}) {
  const wanted=selectedValues(variant,size,colour,options);
  if(variant.options.some(option=>!wanted[option.name]||!option.values.includes(wanted[option.name])))return null;
  return variant.editions.find(e=>variant.options.every(option=>e.values[option.name]===wanted[option.name])) ?? null;
}
export function getPrice(variant,selection) {
  const exact=getEdition(variant,selection.size,selection.colour,selection.options);
  if(exact)return exact.price;
  const wanted=selectedValues(variant,selection.size,selection.colour,selection.options);
  const matches=variant.editions.filter(e=>Object.entries(wanted).every(([key,value])=>!value||e.values[key]===value));
  return Math.min(...(matches.length?matches:variant.editions).map(e=>e.price));
}
export function heightSuggestions(variant,height) {
  const sizes=variant.options.find(o=>o.name==='Размер')?.values ?? [];
  return sizes.filter(size=>{const m=size.match(/рост\s*(\d+)\s*[-–]\s*(\d+)/i);return m&&height>=Number(m[1])&&height<=Number(m[2]);});
}
export function changeVariant(group,selection,id) {
  const variant=group.variants.find(v=>v.id===id);
  if(!variant)return selection;
  const sizes=variant.options.find(o=>o.name==='Размер')?.values??[];
  const options=Object.fromEntries(Object.entries(selection.options??{}).filter(([key,value])=>variant.options.some(o=>o.name===key&&o.values.includes(value))));
  return {...selection,variantId:variant.id,line:variant.line,options,colour:group.key==='gloves'&&variant.line==='cube'?'black':selection.colour,size:sizes.includes(selection.size)?selection.size:''};
}
export function changeLine(group,selection,line) {
  const current=getVariant(group,selection);
  const variant=current.line===line?current:group.variants.find(v=>v.line===line);
  return variant?changeVariant(group,selection,variant.id):selection;
}
// A bundled cage replaces the separate mask item. Choosing a separate mask switches
// the helmet to the unbundled SKU, preserving valid size/colour and explicit prices.
export function setEnabled(catalog,selections,key,enabled) {
  const next={...selections,[key]:{...selections[key],enabled}};
  const helmetGroup=catalog.find(g=>g.key==='helmet');
  if(!enabled||!helmetGroup)return next;
  const helmet=getVariant(helmetGroup,next.helmet);
  if(key==='helmet'&&helmet.includesMask&&next.mask)next.mask={...next.mask,enabled:false};
  if(key==='mask'&&next.helmet.enabled&&helmet.includesMask){
    const bare=helmetGroup.variants.find(v=>!v.includesMask);
    if(bare)next.helmet=changeVariant(helmetGroup,next.helmet,bare.id);
  }
  return next;
}
export function orderIssue(group,selection) {
  const variant=getVariant(group,selection);
  if(variant.slug==='perchatki'&&selection.colour==='red'&&!variant.options.some(o=>o.name==='Цвет'))return 'Красный цвет перчаток ещё не привязан к исполнению в каталоге. Для заказа уточните цвет у MWP или выберите вариант из карточки товара.';
  const wanted=selectedValues(variant,selection.size,selection.colour,selection.options);
  const missing=variant.options.find(o=>!wanted[o.name]||!o.values.includes(wanted[o.name]));
  if(missing)return 'Выберите '+missing.name.toLowerCase()+': '+group.label.toLowerCase();
  if(!getEdition(variant,selection.size,selection.colour,selection.options))return 'Такое сочетание недоступно: '+group.label.toLowerCase();
  return null;
}
export function previewImage(variant,colour) {
  const value=colourValue(variant,colour);
  const matched=variant.images.find(i=>i.optionValue&&normaliseColour(i.optionValue)===normaliseColour(value));
  // Existing base glove photos have no option mapping. Known source files are only display refs.
  const legacy=variant.slug==='perchatki'?variant.images.find(i=>i.file===(colour==='red'?'p9-b1a24abf':'p9-4f8251a5')):null;
  return matched??legacy??variant.images[0];
}
export function cartItems(catalog,selections) {
  return catalog.filter(g=>selections[g.key].enabled).map(group=>{
    const selection=selections[group.key];const issue=orderIssue(group,selection);
    if(issue)throw new Error(issue);
    const variant=getVariant(group,selection);const edition=getEdition(variant,selection.size,selection.colour,selection.options);
    const image=variant.images.find(i=>i.optionValue&&Object.values(edition.values).includes(i.optionValue))??previewImage(variant,selection.colour);
    return {productId:variant.id,slug:variant.slug,name:variant.name,values:{...edition.values},price:edition.price,image:image?.file??null};
  });
}
export const rubles=amount=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(amount);

// Accessories can be ordered separately, e.g. for a helmet the customer already owns.
// This describes visibility only; it never silently adds or removes a cart item.
export function visibilityNote(key,selections,catalog=[]) {
  if(!selections[key]?.enabled)return null;
  if(['mask','chin'].includes(key)&&!selections.helmet?.enabled)return 'В комплекте. На фигуре появится, когда добавите шлем.';
  if(key==='chin'&&(selections.mask?.enabled||(selections.helmet?.enabled&&catalog.find(g=>g.key==='helmet')&&getVariant(catalog.find(g=>g.key==='helmet'),selections.helmet).includesMask)))return 'В комплекте как отдельный аксессуар. У маски на фото уже есть подбородочная чашка.';
  if(key==='groin'&&selections.pants?.enabled)return 'Надета под шортами';
  return null;
}
export function kitLabel(group,selection) {
  if(!selection.enabled)return 'Не в комплекте';
  const edition=getEdition(getVariant(group,selection),selection.size,selection.colour,selection.options);
  if(!edition)return 'Выберите опции';
  return edition.values['Размер']?.split(' (')[0] || 'В комплекте';
}

export function figureSelection(catalog,selections) {
  const gloveGroup=catalog.find(g=>g.key==='gloves');
  const helmetGroup=catalog.find(g=>g.key==='helmet');
  const glove=gloveGroup&&getVariant(gloveGroup,selections.gloves);
  const helmet=helmetGroup&&getVariant(helmetGroup,selections.helmet);
  const on=Object.fromEntries(catalog.map(g=>[g.key,selections[g.key].enabled]));
  if(on.helmet&&helmet?.includesMask)on.mask=true;
  const lines=Object.fromEntries(['chest','elbows','pants','shins','neck'].map(key=>{const g=catalog.find(g=>g.key===key);return [key+'Line',g?getVariant(g,selections[key]).line:'base'];}));
  return {
    on,...lines,
    gloveColour:glove?colourKey(colourValue(glove,selections.gloves.colour)):'black',
    helmetColour:helmet?colourKey(colourValue(helmet,selections.helmet.colour)):'white',
    gloveLine:glove?.line??'base',gloveSlug:glove?.slug??'perchatki',
  };
}
