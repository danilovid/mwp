import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialSelections,getVariant,getEdition,getPrice,heightSuggestions,changeLine,changeVariant,setEnabled,cartItems,orderIssue,previewImage,visibilityNote,kitLabel,figureSelection} from '../src/app/(site)/constructor/model.js';
import {createScene,DEFAULT_URLS,HELMET_SOURCES,GLOVE_SOURCES,CUBE_SOURCES,SOURCE_FRAMES} from '../src/app/(site)/constructor/figure.js';
import {COLOURS,colourChoices,colourValue,colourKey,normaliseColour} from '../src/app/(site)/constructor/colours.js';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('./fixtures/constructor-catalog.json',import.meta.url)));
// Хоккеист начинает раздетым, поэтому полный комплект для проверок собирается явно.
const allEnabled=(list=catalog)=>{
 const selected=initialSelections(list);
 for(const g of list)selected[g.key].enabled=true;
 return selected;
};
const validSelections=()=>{
 const selected=allEnabled();
 for(const g of catalog){const v=getVariant(g,selected[g.key]);selected[g.key].size=v.options.find(o=>o.name==='Размер')?.values[0]??'';}
 return selected;
};
test('real cart receives exact database values, image basenames and prices; existing cart owns qty/key',()=>{
 const result=cartItems(catalog,validSelections());assert.equal(result.length,10);
 assert.equal(result[0].values['Цвет'],'Белый');
 for(const item of result){
  const v=catalog.flatMap(g=>g.variants).find(v=>v.id===item.productId);
  const e=v.editions.find(e=>JSON.stringify(e.values)===JSON.stringify(item.values));
  assert.ok(e);assert.equal(item.price,e.price);assert.ok(v.images.some(i=>i.file===item.image));
  assert.ok(!('qty' in item));assert.ok(!('previewColour' in item));assert.ok(!('editionId' in item));
 }
});
test('all required options must match; arbitrary size or missing colour is never substituted',()=>{
 const helmet=catalog.find(g=>g.key==='helmet').variants[0];
 assert.equal(getEdition(helmet,'invented','white'),null);
 assert.equal(getEdition(helmet,'S',''),null);
 assert.equal(getEdition(helmet,'S','purple'),null);
 assert.throws(()=>cartItems(catalog,allEnabled()),/Выберите/);
 assert.deepEqual(cartItems(catalog,initialSelections(catalog)),[],'раздетый хоккеист — пустой комплект');
});
test('unmapped red gloves are visible but cannot enter the real cart',()=>{
 const legacy=structuredClone(catalog);const selected=validSelections();selected.gloves.colour='red';
 const gloves=legacy.find(g=>g.key==='gloves');gloves.variants[0].options=gloves.variants[0].options.filter(o=>o.name!=='Цвет');
 assert.match(orderIssue(gloves,selected.gloves),/Красный цвет/);
 assert.throws(()=>cartItems(legacy,selected),/Красный цвет/);
 assert.equal(previewImage(gloves.variants[0],'red').file,'p9-b1a24abf');
 selected.gloves.enabled=false;assert.equal(cartItems(catalog,selected).length,9);
});
test('red gloves become orderable only when a genuine colour edition is present',()=>{
 const mapped=structuredClone(catalog);const gloves=mapped.find(g=>g.key==='gloves');const base=gloves.variants[0];
 base.options=base.options.filter(o=>o.name!=='Цвет');base.options.push({name:'Цвет',values:['Черный','Красный']});
 base.editions=base.editions.flatMap(e=>['Черный','Красный'].map((colour,i)=>({...e,id:e.id*10+i,price:e.price+i*100,values:{...e.values,Цвет:colour}})));
 base.images[2].optionValue='Красный';
 const selected=validSelections();selected.gloves.colour='red';
 assert.equal(orderIssue(gloves,selected.gloves),null);
 const item=cartItems(mapped,selected).find(i=>i.productId===base.id);
 assert.equal(item.values['Цвет'],'Красный');assert.equal(item.image,base.images[2].file);
 assert.equal(item.price,base.editions.find(e=>e.values.Размер===selected.gloves.size&&e.values.Цвет==='Красный').price);
});
test('unsupported CUBE stays unchanged; supported CUBE resolves the selected size and current price',()=>{
 const selected=validSelections(),helmet=catalog.find(g=>g.key==='helmet');
 assert.equal(changeLine(helmet,selected.helmet,'cube'),selected.helmet);
 const gloves=catalog.find(g=>g.key==='gloves');selected.gloves=changeLine(gloves,{...selected.gloves,colour:'red'},'cube');
 const variant=getVariant(gloves,selected.gloves);assert.equal(variant.line,'cube');assert.equal(selected.gloves.colour,'black');
 assert.equal(getPrice(variant,selected.gloves),getEdition(variant,selected.gloves.size,'black').price);
});
test('price changes and newly required options take effect from fresh props',()=>{
 const updated=structuredClone(catalog);const gloves=updated.find(g=>g.key==='gloves');const selected=validSelections();
 for(const e of gloves.variants[0].editions)e.price+=123;
 assert.equal(getPrice(gloves.variants[0],selected.gloves),getPrice(catalog.find(g=>g.key==='gloves').variants[0],selected.gloves)+123);
 gloves.variants[0].options.push({name:'Посадка',values:['Стандартная','Широкая']});
 for(const e of gloves.variants[0].editions)e.values.Посадка='Стандартная';
 assert.match(orderIssue(gloves,selected.gloves),/посадка/);
 selected.gloves.options.Посадка='Стандартная';assert.equal(orderIssue(gloves,selected.gloves),null);
});
test('only published/loaded groups initialise; missing categories do not break state',()=>{
 const subset=catalog.filter(g=>g.key!=='gloves');const selected=initialSelections(subset);
 assert.equal(Object.keys(selected).length,9);assert.equal(selected.gloves,undefined);
 const cubeOnly=structuredClone(catalog.find(g=>g.key==='chest'));cubeOnly.variants=cubeOnly.variants.filter(v=>v.line==='cube');
 assert.equal(initialSelections([cubeOnly]).chest.line,'cube');
});
test('height is an orientation for configured ranges; overlapping sizes are not collapsed',()=>{
 assert.equal(heightSuggestions(catalog.find(g=>g.key==='chest').variants[0],185).length,2);
 for(const key of ['helmet','gloves','pants','groin'])assert.deepEqual(heightSuggestions(catalog.find(g=>g.key===key).variants[0],178),[]);
});
test('2048 figure states keep masks unique and hide groin under pants',()=>{
 const keys=catalog.map(g=>g.key);
 for(let n=0;n<1024;n++)for(const colour of ['black','red']){
  const on=Object.fromEntries(keys.map((key,i)=>[key,Boolean(n&(1<<i))]));const svg=createScene({prefix:'test'+n,on,colour});
  assert.equal(svg.includes('id="test'+n+'-groin"'),on.groin&&!on.pants);
  assert.ok(svg.includes('/constructor-assets/figure/base.webp'));
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 }
});

test('chin accessory needs no size, gets a kit check and exact edition',()=>{
 const group=catalog.find(g=>g.key==='chin');const selected=initialSelections([group]);selected.chin.enabled=true;
 assert.equal(orderIssue(group,selected.chin),null);assert.equal(kitLabel(group,selected.chin),'В комплекте');
 assert.deepEqual(cartItems([group],selected),[{productId:4,slug:'zashchita-podborodka',name:group.variants[0].name,values:{},price:490,image:'p4-f850fc6b'}]);
});
test('helmet and removable mask are separate products, not a second mask on a bundle',()=>{
 const selected=initialSelections(catalog);selected.helmet={...selected.helmet,enabled:true,size:'M'};selected.mask={...selected.mask,enabled:true,size:'L'};
 const items=cartItems(catalog,selected);assert.deepEqual(items.map(i=>i.productId),[1,3]);
 assert.equal(items.reduce((sum,i)=>sum+i.price,0),3020);
 selected.mask.enabled=false;assert.equal(cartItems(catalog,selected)[0].price,2040);
});
test('mask can be ordered for an existing helmet; removing preview helmet does not drop the accessory',()=>{
 const selected=initialSelections(catalog);selected.mask={...selected.mask,enabled:true,size:'S'};
 assert.match(visibilityNote('mask',selected),/когда добавите шлем/);assert.equal(cartItems(catalog,selected)[0].productId,3);
 assert.ok(!createScene({on:{mask:true}}).includes('helmet-bare.webp'));
 const masked=createScene({on:{helmet:true,mask:true}});assert.ok(masked.includes('master.webp'));assert.ok(!masked.includes('helmet-bare.webp'));
 const bare=createScene({on:{helmet:true,mask:false}});assert.ok(bare.includes('helmet-bare.webp'));assert.ok(!bare.includes('master.webp'));
});
test('neck base/CUBE sizes retain exact separate database prices and photos',()=>{
 const group=catalog.find(g=>g.key==='neck');let s={...initialSelections([group]).neck,enabled:true,size:'Юниор'};
 assert.equal(getPrice(getVariant(group,s),s),590);s=changeLine(group,s,'cube');
 assert.equal(getPrice(getVariant(group,s),s),750);const [item]=cartItems([group],{neck:s});
 assert.equal(item.productId,19);assert.deepEqual(item.values,{'Размер':'Юниор'});assert.equal(item.image,'p19-658d883f');
 assert.ok(createScene({on:{neck:true},neckLine:'cube'}).includes('neck-cube.webp'));
 assert.ok(createScene({on:{neck:true},neckLine:'base'}).includes('neck-base.webp'));
});
test('CUBE glove sole colour remains automatic and 12,5 costs exactly 4220',()=>{
 const group=catalog.find(g=>g.key==='gloves');let s=initialSelections([group]).gloves;s=changeLine(group,s,'cube');s={...s,enabled:true,size:'12,5'};
 assert.equal(orderIssue(group,s),null);assert.equal(getPrice(getVariant(group,s),s),4220);
 assert.equal(cartItems([group],{gloves:s})[0].values['Цвет'],'Черно-красный');
});

test('every catalog colour is a selectable swatch, matching gallery photo and exact cart option',()=>{
 for(const key of ['helmet','gloves']){
  const group=catalog.find(g=>g.key===key),variant=group.variants.find(v=>v.line==='base');
  const choices=colourChoices(variant);assert.equal(choices.length,variant.options.find(o=>o.name==='Цвет').values.length);
  for(const choice of choices){
   assert.ok(COLOURS[choice.key]);const selected=initialSelections(catalog);
   selected[key]={...selected[key],enabled:true,size:key==='helmet'?'M':'12,5',colour:choice.key};
   assert.equal(orderIssue(group,selected[key]),null);
   assert.equal(previewImage(variant,choice.key).optionValue,choice.label);
   const [item]=cartItems(catalog,selected);assert.equal(item.values['Цвет'],choice.label);
   assert.equal(item.price,getEdition(variant,selected[key].size,choice.key).price);
   assert.equal(figureSelection(catalog,selected)[key==='helmet'?'helmetColour':'gloveColour'],choice.key);
  }
 }
});
test('colour spelling is normalised for matching but exact database labels reach the cart',()=>{
 const group=structuredClone(catalog.find(g=>g.key==='helmet')),variant=group.variants[0];
 for(const o of variant.options)if(o.name==='Цвет')o.values=o.values.map(v=>v==='Черный'?'Чёрный':v);
 for(const e of variant.editions)if(e.values.Цвет==='Черный')e.values.Цвет='Чёрный';
 for(const i of variant.images)if(i.optionValue==='Черный')i.optionValue='Чёрный';
 const selected=initialSelections([group]);selected.helmet={...selected.helmet,enabled:true,size:'S',colour:'black'};
 assert.equal(cartItems([group],selected)[0].values.Цвет,'Чёрный');
 assert.equal(previewImage(variant,'black').optionValue,'Чёрный');
 assert.equal(colourKey('Сине–чёрный'),'blueblack');
 assert.notEqual(colourKey('Черно-красный'),colourKey('Красно-черный'));
 assert.equal(normaliseColour('  Красно — чёрный '),'красно-черный');
 assert.equal(colourValue(variant,'purple'),'');
});
test('every base glove colour switches to genuine CUBE single-colour asset and returns to base',()=>{
 const group=catalog.find(g=>g.key==='gloves');
 for(const choice of colourChoices(group.variants[0])){
  const selected=initialSelections(catalog);selected.gloves={...selected.gloves,enabled:true,size:'12,5',colour:choice.key};
  selected.gloves=changeLine(group,selected.gloves,'cube');
  const options=figureSelection(catalog,selected);assert.equal(options.gloveColour,'blackred');assert.equal(options.gloveLine,'cube');
  const svg=createScene(options);assert.ok(svg.includes('gloves-cube-left.webp'));assert.ok(svg.includes('gloves-cube-right.webp'));
  assert.equal(cartItems(catalog,selected)[0].price,4220);assert.equal(cartItems(catalog,selected)[0].values.Цвет,'Черно-красный');
  selected.gloves=changeLine(group,selected.gloves,'base');
  assert.equal(figureSelection(catalog,selected).gloveLine,'base');assert.equal(orderIssue(group,selected.gloves),null);
 }
});
test('four helmet colours work with mask on/off and chin without changing fixed face sources',()=>{
 for(const colour of ['white','black','red','blue'])for(const mask of [false,true])for(const chin of [false,true]){
  const on={helmet:true,mask,chin};const svg=createScene({on,helmetColour:colour,prefix:'colour-check'});
  const head=svg.match(/<image href="([^"]+)"[^>]*mask="url\(#colour-check-helmet\)"/)[1];
  assert.equal(head,mask?DEFAULT_URLS.master:DEFAULT_URLS.helmetBare);
  if(colour==='white')assert.ok(!svg.includes('id="colour-check-helmetPaint"'));
  else{
   const key=HELMET_SOURCES[colour][mask?'mask':'bare'];assert.ok(svg.includes(DEFAULT_URLS[key]));
   assert.ok(svg.includes('fill-rule="evenodd"'));
  }
  assert.equal(svg.includes('id="colour-check-chin"'),chin&&!mask);
 }
});
test('all forty helmet/glove colour combinations select the correct available assets',()=>{
 const gloves=[['base','black'],['base','red'],['base','redblack'],['base','blueblack'],['cube','blackred']];
 for(const helmetColour of ['white','black','red','blue'])for(const [gloveLine,gloveColour] of gloves)for(const mask of [false,true]){
  const svg=createScene({on:{helmet:true,gloves:true,mask},helmetColour,gloveLine,gloveColour});
  const pair=gloveLine==='cube'?GLOVE_SOURCES.cube:GLOVE_SOURCES[gloveColour];
  if(pair){assert.ok(svg.includes(DEFAULT_URLS[pair.left]));assert.ok(svg.includes(DEFAULT_URLS[pair.right]));}
  else assert.ok(svg.includes(gloveColour==='red'?DEFAULT_URLS.red:DEFAULT_URLS.master));
  assert.ok(!svg.includes('undefined'));assert.ok(!svg.includes('NaN'));
 }
});
test('all cropped assets exist, match their coordinate frames and stay below 400 KB combined',async()=>{
 const sharp=require('sharp');let bytes=0;
 for(const [key,frame] of Object.entries(SOURCE_FRAMES)){
  const path=new URL('../public'+DEFAULT_URLS[key],import.meta.url);const buf=readFileSync(path);bytes+=buf.length;
  const meta=await sharp(buf).metadata();assert.equal(meta.width,frame.width);assert.equal(meta.height,frame.height);assert.ok(meta.hasAlpha);
 }
 assert.ok(bytes<400000,`All cropped colour/CUBE assets total ${bytes} bytes`);
});

test('mixed base/CUBE equipment selects each independent source, never only a global line',()=>{
 const keys=['chest','elbows','pants','shins'];
 for(let mask=0;mask<16;mask++){
  const selected=initialSelections(catalog);
  for(const [i,key] of keys.entries()){
   const group=catalog.find(g=>g.key===key);
   selected[key]={...changeLine(group,selected[key],mask&(1<<i)?'cube':'base'),enabled:true};
  }
  const options=figureSelection(catalog,selected),svg=createScene(options);
  for(const [part,source] of Object.entries(CUBE_SOURCES)){
   const key=part.startsWith('elbow')?'elbows':part;
   assert.equal(svg.includes(DEFAULT_URLS[source]),options[key+'Line']==='cube');
  }
 }
});
test('child CUBE is a separate glove SKU with sizes 8/9, genuine price and its own pattern',()=>{
 const group=catalog.find(g=>g.key==='gloves'),child=group.variants.find(v=>v.slug==='perchatki-detskie-cube');
 let selected=initialSelections(catalog);selected.gloves=changeVariant(group,{...selected.gloves,enabled:true,size:'12,5',colour:'red'},child.id);
 assert.equal(selected.gloves.size,'');assert.match(orderIssue(group,selected.gloves),/размер/);
 for(const size of ['8','9']){
  selected.gloves={...selected.gloves,size};
  const [item]=cartItems(catalog,selected);assert.equal(item.productId,11);assert.equal(item.price,3290);assert.deepEqual(item.values,{'Размер':size});
  const svg=createScene(figureSelection(catalog,selected));assert.ok(svg.includes('gloves-child-cube-left.webp'));assert.ok(!svg.includes('/gloves-cube-left.webp'));
 }
 selected.gloves=changeLine(group,selected.gloves,'cube');assert.equal(getVariant(group,selected.gloves).id,11,'same-line master switch preserves child SKU');
 selected.gloves=changeLine(group,selected.gloves,'base');assert.equal(getVariant(group,selected.gloves).id,9);assert.equal(selected.gloves.size,'');
});
test('bundled helmet includes mask at 2970 and replacing it with separate cage cannot charge twice',()=>{
 const helmet=catalog.find(g=>g.key==='helmet'),bundle=helmet.variants.find(v=>v.includesMask);
 let selected=initialSelections(catalog);selected.helmet={...changeVariant(helmet,selected.helmet,bundle.id),size:'M'};selected.mask={...selected.mask,enabled:true,size:'L'};
 selected=setEnabled(catalog,selected,'helmet',true);
 assert.equal(selected.mask.enabled,false);assert.equal(figureSelection(catalog,selected).on.mask,true);
 let items=cartItems(catalog,selected);assert.equal(items.length,1);assert.equal(items[0].productId,2);assert.equal(items[0].price,2970);
 selected=setEnabled(catalog,selected,'mask',true);items=cartItems(catalog,selected);
 assert.deepEqual(items.map(i=>i.productId),[1,3]);assert.equal(items.reduce((sum,i)=>sum+i.price,0),3020);
 assert.equal(selected.helmet.size,'M');assert.equal(selected.helmet.colour,'white');
 selected=setEnabled(catalog,selected,'mask',false);assert.equal(figureSelection(catalog,selected).on.mask,false);
});
