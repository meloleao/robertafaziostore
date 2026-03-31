// ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
const supabaseUrl = 'https://xfopqonqufafjfphrrli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmb3Bxb25xdWZhZmpmcGhycmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzM4NDEsImV4cCI6MjA5MDEwOTg0MX0.YcDrniGV80ueR0sxoVOj6e-XM9O_z70JwTTGHItNBDo';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ─── STATE ───────────────────────────────────────────────────────────────────
let currentUser = null;
let products = [];
let editingId = null;
let allOrders = [];

const loginSection = document.getElementById('login-section');
const adminContent = document.getElementById('admin-content');
const productTbody = document.getElementById('product-tbody');
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function checkUser() {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    const user = session?.user ?? null;
    if (user) {
      currentUser = user;
      loginSection.classList.add('hidden');
      adminContent.classList.remove('hidden');
      document.getElementById('user-info').textContent = user.email;
      initFinFilter();
      loadProducts();
      loadOrders();
    } else {
      currentUser = null;
      loginSection.classList.remove('hidden');
      adminContent.classList.add('hidden');
    }
  } catch (e) {
    console.error('[Admin] Falha crítica no checkUser:', e);
  }
}

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Processando...';
  btn.disabled = true;
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;
  const { error } = await _supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Erro ao entrar: ' + error.message);
    btn.textContent = 'Entrar';
    btn.disabled = false;
  } else {
    checkUser();
  }
};

async function logout() {
  await _supabase.auth.signOut();
  checkUser();
}

// ─── TABS ────────────────────────────────────────────────────────────────────

function showTab(tab) {
  document.getElementById('section-produtos').classList.toggle('hidden', tab !== 'produtos');
  document.getElementById('section-financeiro').classList.toggle('hidden', tab !== 'financeiro');
  document.getElementById('tab-produtos').classList.toggle('active', tab === 'produtos');
  document.getElementById('tab-financeiro').classList.toggle('active', tab === 'financeiro');
}

// ─── PRODUCTS CRUD ──────────────────────────────────────────────────────────

async function loadProducts() {
  productTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#aaa;">Carregando...</td></tr>';
  const { data, error } = await _supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    productTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Erro ao carregar dados.</td></tr>';
    return;
  }
  products = data || [];
  renderProducts();
}

function renderProducts() {
  if (products.length === 0) {
    productTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:3rem;color:#aaa;">Nenhum produto cadastrado.<br><br><button class="btn-primary" onclick="openProductModal()">Cadastrar Primeiro Produto</button></td></tr>';
    return;
  }
  productTbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.img}" alt="${p.name}" class="product-thumb" onerror="this.style.background='#f3eddf'"></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.category}</td>
      <td>R$ ${p.price.toFixed(2).replace('.', ',')}</td>
      <td>${p.badge || '–'}</td>
      <td class="actions">
        <button class="btn-icon" title="Editar" onclick="editProduct('${p.id}')">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="btn-icon btn-delete" title="Excluir" onclick="deleteProduct('${p.id}')">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

async function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById('img-preview');
  const placeholder = document.getElementById('img-upload-placeholder');
  const status = document.getElementById('img-upload-status');
  preview.src = URL.createObjectURL(file);
  preview.style.display = 'block';
  placeholder.style.display = 'none';
  status.style.display = 'block';
  status.textContent = 'Enviando...';
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}.${ext}`;
  const { error } = await _supabase.storage.from('products').upload(fileName, file);
  if (error) {
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
    status.style.display = 'none';
    alert('Erro no upload: ' + error.message);
    return;
  }
  const { data: { publicUrl } } = _supabase.storage.from('products').getPublicUrl(fileName);
  document.getElementById('prod-img').value = publicUrl;
  status.style.display = 'none';
}

function openProductModal(id = null) {
  editingId = id;
  productForm.reset();
  document.getElementById('modal-title').textContent = id ? 'Editar Produto' : 'Novo Produto';
  document.getElementById('img-preview').style.display = 'none';
  document.getElementById('img-upload-placeholder').style.display = 'flex';
  document.getElementById('img-upload-status').style.display = 'none';
  if (id) {
    const p = products.find(item => item.id === id);
    if (p) {
      document.getElementById('prod-name').value = p.name;
      document.getElementById('prod-category').value = p.category;
      document.getElementById('prod-price').value = p.price;
      document.getElementById('prod-badge').value = p.badge || '';
      document.getElementById('prod-img').value = p.img;
      document.getElementById('prod-desc').value = p.description || '';
      if (p.img) {
        const preview = document.getElementById('img-preview');
        preview.src = p.img;
        preview.style.display = 'block';
        document.getElementById('img-upload-placeholder').style.display = 'none';
      }
    }
  }
  productModal.style.display = 'flex';
}

function closeProductModal() { productModal.style.display = 'none'; }

async function handleProductSubmit(e) {
  e.preventDefault();
  const formData = {
    name: document.getElementById('prod-name').value,
    category: document.getElementById('prod-category').value,
    price: parseFloat(document.getElementById('prod-price').value),
    badge: document.getElementById('prod-badge').value || null,
    img: document.getElementById('prod-img').value,
    description: document.getElementById('prod-desc').value
  };
  if (editingId) {
    const { error } = await _supabase.from('products').update(formData).eq('id', editingId);
    if (error) alert('Erro ao atualizar: ' + error.message);
  } else {
    const { error } = await _supabase.from('products').insert([formData]);
    if (error) alert('Erro ao inserir: ' + error.message);
  }
  closeProductModal();
  loadProducts();
}

async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  const { error } = await _supabase.from('products').delete().eq('id', id);
  if (error) alert('Erro ao excluir: ' + error.message);
  loadProducts();
}

// ─── FINANCEIRO ──────────────────────────────────────────────────────────────

function initFinFilter() {
  const now = new Date();
  const yearSel = document.getElementById('fin-year');
  const monthSel = document.getElementById('fin-month');
  const startYear = 2024;
  const endYear = now.getFullYear();
  yearSel.innerHTML = '';
  for (let y = endYear; y >= startYear; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  }
  monthSel.value = now.getMonth() + 1;
  yearSel.value = now.getFullYear();
}

async function loadOrders() {
  const { data, error } = await _supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao carregar pedidos:', error);
    document.getElementById('orders-tbody').innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#c0392b;">
        Erro ao carregar pedidos: ${error.message}
      </td></tr>`;
    return;
  }
  allOrders = data || [];
  renderFinanceiro();
}

// Extrai dados do comprador de qualquer estrutura salva (colunas dedicadas, buyer_info JSON, ou vazio)
function getBuyer(o) {
  const b = o.buyer_info || {};
  return {
    name:     o.buyer_name     || b.name     || '–',
    email:    o.buyer_email    || b.email    || '–',
    whatsapp: o.buyer_whatsapp || b.whatsapp || '–',
    address:  o.buyer_address  || b.address  || '–',
    cep:      o.buyer_cep      || b.cep      || '–',
  };
}

// Retorna apenas os itens do carrinho, ignorando metadados de comprador
function getCartItems(o) {
  return Array.isArray(o.items) ? o.items.filter(i => !i._buyer_info) : [];
}

function applyFinFilter() { renderFinanceiro(); }

function renderFinanceiro() {
  const month = parseInt(document.getElementById('fin-month').value);
  const year  = parseInt(document.getElementById('fin-year').value);

  const filtered = allOrders.filter(o => {
    const d = new Date(o.created_at);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  // KPIs
  const receita = filtered.reduce((s, o) => s + (o.total || 0), 0);
  const pedidos = filtered.length;
  const ticket  = pedidos > 0 ? receita / pedidos : 0;
  const itens   = filtered.reduce((s, o) => {
    return s + (Array.isArray(o.items) ? o.items.reduce((si, i) => si + (i.qty || 1), 0) : 0);
  }, 0);

  document.getElementById('kpi-receita').textContent = `R$ ${receita.toFixed(2).replace('.', ',')}`;
  document.getElementById('kpi-receita-sub').textContent = `${pedidos} pedido${pedidos !== 1 ? 's' : ''}`;
  document.getElementById('kpi-pedidos').textContent = pedidos;
  document.getElementById('kpi-ticket').textContent = `R$ ${ticket.toFixed(2).replace('.', ',')}`;
  document.getElementById('kpi-itens').textContent = itens;

  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('fin-period-label').textContent = `${monthNames[month - 1]} de ${year}`;

  renderChart(filtered, year, month);
  renderOrdersTable(filtered);
}

function renderChart(orders, year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, total: 0 }));

  orders.forEach(o => {
    const day = new Date(o.created_at).getDate();
    daily[day - 1].total += o.total || 0;
  });

  const maxVal = Math.max(...daily.map(d => d.total), 1);
  const chart = document.getElementById('bar-chart');

  chart.innerHTML = daily.map(d => {
    const pct = Math.round((d.total / maxVal) * 100);
    const hasVal = d.total > 0;
    return `
      <div class="bar-wrap">
        <div class="bar ${hasVal ? 'has-value' : ''}" style="height:${Math.max(pct, hasVal ? 4 : 2)}%">
          ${hasVal ? `<div class="bar-tip">Dia ${d.day}<br>R$ ${d.total.toFixed(2).replace('.', ',')}</div>` : ''}
        </div>
        <span class="bar-label">${d.day % 5 === 0 || d.day === 1 ? d.day : ''}</span>
      </div>`;
  }).join('');
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  document.getElementById('orders-count-label').textContent = `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`;

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:3rem;color:#aaa;">Nenhum pedido neste período.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map((o, idx) => {
    const date = new Date(o.created_at);
    const dateStr = date.toLocaleDateString('pt-BR');
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const buyer = getBuyer(o);
    const cartItems = getCartItems(o);
    const itemsSummary = cartItems.length > 0
      ? cartItems.map(i => `${i.name} \u00D7${i.qty || 1}`).join(', ')
      : '\u2013';
    const truncated = itemsSummary.length > 40 ? itemsSummary.slice(0, 40) + '\u2026' : itemsSummary;
    const payBadge = o.payment_method === 'pix'
      ? '<span class="badge-status badge-pix">PIX</span>'
      : `<span class="badge-status badge-card">${o.payment_method || '\u2013'}</span>`;

    return `
      <tr>
        <td style="white-space:nowrap">${dateStr}<br><span style="font-size:0.78rem;color:#aaa">${timeStr}</span></td>
        <td>${buyer.name !== '–' ? buyer.name : '<span style="color:#ccc">\u2013</span>'}</td>
        <td style="white-space:nowrap">${buyer.whatsapp !== '–' ? buyer.whatsapp : '<span style="color:#ccc">\u2013</span>'}</td>
        <td style="font-size:0.82rem;color:#666;max-width:200px;overflow:hidden">${truncated}</td>
        <td style="white-space:nowrap;font-weight:700">R$ ${(o.total || 0).toFixed(2).replace('.', ',')}</td>
        <td>${payBadge}</td>
        <td><button class="btn-detail" onclick="showOrderDetail(${idx})">Ver</button></td>
      </tr>`;
  }).join('');

  // store filtered orders for detail modal
  window._filteredOrders = orders;
}

function showOrderDetail(idx) {
  const o = window._filteredOrders[idx];
  if (!o) return;

  const date = new Date(o.created_at);
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const buyer = getBuyer(o);
  const cartItems = getCartItems(o);
  const itemsHtml = cartItems.length > 0 ? cartItems.map(i => `
    <div class="order-item-row">
      <span>${i.name} <span style="color:#aaa">\u00D7${i.qty || 1}</span></span>
      <span style="font-weight:600">R$ ${((i.price || 0) * (i.qty || 1)).toFixed(2).replace('.', ',')}</span>
    </div>`).join('') : '<div class="order-item-row"><span style="color:#aaa">Sem itens</span></div>';

  document.getElementById('order-detail-content').innerHTML = `
    <div class="order-detail-grid">
      <div class="order-detail-item">
        <div class="od-label">Data e Hora</div>
        <div class="od-value">${dateStr}, ${timeStr}</div>
      </div>
      <div class="order-detail-item">
        <div class="od-label">Pagamento</div>
        <div class="od-value">${o.payment_method?.toUpperCase() || '\u2013'}</div>
      </div>
      <div class="order-detail-item">
        <div class="od-label">Nome</div>
        <div class="od-value">${buyer.name}</div>
      </div>
      <div class="order-detail-item">
        <div class="od-label">E-mail</div>
        <div class="od-value">${buyer.email}</div>
      </div>
      <div class="order-detail-item">
        <div class="od-label">WhatsApp</div>
        <div class="od-value">${buyer.whatsapp}</div>
      </div>
      <div class="order-detail-item">
        <div class="od-label">CEP</div>
        <div class="od-value">${buyer.cep}</div>
      </div>
      <div class="order-detail-item" style="grid-column:1/-1">
        <div class="od-label">Endere\u00E7o</div>
        <div class="od-value">${buyer.address}</div>
      </div>
    </div>

    <div style="font-size:0.78rem;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">Itens do Pedido</div>
    <div class="order-items-list">${itemsHtml}</div>
    <div class="order-total-row">
      <span>Total</span>
      <span>R$ ${(o.total || 0).toFixed(2).replace('.', ',')}</span>
    </div>`;

  document.getElementById('order-detail-modal').style.display = 'flex';
}

function closeOrderDetail() {
  document.getElementById('order-detail-modal').style.display = 'none';
}

// ─── GLOBAL EXPORTS ──────────────────────────────────────────────────────────
window.showTab          = showTab;
window.editProduct      = openProductModal;
window.deleteProduct    = deleteProduct;
window.logout           = logout;
window.closeProductModal = closeProductModal;
window.openProductModal = openProductModal;
window.handleImageUpload = handleImageUpload;
window.applyFinFilter   = applyFinFilter;
window.showOrderDetail  = showOrderDetail;
window.closeOrderDetail = closeOrderDetail;

productForm.onsubmit = handleProductSubmit;

// ─── INIT ─────────────────────────────────────────────────────────────────────
checkUser();
