import { DENOMINATIONS, formatCurrency } from './money.js';

class UI {
    constructor() {
        this.elements = {
            level: document.getElementById('level'),
            score: document.getElementById('score'),
            streak: document.getElementById('streak'),
            timer: document.getElementById('timer'),
            price: document.getElementById('price'),
            paid: document.getElementById('paid'),
            changeDue: document.getElementById('change-due'),
            feedback: document.getElementById('feedback'),
            deliveredItems: document.getElementById('delivered-items'),
            deliveredTotal: document.getElementById('delivered-total'),
            coinsButtons: document.getElementById('coins-buttons'),
            billsButtons: document.getElementById('bills-buttons'),
            btnCheck: document.getElementById('btn-check'),
            btnClear: document.getElementById('btn-clear')
        };
        
        this.timerInterval = null;
        this.timeRemaining = 0;
    }
    
    renderCashButtons(denominations) {
        // Limpiar botones
        this.elements.coinsButtons.innerHTML = '';
        this.elements.billsButtons.innerHTML = '';
        
        // Renderizar monedas
        if (denominations.coins) {
            for (const coin of denominations.coins) {
                const btn = document.createElement('button');
                btn.className = 'cash-btn coin';
                btn.textContent = coin.label;
                btn.dataset.value = coin.value;
                btn.dataset.type = coin.type;
                this.elements.coinsButtons.appendChild(btn);
            }
        }
        
        // Renderizar billetes
        if (denominations.bills) {
            for (const bill of denominations.bills) {
                const btn = document.createElement('button');
                btn.className = 'cash-btn bill';
                btn.textContent = bill.label;
                btn.dataset.value = bill.value;
                btn.dataset.type = bill.type;
                this.elements.billsButtons.appendChild(btn);
            }
        }
    }
    
    updateTransactionInfo(transaction) {
        this.elements.price.textContent = formatCurrency(transaction.price);
        this.elements.paid.textContent = formatCurrency(transaction.paid);
        this.elements.changeDue.textContent = '???';
        this.elements.changeDue.dataset.value = transaction.change;
    }
    
    updateStats(level, score, streak) {
        this.elements.level.textContent = level;
        this.elements.score.textContent = score;
        this.elements.streak.textContent = streak;
    }
    
    startTimer(seconds, onTimeout) {
        this.stopTimer();
        this.timeRemaining = seconds;
        this.elements.timer.textContent = this.timeRemaining;
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.elements.timer.textContent = this.timeRemaining;
            
            if (this.timeRemaining <= 0) {
                this.stopTimer();
                if (onTimeout) {
                    onTimeout();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    getTimeRemaining() {
        return this.timeRemaining;
    }
    
    showFeedback(message, type) {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = 'feedback show';
        
        if (type === 'success') {
            this.elements.feedback.classList.add('success');
        } else if (type === 'error') {
            this.elements.feedback.classList.add('error');
        } else if (type === 'warning') {
            this.elements.feedback.classList.add('warning');
        }
    }
    
    clearFeedback() {
        this.elements.feedback.className = 'feedback';
        this.elements.feedback.textContent = '';
    }
    
    renderDeliveredItems(items, onRemove) {
        this.elements.deliveredItems.innerHTML = '';
        
        if (items.length === 0) {
            return;
        }
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'delivered-item';
            
            const moneyDiv = document.createElement('div');
            if (item.value < 1) {
                moneyDiv.className = 'money-display coin';
            } else {
                moneyDiv.className = 'money-display bill';
            }
            moneyDiv.textContent = item.label;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'delivered-item-remove';
            removeBtn.textContent = '×';
            removeBtn.onclick = () => onRemove(i);
            
            itemDiv.appendChild(moneyDiv);
            itemDiv.appendChild(removeBtn);
            this.elements.deliveredItems.appendChild(itemDiv);
        }
    }
    
    updateDeliveredTotal(total) {
        this.elements.deliveredTotal.textContent = formatCurrency(total);
    }
}

export default UI;
