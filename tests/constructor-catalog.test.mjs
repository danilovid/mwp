import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {initialSelections,cartItems,orderIssue} from '../src/app/(site)/constructor/model.js';
import {colourKey} from '../src/app/(site)/constructor/colours.js';

const require=createRequire(import.meta.url);
const published=JSON.parse(readFileSync(new URL('./fixtures/constructor-published-products.json',import.meta.url)));
// Exercise the real server loader against public-only catalog fixtures, without
// connecting tests to the site's customer/order/admin database.
function loader(products) {
 const exports={};
 const mock={
  getPublishedSlugs:async()=>products.map(p=>({slug:p.slug})),
  getProductBySlug:async slug=>{
   const p=products.find(p=>p.slug===slug);if(!p)return null;
   const pair=products.find(q=>p.baseId?q.id===p.baseId:q.baseId===p.id);
   return {...p,pair:pair?{slug:pair.slug}:null};
  },
 };
 const ts=require('typescript');
 const code=ts.transpileModule(readFileSync(new URL('../src/lib/constructor.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>name==='./catalog'?mock:name==='./media'?{imageUrl:(file,width)=>'/uploads/'+file+'-'+width+'.webp'}:require(name)});
 return exports;
}
test('every published product loads exactly once in body variants or supplementary products',async()=>{
 const api=loader(published),catalog=await api.getConstructorCatalog(),extras=await api.getConstructorExtras(catalog);
 const products=[...catalog.flatMap(g=>g.variants),...extras];
 assert.equal(products.length,28);assert.equal(new Set(products.map(p=>p.id)).size,28);
 assert.deepEqual(products.map(p=>p.id).sort((a,b)=>a-b),published.map(p=>p.id));
 assert.equal(catalog.flatMap(g=>g.variants).length,18);assert.equal(extras.length,10);
 assert.ok(catalog.find(g=>g.key==='gloves').variants.some(v=>v.slug==='perchatki-detskie-cube'));
 assert.ok(extras.some(v=>v.slug==='shlem-vratarya'));assert.ok(extras.some(v=>v.slug==='shorty-vratarya'));
});
test('new published products appear automatically; removed SKUs leave no phantom item',async()=>{
 const products=structuredClone(published),api=loader(products);
 products.push({...products.find(p=>p.slug==='klipsy-1'),id:1000,slug:'new-accessory',baseId:null});
 let catalog=await api.getConstructorCatalog(),extras=await api.getConstructorExtras(catalog);
 assert.ok(extras.some(v=>v.id===1000));
 products.splice(products.findIndex(p=>p.id===11),1);
 catalog=await api.getConstructorCatalog();extras=await api.getConstructorExtras(catalog);
 assert.ok(![...catalog.flatMap(g=>g.variants),...extras].some(v=>v.id===11));
});
test('all published editions remain orderable with exact IDs, values, photos and database prices',async()=>{
 const api=loader(published),catalog=await api.getConstructorCatalog(),extras=await api.getConstructorExtras(catalog);
 for(const product of [...catalog.flatMap(g=>g.variants),...extras])for(const edition of product.editions){
  const group={key:'product-'+product.id,label:product.name,variants:[product]},selection=initialSelections([group])[group.key];
  Object.assign(selection,{enabled:true,size:edition.values.Размер??'',colour:edition.values.Цвет?colourKey(edition.values.Цвет):'black',options:{...edition.values}});
  assert.equal(orderIssue(group,selection),null,product.slug+' '+JSON.stringify(edition.values));
  const [item]=cartItems([group],{[group.key]:selection});
  assert.equal(item.productId,product.id);assert.equal(item.price,edition.price);assert.deepEqual(item.values,edition.values);
  assert.ok(product.images.some(i=>i.file===item.image));
 }
});
