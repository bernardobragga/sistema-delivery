// ========== DADOS DO CARDÁPIO ==========
const menuData = [
    {
        id: 1,
        name: 'Açaí com Granola',
        category: 'acai',
        description: 'Açaí cremoso com granola crocante',
        price: 18.90,
        emoji: '🫐'
    },
    {
        id: 2,
        name: 'Açaí Power',
        category: 'acai',
        description: 'Açaí com banana, morango e mel',
        price: 22.90,
        emoji: '🫐'
    },
    {
        id: 3,
        name: 'Açaí Nutella',
        category: 'acai',
        description: 'Açaí com chocolate Nutella',
        price: 24.90,
        emoji: '🫐'
    },
    {
        id: 4,
        name: 'Sorvete Chocolate',
        category: 'sorvete',
        description: 'Sorvete de chocolate belga artesanal',
        price: 15.90,
        emoji: '🍫'
    },
    {
        id: 5,
        name: 'Sorvete Morango',
        category: 'sorvete',
        description: 'Sorvete de morango fresco',
        price: 15.90,
        emoji: '🍓'
    },
    {
        id: 6,
        name: 'Sorvete Pistache',
        category: 'sorvete',
        description: 'Sorvete premium de pistache',
        price: 18.90,
        emoji: '🟢'
    },
    {
        id: 7,
        name: 'Milk-shake Chocolate',
        category: 'milkshake',
        description: 'Milk-shake cremoso de chocolate',
        price: 16.90,
        emoji: '🥤'
    },
    {
        id: 8,
        name: 'Milk-shake Morango',
        category: 'milkshake',
        description: 'Milk-shake com morango natural',
        price: 16.90,
        emoji: '🥤'
    },
    {
        id: 9,
        name: 'Milk-shake Baunilha',
        category: 'milkshake',
        description: 'Milk-shake clássico de baunilha',
        price: 16.90,
        emoji: '🥤'
    }
];

// ========== VARIÁVEIS GLOBAIS ==========
let cart = [];
let currentFilter = 'all';

// ========== DOM ELEMENTS ==========
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const overlay = document.getElementById('overlay');
const checkoutForm = document.getElementById('checkoutForm');
const menuGrid = document.getElementById('menuGrid');
const categoryBtns = document.querySelectorAll('.category-btn');
const searchCepBtn = document.getElementById('searchCepBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    setupEventListeners();
    loadCartFromStorage();
});

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Cart
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeAllModals);
    
    // Checkout
    checkoutBtn.addEventListener('click', openCheckout);
    closeModalBtn.addEventListener('click', closeCheckout);
    checkoutForm.addEventListener('submit', handleCheckout);
    
    // Category Filter
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });
    
    // CEP
    searchCepBtn.addEventListener('click', searchCEP);
    document.getElementById('cep').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCEP();
    });
    
    // Mobile Menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

// ========== RENDERIZAR CARDÁPIO ==========
function renderMenu(filter = 'all') {
    menuGrid.innerHTML = '';
    
    let filteredMenu = menuData;
    if (filter !== 'all') {
        filteredMenu = menuData.filter(item => item.category === filter);
    }
    
    filteredMenu.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-item-image">${item.emoji}</div>
            <div class="menu-item-content">
                <span class="menu-item-category">${getCategoryLabel(item.category)}</span>
                <h3>${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">R$ ${item.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" data-id="${item.id}">
                        <i class="fas fa-plus"></i> Adicionar
                    </button>
                </div>
            </div>
        `;
        
        menuItem.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            addToCart(item);
        });
        
        menuGrid.appendChild(menuItem);
    });
}

// ========== GERENCIAMENTO DO CARRINHO ==========
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCartToStorage();
    showNotification('Produto adicionado ao carrinho!');
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
    saveCartToStorage();
}

function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartUI();
            saveCartToStorage();
        }
    }
}

function updateCartUI() {
    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Atualizar itens do carrinho
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-id="${item.id}" data-action="minus">−</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="plus">+</button>
                </div>
                <button class="remove-item-btn" data-id="${item.id}" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        // Event listeners para botões de quantidade
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                const action = e.currentTarget.dataset.action;
                updateQuantity(itemId, action === 'plus' ? 1 : -1);
            });
        });
        
        // Event listeners para botões de remover
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.currentTarget.dataset.id);
                removeFromCart(itemId);
            });
        });
    }
    
    // Atualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// ========== ARMAZENAMENTO LOCAL ==========
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// ========== CARRINHO (ABRIR/FECHAR) ==========
function openCart() {
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// ========== CHECKOUT ==========
function openCheckout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'error');
        return;
    }
    
    updateOrderSummary();
    checkoutModal.classList.add('active');
    overlay.classList.add('active');
    cartSidebar.classList.remove('active');
}

function closeCheckout() {
    checkoutModal.classList.remove('active');
    overlay.classList.remove('active');
}

function closeAllModals() {
    closeCart();
    closeCheckout();
}

function updateOrderSummary() {
    const summaryDiv = document.getElementById('orderSummary');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    summaryDiv.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('') + `
        <div class="summary-total">
            Total: R$ ${total.toFixed(2)}
        </div>
    `;
}

function handleCheckout(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        cep: document.getElementById('cep').value,
        street: document.getElementById('street').value,
        number: document.getElementById('number').value,
        complement: document.getElementById('complement').value,
        neighborhood: document.getElementById('neighborhood').value,
        city: document.getElementById('city').value
    };
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.phone || !formData.cep || !formData.street || 
        !formData.number || !formData.neighborhood || !formData.city) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    sendToWhatsApp(formData);
}

// ========== INTEGRAÇÃO COM WHATSAPP ==========
function sendToWhatsApp(formData) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let message = `*Novo Pedido*\n\n`;
    message += `👤 *Cliente:* ${formData.name}\n`;
    message += `📱 *Telefone:* ${formData.phone}\n`;
    message += `📧 *Email:* ${formData.email || 'Não informado'}\n\n`;
    
    message += `📦 *Itens do Pedido:*\n`;
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *Total:* R$ ${total.toFixed(2)}\n\n`;
    
    message += `📍 *Endereço de Entrega:*\n`;
    message += `${formData.street}, ${formData.number}\n`;
    if (formData.complement) message += `${formData.complement}\n`;
    message += `${formData.neighborhood} - ${formData.city}\n`;
    message += `CEP: ${formData.cep}`;
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número do WhatsApp (substituir por número real)
    // Formato: 55 + DDD + número (sem caracteres especiais)
    const whatsappNumber = '5511999999999'; // Exemplo: (11) 99999-9999
    
    // Abrir WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    
    // Limpar carrinho e formulário
    setTimeout(() => {
        cart = [];
        updateCartUI();
        saveCartToStorage();
        checkoutForm.reset();
        closeCheckout();
        showNotification('Seu pedido foi enviado! Aguarde a confirmação no WhatsApp.', 'success');
    }, 500);
}

// ========== BUSCA DE CEP ==========
async function searchCEP() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        showNotification('Por favor, digite um CEP válido (8 dígitos)', 'error');
        return;
    }
    
    try {
        searchCepBtn.disabled = true;
        searchCepBtn.textContent = 'Buscando...';
        
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            showNotification('CEP não encontrado!', 'error');
            searchCepBtn.disabled = false;
            searchCepBtn.textContent = 'Buscar';
            return;
        }
        
        // Preencher campos
        document.getElementById('street').value = data.logradouro;
        document.getElementById('neighborhood').value = data.bairro;
        document.getElementById('city').value = data.localidade;
        
        showNotification('Endereço encontrado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showNotification('Erro ao buscar CEP. Tente novamente!', 'error');
    } finally {
        searchCepBtn.disabled = false;
        searchCepBtn.textContent = 'Buscar';
    }
}

// ========== FILTRO DE CATEGORIAS ==========
function handleCategoryFilter(e) {
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.category;
    renderMenu(currentFilter);
}

// ========== UTILITÁRIOS ==========
function getCategoryLabel(category) {
    const labels = {
        'acai': 'Açaís',
        'sorvete': 'Sorvetes',
        'milkshake': 'Milk-shakes'
    };
    return labels[category] || category;
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#1dd1a1' : type === 'error' ? '#ff6b35' : '#004e89'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== MENU MOBILE ==========
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    }
}

// ========== ANIMAÇÕES CSS ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========== FORMATAÇÃO DE CEP ==========
document.getElementById('cep').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    e.target.value = value;
});

// ========== FORMATAÇÃO DE TELEFONE ==========
document.getElementById('phone').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 2) {
            value = `(${value}`;
        } else if (value.length <= 7) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
        }
    }
    e.target.value = value;
});
