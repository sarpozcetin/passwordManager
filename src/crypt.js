//crypt.js
/*
* Cryptography utlities
* All encryption/decryption happens in browser using Web Crypto API so the server never sees plaintext passwords
*/

const encoder = new TextEncoder();
const decoder = new TextDecoder();

//Helper Functions

//Hex string (MongoDB) to Uint8Array
const hexToUint8Array      = (hex)  => Uint8Array.from(hex.match(/.{2}/g), b => parseInt(b, 16));
//Uint8Array to Base64
const uint8ArrayToBase64   = (arr)  => btoa(String.fromCharCode(...arr));
//ArrayBuffer to Base64
const arrayBufferToBase64  = (buf)  => btoa(String.fromCharCode(...new Uint8Array(buf)));
//Base64 to Uint8Array
const base64ToUint8Array   = (b64)  => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
//Base64 to ArrayBuffer
const base64ToArrayBuffer  = (b64)  => base64ToUint8Array(b64).buffer;

/*
* Derives AES-256-GCM key from the master password and the salt combined
* Uses PBKDF2 with iterations set at 200,000
*/
export async function deriveKey(masterPassword, saltHex) {
    const salt = hexToUint8Array(saltHex);
    const baseKey = await crypto.subtle.importKey(
        'raw', encoder.encode(masterPassword), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/*
* Encrpyts the user password using the derived key and the IV (Initialization Vector)
*/
export async function encryptPassword(password, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(password)
    );
    return {
        encrypted: arrayBufferToBase64(encrypted),
        iv: uint8ArrayToBase64(iv)
    };
}

/*
* Decrpyts the user password using the stored encrypted blob and the IV (Initialization Vector)
*/
export async function decryptPassword(encryptedB64, ivB64, key) {
    const encrypted = base64ToArrayBuffer(encryptedB64);
    const iv = base64ToUint8Array(ivB64);
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
    );
    return decoder.decode(decrypted);
}