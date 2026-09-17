document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-germination]').forEach(stage=>{
    const parts=[...stage.querySelectorAll('[data-plant-part]')],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render=()=>{const rect=stage.getBoundingClientRect(),start=innerHeight*.9,progress=Math.max(0,Math.min(1,(start-rect.top)/(rect.height*.72)));stage.style.setProperty('--growth',progress.toFixed(3));parts.forEach(part=>{const range=part.dataset.plantPart.split(',').map(Number),local=Math.max(0,Math.min(1,(progress-range[0])/(range[1]-range[0])));part.style.opacity=local.toFixed(3);part.style.transform=`scale(${(.55+local*.45).toFixed(3)})`;});};
    if(reduce){stage.style.setProperty('--growth',1);parts.forEach(part=>{part.style.opacity=1;part.style.transform='none'});return}let ticking=false;const request=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{render();ticking=false})};render();addEventListener('scroll',request,{passive:true});addEventListener('resize',request);
  });
  const form=document.querySelector('.nav-busca'), input=form?.querySelector('input[type="search"]'), submit=form?.querySelector('button[type="submit"]');
  if(form&&input&&submit){form.addEventListener('submit',event=>{if(innerWidth<=820&&!form.classList.contains('aberta')){event.preventDefault();form.classList.add('aberta');input.focus()}else if(!input.value.trim()){event.preventDefault();form.classList.add('aberta');input.focus()}})}
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});
    btn.classList.add('active');
    btn.setAttribute('aria-pressed','true');
    const value=btn.dataset.filter;
    document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=value!=='todos'&&!card.dataset.category.split(' ').includes(value)})
  }));
  document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.closest('.product-img,.hero-media,.visual,.card-media')?.classList.add('image-error')));
  const store=document.querySelector('.store-layout');
  if(store){
    const grid=store.querySelector('.store-grid'),cards=[...grid.querySelectorAll('[data-category]')],search=store.querySelector('[data-store-search]'),filters=[...store.querySelectorAll('[data-store-filter]')],sort=store.querySelector('[data-store-sort]');
    const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    function updateStore(){
      const query=normalize(search.value.trim());
      cards.forEach(card=>{
        const categories=card.dataset.category.split(' '),price=card.dataset.price===''?null:Number(card.dataset.price);
        card.hidden=!normalize(card.dataset.name+' '+card.dataset.category).includes(query)||filters.some(filter=>{
          const value=filter.value;if(!value)return false;
          if(filter.dataset.storeFilter==='price')return price===null||(value==='above100'?price<=100:price>Number(value));
          return !categories.includes(value);
        });
      });
      const visible=cards.filter(card=>!card.hidden).length;
      store.querySelector('[data-result-count]').textContent=`${visible} ${visible===1?'material':'materiais'}`;
      store.querySelector('.store-empty').hidden=visible>0;
      const ordered=[...cards].sort((a,b)=>{
        if(sort.value==='name')return a.dataset.name.localeCompare(b.dataset.name,'pt-BR');
        if(sort.value==='price-asc'||sort.value==='price-desc'){
          if(a.dataset.price==='')return 1;if(b.dataset.price==='')return -1;
          return (Number(a.dataset.price)-Number(b.dataset.price))*(sort.value==='price-desc'?-1:1);
        }
        return Number(a.dataset.order)-Number(b.dataset.order);
      });
      ordered.forEach(card=>grid.append(card));
    }
    filters.forEach(filter=>filter.addEventListener('change',updateStore));search.addEventListener('input',updateStore);sort.addEventListener('change',updateStore);
    store.querySelector('[data-store-reset]').addEventListener('click',()=>{search.value='';filters.forEach(filter=>filter.value='');sort.value='default';updateStore()});
    updateStore();
  }
  document.querySelectorAll('.format-carousel').forEach(carousel=>{
    const track=carousel.querySelector('.format-track'),original=track.querySelector('.format-group:not([aria-hidden])');
    const fillLoop=()=>{
      const cycle=original.getBoundingClientRect().width;
      if(!cycle)return;
      const copies=Math.max(1,Math.ceil(carousel.clientWidth/cycle));
      if(track.querySelectorAll('.format-group[aria-hidden]').length!==copies){
        track.querySelectorAll('.format-group[aria-hidden]').forEach(copy=>copy.remove());
        for(let i=0;i<copies;i++){const copy=original.cloneNode(true);copy.setAttribute('aria-hidden','true');track.append(copy)}
      }
      track.style.setProperty('--format-cycle',`${cycle}px`);
    };
    fillLoop();new ResizeObserver(fillLoop).observe(carousel);document.fonts.ready.then(fillLoop);
  });
  document.querySelectorAll('[data-product-gallery]').forEach(gallery=>{
    const images=[...gallery.querySelectorAll('[data-gallery-image]')],thumbs=[...gallery.querySelectorAll('[data-gallery-thumb]')];
    thumbs.forEach(button=>button.addEventListener('click',()=>{
      const index=Number(button.dataset.galleryThumb);
      images.forEach((image,i)=>image.classList.toggle('active',i===index));
      thumbs.forEach((thumb,i)=>{thumb.classList.toggle('active',i===index);thumb.setAttribute('aria-pressed',String(i===index))});
    }));
  });
  document.querySelector('[data-carousel-pause]')?.addEventListener('click',event=>{
    const button=event.currentTarget,paused=button.closest('.speech-formats').classList.toggle('paused');
    button.textContent=paused?'Retomar galeria':'Pausar galeria';button.setAttribute('aria-pressed',String(paused));
    if(!paused){button.closest('.speech-formats').classList.remove('manual');button.closest('.speech-formats').querySelector('.format-carousel').scrollLeft=0}
  });
  document.querySelectorAll('[data-carousel-prev],[data-carousel-next]').forEach(button=>button.addEventListener('click',()=>{
    const section=button.closest('.speech-formats'),carousel=section.querySelector('.format-carousel'),group=section.querySelector('.format-group'),pause=section.querySelector('[data-carousel-pause]');
    section.classList.add('paused','manual');pause.textContent='Retomar galeria';pause.setAttribute('aria-pressed','true');
    const step=group.querySelector('.format-card').offsetWidth+18,direction=button.hasAttribute('data-carousel-next')?1:-1;
    if(direction<0&&carousel.scrollLeft===0)carousel.scrollLeft=group.scrollWidth;
    if(direction>0&&carousel.scrollLeft>=group.scrollWidth)carousel.scrollLeft=0;
    carousel.scrollBy({left:direction*step,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  }));
  document.querySelector('[data-ticker-pause]')?.addEventListener('click',event=>{
    const button=event.currentTarget,paused=button.closest('.store-ticker').classList.toggle('paused');button.textContent=paused?'Retomar':'Pausar';button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Retomar barra de vantagens':'Pausar barra de vantagens');
  });
  const paper=document.querySelector('.article-paper'),toc=document.querySelector('[data-article-toc]');
  if(paper&&toc){[...paper.querySelectorAll('h2')].forEach((heading,i)=>{if(heading.closest('.editorial-card'))return;heading.id=`topico-${i+1}`;const anchor=document.createElement('a');anchor.href=`#${heading.id}`;anchor.textContent=heading.textContent;toc.append(anchor)})}
  const blogCards=[...document.querySelectorAll('.blog-list article')];
  if(blogCards.length){
    const theme=new URLSearchParams(location.search).get('tema');
    if(theme){const normalized=theme.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();blogCards.forEach(card=>card.hidden=!card.dataset.blogTopics.split(' ').includes(normalized));}
  }
  document.querySelector('.contact-form')?.addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
    const data=new FormData(form),message=`Olá, Germinar!\nAssunto: ${data.get('assunto')}\nNome: ${data.get('nome')}\nE-mail: ${data.get('email')}\nTelefone: ${data.get('telefone')||'Não informado'}\nEscola/empresa: ${data.get('organizacao')||'Não informado'}\n\n${data.get('mensagem')}`;
    const url=`https://wa.me/554192012005?text=${encodeURIComponent(message)}`;
    window.open(url,'_blank','noopener');
    const status=form.querySelector('.form-status');status.textContent='Sua mensagem está preparada. Revise e envie no WhatsApp. Se a janela não abrir, ';const fallback=document.createElement('a');fallback.href=url;fallback.target='_blank';fallback.rel='noopener';fallback.textContent='abra sua mensagem aqui.';status.append(fallback);
  });
});
