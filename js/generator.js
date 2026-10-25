import { DENOMINATIONS, toCents, fromCents, amountsEqual } from './money.js';

// Configuración de niveles
const LEVEL_CONFIG = {
    1: {
        timeLimit: 60,
        minPrice: 0.10,
        maxPrice: 15.00,
        allowedDenominations: {
            coins: DENOMINATIONS.coins,
            bills: [DENOMINATIONS.bills[0], DENOMINATIONS.bills[1]] // $1, $5
        }
    },
    2: {
        timeLimit: 60,
        minPrice: 0.25,
        maxPrice: 40.00,
        allowedDenominations: {
            coins: DENOMINATIONS.coins,
            bills: [DENOMINATIONS.bills[0], DENOMINATIONS.bills[1], DENOMINATIONS.bills[2]] // $1, $5, $10
        }
    },
    3: {
        timeLimit: 60,
        minPrice: 1.00,
        maxPrice: 150.00,
        allowedDenominations: {
            coins: DENOMINATIONS.coins,
            bills: DENOMINATIONS.bills // Todos incluyendo $20, $50, $100
        }
    }
};

function getRandomFloat(min, max, decimals = 2) {
    const factor = Math.pow(10, decimals);
    const minInt = Math.round(min * factor);
    const maxInt = Math.round(max * factor);
    const randomInt = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    return randomInt / factor;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Verificar si el cambio es realizable con las denominaciones disponibles
function isChangePossible(changeAmount, denominations) {
    const allDenoms = [...denominations.coins, ...denominations.bills];
    // Ordenar de mayor a menor
    allDenoms.sort((a, b) => b.value - a.value);
    
    let remainingCents = toCents(changeAmount);
    
    for (const denom of allDenoms) {
        const denomCents = toCents(denom.value);
        if (denomCents === 0) continue;
        const count = Math.floor(remainingCents / denomCents);
        remainingCents -= count * denomCents;
        if (remainingCents === 0) break;
    }
    
    return remainingCents === 0;
}

// Generar una transacción para el nivel dado
function generateTransaction(level) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
    const allDenoms = [...config.allowedDenominations.coins, ...config.allowedDenominations.bills];
    
    let price, paid, change;
    let attempts = 0;
    const maxAttempts = 200;
    
    do {
        // Generar precio (puede tener céntimos)
        price = getRandomFloat(config.minPrice, config.maxPrice);
        price = Math.round(price * 100) / 100;
        
        // Cliente paga con billete entero (solo dólares, sin céntimos)
        const allowedBills = [...config.allowedDenominations.bills].sort((a, b) => a.value - b.value);
        // Filtrar billetes que sean >= precio
        const candidates = allowedBills.filter(bill => bill.value >= price);
        
        if (candidates.length > 0) {
            // Elegir aleatoriamente entre los billetes que cubran el precio
            // Dar mayor probabilidad a billetes un poco mayores para variedad
            const randomIndex = getRandomInt(0, candidates.length - 1);
            paid = candidates[randomIndex].value;
        } else {
            // Usar el billete más grande disponible
            if (allowedBills.length > 0) {
                paid = allowedBills[allowedBills.length - 1].value;
            } else {
                paid = Math.ceil(price);
            }
        }
        
        paid = Math.round(paid * 100) / 100;
        change = Math.round((paid - price) * 100) / 100;
        attempts++;
    } while ((!isChangePossible(change, config.allowedDenominations) || amountsEqual(change, 0) || change < 0) && attempts < maxAttempts);
    
    // Si no se encontró una combinación realizable después de muchos intentos, ajustar
    if (!isChangePossible(change, config.allowedDenominations)) {
        // Forzar cambio con denominaciones básicas
        change = getRandomFloat(0.01, 5.00);
        paid = price + change;
        // Redondear para que sea realizable
        change = Math.round(change * 100) / 100;
        paid = Math.round((price + change) * 100) / 100;
    }
    
    return {
        price: Math.round(price * 100) / 100,
        paid: Math.round(paid * 100) / 100,
        change: Math.round((paid - price) * 100) / 100,
        level: level,
        timeLimit: config.timeLimit,
        allowedDenominations: config.allowedDenominations
    };
}

function getLevelConfig(level) {
    return LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
}

export {
    generateTransaction,
    getLevelConfig,
    LEVEL_CONFIG
};
