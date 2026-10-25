import UI from './ui.js';
import { generateTransaction, getLevelConfig } from './generator.js';
import { DENOMINATIONS, formatCurrency, addAmounts, subtractAmounts, amountsEqual, toCents } from './money.js';

class Game {
    constructor() {
        this.ui = new UI();
        this.currentTransaction = null;
        this.deliveredItems = [];
        this.level = 1;
        this.score = 0;
        this.streak = 0;
        this.consecutiveCorrect = 0;
        this.isProcessing = false;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.ui.elements.btnCheck.addEventListener('click', () => this.checkAnswer());
        this.ui.elements.btnClear.addEventListener('click', () => this.clearSelection());
        
        // Event delegation para botones de efectivo
        this.ui.elements.coinsButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('cash-btn')) {
                this.addItem(e.target);
            }
        });
        
        this.ui.elements.billsButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('cash-btn')) {
                this.addItem(e.target);
            }
        });
        
        // Iniciar juego
        this.startNewTransaction();
    }
    
    startNewTransaction() {
        this.isProcessing = false;
        this.deliveredItems = [];
        this.ui.clearFeedback();
        this.ui.renderDeliveredItems([], () => {});
        this.ui.updateDeliveredTotal(0);
        this.ui.elements.changeDue.textContent = '???';
        
        // Generar nueva transacción
        this.currentTransaction = generateTransaction(this.level);
        
        // Actualizar UI
        this.ui.updateTransactionInfo(this.currentTransaction);
        this.ui.renderCashButtons(this.currentTransaction.allowedDenominations);
        this.ui.updateStats(this.level, this.score, this.streak);
        
        // Iniciar temporizador
        this.ui.startTimer(this.currentTransaction.timeLimit, () => {
            this.handleTimeout();
        });
    }
    
    addItem(button) {
        if (this.isProcessing) return;
        
        const value = parseFloat(button.dataset.value);
        const label = button.textContent;
        
        this.deliveredItems.push({
            value: value,
            label: label
        });
        
        this.updateDeliveredDisplay();
    }
    
    updateDeliveredDisplay() {
        this.ui.renderDeliveredItems(this.deliveredItems, (index) => {
            this.removeItem(index);
        });
        
        const total = this.deliveredItems.reduce((sum, item) => {
            return addAmounts(sum, item.value);
        }, 0);
        
        this.ui.updateDeliveredTotal(total);
    }
    
    removeItem(index) {
        if (this.isProcessing) return;
        this.deliveredItems.splice(index, 1);
        this.updateDeliveredDisplay();
    }
    
    clearSelection() {
        if (this.isProcessing) return;
        this.deliveredItems = [];
        this.updateDeliveredDisplay();
    }
    
    checkAnswer() {
        if (this.isProcessing || !this.currentTransaction) return;
        
        this.isProcessing = true;
        this.ui.stopTimer();
        
        // Mostrar el cambio a dar
        this.ui.elements.changeDue.textContent = formatCurrency(this.currentTransaction.change);
        
        // Calcular total entregado
        const totalDelivered = this.deliveredItems.reduce((sum, item) => {
            return addAmounts(sum, item.value);
        }, 0);
        
        const changeDue = this.currentTransaction.change;
        
        if (amountsEqual(totalDelivered, changeDue)) {
            // Acierto
            this.handleCorrect(totalDelivered);
        } else {
            // Fallo
            this.handleIncorrect(totalDelivered, changeDue);
        }
    }
    
    handleCorrect(totalDelivered) {
        const timeRemaining = this.ui.getTimeRemaining();
        let pointsEarned = 10; // Puntos base
        
        // Bonus por racha
        if (this.streak >= 2) {
            pointsEarned += this.streak * 2;
        }
        
        // Bonus por tiempo restante
        if (timeRemaining > 10) {
            pointsEarned += Math.floor(timeRemaining / 5);
        }
        
        this.score += pointsEarned;
        this.streak++;
        this.consecutiveCorrect++;
        
        // Comprobar si sube de nivel
        if (this.consecutiveCorrect >= 5 && this.level < 3) {
            this.level++;
            this.consecutiveCorrect = 0;
            this.ui.showFeedback(
                `¡Correcto! +${pointsEarned} puntos. ¡Subes al Nivel ${this.level}!`,
                'success'
            );
        } else {
            this.ui.showFeedback(
                `¡Correcto! +${pointsEarned} puntos. Racha: ${this.streak}`,
                'success'
            );
        }
        
        this.ui.updateStats(this.level, this.score, this.streak);
        
        setTimeout(() => {
            this.startNewTransaction();
        }, 1500);
    }
    
    handleIncorrect(totalDelivered, changeDue) {
        this.score -= 5;
        if (this.score < 0) this.score = 0;
        this.streak = 0;
        this.consecutiveCorrect = 0;
        
        const diff = Math.abs(subtractAmounts(totalDelivered, changeDue));
        let message;
        
        if (totalDelivered < changeDue) {
            message = `Incorrecto. Te faltan ${formatCurrency(diff)}. -5 puntos.`;
        } else {
            message = `Incorrecto. Te sobran ${formatCurrency(diff)}. -5 puntos.`;
        }
        
        this.ui.showFeedback(message, 'error');
        this.ui.updateStats(this.level, this.score, this.streak);
        
        setTimeout(() => {
            this.startNewTransaction();
        }, 1500);
    }
    
    handleTimeout() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.score -= 5;
        if (this.score < 0) this.score = 0;
        this.streak = 0;
        this.consecutiveCorrect = 0;
        
        this.ui.showFeedback('Tiempo agotado. -5 puntos.', 'warning');
        this.ui.updateStats(this.level, this.score, this.streak);
        
        setTimeout(() => {
            this.startNewTransaction();
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
