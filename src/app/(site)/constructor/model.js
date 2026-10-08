const colours = {white:'Белый',black:'Черный',red:'Красный',blue:'Синий'};
export function initialSelections(catalog) {
  return Object.fromEntries(catalog.map(group => [group.key,{
    enabled:true,line:group.variants.find(v=>v.line==='base')?.line??group.variants[0].line,
    size:'',colour:group.key==='helmet'?'white':'black',options:{}
  }]));
}
export function getVariant(group,selection) {
  return group.variants.find(v=>v.line===selection.line) ?? group.variants[0];
}
const selectedValues = (variant,size,colour,options={}) => Object.fromEntries(variant.options.map(option=>[
  option.name,option.name==='Размер'?size:option.name==='Цвет'?(colours[colour]??colour):(options[option.name]??(option.values.length===1?option.values[0]:''))
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
export function changeLine(group,selection,line) {
  const variant=group.variants.find(v=>v.line===line);
  if(!variant)return selection;
  const sizes=variant.options.find(o=>o.name==='Размер')?.values??[];
  const options=Object.fromEntries(Object.entries(selection.options??{}).filter(([key,value])=>variant.options.some(o=>o.name===key&&o.values.includes(value))));
  return {...selection,line,options,colour:group.key==='gloves'&&line==='cube'?'black':selection.colour,size:sizes.includes(selection.size)?selection.size:''};
}
export function orderIssue(group,selection) {
  const variant=getVariant(group,selection);
  if(group.key==='gloves'&&selection.colour==='red'&&!variant.options.some(o=>o.name==='Цвет'))return 'Красный цвет перчаток ещё не привязан к исполнению в каталоге. Для заказа уточните цвет у MWP или выберите вариант из карточки товара.';
  const wanted=selectedValues(variant,selection.size,selection.colour,selection.options);
  const missing=variant.options.find(o=>!wanted[o.name]||!o.values.includes(wanted[o.name]));
  if(missing)return 'Выберите '+missing.name.toLowerCase()+': '+group.label.toLowerCase();
  if(!getEdition(variant,selection.size,selection.colour,selection.options))return 'Такое сочетание недоступно: '+group.label.toLowerCase();
  return null;
}
export function previewImage(variant,colour) {
  const value=colours[colour]??colour;
  const matched=variant.images.find(i=>i.optionValue===value);
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
