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
  const { data: { user } } = await _supabase.auth.getUser();
  if (user) {
    currentUser = user;
    loginSection.classList.add('hidden');
    adminContent.classList.remove('hidden');
    document.getElementById('user-info').textContent = user.email;
    loadProducts();
  } else {
    loginSection.classList.remove('hidden');
    adminContent.classList.add('hidden');
  }
}

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;

  const { error } = await _supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Erro ao entrar: ' + error.message);
  } else {
    checkUser();
  }
};

async function logout() {
  await _supabase.auth.signOut();
  checkUser();
}

// ─── PRODUCTS CRUD ──────────────────────────────────────────────────────────

async function loadProducts() {
  const { data, error } = await _supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return;
  }
  products = data;
  renderProducts();
}

function renderProducts() {
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

function openProductModal(id = null) {
  editingId = id;
  productForm.reset();
  document.getElementById('modal-title').textContent = id ? 'Editar Produto' : 'Novo Produto';

  if (id) {
    const p = products.find(item => item.id === id);
    if (p) {
      document.getElementById('prod-name').value = p.name;
      document.getElementById('prod-category').value = p.category;
      document.getElementById('prod-price').value = p.price;
      document.getElementById('prod-badge').value = p.badge || '';
      document.getElementById('prod-img').value = p.img;
      document.getElementById('prod-desc').value = p.description || '';
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

productForm.onsubmit = handleProductSubmit;

// ─── INIT ─────────────────────────────────────────────────────────────────────
checkUser();
