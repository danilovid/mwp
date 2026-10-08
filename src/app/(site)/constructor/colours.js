// One colour vocabulary for catalog options, swatches, gallery and figure assets.
// Labels returned to the cart always remain the exact catalog strings.
export const COLOURS = {
  white:{label:'Белый',css:'#f2f4f7'},
  black:{label:'Черный',css:'#1b2029'},
  red:{label:'Красный',css:'#d92b3c'},
  blue:{label:'Синий',css:'#2b63c6'},
  redblack:{label:'Красно-черный',css:'linear-gradient(135deg,#d92b3c 50%,#1b2029 50%)'},
  blueblack:{label:'Сине-черный',css:'linear-gradient(135deg,#2b63c6 50%,#1b2029 50%)'},
  blackred:{label:'Черно-красный',css:'linear-gradient(135deg,#1b2029 50%,#d92b3c 50%)'},
};

export const normaliseColour = value => String(value??'').normalize('NFKC').trim().toLowerCase().replaceAll('ё','е').replace(/[–—−]/g,'-').replace(/\s*-\s*/g,'-');

export function colourKey(value) {
  if(Object.hasOwn(COLOURS,value))return value;
  return Object.keys(COLOURS).find(key=>normaliseColour(COLOURS[key].label)===normaliseColour(value)) ?? value;
}

export function colourValue(variant,key) {
  const option=variant.options.find(o=>o.name==='Цвет');
  // The CUBE glove's only colour is automatic, even if the previous base colour differs.
  if(option?.values.length===1)return option.values[0];
  const label=COLOURS[key]?.label??key;
  if(!option)return label;
  return option.values.find(value=>normaliseColour(value)===normaliseColour(label)) ?? '';
}

export function colourChoices(variant) {
  return (variant.options.find(o=>o.name==='Цвет')?.values??[]).map(value=>{
    const key=colourKey(value);
    return {key,label:value,css:COLOURS[key]?.css};
  });
}
