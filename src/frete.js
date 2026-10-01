import {ORS_KEY,ORIGEM,PRECO_KM} from './data.js'
const B='https://api.openrouteservice.org'
let origem
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()

export async function buscarCep(cep){
 const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`)
 const j=await r.json()
 if(!r.ok||j.erro)throw new Error('cep')
 return {rua:j.logradouro,bairro:j.bairro,cidade:j.localidade,uf:j.uf}
}

async function geo(texto,foco,cidade,uf){
 const p={api_key:ORS_KEY,text:texto,'boundary.country':'BR',size:10}
 if(foco){p['focus.point.lon']=foco[0];p['focus.point.lat']=foco[1]}
 const r=await fetch(B+'/geocode/search?'+new URLSearchParams(p))
 if(!r.ok)throw new Error('geocode')
 const fs=(await r.json()).features||[]
 const f=cidade?fs.find(x=>{
  const l=norm(x.properties?.label)
  return l.includes(norm(cidade))&&l.includes(', '+uf.toLowerCase()+',')
 }):fs[0]
 if(!f)throw new Error('nao-achou')
 return {c:f.geometry.coordinates,label:f.properties.label,exato:f.properties.layer==='address'}
}

export async function calcularFrete(end,num){
 origem??=(await geo(ORIGEM)).c
 let d
 try{d=await geo(`${end.rua}, ${num}, ${end.bairro}, ${end.cidade}, ${end.uf}`,origem,end.cidade,end.uf)}
 catch{d=await geo(`${end.rua||end.bairro}, ${end.cidade}, ${end.uf}`,origem,end.cidade,end.uf)}
 const r=await fetch(B+'/v2/directions/driving-car',{
  method:'POST',
  headers:{'Content-Type':'application/json',Authorization:ORS_KEY},
  body:JSON.stringify({coordinates:[origem,d.c]})})
 if(!r.ok)throw new Error('rota')
 const km=(await r.json()).routes[0].summary.distance/1000
 return {km:Math.round(km*10)/10,valor:Math.max(1,Math.ceil(km))*PRECO_KM,achado:d.label,exato:d.exato}
}