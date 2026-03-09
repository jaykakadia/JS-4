let expenses = JSON.parse(localStorage.getItem('expenses')) || [
    { id: "1", name: "Office Supplies", amount: 25.50, category: "Stationery", date: "2024-06-15" },
    
];

let categories = JSON.parse(localStorage.getItem('categories')) || ['Stationery', 'Food', 'Utilities', 'Marketing', 'Office Supplies'];

let editingId = null;

let currentPage = 1;
const itemsPerPage = 5;

const form = document.getElementById('add-expense-form');
const nameInput = document.getElementById('expense-name');
const amountInput = document.getElementById('expense-amount');
const categoryInput = document.getElementById('expense-category');
const dateInput = document.getElementById('expense-date');
const addBtn = document.getElementById('add-btn');

const tbody = document.getElementById('expense-tbody');
const totalAmountEl = document.getElementById('total-amount');

const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const filterName = document.getElementById('filter-name');
const filterCategory = document.getElementById('filter-category');

const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

const modal = document.getElementById('category-modal');
const manageBtn = document.getElementById('manage-categories-link');
const closeBtn = document.querySelector('.close-btn');
const categoryForm = document.getElementById('category-form');
const newCategoryInput = document.getElementById('new-category');
const categoryList = document.getElementById('category-list');

const expenseModal = document.getElementById('expense-modal');
const closeExpenseBtn = document.querySelector('.close-expense-btn');
const saveExpenseBtn = document.getElementById('save-expense-btn');

function init() {
    if (!Array.isArray(expenses)) expenses = [];
    if (!Array.isArray(categories)) categories = ['Stationery', 'Food', 'Utilities', 'Marketing'];
    
    renderCategories();
    renderExpenses();
}

function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('categories', JSON.stringify(categories));
}

function formatAmount(amount) {
    return parseFloat(amount).toFixed(2);
}

function formatDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

function renderCategories() {
    categoryInput.innerHTML = '<option value="" disabled selected>Select...</option>';
    filterCategory.innerHTML = '<option value="">All Categories</option>';
    categoryList.innerHTML = '';

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoryInput.appendChild(opt);

        const fOpt = document.createElement('option');
        fOpt.value = cat;
        fOpt.textContent = cat;
        filterCategory.appendChild(fOpt);

        const li = document.createElement('li');
        li.innerHTML = `<span>${cat}</span>`;
        
        const delIcon = document.createElement('i');
        delIcon.className = 'bx bx-trash';
        delIcon.onclick = () => deleteCategory(cat);
        li.appendChild(delIcon);
        
        categoryList.appendChild(li);
    });
}

function deleteCategory(cat) {
    categories = categories.filter(c => c !== cat);
    saveToLocalStorage();
    renderCategories();
}

categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCat = newCategoryInput.value.trim();
    if (newCat && !categories.includes(newCat)) {
        categories.push(newCat);
        saveToLocalStorage();
        renderCategories();
        newCategoryInput.value = '';
    }
});

manageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('show');
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
    if (e.target === expenseModal) {
        expenseModal.classList.remove('show');
    }
}); 


closeExpenseBtn.addEventListener('click', () => {
    expenseModal.classList.remove('show');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const amount = amountInput.value.trim();
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!name || !amount || !category || !date) return;

    if (editingId) {
        const index = expenses.findIndex(e => e.id === editingId);
        if (index !== -1) {
            expenses[index] = { id: editingId, name, amount: parseFloat(amount), category, date };
        }
        editingId = null;
        saveExpenseBtn.textContent = 'SAVE';
    } else {
        const newExpense = {
            id: Date.now().toString(),
            name,
            amount: parseFloat(amount),
            category,
            date
        };
        expenses.push(newExpense);
    }

    saveToLocalStorage();
    form.reset();
    expenseModal.classList.remove('show');
    renderExpenses();
});

function deleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        expenses = expenses.filter(e => e.id !== id);
        saveToLocalStorage();
        
        const filtered = getFilteredExpenses();
        const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        
        renderExpenses();
    }
}

function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    nameInput.value = expense.name;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;

    editingId = id;
    saveExpenseBtn.textContent = 'UPDATE';
    document.getElementById('expense-modal-title').textContent = 'Edit Expense';
    expenseModal.classList.add('show');
}

function getFilteredExpenses() {
    let filtered = expenses;
    
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;
    const nameStr = filterName.value.toLowerCase();
    const catStr = filterCategory.value;

    if (startDate) {
        filtered = filtered.filter(e => e.date >= startDate);
    }
    if (endDate) {
        filtered = filtered.filter(e => e.date <= endDate);
    }
    if (nameStr) {
        filtered = filtered.filter(e => e.name.toLowerCase().includes(nameStr));
    }
    if (catStr) {
        filtered = filtered.filter(e => e.category === catStr);
    }

    
    
    return filtered;
}

document.getElementById('search-btn').addEventListener('click', () => {
    currentPage = 1;
    renderExpenses();
});

document.getElementById('clear-filters-btn').addEventListener('click', () => {
    filterStartDate.value = '';
    filterEndDate.value = '';
    filterName.value = '';
    filterCategory.value = '';
    currentPage = 1;
    renderExpenses();
});

function renderExpenses() {
    const filtered = getFilteredExpenses();
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

    tbody.innerHTML = '';
    paginated.forEach((expense, index) => {
        const tr = document.createElement('tr');
        const absoluteIndex = startIdx + index + 1;
        
        tr.innerHTML = `
            <td>${absoluteIndex}</td>
            <td>${expense.name}</td>
            <td>${formatAmount(expense.amount)}</td>
            <td>${expense.category}</td>
            <td>${formatDate(expense.date)}</td>
            <td class="actions">
                <i class='bx bx-edit-alt' title="Edit" onclick="editExpense('${expense.id}')"></i>
                <i class='bx bx-trash' title="Delete" onclick="deleteExpense('${expense.id}')"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });

    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage === 1 || filtered.length === 0;
    nextBtn.disabled = currentPage === totalPages || filtered.length === 0;

    const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
    totalAmountEl.textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderExpenses();
    }
});

nextBtn.addEventListener('click', () => {
    const filtered = getFilteredExpenses();
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPage < totalPages) {
        currentPage++;
        renderExpenses();
    }
});
addBtn.addEventListener("click", () => {
  editingId = null;
  form.reset();
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  document.getElementById("expense-modal-title").textContent = "Add Expense";
  saveExpenseBtn.textContent = "SAVE";
  expenseModal.classList.add("show");
});

init();