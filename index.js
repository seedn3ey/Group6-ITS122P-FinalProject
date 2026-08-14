document.addEventListener('DOMContentLoaded', () => {
  const addAccountBtn = document.querySelector('.actionButtons button:nth-child(1)');
  const addTransactionBtn = document.querySelector('.actionButtons button:nth-child(2)');
  const viewLogsBtn = document.querySelector('.actionButtons button:nth-child(3)');
  const container = document.querySelector('.container');

  let accounts = [];
  let accountIdCounter = 0;

  // ============================================================
  // RENDER ACCOUNTS (source of truth -> DOM)
  // ============================================================
  function renderAccounts() {
    container.innerHTML = '';

    accounts.forEach(account => {
      const card = document.createElement('div');
      card.className = 'card';

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
        account.transactions.forEach(tx => {
          const item = document.createElement('li');
          const sign = tx.type === 'income' ? '+' : '-';
          item.textContent = `${tx.description}: ${sign}$${tx.amount.toFixed(2)}`;
          item.classList.add(tx.type);
          txList.appendChild(item);
        });
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

      const account = accounts.find(a => a.id === accountId);
      account.transactions.push({ description, amount, type, date: new Date() });

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

    if (account.transactions.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'card-text';
      empty.textContent = 'No transactions recorded for this account.';
      logList.appendChild(empty);
    } else {
      const sorted = [...account.transactions].sort((a, b) => b.date - a.date);

      sorted.forEach(tx => {
        const item = document.createElement('li');
        item.className = `log-entry ${tx.type}`;

        const sign = tx.type === 'income' ? '+' : '-';
        const dateStr = tx.date.toLocaleString();

        const desc = document.createElement('span');
        desc.className = 'log-desc';
        desc.textContent = tx.description;

        const amt = document.createElement('span');
        amt.className = 'log-amount';
        amt.textContent = `${sign}$${tx.amount.toFixed(2)}`;

        const date = document.createElement('span');
        date.className = 'log-date';
        date.textContent = dateStr;

        item.appendChild(desc);
        item.appendChild(amt);
        item.appendChild(date);
        logList.appendChild(item);
      });
    }

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
});