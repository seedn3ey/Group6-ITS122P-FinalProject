document.addEventListener('DOMContentLoaded', () => {
  const addAccountBtn = document.querySelector('.actionButtons button:nth-child(1)');
  const addTransactionBtn = document.querySelector('.actionButtons button:nth-child(2)');
  const viewLogsBtn = document.querySelector('.actionButtons button:nth-child(3)');
  const deleteAccountBtn = document.querySelector('.actionButtons button:nth-child(4)');
  const container = document.querySelector('.container');

  let accounts = [];
  let accountIdCounter = 0;

  // Shared list of transaction categories, used by both Add and Edit modals
  const CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Salary', 'Other'];

  // ============================================================
  // RENDER ACCOUNTS (source of truth -> DOM)
  // ============================================================
  function renderAccounts() {
    container.innerHTML = '';

    accounts.forEach(account => {
      const card = document.createElement('div');
      card.className = 'card';

      // Clicking the card opens the full transaction log for this account
      card.addEventListener('click', () => {
        openLogsView(account);
      });

      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = account.name;

      const balance = document.createElement('p');
      balance.className = 'card-balance';
      balance.textContent = `Balance: $${account.balance.toFixed(2)}`;
      balance.classList.add(account.balance < 0 ? 'negative' : 'positive');

      const txList = document.createElement('ul');
      txList.className = 'card-transactions';

      if (account.transactions.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'card-text';
        empty.textContent = 'No transactions yet.';
        txList.appendChild(empty);
      } else {
        // Show only the 3 most recent transactions on the card
        const recentTx = [...account.transactions]
          .sort((a, b) => b.date - a.date)
          .slice(0, 3);

        recentTx.forEach(tx => {
          const item = document.createElement('li');
          const sign = tx.type === 'income' ? '+' : '-';
          item.textContent = `[${tx.category}] ${tx.description}: ${sign}$${tx.amount.toFixed(2)}`;
          item.classList.add(tx.type);
          txList.appendChild(item);
        });

        if (account.transactions.length > 3) {
          const more = document.createElement('li');
          more.className = 'card-text card-more';
          more.textContent = `+ ${account.transactions.length - 3} more — click to view all`;
          txList.appendChild(more);
        }
      }

      card.appendChild(title);
      card.appendChild(balance);
      card.appendChild(txList);
      container.appendChild(card);
    });
  }

  // ============================================================
  // ADD ACCOUNT
  // ============================================================
  addAccountBtn.addEventListener('click', () => {
    accountIdCounter++;
    accounts.push({
      id: accountIdCounter,
      name: `Account ${accountIdCounter}`,
      balance: 0,
      transactions: []
    });
    renderAccounts();
  });

  // ============================================================
  // ADD TRANSACTION
  // ============================================================
  addTransactionBtn.addEventListener('click', () => {
    if (accounts.length === 0) {
      alert('Please add an account first.');
      return;
    }
    openAddTransactionModal();
  });

  function openAddTransactionModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const heading = document.createElement('h3');
    heading.textContent = 'Add Transaction';

    const select = document.createElement('select');
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name;
      select.appendChild(option);
    });

    // Income / Expense toggle
    const typeWrapper = document.createElement('div');
    typeWrapper.className = 'type-toggle';

    const incomeLabel = document.createElement('label');
    const incomeRadio = document.createElement('input');
    incomeRadio.type = 'radio';
    incomeRadio.name = 'txType';
    incomeRadio.value = 'income';
    incomeRadio.checked = true;
    incomeLabel.appendChild(incomeRadio);
    incomeLabel.append(' Income');

    const expenseLabel = document.createElement('label');
    const expenseRadio = document.createElement('input');
    expenseRadio.type = 'radio';
    expenseRadio.name = 'txType';
    expenseRadio.value = 'expense';
    expenseLabel.appendChild(expenseRadio);
    expenseLabel.append(' Expense');

    typeWrapper.appendChild(incomeLabel);
    typeWrapper.appendChild(expenseLabel);

    // ---- Category dropdown ----
    const categorySelect = document.createElement('select');
    CATEGORIES.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.placeholder = 'Description';

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.placeholder = 'Amount';
    amountInput.min = '0';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'card-button';
    confirmBtn.textContent = 'Add Transaction';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'card-button cancel';
    cancelBtn.textContent = 'Cancel';

    confirmBtn.addEventListener('click', () => {
      const accountId = parseInt(select.value);
      const description = descInput.value.trim() || 'Unnamed transaction';
      const amount = Math.abs(parseFloat(amountInput.value) || 0);
      const type = typeWrapper.querySelector('input[name="txType"]:checked').value;
      const category = categorySelect.value;

      const account = accounts.find(a => a.id === accountId);
      account.transactions.push({ description, amount, type, category, date: new Date() });

      // simple math: income adds, expense subtracts
      account.balance += type === 'income' ? amount : -amount;

      renderAccounts();
      document.body.removeChild(overlay);
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(heading);
    modal.appendChild(select);
    modal.appendChild(typeWrapper);
    modal.appendChild(categorySelect);
    modal.appendChild(descInput);
    modal.appendChild(amountInput);
    modal.appendChild(confirmBtn);
    modal.appendChild(cancelBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // ============================================================
  // VIEW TRANSACTION LOGS
  // ============================================================
  viewLogsBtn.addEventListener('click', () => {
    if (accounts.length === 0) {
      alert('Please add an account first.');
      return;
    }
    openLogsAccountPicker();
  });

  function openLogsAccountPicker() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const heading = document.createElement('h3');
    heading.textContent = 'View Logs For Account';

    const select = document.createElement('select');
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name;
      select.appendChild(option);
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'card-button';
    confirmBtn.textContent = 'View Logs';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'card-button cancel';
    cancelBtn.textContent = 'Cancel';

    confirmBtn.addEventListener('click', () => {
      const accountId = parseInt(select.value);
      const account = accounts.find(a => a.id === accountId);
      document.body.removeChild(overlay);
      openLogsView(account);
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(heading);
    modal.appendChild(select);
    modal.appendChild(confirmBtn);
    modal.appendChild(cancelBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function openLogsView(account) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal logs-modal';

    const heading = document.createElement('h3');
    heading.textContent = `${account.name} — Transaction Log`;

    const balance = document.createElement('p');
    balance.className = 'card-balance';
    balance.textContent = `Current Balance: $${account.balance.toFixed(2)}`;
    balance.classList.add(account.balance < 0 ? 'negative' : 'positive');

    const logList = document.createElement('ul');
    logList.className = 'logs-list';

    function refreshBalanceDisplay() {
      balance.textContent = `Current Balance: $${account.balance.toFixed(2)}`;
      balance.classList.remove('positive', 'negative');
      balance.classList.add(account.balance < 0 ? 'negative' : 'positive');
    }

    function renderLogList() {
      logList.innerHTML = '';

      if (account.transactions.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'card-text';
        empty.textContent = 'No transactions recorded for this account.';
        logList.appendChild(empty);
        return;
      }

      const sorted = [...account.transactions].sort((a, b) => b.date - a.date);

      sorted.forEach(tx => {
        const item = document.createElement('li');
        item.className = `log-entry ${tx.type}`;

        const infoWrapper = document.createElement('div');
        infoWrapper.className = 'log-info';

        const sign = tx.type === 'income' ? '+' : '-';
        const dateStr = tx.date.toLocaleString();

        const desc = document.createElement('span');
        desc.className = 'log-desc';
        desc.textContent = tx.description;

        const category = document.createElement('span');
        category.className = 'log-category';
        category.textContent = tx.category;

        const amt = document.createElement('span');
        amt.className = 'log-amount';
        amt.textContent = `${sign}$${tx.amount.toFixed(2)}`;

        const date = document.createElement('span');
        date.className = 'log-date';
        date.textContent = dateStr;

        infoWrapper.appendChild(desc);
        infoWrapper.appendChild(category);
        infoWrapper.appendChild(amt);
        infoWrapper.appendChild(date);

        // ---- Button group: Edit + Delete ----
        const btnGroup = document.createElement('div');
        btnGroup.className = 'log-btn-group';

        const editBtn = document.createElement('button');
        editBtn.className = 'log-edit-btn';
        editBtn.textContent = '✎';
        editBtn.title = 'Edit this transaction';

        editBtn.addEventListener('click', () => {
          openEditTransactionModal(account, tx, () => {
            refreshBalanceDisplay();
            renderLogList();
            renderAccounts();
          });
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'log-delete-btn';
        deleteBtn.textContent = '--';
        deleteBtn.title = 'Delete this transaction';

        deleteBtn.addEventListener('click', () => {
          const confirmed = confirm(`Delete transaction "${tx.description}"? This cannot be undone.`);
          if (!confirmed) return;

          // Reverse this transaction's effect on the balance
          account.balance += tx.type === 'income' ? -tx.amount : tx.amount;

          // Remove it from the account's transaction list
          account.transactions = account.transactions.filter(t => t !== tx);

          refreshBalanceDisplay();
          renderLogList();
          renderAccounts();
        });

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);

        item.appendChild(infoWrapper);
        item.appendChild(btnGroup);
        logList.appendChild(item);
      });
    }

    renderLogList();

    const closeBtn = document.createElement('button');
    closeBtn.className = 'card-button cancel';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(heading);
    modal.appendChild(balance);
    modal.appendChild(logList);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // ============================================================
  // EDIT TRANSACTION
  // ============================================================
  function openEditTransactionModal(account, tx, onSaved) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const heading = document.createElement('h3');
    heading.textContent = 'Edit Transaction';

    // Income / Expense toggle, pre-set to the transaction's current type
    const typeWrapper = document.createElement('div');
    typeWrapper.className = 'type-toggle';

    const incomeLabel = document.createElement('label');
    const incomeRadio = document.createElement('input');
    incomeRadio.type = 'radio';
    incomeRadio.name = 'editTxType';
    incomeRadio.value = 'income';
    incomeRadio.checked = tx.type === 'income';
    incomeLabel.appendChild(incomeRadio);
    incomeLabel.append(' Income');

    const expenseLabel = document.createElement('label');
    const expenseRadio = document.createElement('input');
    expenseRadio.type = 'radio';
    expenseRadio.name = 'editTxType';
    expenseRadio.value = 'expense';
    expenseRadio.checked = tx.type === 'expense';
    expenseLabel.appendChild(expenseRadio);
    expenseLabel.append(' Expense');

    typeWrapper.appendChild(incomeLabel);
    typeWrapper.appendChild(expenseLabel);

    // ---- Category dropdown, pre-set to the transaction's current category ----
    const categorySelect = document.createElement('select');
    CATEGORIES.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      if (cat === tx.category) option.selected = true;
      categorySelect.appendChild(option);
    });

    // Pre-fill inputs with the transaction's current values
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.placeholder = 'Description';
    descInput.value = tx.description;

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.placeholder = 'Amount';
    amountInput.min = '0';
    amountInput.value = tx.amount;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'card-button';
    saveBtn.textContent = 'Save Changes';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'card-button cancel';
    cancelBtn.textContent = 'Cancel';

    saveBtn.addEventListener('click', () => {
      const newDescription = descInput.value.trim() || 'Unnamed transaction';
      const newAmount = Math.abs(parseFloat(amountInput.value) || 0);
      const newType = typeWrapper.querySelector('input[name="editTxType"]:checked').value;
      const newCategory = categorySelect.value;

      // Step 1: undo the OLD transaction's effect on the balance
      account.balance += tx.type === 'income' ? -tx.amount : tx.amount;

      // Step 2: apply the NEW values' effect on the balance
      account.balance += newType === 'income' ? newAmount : -newAmount;

      // Step 3: update the transaction object itself
      tx.description = newDescription;
      tx.amount = newAmount;
      tx.type = newType;
      tx.category = newCategory;

      document.body.removeChild(overlay);
      onSaved(); // tells openLogsView to refresh its balance/list, and refreshes the cards
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(heading);
    modal.appendChild(typeWrapper);
    modal.appendChild(categorySelect);
    modal.appendChild(descInput);
    modal.appendChild(amountInput);
    modal.appendChild(saveBtn);
    modal.appendChild(cancelBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================
  deleteAccountBtn.addEventListener('click', () => {
    if (accounts.length === 0) {
      alert('There are no accounts to delete.');
      return;
    }
    openDeleteAccountPicker();
  });

  function openDeleteAccountPicker() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const heading = document.createElement('h3');
    heading.textContent = 'Delete Account';

    const select = document.createElement('select');
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name;
      select.appendChild(option);
    });

    const warning = document.createElement('p');
    warning.className = 'card-text delete-warning';
    warning.textContent = 'This will permanently delete the account and all its transactions.';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'card-button delete';
    confirmBtn.textContent = 'Delete Account';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'card-button cancel';
    cancelBtn.textContent = 'Cancel';

    confirmBtn.addEventListener('click', () => {
      const accountId = parseInt(select.value);
      const account = accounts.find(a => a.id === accountId);

      const confirmed = confirm(`Are you sure you want to delete "${account.name}"? This cannot be undone.`);
      if (!confirmed) return;

      accounts = accounts.filter(a => a.id !== accountId);

      renderAccounts();
      document.body.removeChild(overlay);
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(heading);
    modal.appendChild(select);
    modal.appendChild(warning);
    modal.appendChild(confirmBtn);
    modal.appendChild(cancelBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
});