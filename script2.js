const sheetID = "1gAMyBK3wsZUWI7juUoV0-9s4N7ixC5b1on7WyVh3-Eo";
const configSheet = "config";
const menuSheet = "itens";
const imgGoogle = "https://lh3.googleusercontent.com/d/";
const imgDefaultProd = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk8skqPCAsyApC1tZAVm6jmVb4H5uaCRfd1yfbmjcrEvdsqc8bqYdQkVxT&s=10';

let cart = [];
let waNumber = null; 

const elements = {
    hero: document.getElementById('hero'),
    logo: document.getElementById('logo'),
    comercioName: document.getElementById('comercio-name'),
    menuContainer: document.getElementById('menu-container'),
    loading: document.getElementById('loading'),
    cartBadge: document.getElementById('cart-count-badge'),
    cartModal: document.getElementById('cart-modal'),
    cartList: document.getElementById('cart-items-list'),
    cartSummary: document.getElementById('cart-summary'),
    cartTotal: document.getElementById('cart-total-value')
};

// Fetch Config
async function loadConfig() {
    try {
        const response = await fetch(`https://opensheet.elk.sh/${sheetID}/${configSheet}`);
        const data = await response.json();
        const config = data[0];

        elements.comercioName.innerText = config.comercio || "Cardápio";
        elements.logo.src = config.logourl || (imgGoogle + config.logodrive);
        waNumber = config.contato || waNumber;
        
        const bg = config.backgroundurl || (config.backgrounddrive ? (imgGoogle + config.backgrounddrive) : "");
        if(bg) elements.hero.style.backgroundImage = `url(${bg})`;
        
        if(config.subtitulo) document.getElementById('subtitle').innerText = config.subtitulo;

    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
    }
}

// Fetch Menu
async function loadMenu() {
    try {
        const response = await fetch(`https://opensheet.elk.sh/${sheetID}/${menuSheet}`);
        const products = await response.json();

        const categoriesMap = {};
        products.forEach(prod => {
            const categoria = (prod.categoria || "").trim() || "Nossos Produtos";

            if (!categoriesMap[categoria]) {
                categoriesMap[categoria] = [];
            }

            categoriesMap[categoria].push(prod);
        });

        renderMenu(categoriesMap);
        elements.loading.style.display = 'none';
    } catch (error) {
        console.error("Erro ao carregar menu:", error);
        elements.loading.innerHTML = "<p>Erro ao carregar cardápio. Tente novamente.</p>";
    }
}

function renderMenu(categoriesMap) {
    elements.menuContainer.innerHTML = "";
    let globalIndex = 1;

    Object.keys(categoriesMap).forEach(catName => {
        const details = document.createElement("details");
        details.className = "category-group";

        details.innerHTML = `
            <summary class="category-header">
                <h2 class="category-title">${catName.toUpperCase()}</h2>
            </summary>

            <div class="products-grid">
                ${categoriesMap[catName].map(item => {
                    const num = String(globalIndex++).padStart(2, "0");
                    const prices = parsePrices(item.preco);

                    return `
                        <div class="product-card">
                            <div class="product-image-container">
                                <div class="product-number">${num}</div>

                                <img
                                    class="product-img"
                                    src="${imgGoogle + item.img}"
                                    alt="${item.nome}"
                                    onerror="this.src='${imgDefaultProd}'">
                            </div>

                            <div class="product-info">
                                <h3>${item.nome}</h3>

                                <p class="product-desc" title="${item.descricao || ""}">
                                    ${item.descricao || ""}
                                </p>

                                <div class="price-container">
                                    ${prices.map(p => {
                                        const precoItem = Number(
                                            String(p.value).replace(",", ".")
                                        ).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        });

                                        return `
                                            <div class="price-item">
                                                <div class="price-value">
                                                    R$ ${precoItem}
                                                </div>

                                                <div class="price-label">
                                                    ${p.label}
                                                </div>

                                                <button
                                                    class="add-to-cart-btn"
                                                    onclick="addToCart('${item.nome}','${item.categoria}','${p.value}','${p.label}')">
                                                    + Adicionar
                                                </button>
                                            </div>
                                        `;
                                    }).join("")}
                                </div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;

        elements.menuContainer.appendChild(details);
    });
}

function parsePrices(priceStr) {
    if (!priceStr) return [{ value: '?', label: '-' }];
    
    const parts = String(priceStr).split(/-|\//);
    if (parts.length === 3) {
        return [
            { value: parts[0].trim(), label: '4 ped' },
            { value: parts[1].trim(), label: '8 ped' },
            { value: parts[2].trim(), label: '12 ped' }
        ];
    }
    if (parts.length === 2) {
        return [
            { value: parts[0].trim(), label: 'Port' },
            { value: parts[1].trim(), label: 'Grande' }
        ];
    }
    return [{ value: priceStr.trim(), label: '' }];
}

// --- Lógica Carrinho ---

function toggleCart() {
    const isActive = elements.cartModal.classList.toggle('active');
    if (isActive) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
    renderCartItems();
}

function addToCart(name, category, price, size) {
    const priceVal = parseFloat(price.replace(',', '.'));
    const existing = cart.find(i => i.name === name && i.size === size);
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, category, price: priceVal, size, qty: 1 });
        
    }
    updateBadge();
}

function updateBadge() {
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    elements.cartBadge.innerText = count;
}

function renderCartItems() {
    if (cart.length === 0) {
        elements.cartList.innerHTML = '<p style="text-align:center; padding:40px; color:var(--text-muted);">Carrinho vazio.</p>';
        elements.cartSummary.style.display = 'none';
        return;
    }

    elements.cartSummary.style.display = 'block';
    let total = 0;
    elements.cartList.innerHTML = cart.map((item, idx) => {
                        
        total += item.price * item.qty;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>- ${item.category}</p>
                    <p>${item.size} - R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQty(${idx}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${idx}, 1)">+</button>
                </div>
            </div>
        `;
    }).join('');
    elements.cartTotal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function updateQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    renderCartItems();
    updateBadge();
}

function handlePaymentChange(val) {
    document.getElementById('troco-group').style.display = (val === 'Dinheiro') ? 'block' : 'none';
}

function sendWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const pay = document.getElementById('pay-method').value;
    const troco = document.getElementById('troco-val').value;

    if (!name || !address) return alert("Por favor, preencha seu nome e a opção de entrega/endereço.");

    let total = 0;
    let msg = `*Novo Pedido - ${elements.comercioName.innerText}*\n`;
    msg += `*Cliente:* ${name}\n`;
    msg += `*Opção de Entrega:* ${address}\n`;
    msg += `*Itens:*\n`;
                
    // cart.forEach(item => {
    //     const sub = item.price * item.qty;
    //     total += sub;
    //     msg += `*${item.category}*\n`;
    //     msg += `* ${item.qty}x ${item.name}${item.size ? ' ('+item.size+')' : ''} (R$ ${sub.toFixed(2).replace('.', ',')})\n`;
    // });

    const grouped = {};

    cart.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }

        grouped[item.category].push(item);
    });

    // Montar mensagem agrupada
    for (const category in grouped) {

        msg += `\n*${category}*\n`;

        grouped[category].forEach(item => {
            const sub = item.price * item.qty;
            total += sub;

            msg += `• ${item.qty}x ${item.name}`;

            if (item.size) {
                msg += ` (${item.size})`;
            }

            msg += ` - R$ ${sub.toFixed(2).replace('.', ',')}\n`;
        });
    }
    msg +=`==================\n`
    msg += `\n`;
    msg += `*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n`;
    msg += `*Pagamento:* ${pay}\n`;
    
    if (pay === 'Dinheiro' && troco) {
        const trocoValor = parseFloat(troco.replace(',', '.'));
        if (!isNaN(trocoValor)) {
            msg += `*Troco para:* R$ ${trocoValor.toFixed(2).replace('.', ',')}\n`;
        }
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encoded}`, '_blank');
}


elements.menuContainer.addEventListener('toggle', (e) => {

    if (e.target.tagName !== "DETAILS") return;

    const all = document.querySelectorAll('.category-group');

    // se abriu uma categoria
    if (e.target.open) {

        all.forEach(detail => {
            if (detail !== e.target) detail.open = false;
        });

        setTimeout(() => {
            window.scrollTo({
                top: e.target.offsetTop,
                behavior: "smooth"
            });
        }, 200);

        return;
    }

    // 🔥 se fechou tudo
    const nenhumAberto = [...all].every(d => !d.open);

    if (nenhumAberto) {

        const primeira = all[0];

        if (primeira) {
            setTimeout(() => {
                window.scrollTo({
                    //top: primeira.getBoundingClientRect().top,
                    top: primeira.offsetTop,
                    behavior: "smooth"
                });
            }, 100);
        }
    }

}, true);

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadMenu();
});

