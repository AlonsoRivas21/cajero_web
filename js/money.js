// Denominaciones en dólares estadounidenses
const DENOMINATIONS = {
    coins: [
        { value: 0.01, label: "$0.01", type: "coin" },
        { value: 0.05, label: "$0.05", type: "coin" },
        { value: 0.10, label: "$0.10", type: "coin" },
        { value: 0.25, label: "$0.25", type: "coin" }
    ],
    bills: [
        { value: 1.00, label: "$1", type: "bill" },
        { value: 5.00, label: "$5", type: "bill" },
        { value: 10.00, label: "$10", type: "bill" },
        { value: 20.00, label: "$20", type: "bill" },
        { value: 50.00, label: "$50", type: "bill" },
        { value: 100.00, label: "$100", type: "bill" }
    ]
};

// Convertir a centavos para evitar errores con decimales
function toCents(amount) {
    return Math.round(amount * 100);
}

// Convertir de centavos a dólares
function fromCents(cents) {
    return cents / 100;
}

// Formatear a moneda en dólares
function formatCurrency(amount) {
    // Asegurar precisión
    const cents = toCents(amount);
    const dollars = Math.floor(cents / 100);
    const centsPart = Math.abs(cents % 100);
    const sign = cents < 0 ? "-" : "";
    return `${sign}$${dollars}.${centsPart.toString().padStart(2, '0')}`;
}

// Sumar montos con precisión
function addAmounts(...amounts) {
    let totalCents = 0;
    for (const amount of amounts) {
        totalCents += toCents(amount);
    }
    return fromCents(totalCents);
}

// Restar montos con precisión
function subtractAmounts(a, b) {
    const resultCents = toCents(a) - toCents(b);
    return fromCents(resultCents);
}

// Comparar montos (igualdad con precisión)
function amountsEqual(a, b) {
    return toCents(a) === toCents(b);
}

export {
    DENOMINATIONS,
    toCents,
    fromCents,
    formatCurrency,
    addAmounts,
    subtractAmounts,
    amountsEqual
};
