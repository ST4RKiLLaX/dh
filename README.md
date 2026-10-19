# Interactive Diffie-Hellman Key Exchange

A tiny, dependency-free web demo that walks through the five canonical steps of
a Diffie-Hellman key exchange: **agree, generate, calculate, exchange,
calculate**.

Pick a prime, a primitive root, and private keys for Alice and Bob (or roll the
dice to let the page fill any field for you), then watch each party derive the
same shared secret side by side.

## Run it

Open [index.html](index.html) in a browser, or serve the folder locally:

```bash
python3 -m http.server
```

Then visit http://127.0.0.1:8000.

## Files

- [index.html](index.html) - markup for the inputs and step cards
- [styles.css](styles.css) - layout, step cards, and dice button styling
- [script.js](script.js) - prime list, primitive-root search, and the five-step rendering

Intended as an educational visualization, not a cryptographic implementation.
