(function () {
    const api = window.ThinkMartApi;
    const currency = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    function showMessage(element, message, isError) {
        if (!element) {
            return;
        }
        element.textContent = message;
        element.classList.toggle('error', Boolean(isError));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    function setLoginPrompt(element) {
        if (!element) {
            return;
        }
        element.innerHTML = 'Please <a href="index.html">log in</a> to view or update your cart.';
        element.classList.add('error');
    }

    const logoutLinks = document.querySelectorAll('[data-logout]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', async event => {
            event.preventDefault();
            try {
                await api.post('/auth/logout', {});
                window.location.href = 'index.html';
            } catch (error) {
                window.alert(error.message);
            }
        });
    });

    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        const message = document.querySelector('#form-message');
        loginForm.addEventListener('submit', async event => {
            event.preventDefault();
            showMessage(message, '', false);
            const form = new FormData(loginForm);
            try {
                await api.post('/auth/login', {
                    email: form.get('email'),
                    password: form.get('password')
                });
                window.location.href = 'Home-Page.html';
            } catch (error) {
                showMessage(message, error.message, true);
            }
        });
    }

    const registerForm = document.querySelector('#register-form');
    if (registerForm) {
        const message = document.querySelector('#form-message');
        registerForm.addEventListener('submit', async event => {
            event.preventDefault();
            showMessage(message, '', false);
            const form = new FormData(registerForm);
            if (form.get('password') !== form.get('confirmPassword')) {
                showMessage(message, 'Passwords do not match.', true);
                return;
            }

            try {
                await api.post('/auth/register', {
                    fullName: form.get('fullName'),
                    email: form.get('email'),
                    phone: form.get('phone'),
                    password: form.get('password')
                });
                showMessage(message, 'Account created. Redirecting to login...', false);
                window.setTimeout(() => {
                    window.location.href = 'index.html';
                }, 900);
            } catch (error) {
                showMessage(message, error.message, true);
            }
        });
    }

    const productsGrid = document.querySelector('#products-grid');
    if (productsGrid) {
        const message = document.querySelector('#page-message');
        productsGrid.innerHTML = '<p>Loading products...</p>';
        api.get('/products')
            .then(products => {
                productsGrid.innerHTML = products.map(product => {
                    const discount = Math.max(0, Math.round((1 - product.price / product.mrp) * 100));
                    return `
                        <article class="product-card">
                            <div class="discount">${discount}% OFF</div>
                            <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}">
                            <div class="product-info">
                                <h3>${escapeHtml(product.name)}</h3>
                                <p class="description">${escapeHtml(product.description)}</p>
                                <div class="rating">⭐ <span>${escapeHtml(product.rating)}</span></div>
                                <div class="price">${currency.format(product.price)} <del>${currency.format(product.mrp)}</del></div>
                                <button type="button" class="cart-btn" data-add-to-cart="${product.id}">Add to Cart</button>
                            </div>
                        </article>`;
                }).join('');
                if (products.length === 0) {
                    showMessage(message, 'No products are available right now.', false);
                }
            })
            .catch(error => showMessage(message, error.message, true));

        productsGrid.addEventListener('click', async event => {
            const button = event.target.closest('[data-add-to-cart]');
            if (!button) {
                return;
            }

            button.disabled = true;
            try {
                await api.post('/cart/items', {
                    productId: Number(button.dataset.addToCart),
                    quantity: 1
                });
                showMessage(message, 'Added to your cart.', false);
            } catch (error) {
                if (error.status === 401) {
                    setLoginPrompt(message);
                } else {
                    showMessage(message, error.message, true);
                }
            } finally {
                button.disabled = false;
            }
        });
    }

    const cartItems = document.querySelector('#cart-items');
    if (cartItems) {
        const message = document.querySelector('#page-message');
        const subtotal = document.querySelector('#cart-subtotal');
        const total = document.querySelector('#cart-total');
        cartItems.innerHTML = '<p>Loading cart...</p>';
        subtotal.textContent = currency.format(0);
        total.textContent = currency.format(0);

        function renderCart(cart) {
            cartItems.innerHTML = cart.items.map(item => `
                <article class="cart-item">
                    <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}">
                    <div class="cart-details">
                        <h3>${escapeHtml(item.name)}</h3>
                        <p>${escapeHtml(item.description)}</p>
                        <div class="quantity">
                            <button type="button" data-quantity="-1" data-product-id="${item.productId}" aria-label="Decrease quantity">-</button>
                            <span>${item.quantity}</span>
                            <button type="button" data-quantity="1" data-product-id="${item.productId}" aria-label="Increase quantity">+</button>
                        </div>
                        <button type="button" class="remove-item" data-remove-item="${item.productId}">Remove</button>
                    </div>
                    <div class="cart-price">${currency.format(item.lineTotal)}</div>
                </article>`).join('');

            if (cart.items.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Browse products to get started.</p>';
            }
            subtotal.textContent = currency.format(cart.subtotal);
            total.textContent = currency.format(cart.subtotal);
        }

        async function refreshCart() {
            const cart = await api.get('/cart');
            renderCart(cart);
        }

        refreshCart().catch(error => {
            if (error.status === 401) {
                setLoginPrompt(message);
            } else {
                showMessage(message, error.message, true);
            }
        });

        cartItems.addEventListener('click', async event => {
            const quantityButton = event.target.closest('[data-quantity]');
            const removeButton = event.target.closest('[data-remove-item]');
            try {
                if (quantityButton) {
                    const item = quantityButton.closest('.cart-item');
                    const currentQuantity = Number(item.querySelector('.quantity span').textContent);
                    const nextQuantity = currentQuantity + Number(quantityButton.dataset.quantity);
                    const productId = quantityButton.dataset.productId;
                    if (nextQuantity === 0) {
                        await api.delete(`/cart/items/${productId}`);
                    } else {
                        await api.put(`/cart/items/${productId}`, { quantity: nextQuantity });
                    }
                    await refreshCart();
                } else if (removeButton) {
                    await api.delete(`/cart/items/${removeButton.dataset.removeItem}`);
                    await refreshCart();
                }
            } catch (error) {
                showMessage(message, error.message, true);
            }
        });
    }
})();
