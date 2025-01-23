document.addEventListener('DOMContentLoaded', () => {
    fetch('/products')
        .then(response => response.json())
        .then(products => {
            const productContainer = document.getElementById('product-container');

            products.forEach((product, index) => {
                const productElement = document.createElement('div');
                productElement.classList.add('product');

                productElement.innerHTML = `
                    <img src="images/${product.image}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p>Price: $${product.price}</p>
                    <p>Quantity: <span id="quantity-${index}">${product.quantity}</span></p>
                    <button onclick="increaseQuantity(${index})">+</button>
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <div class="product-menu-icon" onclick="toggleProductMenu(this)">
                        <i class="fas fa-bars"></i>
                    </div>
                    <div class="product-menu">
                        <a  onclick="editProduct(${index})">Edit</a>
                        <a  onclick="deleteProduct(${index})">Delete</a>
                    </div>
                `;

                productContainer.appendChild(productElement);
            });
        });

    const modal = document.getElementById('item-modal');
    const addItemButton = document.getElementById('add-item-button');
    const closeButton = document.querySelector('.close-button');
    const itemForm = document.getElementById('item-form');

    addItemButton.onclick = () => {
        modal.style.display = 'block';
    };

    closeButton.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    itemForm.onsubmit = (event) => {
        event.preventDefault();

        const name = document.getElementById('item-name').value;
        const price = parseFloat(document.getElementById('item-price').value);
        const quantity = parseInt(document.getElementById('item-quantity').value);
        const imageFile = document.getElementById('item-image').files[0];
        const imageName = imageFile.name;

        const reader = new FileReader();
        reader.onload = () => {
            const newProduct = { name, price, quantity, image: imageName };
            addProduct(newProduct);
            saveQuantities();
            modal.style.display = 'none';
        };
        reader.readAsDataURL(imageFile);
    };
});

function addProduct(product) {
    const productContainer = document.getElementById('product-container');
    const index = document.querySelectorAll('.product').length;

    const productElement = document.createElement('div');
    productElement.classList.add('product');

    productElement.innerHTML = `
        <img src="images/${product.image}" alt="${product.name}">
        <h2>${product.name}</h2>
        <p>Price: $${product.price}</p>
        <p>Quantity: <span id="quantity-${index}">${product.quantity}</span></p>
        <button onclick="increaseQuantity(${index})">+</button>
        <button onclick="decreaseQuantity(${index})">-</button>
        <div class="product-menu-icon" onclick="toggleProductMenu(this)">
            <i class="fas fa-bars"></i>
        </div>
        <div class="product-menu">
            <a  onclick="editProduct(${index})">Edit</a>
            <a  onclick="deleteProduct(${index})">Delete</a>
        </div>
    `;

    productContainer.appendChild(productElement);
}

function saveQuantities() {
    const products = [];
    document.querySelectorAll('.product').forEach((productElement, index) => {
        const name = productElement.querySelector('h2').textContent;
        const price = parseFloat(productElement.querySelector('p').textContent.replace('Price: $', ''));
        const quantity = parseInt(productElement.querySelector(`#quantity-${index}`).textContent);
        const image = productElement.querySelector('img').src.split('/').pop();
        products.push({ name, price, quantity, image });
    });

    fetch('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(products)
    });
}

function increaseQuantity(index) {
    const quantityElement = document.getElementById(`quantity-${index}`);
    let quantity = parseInt(quantityElement.textContent);
    quantityElement.textContent = ++quantity;
    saveQuantities();
}

function decreaseQuantity(index) {
    const quantityElement = document.getElementById(`quantity-${index}`);
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 0) {
        quantityElement.textContent = --quantity;
        saveQuantities();
    }
}

function toggleProductMenu(element) {
    const menu = element.nextElementSibling;
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
}

function editProduct(index) {
    const product = document.querySelectorAll('.product')[index];
    const name = product.querySelector('h2').textContent;
    const price = product.querySelector('p').textContent.replace('Price: $', '');
    const quantity = product.querySelector(`#quantity-${index}`).textContent;

    document.getElementById('edit-name').value = name;
    document.getElementById('edit-price').value = price;
    document.getElementById('edit-quantity').value = quantity;

    document.getElementById('edit-modal').style.display = 'block';

    document.getElementById('edit-form').onsubmit = function(event) {
        event.preventDefault();
        const updatedName = document.getElementById('edit-name').value;
        const updatedPrice = parseFloat(document.getElementById('edit-price').value);
        const updatedQuantity = parseInt(document.getElementById('edit-quantity').value);

        product.querySelector('h2').textContent = updatedName;
        product.querySelector('p').textContent = `Price: $${updatedPrice}`;
        product.querySelector(`#quantity-${index}`).textContent = updatedQuantity;

        fetch(`/products/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: updatedName, price: updatedPrice, quantity: updatedQuantity })
        }).then(() => {
            document.getElementById('edit-modal').style.display = 'none';
            saveQuantities();
        });
    };
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`/products/${index}`, {
            method: 'DELETE'
        }).then(() => {
            const product = document.querySelectorAll('.product')[index];
            product.remove();
            saveQuantities();
        });
    }
}