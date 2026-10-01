import {useState,useMemo,useEffect} from 'react'
import {BRAND,WHATSAPP,CATS,ITEMS,STEPS,FAQ} from './data.js'
import {calcularFrete,buscarCep} from './frete.js'

const Awning=()=>(<div className="awning" aria-hidden="true">{Array.from({length:48}).map((_,i)=><span key={i} className={i%2?'w':'p'}/>)}</div>)
const kernels=Array.from({length:16}).map((_,i)=>({l:(i*37)%100,d:(i*0.7)%6,s:14+(i*5)%18,e:i%3?'🍿':'✨'}))
const brl=v=>'R$ '+v.toFixed(2).replace('.',',')

export default function App(){
 const [cat,setCat]=useState('Todos')
 const [cart,setCart]=useState({})
 const [open,setOpen]=useState(false)
 const [f,setF]=useState({nome:'',data:'',cep:'',num:'',obs:''})
 const [end,setEnd]=useState(null)
 const [fr,setFr]=useState(null)
 const [frSt,setFrSt]=useState('')
 const list=useMemo(()=>ITEMS.filter(i=>cat==='Todos'||i.cat===cat),[cat])
 const sel=ITEMS.filter(i=>cart[i.id])
 const total=Object.values(cart).reduce((a,b)=>a+b,0)
 const add=(id,n=1)=>setCart(c=>{const q=(c[id]||0)+n;const x={...c};q<=0?delete x[id]:x[id]=q;return x})

 // 1) CEP completo -> busca rua, bairro e cidade
 useEffect(()=>{
  const c=f.cep.replace(/\D/g,'')
  setEnd(null);setFr(null);setFrSt('')
  if(c.length!==8)return
  let vivo=true;setFrSt('carregando')
  buscarCep(c).then(e=>vivo&&setEnd(e)).catch(()=>vivo&&setFrSt('cep'))
  return()=>{vivo=false}
 },[f.cep])

 // 2) endereço + número -> calcula o frete
 useEffect(()=>{
  setFr(null)
  if(!end||!f.num.trim()){if(end)setFrSt('');return}
  setFrSt('carregando');let vivo=true
  const id=setTimeout(async()=>{
   try{const r=await calcularFrete(end,f.num.trim());if(vivo){setFr(r);setFrSt('')}}
   catch{if(vivo)setFrSt('erro')}
  },700)
  return()=>{vivo=false;clearTimeout(id)}
 },[end,f.num])

 useEffect(()=>{document.body.style.overflow=open?'hidden':''},[open])

 const send=()=>{
  const dataBR=f.data?f.data.split('-').reverse().join('/'):'-'
  const linhas=sel.map(i=>`• ${cart[i.id]}x ${i.name}`).join('\n')
  const frete=fr?`${brl(fr.valor)} (${fr.km} km)`:'a combinar'
  const endTxt=end?`${end.rua}, ${f.num||'s/n'} - ${end.bairro}, ${end.cidade}/${end.uf} (CEP ${f.cep})`:'-'
  const msg=`Olá! Vim pelo site da ${BRAND} e quero um orçamento de locação:\n\n${linhas||'(ainda vou escolher os itens)'}\n\nNome: ${f.nome||'-'}\nData da festa: ${dataBR}\nEndereço da festa: ${endTxt}\nFrete estimado: ${frete}${f.obs?`\nObs.: ${f.obs}`:''}`
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,'_blank','noopener')
 }

 const set=k=>e=>setF({...f,[k]:e.target.value})
 return(<>
 <header className="top"><a className="logo" href="#topo"><img src="/logo.png" alt={BRAND}/></a>
  <nav><a href="#catalogo">Catálogo</a><a href="#como">Como funciona</a><a href="#duvidas">Dúvidas</a></nav>
  <button className="bag" onClick={()=>setOpen(true)} aria-label="Abrir meu pedido">Meu pedido{total>0&&<b>{total}</b>}</button></header>

 <section className="hero" id="topo">
  <div className="kern" aria-hidden="true">{kernels.map((k,i)=><i key={i} style={{left:k.l+'%',animationDelay:k.d+'s',fontSize:k.s}}>{k.e}</i>)}</div>
  <div className="hero-in"><p className="pill">Locação para festas</p>
   <h1>Sua festa com cheiro de pipoca e gosto de infância.</h1>
   <p className="lead">Pipoqueira, algodão-doce, brinquedos e combos. Você monta o pedido aqui e fecha tudo pela conversa no WhatsApp.</p>
   <div className="cta"><a className="btn pink" href="#catalogo">Montar meu pedido</a>
   <a className="btn ghost" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">Falar no WhatsApp</a></div></div>
  <Awning/></section>

 <section className="sec" id="catalogo"><h2>O que você quer alugar?</h2>
  <div className="tabs" role="tablist">{CATS.map(c=><button key={c} role="tab" aria-selected={c===cat} className={c===cat?'on':''} onClick={()=>setCat(c)}>{c}</button>)}</div>
  <div className="grid">{list.map(i=>(<article className="card" key={i.id}>
   <div className="ico">{i.emoji}</div><h3>{i.name}</h3><p>{i.desc}</p>
   <div className="row"><span className="price">a partir de <b>{i.price}</b></span>
   {cart[i.id]?<div className="qty"><button onClick={()=>add(i.id,-1)} aria-label="Menos">−</button><span>{cart[i.id]}</span><button onClick={()=>add(i.id)} aria-label="Mais">+</button></div>
   :<button className="btn pink sm" onClick={()=>add(i.id)}>Adicionar</button>}</div></article>))}</div></section>

 <section className="sec alt" id="como"><h2>Como funciona</h2>
  <ol className="steps">{STEPS.map(([t,d],i)=><li key={t}><span>{i+1}</span><h3>{t}</h3><p>{d}</p></li>)}</ol></section>

 <section className="sec" id="duvidas"><h2>Dúvidas comuns</h2>
  <div className="faq">{FAQ.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>

 <footer><Awning/><div className="foot"><b>{BRAND}</b><p>Locação de máquinas e brinquedos para festas.</p>
  <a className="btn pink" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">Pedir orçamento</a></div></footer>

 <a className="fab" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>

 <div className={'veil'+(open?' show':'')} onClick={()=>setOpen(false)}/>
 <aside className={'drawer'+(open?' show':'')} aria-hidden={!open}>
  <div className="dh"><h2>Meu pedido</h2><button onClick={()=>setOpen(false)} aria-label="Fechar">✕</button></div>
  <div className="db">{sel.length===0?<p className="empty">Nada por aqui ainda. Adicione itens do catálogo.</p>:
   sel.map(i=><div className="li" key={i.id}><span>{i.emoji} {i.name}</span><div className="qty"><button onClick={()=>add(i.id,-1)}>−</button><span>{cart[i.id]}</span><button onClick={()=>add(i.id)}>+</button></div></div>)}
   <label>Seu nome<input value={f.nome} onChange={set('nome')} autoComplete="name"/></label>
   <label>Data da festa<input type="date" value={f.data} onChange={set('data')}/></label>
   <label>CEP da festa<input value={f.cep} onChange={set('cep')} inputMode="numeric" maxLength="9" placeholder="00000-000" autoComplete="postal-code"/></label>
   {end&&<p className="empty">{end.rua&&end.rua+', '}{end.bairro&&end.bairro+' - '}{end.cidade}/{end.uf}</p>}
   {end&&<label>Número e complemento<input value={f.num} onChange={set('num')}/></label>}
   {frSt==='carregando'&&<p className="empty">Calculando...</p>}
   {fr&&<p className="empty">Frete estimado: <b>{brl(fr.valor)}</b> ({fr.km} km)<br/></p>}
   {frSt==='cep'&&<p className="empty">CEP não encontrado. Confira os números.</p>}
   {frSt==='erro'&&<p className="empty">Não consegui calcular. Confira o número ou combine o frete pelo WhatsApp.</p>}
   <label>Observações<textarea rows="2" value={f.obs} onChange={set('obs')}/></label></div>
  <div className="df"><button className="btn wa" onClick={send} disabled={frSt==='carregando'}>Enviar pelo WhatsApp</button><small>O valor final é combinado na conversa.</small></div></aside>
 </>)}