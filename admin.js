// ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
const supabaseUrl = 'https://xfopqonqufafjfphrrli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmb3Bxb25xdWZhZmpmcGhycmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzM4NDEsImV4cCI6MjA5MDEwOTg0MX0.YcDrniGV80ueR0sxoVOj6e-XM9O_z70JwTTGHItNBDo'; // Pegue em Settings > API
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ─── STATE ───────────────────────────────────────────────────────────────────
let currentUser = null;
let products = [];
let editingId = null;

const loginSection = document.getElementById('login-section');
const adminContent = document.getElementById('admin-content');
const productTbody = document.getElementById('product-tbody');
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function checkUser() {
  console.log('[Admin] Verificando sessão do usuário...');
  try {
    const { data: { user }, error } = await _supabase.auth.getUser();
    if (error) {
      console.error('[Admin] Erro ao obter usuário:', error.message);
      return;
    }
    
    if (user) {
      console.log('[Admin] Usuário autenticado:', user.email);
      currentUser = user;
      loginSection.classList.add('hidden');
      adminContent.classList.remove('hidden');
      document.getElementById('user-info').textContent = user.email;
      loadProducts();
    } else {
      console.log('[Admin] Nenhum usuário logado.');
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
  const originalText = btn.textContent;
  btn.textContent = 'Processando...';
  btn.disabled = true;

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;

  console.log('Tentando login para:', email);
  const { error } = await _supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    alert('Erro ao entrar: ' + error.message);
    btn.textContent = originalText;
    btn.disabled = false;
  } else {
    console.log('Login bem-sucedido!');
    checkUser();
  }
};

async function logout() {
  await _supabase.auth.signOut();
  checkUser();
}

// ─── PRODUCTS CRUD ──────────────────────────────────────────────────────────

async function loadProducts() {
  productTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">Carregando produtos...</td></tr>';
  
  console.log('Buscando produtos do Supabase...');
  const { data, error } = await _supabase.from('products').select('*').order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar produtos:', error);
    productTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Erro ao carregar dados.</td></tr>';
    return;
  }
  
  console.log('Produtos recebidos:', data?.length || 0);
  products = data || [];
  renderProducts();
}

function renderProducts() {
  if (products.length === 0) {
    productTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:3rem;color:#666;">Nenhum produto cadastrado ainda.<br><br><button class="btn-primary" onclick="openProductModal()">Cadastrar Primeiro Produto</button></td></tr>';
    return;
  }
  productTbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.img}" alt="${p.name}" class="product-thumb" onerror="this.src='./Imagens/placeholder.jpg'"></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.category}</td>
      <td>R$ ${p.price.toFixed(2).replace('.', ',')}</td>
      <td>${p.badge || '-'}</td>
      <td class="actions">
        <button class="btn-icon" onclick="editProduct('${p.id}')">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="btn-icon btn-delete" onclick="deleteProduct('${p.id}')">
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

  // Mostrar preview local imediatamente
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
    alert('Erro no upload da imagem: ' + error.message + '\n\nVerifique se o bucket "products" tem uma policy de INSERT para anon no Supabase Storage.');
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

  // Resetar área de upload
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

function closeProductModal() {
  productModal.style.display = 'none';
}

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

// Global functions for events
window.editProduct = openProductModal;
window.deleteProduct = deleteProduct;
window.logout = logout;
window.closeProductModal = closeProductModal;
window.openProductModal = openProductModal;
window.handleImageUpload = handleImageUpload;

productForm.onsubmit = handleProductSubmit;

// ─── INIT ─────────────────────────────────────────────────────────────────────
console.log('[Admin] Arquivo v4 carregado (com logs)!');
checkUser();
