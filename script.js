// let expenses = JSON.parse(localStorage.getItem("expenses")) || [
let expenses = [
  {
    id: 1,
    name: "Supplies",
    amount: 35,
    category: "b",
    date: "2026-06-15",
  },
  {
    id: 2,
    name: "Food",
    amount: 15,
    category: "a",
    date: "2026-06-16",
  },
  {
    id: 3,
    name: "Party",
    amount: 100,
    category: "c",
    date: "2026-06-17",
  },
];
let originalExpenses = [...expenses];
let ID = 4;
let categories = JSON.parse(localStorage.getItem("categories")) || [
  "Stationery",
  "Food",
  "Utilities",
  "Marketing",
  "Office Supplies",
];

let editingId = null;

let currentPage = 1;
const itemsPerPage = 5;
const currentSort = { field: "date", asc: false };

const form = document.getElementById("add-expense-form");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");
const dateInput = document.getElementById("expense-date");
const addBtn = document.getElementById("add-btn");

const tbody = document.getElementById("expense-tbody");
const totalAmountEl = document.getElementById("total-amount");

const filterStartDate = document.getElementById("filter-start-date");
const filterEndDate = document.getElementById("filter-end-date");
const filterName = document.getElementById("filter-name");
const filterCategory = document.getElementById("filter-category");

const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

const modal = document.getElementById("category-modal");
const manageBtn = document.getElementById("manage-categories-link");
const closeBtn = document.querySelector(".close-btn");
const categoryForm = document.getElementById("category-form");
const newCategoryInput = document.getElementById("new-category");
const categoryList = document.getElementById("category-list");

const expenseModal = document.getElementById("expense-modal");
const closeExpenseBtn = document.querySelector(".close-expense-btn");
const saveExpenseBtn = document.getElementById("save-expense-btn");
const sortNameBtn = document.getElementById("sort-name-btn");
const sortAmountBtn = document.getElementById("sort-amount-btn");
const sortCategoryBtn = document.getElementById("sort-category-btn");
const sortDateBtn = document.getElementById("sort-date-btn");
const removeSortBtn = document.getElementById("remove-sort-btn");

function init() {
  if (!Array.isArray(expenses)) expenses = [];
  if (!Array.isArray(categories))
    categories = ["Stationery", "Food", "Utilities", "Marketing"];

  currentSort.field = "date";
  currentSort.asc = false;
  applyCurrentSort();
  document.getElementById("sort-date-icon").innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg);"><path d="M12 5V19M12 5L6 11M12 5L18 11" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

  renderCategories();
  renderExpenses();
}

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("categories", JSON.stringify(categories));
}

function formatAmount(amount) {
  return parseFloat(amount).toFixed(2);
}

// function formatDate(dateString) {
//     const parts = dateString.split('-');
//     if (parts.length === 3) {
//         return `${parts[2]}/${parts[1]}/${parts[0]}`;
//     }
//     return dateString;
// }

function renderCategories() {
  categoryInput.innerHTML =
    '<option value="" disabled selected>Select...</option>';
  filterCategory.innerHTML = '<option value="">All Categories</option>';
  categoryList.innerHTML = "";

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryInput.appendChild(opt);
    const fOpt = document.createElement("option");
    fOpt.value = cat;
    fOpt.textContent = cat;
    filterCategory.appendChild(fOpt);

    const li = document.createElement("li");
    li.innerHTML = `<span>${cat}</span>`;

    const delIcon = document.createElement("i");
    delIcon.className = "bx bx-trash";
    delIcon.onclick = () => deleteCategory(cat);
    li.appendChild(delIcon);

    categoryList.appendChild(li);
  }
}

function deleteCategory(cat) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i] === cat) {
      categories.splice(i, 1);
    }
  }
  saveToLocalStorage();
  renderCategories();
}

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newCat = newCategoryInput.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    saveToLocalStorage();
    renderCategories();
    newCategoryInput.value = "";
  }
});

manageBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  modal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
  }
  if (e.target === expenseModal) {
    expenseModal.classList.remove("show");
  }
});

closeExpenseBtn.addEventListener("click", () => {
  expenseModal.classList.remove("show");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const amount = amountInput.value.trim();
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!name || !amount || !category || !date) return;

  if (editingId) {
    const index = expenses.findIndex((e) => e.id === editingId);
    if (index !== -1) {
      expenses[index] = {
        id: editingId,
        name,
        amount: parseFloat(amount),
        category,
        date,
      };
    }
    editingId = null;
    saveExpenseBtn.textContent = "SAVE";
  } else {
    const newExpense = {
      id: ID++,
      name,
      amount: parseFloat(amount),
      category,
      date,
    };
    expenses.push(newExpense);
    originalExpenses.push(newExpense); 
    originalExpenses.sort((a, b) => {
      if (b.date < a.date) return -1;
      if (b.date > a.date) return 1;
      return 0;
    });
    console.log("Original Expenses after adding new expense:", originalExpenses);
  }

  if (currentSort.field) {
    applyCurrentSort();
  }

  saveToLocalStorage();
  form.reset();
  expenseModal.classList.remove("show");
  renderExpenses();
});

function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses = expenses.filter((e) => e.id !== id);
    saveToLocalStorage();

    const filtered = getFilteredExpenses();
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    renderExpenses();
  }
}

function editExpense(id) {
  const expense = expenses.find((e) => e.id === id);
  if (!expense) return;

  nameInput.value = expense.name;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;

  editingId = id;
  saveExpenseBtn.textContent = "UPDATE";
  document.getElementById("expense-modal-title").textContent = "Edit Expense";
  expenseModal.classList.add("show");
}

function getFilteredExpenses() {
  let filtered = expenses;

  const startDate = filterStartDate.value;
  const endDate = filterEndDate.value;
  const nameStr = filterName.value.toLowerCase();
  const catStr = filterCategory.value;

  if (startDate) {
    filtered = filtered.filter((e) => e.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((e) => e.date <= endDate);
  }
  if (nameStr) {
    filtered = filtered.filter((e) => e.name.toLowerCase().includes(nameStr));
  }
  if (catStr) {
    filtered = filtered.filter((e) => e.category === catStr);
  }
  if (filtered.length === 0) {
  }
  return filtered;
}

document.getElementById("search-btn").addEventListener("click", () => {
  currentPage = 1;
  renderExpenses();
});

document.getElementById("clear-filters-btn").addEventListener("click", () => {
  filterStartDate.value = "";
  filterEndDate.value = "";
  filterName.value = "";
  filterCategory.value = "";
  currentPage = 1;
  renderExpenses();
});

function renderExpenses() {
  const filtered = getFilteredExpenses();

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);
  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;">No expenses found.</td></tr>';
    pageInfo.textContent = "1 / 1";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    totalAmountEl.textContent = "0.00";
    return;
  }

  tbody.innerHTML = "";
  paginated.forEach((expense, index) => {
    const tr = document.createElement("tr");
    const absoluteIndex = startIdx + index + 1;

    tr.innerHTML = `
            <td>${absoluteIndex}</td>
            <td>${expense.name}</td>
            <td>${formatAmount(expense.amount)}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
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
  totalAmountEl.textContent = total.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderExpenses();
  }
});

nextBtn.addEventListener("click", () => {
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
function clearSortIcons() {
  document.getElementById("sort-name-icon").innerHTML = "";
  document.getElementById("sort-amount-icon").innerHTML = "";
  document.getElementById("sort-category-icon").innerHTML = "";
  document.getElementById("sort-date-icon").innerHTML = "";
}

function applyCurrentSort() {
  if (!currentSort.field) return;

  clearSortIcons();

  const isAsc = currentSort.asc;
  const rotateStyle = isAsc ? "" : ' style="transform: rotate(180deg);"';

  const arrowSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" ${rotateStyle}><path d="M12 5V19M12 5L6 11M12 5L18 11" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;


  if (currentSort.field === "name") {
    if (isAsc) {
      expenses.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    } else {
      expenses.sort((a, b) => {
        if (b.name < a.name) return -1;
        if (b.name > a.name) return 1;
        return 0;
      });
    }

    document.getElementById("sort-name-icon").innerHTML = arrowSvg;
  } else if (currentSort.field === "amount") {
    if (isAsc) {
      expenses.sort((a, b) => a.amount - b.amount);
    } else {
      expenses.sort((a, b) => b.amount - a.amount);
    }

    document.getElementById("sort-amount-icon").innerHTML = arrowSvg;
  } else if (currentSort.field === "category") {
    if (isAsc) {
      expenses.sort((a, b) => {if (a.category < b.category) return -1; if (a.category > b.category) return 1; return 0;});
    } else {
      expenses.sort((a, b) => {if (b.category < a.category) return -1; if (b.category > a.category) return 1; return 0;});
    }

    document.getElementById("sort-category-icon").innerHTML = arrowSvg;
  } else if (currentSort.field === "date") {
    if (isAsc) {
      expenses.sort((a, b) => {if (a.date < b.date) return -1; if (a.date > b.date) return 1; return 0;});
    } else {
      expenses.sort((a, b) => {if (b.date < a.date) return -1; if (b.date > a.date) return 1; return 0;});
    }

    document.getElementById("sort-date-icon").innerHTML = arrowSvg;
  }
}

const forsort = [1, 2, 3];
let iforsort = 0;
function sortName() {
  clearSortIcons();

  if (forsort[iforsort] === 1) {
    currentSort.field = "name";
    currentSort.asc = true;
  } else if (forsort[iforsort] === 2) {
    currentSort.field = "name";
    currentSort.asc = false;
  } else {
    currentSort.field = null;
  }

  if (currentSort.field) {
    applyCurrentSort();
  } else {
    expenses = [...originalExpenses];
  }

  iforsort = iforsort + 1;
  if (iforsort >= forsort.length) iforsort = 0;
  renderExpenses();
}


const forsortAmount = [1, 2, 3];
let iforsortAmount = 0;

function sortAmount() {
  clearSortIcons();

  if (forsortAmount[iforsortAmount] === 1) {
    currentSort.field = "amount";
    currentSort.asc = true;
  } else if (forsortAmount[iforsortAmount] === 2) {
    currentSort.field = "amount";
    currentSort.asc = false;
  } else {
    currentSort.field = null;
  }

  if (currentSort.field) {
    applyCurrentSort();
  } else {
    expenses = [...originalExpenses];
  }

  iforsortAmount = iforsortAmount + 1;
  if (iforsortAmount >= forsortAmount.length) iforsortAmount = 0;
  renderExpenses();
}

const forsortCategory = [1, 2, 3];
let iforsortCategory = 0;


function sortCategory() {
  clearSortIcons();

  if (forsortCategory[iforsortCategory] === 1) {
    currentSort.field = "category";
    currentSort.asc = true;
  } else if (forsortCategory[iforsortCategory] === 2) {
    currentSort.field = "category";
    currentSort.asc = false;
  } else {
    currentSort.field = null;
  }

  if (currentSort.field) {
    applyCurrentSort();
  } else {
    expenses = [...originalExpenses];
  }

  iforsortCategory = iforsortCategory + 1;
  if (iforsortCategory >= forsortCategory.length) iforsortCategory = 0;
  renderExpenses();
}
let sortDateAsc = false;
function sortDate() {
  clearSortIcons();
  sortDateAsc = !sortDateAsc;
  currentSort.field = "date";
  currentSort.asc = sortDateAsc;

  applyCurrentSort();
  renderExpenses();
}
removeSortBtn.addEventListener("click", () => {
  clearSortIcons();
  currentSort.field = null;
  expenses = [...originalExpenses];
  renderExpenses();
});
init();
