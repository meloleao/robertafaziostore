// ─── DATA ───────────────────────────────────────────────────────────────────

const products = [
  {
    id: 1, name: 'Caneca Sanguínea', category: 'canecas',
    price: 59.90, badge: 'best',
    img: './Imagens/sanguinia.jpg',
    desc: 'Caneca artística ilustrada com as características da Sanguínea.',
    tag: 'Mais Vendido'
  },
  {
    id: 2, name: 'Caneca Colérica', category: 'canecas',
    price: 59.90, badge: 'new',
    img: './Imagens/colerica.jpg',
    desc: 'Caneca artística ilustrada com as características da Colérica.',
    tag: 'Novo'
  },
  {
    id: 9, name: 'Caneca Fleumática', category: 'canecas',
    price: 59.90,
    img: './Imagens/fleumatica.jpg',
    desc: 'Caneca artística ilustrada com as características da Fleumática.'
  },
  {
    id: 10, name: 'Caneca Melancólica', category: 'canecas',
    price: 59.90,
    img: './Imagens/melancolica.jpg',
    desc: 'Caneca artística ilustrada com as características da Melancólica.'
  },
  {
    id: 3, name: 'Print A Sanguínea', category: 'prints',
    price: 49.90, oldPrice: 69.90, badge: 'best',
    img: './Imagens/sanguinia.jpg',
    desc: 'Pôster A3 premium da ilustração original A Sanguínea.',
    tag: 'Mais Vendido'
  },
  {
    id: 4, name: 'Print A Colérica', category: 'prints',
    price: 49.90,
    img: './Imagens/colerica.jpg',
    desc: 'Pôster A3 premium da ilustração original A Colérica.'
  },
  {
    id: 5, name: 'Print A Fleumática', category: 'prints',
    price: 49.90,
    img: './Imagens/fleumatica.jpg',
    desc: 'Pôster A3 premium da ilustração original A Fleumática.'
  },
  {
    id: 6, name: 'Print A Melancólica', category: 'prints',
    price: 49.90,
    img: './Imagens/melancolica.jpg',
    desc: 'Pôster A3 premium da illustration original A Melancólica.'
  },
  {
    id: 7, name: 'Curso Online: Os 4 Temperamentos', category: 'cursos',
    price: 297, oldPrice: 497, badge: 'digital',
    img: './Imagens/Livro.jpg',
    desc: 'Curso completo com 8 módulos em vídeo. Acesso vitalício.',
    tag: 'Digital'
  },
  {
    id: 8, name: 'Mentoria Individual', category: 'cursos',
    price: 450, badge: 'digital',
    img: './Imagens/Livro.jpg',
    desc: '1 hora de mentoria individual com Roberta Fazio via videoconferência.',
    tag: 'Digital'
  }
];


const book = {
  title: 'Você, o seu temperamento e um propósito',
  price: 79.90,
  desc: 'Roberta Fázio é missionária, especialista nos quatro temperamentos e mentora. Através de seu ministério, tem impactado significativamente a vida de muitas mulheres, guiando-as em suas jornadas de autoconhecimento e relacionamento com Deus.',
  pages: 192, edition: '1ª Edição', publisher: 'Ágape', year: 2024,
  img: './Imagens/Livro.jpg',
  details: {
    isbn10: '6557241443',
    isbn13: '978-6557241448',
    date: '15 de setembro de 2024',
    language: 'Português'
  }
};

// ─── CART STATE ──────────────────────────────────────────────────────────────

let cart = JSON.parse(localStorage.getItem('rf-cart') || '[]');
let currentPage = 'home';
let activeFilter = 'todos';

function saveCart() { localStorage.setItem('rf-cart', JSON.stringify(cart)); }

// ─── CART FUNCTIONS ───────────────────────────────────────────────────────────

function addToCart(id) {
  const product = [...products, { ...book, id: 99, name: book.title, category: 'livro', badge: 'best' }]
    .find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 }); }
  saveCart();
  renderCart();
  showToast(`"${product.name}" adicionado! 🛍️`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');
  const badge = document.getElementById('cart-badge');
  const totalEl = document.getElementById('cart-total-price');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';

  if (cart.length === 0) {
    emptyEl.style.display = 'flex';
    footer.style.display = 'none';
    container.innerHTML = '';
    container.appendChild(emptyEl);
    return;
  }

  emptyEl.style.display = 'none';
  footer.style.display = 'flex';
  totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.background='#f3eddf'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeFromCart(${item.id})">
        <span class="material-symbols-outlined" style="font-size:1.1rem">delete</span>
      </button>
    </div>
  `).join('');
}

function toggleCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  overlay.classList.toggle('open');
  drawer.classList.toggle('open');
}

function checkout() {
  toggleCart();
  document.getElementById('checkout-modal').style.display = 'flex';
}

function closeCheckout() {
  document.getElementById('checkout-modal').style.display = 'none';
  cart = []; saveCart(); renderCart();
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function showToast(msg) {
  let toast = document.getElementById('rf-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'rf-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:1rem">check_circle</span> ${msg}`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── PAGE RENDER ──────────────────────────────────────────────────────────────

function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  window.scrollTo(0, 0);
  renderPage(page);
}

function renderPage(page) {
  const el = document.getElementById(`page-${page}`);
  if (page === 'home') renderHome(el);
  else if (page === 'store') renderStore(el);
  else if (page === 'about') renderAbout(el);
  else if (page === 'book') renderBook(el);
}


// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function renderHome(el) {
  el.innerHTML = `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-text">
        <div class="section-label">Autoconhecimento com Propósito</div>
        <h1>A arte de<br><em>compreender</em> a alma.</h1>
        <p>Arquiteta e Psicanalista cristã de formação, e mentora de milhares de mulheres, Roberta Fázio ajuda mulheres a descobrirem sua essência sob uma perspectiva cristã.</p>
        <div class="hero-tags">
          <span class="tag tag-red">SANGUÍNEA</span>
          <span class="tag tag-green">FLEUMÁTICA</span>
          <span class="tag tag-sand">MELANCÓLICA</span>
          <span class="tag tag-teal">COLÉRICA</span>
        </div>
        <div class="hero-btns">
          <button class="btn-primary" onclick="showPage('store')">
            <span class="material-symbols-outlined" style="font-size:1rem">storefront</span>
            Explorar Loja
          </button>
          <button class="btn-ghost" onclick="showPage('book')">Conheça o Livro</button>
        </div>
      </div>
      <div class="hero-img">
        <img src="./Imagens/Roberta.png" alt="Roberta Fázio - A Menina dos Temperamentos">
        <div class="hero-quote" style="border-top-color: var(--primary)">
          <p>"O temperamento não é um destino, é o ponto de partida para a virtude."</p>
        </div>
      </div>
    </section>

    <!-- TEMPERAMENTOS -->
    <section class="temper-strip">
      <div class="section-header center" style="max-width:1200px;margin:0 auto 2.5rem">
        <div class="section-label">Conheça os Temperamentos</div>
        <h2 class="section-title">Qual é o seu perfil?</h2>
      </div>
      <div class="temper-grid" style="max-width:1200px;margin:0 auto">
        ${[
          { 
            img:'./Imagens/colerica.jpg', label:'COLÉRICA', element: 'FOGO',
            desc: 'O perfil da ação e do comando. Decidido, focado em resultados e com alta energia de realização.',
            good: 'Liderança natural, coragem e lealdade.',
            challenge: 'Impaciência, ira e autoritarismo.',
            color:'#9a402b' 
          },
          { 
            img:'./Imagens/sanguinia.jpg', label:'SANGUÍNEA', element: 'AR',
            desc: 'Perfil da comunicação e movimento. Pessoas vibrantes, que iluminam o ambiente e se adaptam fácil.',
            good: 'Alegria, facilidade em fazer amigos e entusiasmo.',
            challenge: 'Falta de constância e superficialidade.',
            color:'#3a6756' 
          },
          { 
            img:'./Imagens/fleumatica.jpg', label:'FLEUMÁTICA', element: 'ÁGIA',
            desc: 'Perfil da paz e constância. Diplomático, calmo e dificilmente perde o controle emocional.',
            good: 'Confiabilidade, bom senso e mediação de conflitos.',
            challenge: 'Lentidão, passividade e dificuldade em se posicionar.',
            color:'#306466' 
          },
          { 
            img:'./Imagens/melancolica.jpg', label:'MELANCÓLICA', element: 'TERRA',
            desc: 'Perfil da profundidade e ordem. Detalhista, sensível e busca perfeição em tudo o que faz.',
            good: 'Lealdade extrema, senso estético e análise profunda.',
            challenge: 'Pessimismo, rancor e paralisia pelo perfeccionismo.',
            color:'#7e2b18' 
          }
        ].map(t => `
          <div class="temper-card">
            <div class="temper-card-img">
              <img src="${t.img}" alt="${t.label}">
            </div>
            <div class="temper-card-content">
              <span class="tag" style="background:${t.color};color:white;margin-bottom:0.5rem">${t.label} (${t.element})</span>
              <p class="temper-desc">${t.desc}</p>
              <div class="temper-details">
                <strong>Lado bom:</strong> ${t.good}<br>
                <strong>Desafio:</strong> ${t.challenge}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- DESTAQUES -->
    <section class="section">
      <div class="products-section">
        <div class="section-header">
          <div class="section-label">Mais Amados</div>
          <h2 class="section-title">Produtos em Destaque</h2>
          <p class="section-subtitle">Ilustrações exclusivas com muito amor e cuidado artístico.</p>
        </div>
        <div class="products-grid">
          ${products.filter(p => p.badge === 'best' || p.badge === 'new').slice(0,4).map(productCard).join('')}
        </div>
        <div style="text-align:center;margin-top:2.5rem">
          <button class="btn-secondary" onclick="showPage('store')">Ver Todos os Produtos</button>
        </div>
      </div>
    </section>

    <!-- QUIZ -->
    <section class="quiz-strip">
      <div class="quiz-inner">
        <div class="section-label">Descubra Seu Temperamento</div>
        <h2 class="section-title">Qual das quatro você é?</h2>
        <p>Faça o quiz gratuito e descubra seu temperamento dominante. Em menos de 3 minutos você terá uma visão profunda de si mesma.</p>
        <div class="quiz-temperaments">
          <span class="quiz-temp-chip" style="background:#ffdad2;color:#9a402b">🔴 SANGUÍNEA</span>
          <span class="quiz-temp-chip" style="background:#b9ead5;color:#3a6756">🟢 FLEUMÁTICA</span>
          <span class="quiz-temp-chip" style="background:#b7ecee;color:#306466">🔵 COLÉRICA</span>
          <span class="quiz-temp-chip" style="background:#f3eddf;color:#7e2b18">🟡 MELANCÓLICA</span>
        </div>
        <button class="btn-primary" onclick="startQuiz()">
          <span class="material-symbols-outlined" style="font-size:1rem">psychology</span>
          Fazer o Quiz Gratuito
        </button>
      </div>
    </section>

    <!-- NEWSLETTER -->
    <section class="newsletter">
      <div class="newsletter-inner">
        <h2>Acompanhe minha jornada</h2>
        <p>Reflexões exclusivas sobre os temperamentos, avisos de novos cursos e conteúdos sobre vida interior.</p>
        <form class="newsletter-form" onsubmit="subscribeNewsletter(event)">
          <input type="email" id="nl-email" placeholder="Seu melhor e-mail" required/>
          <button type="submit">Inscrever</button>
        </form>
      </div>
    </section>

    <!-- FOOTER -->
    ${renderFooter()}
  `;
}


// ─── STORE PAGE ───────────────────────────────────────────────────────────────

function renderStore(el) {
  const filtered = activeFilter === 'todos' ? products : products.filter(p => p.category === activeFilter);
  el.innerHTML = `
    <div class="store-header">
      <h1>Nossa Loja</h1>
      <p>Produtos artísticos criados com amor para sua jornada de autoconhecimento.</p>
      <div class="store-filters">
        ${['todos','prints','canecas','cursos'].map(f => `
          <button class="filter-btn ${activeFilter === f ? 'active' : ''}" onclick="setFilter('${f}')">
            ${ {todos:'Todos', prints:'Pôsteres', canecas:'Canecas', cursos:'Cursos & Mentoria'}[f] }
          </button>
        `).join('')}
      </div>
    </div>
    <div class="store-products">
      <div class="products-grid">
        ${filtered.map(productCard).join('')}
      </div>
    </div>
    ${renderFooter()}
  `;
}

function setFilter(f) {
  activeFilter = f;
  renderStore(document.getElementById('page-store'));
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────

function renderAbout(el) {
  el.innerHTML = `
    <div class="about-hero">
      <div class="section-label">Sobre Roberta</div>
      <h1>Conheça a 'Menina dos Temperamentos'</h1>
      <p>Arquiteta e Psicanalista cristã de formação, e mentora de milhares de mulheres.</p>
    </div>
    <div class="about-content">
      <p class="drop-cap">Roberta Fázio é uma missionária, estudante de psicanálise e especialista na ciência dos quatro temperamentos. Ela ficou amplamente conhecida nas redes sociais, onde é carinhosamente chamada de "a menina dos temperamentos", reunindo uma comunidade de mais de 450 mil seguidores.</p>
      
      <p>Casada com Marco Paulo e mãe de Daniel e Carolina, Roberta e sua família estabeleceram-se nos Estados Unidos há doze anos, onde se tornaram missionários pela JOCUM na América do Norte. Atualmente, ela utiliza sua experiência para ajudar mulheres a entenderem sua própria essência e a viverem com inteligência emocional e fé através de seu ministério.</p>

      <div class="about-pillars">
        <div class="pillar">
          <div class="pillar-icon">📖</div>
          <h3>Escritora</h3>
          <p>Autora do livro "Você, o Seu Temperamento e um Propósito" (Editora Ágape), um guia para o autoconhecimento bíblico.</p>
        </div>
        <div class="pillar">
          <div class="pillar-icon">🏠</div>
          <h3>Mentora</h3>
          <p>Missionária focada em guiar mulheres em suas jornadas de autoconhecimento e relacionamento com Deus.</p>
        </div>
        <div class="pillar">
          <div class="pillar-icon">🎨</div>
          <h3>Criativa</h3>
          <p>Especialista na ciência dos temperamentos, ajudando a descobrir uma vida cheia de propósito e relacionamentos saudáveis.</p>
        </div>
      </div>

      <p>O foco central de seu trabalho é o autoconhecimento guiado pela fé. Roberta defende que entender as "inclinações naturais" é uma chave poderosa para o amadurecimento espiritual, permitindo potencializar qualidades e trabalhar fraquezas de forma prática.</p>
    </div>
    <!-- NEWSLETTER -->
    <section class="newsletter">
      <div class="newsletter-inner">
        <h2>Fique por dentro</h2>
        <p>Reflexões semanais direto no seu e-mail.</p>
        <form class="newsletter-form" onsubmit="subscribeNewsletter(event)">
          <input type="email" placeholder="Seu e-mail" required/>
          <button type="submit">Inscrever</button>
        </form>
      </div>
    </section>
    ${renderFooter()}
  `;
}

// ─── BOOK PAGE ────────────────────────────────────────────────────────────────

function renderBook(el) {
  el.innerHTML = `
    <div class="book-hero">
      <div class="book-cover gallery">
        <img class="book-cover-img" src="./Imagens/Livro.jpg" alt="${book.title}">
        <img class="book-cover-img secondary" src="./Imagens/Livro 1.jpg" alt="Verso do Livro">
      </div>
      <div class="book-info">
        <div class="section-label">Lançamento</div>
        <h1>${book.title}</h1>
        <div class="author">por Roberta Fazio</div>
        <p>${book.desc}</p>
        <div class="book-features">
          <div class="book-feat"><span class="material-symbols-outlined">auto_stories</span> ${book.pages} páginas</div>
          <div class="book-feat"><span class="material-symbols-outlined">new_releases</span> ${book.edition} · Publicado em ${book.details.date}</div>
          <div class="book-feat"><span class="material-symbols-outlined">local_shipping</span> Frete grátis para todo o Brasil</div>
          <div class="book-feat"><span class="material-symbols-outlined">verified</span> Editora: ${book.publisher} | ISBN: ${book.details.isbn13}</div>
        </div>
        <div class="book-price">R$ ${book.price.toFixed(2).replace('.', ',')} <span>ou 3x sem juros</span></div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap">
          <button class="btn-primary" onclick="addToCart(99)">
            <span class="material-symbols-outlined" style="font-size:1rem">add_shopping_cart</span>
            Comprar Agora
          </button>
          <button class="btn-ghost" onclick="showPage('store')">Ver Outros Produtos</button>
        </div>
      </div>
    </div>

    <!-- PRINTS RELATED -->
    <section class="section" style="background:var(--surface)">
      <div class="products-section">
        <div class="section-header">
          <div class="section-label">Combina com o Livro</div>
          <h2 class="section-title">Pôsteres das Ilustrações</h2>
        </div>
        <div class="products-grid">
          ${products.filter(p => p.category === 'prints').map(productCard).join('')}
        </div>
      </div>
    </section>
    ${renderFooter()}
  `;
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function productCard(p) {
  const badgeMap = { best: 'badge-best', new: 'badge-new', digital: 'badge-digital' };
  const badgeLabel = { best: 'Mais Vendido', new: 'Novo', digital: 'Digital' };
  return `
    <div class="product-card" id="prod-${p.id}">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentElement.style.background='#f3eddf'">
        ${p.badge ? `<span class="product-badge ${badgeMap[p.badge]}">${badgeLabel[p.badge]}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-cat">${{prints:'Pôster', canecas:'Caneca', cursos:'Curso', livro:'Livro'}[p.category] || p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc || ''}</div>
        <div class="product-footer">
          <div>
            ${p.oldPrice ? `<div class="product-price-old">R$ ${p.oldPrice.toFixed(2).replace('.', ',')}</div>` : ''}
            <div class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
          </div>
          <button class="add-btn" onclick="addToCart(${p.id})">
            <span class="material-symbols-outlined">add_shopping_cart</span>
            Comprar
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function renderFooter() {
  return `
    <footer>
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="logo">Roberta Fazio</div>
          <p>Transformando o conhecimento milenar em ferramentas práticas para o seu crescimento pessoal e espiritual.</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="#" onclick="showPage('store')">Pôsteres</a></li>
            <li><a href="#" onclick="showPage('store')">Canecas</a></li>
            <li><a href="#" onclick="showPage('store')">Cursos</a></li>
            <li><a href="#" onclick="showPage('book')">Livro</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Institucional</h4>
          <ul>
            <li><a href="#" onclick="showPage('about')">Sobre</a></li>
            <li><a href="#">Termos de Uso</a></li>
            <li><a href="#">Privacidade</a></li>
            <li><a href="#">Trocas e Devoluções</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contato</h4>
          <ul>
            <li><a href="mailto:contato@robertafazio.com.br">E-mail</a></li>
            <li><a href="https://www.instagram.com/robertafazio" target="_blank">Instagram</a></li>
            <li><a href="https://www.youtube.com/@robertafaziooficial" target="_blank">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">© 2026 Roberta Fazio. Todos os direitos reservados.</div>
    </footer>
  `;
}


// ─── MISC ─────────────────────────────────────────────────────────────────────

function subscribeNewsletter(e) {
  e.preventDefault();
  showToast('Inscrição realizada com sucesso! 💌');
  e.target.reset();
}

function startQuiz() {
  showToast('Quiz em breve! Fique ligada. ✨');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

renderCart();
showPage('home');
