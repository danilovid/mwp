import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialSelections,getVariant,getEdition,getPrice,heightSuggestions,changeLine,cartItems,orderIssue,previewImage} from '../src/app/(site)/constructor/model.js';
import {createScene} from '../src/app/(site)/constructor/figure.js';
const catalog=JSON.parse(readFileSync(new URL('./fixtures/constructor-catalog.json',import.meta.url)));
// Хоккеист начинает раздетым, поэтому полный комплект для проверок собирается явно.
const allEnabled=(list=catalog)=>{
 const selected=initialSelections(list);
 for(const g of list)selected[g.key].enabled=true;
 return selected;
};
const validSelections=()=>{
 const selected=allEnabled();
 for(const g of catalog){const v=getVariant(g,selected[g.key]);selected[g.key].size=v.options.find(o=>o.name==='Размер').values[0];}
 return selected;
};
test('real cart receives exact database values, image basenames and prices; existing cart owns qty/key',()=>{
 const result=cartItems(catalog,validSelections());assert.equal(result.length,7);
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
 const selected=validSelections();selected.gloves.colour='red';
 const gloves=catalog.find(g=>g.key==='gloves');
 assert.match(orderIssue(gloves,selected.gloves),/Красный цвет/);
 assert.throws(()=>cartItems(catalog,selected),/Красный цвет/);
 assert.equal(previewImage(gloves.variants[0],'red').file,'p9-b1a24abf');
 selected.gloves.enabled=false;assert.equal(cartItems(catalog,selected).length,6);
});
test('red gloves become orderable only when a genuine colour edition is present',()=>{
 const mapped=structuredClone(catalog);const gloves=mapped.find(g=>g.key==='gloves');const base=gloves.variants[0];
 base.options.push({name:'Цвет',values:['Черный','Красный']});
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
 assert.equal(Object.keys(selected).length,6);assert.equal(selected.gloves,undefined);
 const cubeOnly=structuredClone(catalog.find(g=>g.key==='chest'));cubeOnly.variants=cubeOnly.variants.filter(v=>v.line==='cube');
 assert.equal(initialSelections([cubeOnly]).chest.line,'cube');
});
test('height is an orientation for configured ranges; overlapping sizes are not collapsed',()=>{
 assert.equal(heightSuggestions(catalog.find(g=>g.key==='chest').variants[0],185).length,2);
 for(const key of ['helmet','gloves','pants','groin'])assert.deepEqual(heightSuggestions(catalog.find(g=>g.key===key).variants[0],178),[]);
});
test('256 figure states keep masks unique and hide groin under pants',()=>{
 const keys=catalog.map(g=>g.key);
 for(let n=0;n<128;n++)for(const colour of ['black','red']){
  const on=Object.fromEntries(keys.map((key,i)=>[key,Boolean(n&(1<<i))]));const svg=createScene({prefix:'test'+n,on,colour});
  assert.equal(svg.includes('id="test'+n+'-groin"'),on.groin&&!on.pants);
  assert.ok(svg.includes('/constructor-assets/figure/base.webp'));
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 }
});
