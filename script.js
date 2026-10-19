// Curated list of primes for demonstration. Kept to a few hundred so that
// primitive-root lookup stays effectively instant.
const primeNumbers = [
    23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n,
    73n, 79n, 83n, 89n, 97n, 101n, 103n, 107n, 109n, 113n,
    127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n,
    179n, 181n, 191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n,
    233n, 239n, 241n, 251n, 257n, 263n, 269n, 271n, 277n, 281n,
    283n, 293n, 307n, 311n, 313n, 317n, 331n, 337n, 347n, 349n,
    353n, 359n, 367n, 373n, 379n, 383n, 389n, 397n, 401n, 409n,
    419n, 421n, 431n, 433n, 439n, 443n, 449n, 457n, 461n, 463n,
    467n, 479n, 487n, 491n, 499n
];

// Elements
const primeSelect = document.getElementById('prime');
const primitiveRootSelect = document.getElementById('primitiveRoot');
const alicePrivateKeyInput = document.getElementById('alicePrivateKey');
const bobPrivateKeyInput = document.getElementById('bobPrivateKey');
const outputDiv = document.getElementById('output');

// Populate the prime number select box
primeNumbers.forEach(prime => {
    const option = document.createElement('option');
    option.value = prime;
    option.textContent = prime;
    primeSelect.appendChild(option);
});

// Update primitive roots when prime changes
primeSelect.addEventListener('change', updatePrimitiveRoots);

// Initialize primitive roots
updatePrimitiveRoots();

// Dice buttons: fill a field with a random valid value
function pickRandomSelectOption(select) {
    if (select.options.length === 0) return;
    const idx = Math.floor(Math.random() * select.options.length);
    select.selectedIndex = idx;
    // Let any listeners (e.g. prime -> root refresh) react
    select.dispatchEvent(new Event('change'));
}

function pickRandomPrivateKey(input) {
    const p = BigInt(primeSelect.value);
    if (p <= 2n) return;
    input.value = randomBigInt(1n, p - 2n).toString();
}

document.getElementById('primeDice')
    .addEventListener('click', () => pickRandomSelectOption(primeSelect));
document.getElementById('rootDice')
    .addEventListener('click', () => pickRandomSelectOption(primitiveRootSelect));
document.getElementById('aliceDice')
    .addEventListener('click', () => pickRandomPrivateKey(alicePrivateKeyInput));
document.getElementById('bobDice')
    .addEventListener('click', () => pickRandomPrivateKey(bobPrivateKeyInput));

function updatePrimitiveRoots() {
    const p = BigInt(primeSelect.value);
    const roots = findAllPrimitiveRoots(p);
    primitiveRootSelect.innerHTML = '';
    roots.forEach(root => {
        const option = document.createElement('option');
        option.value = root;
        option.textContent = root;
        primitiveRootSelect.appendChild(option);
    });
}

// Modular exponentiation function for BigInt
function modPow(base, exponent, modulus) {
    base = base % modulus;
    let result = 1n;
    while (exponent > 0) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent / 2n;
        base = (base * base) % modulus;
    }
    return result;
}

// Calculate all primitive roots of p
function findAllPrimitiveRoots(p) {
    const phi = p - 1n;
    const factors = Array.from(primeFactors(phi));
    const roots = [];
    for (let g = 2n; g < p; g++) {
        let flag = false;
        for (let factor of factors) {
            if (modPow(g, phi / factor, p) === 1n) {
                flag = true;
                break;
            }
        }
        if (!flag) roots.push(g);
        if (roots.length >= 30) break; // Cap the dropdown so it stays usable
    }
    return roots;
}

// Find prime factors of n
function primeFactors(n) {
    const factors = new Set();
    while (n % 2n === 0n) {
        factors.add(2n);
        n /= 2n;
    }
    for (let i = 3n; i * i <= n; i += 2n) {
        while (n % i === 0n) {
            factors.add(i);
            n /= i;
        }
    }
    if (n > 2n) factors.add(n);
    return factors;
}

// Icons
const ICON_PRIVATE = '<i class="fas fa-key key-icon private-key-icon"></i>';
const ICON_PUBLIC  = '<i class="fas fa-key key-icon public-key-icon"></i>';
const ICON_SHARED  = '<i class="fas fa-key key-icon shared-key-icon"></i>';

// Build one step card
function stepCard(n, title, subtitle, bodyHtml) {
    return `
        <section class="step">
            <header class="step-header">
                <span class="step-badge">${n}</span>
                <h2 class="step-title">${title}</h2>
                <span class="step-subtitle">${subtitle}</span>
            </header>
            <div class="step-body">${bodyHtml}</div>
        </section>
    `;
}

function diffieHellman() {
    // Public parameters
    const p = BigInt(primeSelect.value);
    const g = BigInt(primitiveRootSelect.value);

    // Private keys (user-supplied or random, with validation)
    let a = alicePrivateKeyInput.value
        ? BigInt(alicePrivateKeyInput.value)
        : randomBigInt(1n, p - 2n);
    if (a <= 0n || a >= p - 1n) {
        alert(`Alice's private key must be between 1 and ${p - 2n}`);
        return;
    }

    let b = bobPrivateKeyInput.value
        ? BigInt(bobPrivateKeyInput.value)
        : randomBigInt(1n, p - 2n);
    if (b <= 0n || b >= p - 1n) {
        alert(`Bob's private key must be between 1 and ${p - 2n}`);
        return;
    }

    // Public keys and shared secrets
    const A = modPow(g, a, p);
    const B = modPow(g, b, p);
    const sA = modPow(B, a, p);
    const sB = modPow(A, b, p);
    const match = sA === sB;

    const steps = [];

    // Step 1: Agree
    steps.push(stepCard(
        1,
        'Agree',
        'Public parameters chosen on the open channel',
        `
            <p>Alice and Bob publicly agree on a prime <strong>p</strong> and a primitive root <strong>g</strong>.</p>
            <div>
                <span class="public-param">p = ${p}</span>
                <span class="public-param">g = ${g}</span>
            </div>
        `
    ));

    // Step 2: Generate
    steps.push(stepCard(
        2,
        'Generate',
        'Each party picks a secret private key',
        `
            <div class="party-grid">
                <div class="party alice">
                    <div class="party-name">Alice</div>
                    <div class="value-line">${ICON_PRIVATE}<strong>Private key a:</strong> ${a}</div>
                </div>
                <div class="party bob">
                    <div class="party-name">Bob</div>
                    <div class="value-line">${ICON_PRIVATE}<strong>Private key b:</strong> ${b}</div>
                </div>
            </div>
        `
    ));

    // Step 3: Calculate (public keys)
    steps.push(stepCard(
        3,
        'Calculate',
        'Each party computes their public key',
        `
            <div class="party-grid">
                <div class="party alice">
                    <div class="party-name">Alice</div>
                    <div class="value-line">${ICON_PUBLIC}<strong>Public key A:</strong> ${A}</div>
                    <div class="formula">A = g<sup>a</sup> mod p = ${g}<sup>${a}</sup> mod ${p}</div>
                </div>
                <div class="party bob">
                    <div class="party-name">Bob</div>
                    <div class="value-line">${ICON_PUBLIC}<strong>Public key B:</strong> ${B}</div>
                    <div class="formula">B = g<sup>b</sup> mod p = ${g}<sup>${b}</sup> mod ${p}</div>
                </div>
            </div>
        `
    ));

    // Step 4: Exchange
    steps.push(stepCard(
        4,
        'Exchange',
        'Public keys travel over the insecure channel; private keys never leave',
        `
            <div class="exchange">
                <div class="party alice">
                    <div class="party-name">Alice</div>
                    <div class="value-line">${ICON_PUBLIC}sends <strong>A = ${A}</strong></div>
                </div>
                <div class="arrows">
                    <div>&rarr; A &rarr;</div>
                    <div>&larr; B &larr;</div>
                </div>
                <div class="party bob">
                    <div class="party-name">Bob</div>
                    <div class="value-line">${ICON_PUBLIC}sends <strong>B = ${B}</strong></div>
                </div>
            </div>
        `
    ));

    // Step 5: Calculate (shared secret)
    steps.push(stepCard(
        5,
        'Calculate',
        'Each party derives the shared secret',
        `
            <div class="party-grid">
                <div class="party alice">
                    <div class="party-name">Alice</div>
                    <div class="value-line">${ICON_SHARED}<strong>Shared secret:</strong> ${sA}</div>
                    <div class="formula">s = B<sup>a</sup> mod p = ${B}<sup>${a}</sup> mod ${p}</div>
                </div>
                <div class="party bob">
                    <div class="party-name">Bob</div>
                    <div class="value-line">${ICON_SHARED}<strong>Shared secret:</strong> ${sB}</div>
                    <div class="formula">s = A<sup>b</sup> mod p = ${A}<sup>${b}</sup> mod ${p}</div>
                </div>
            </div>
            <div class="result-banner ${match ? 'success' : 'error'}">
                <i class="fas ${match ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                ${match
                    ? `Both parties derived the same shared secret: <strong>${sA}</strong>`
                    : `Shared secrets do not match.`}
            </div>
        `
    ));

    outputDiv.innerHTML = steps.join('');
}

// Generate a random BigInt between min and max (inclusive)
function randomBigInt(min, max) {
    min = BigInt(min);
    max = BigInt(max);
    const range = max - min + 1n;
    const byteLength = Math.ceil(range.toString(2).length / 8);
    let randomValue;
    do {
        const randomBytes = new Uint8Array(byteLength);
        window.crypto.getRandomValues(randomBytes);
        randomValue = BigInt('0x' + [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join(''));
    } while (randomValue >= range);
    return min + randomValue;
}
