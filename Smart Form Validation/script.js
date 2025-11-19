'use strict';

// Element refs (IDs must match HTML)
const form = document.getElementById('smartForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');

const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const capsWarning = document.getElementById('capsWarning');
const strengthBar = document.getElementById('strengthBar');

const nameCheck = document.getElementById('nameCheck');
const emailCheck = document.getElementById('emailCheck');
const passCheck = document.getElementById('passCheck');
const formResult = document.getElementById('formResult');

// Validation helpers
function isNameValid(val) {
    if (!val) return { ok: false, msg: 'Name is required.' };
    if (val.trim().length < 2) return { ok: false, msg: 'Name must be at least 2 characters long.' };
    if (!/^[a-zA-Z\s]+$/.test(val)) return { ok: false, msg: 'Name can only contain letters and spaces.' };
    return { ok: true };
}

function isEmailValid(val) {
    if (!val) return { ok: false, msg: 'Email is required.' };
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!re.test(val)) return { ok: false, msg: 'Invalid email format.' };
    return { ok: true };
}

function passwordCriteria(val) {
    const hasMin = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[^\w\s]/.test(val);
    const score = (hasMin ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
    return { hasMin, hasUpper, hasNumber, hasSpecial, score };
}

function isPasswordValid(val) {
    if (!val) return { ok: false, msg: 'Password is required.' };
    const criteria = passwordCriteria(val);
    if (!criteria.hasMin) return { ok: false, msg: 'Password must be at least 8 characters long.' };
    if (!criteria.hasUpper) return { ok: false, msg: 'Password must contain at least one uppercase letter.' };
    if (!criteria.hasNumber) return { ok: false, msg: 'Password must contain at least one number.' };
    if (!criteria.hasSpecial) return { ok: false, msg: 'Password must contain at least one special character.' };
    return { ok: true };
}

// UI updates
function showError(elem, msg) {
    elem.textContent = msg;
    elem.hidden = false;
}
function hideError(elem) {
    elem.textContent = '';
    elem.hidden = true;
}
function markCheck(el, ok) {
    el.textContent = ok ? '✔️' : '';
}

function updateSubmitState() {
    const n = isNameValid(nameInput.value).ok;
    const e = isEmailValid(emailInput.value).ok;
    const p = isPasswordValid(passInput.value).ok;
    submitBtn.disabled = !(n && e && p);
}

function updateStrength(val) {
    const crit = passwordCriteria(val);
    const width = (crit.score / 4) * 100; // 0..100
    strengthBar.style.width = width + '%';
    strengthBar.parentElement.setAttribute('aria-label', `Password strength: ${Math.round(width)}%`);
    passCheck.textContent = crit.score === 4 ? '✔️' : '';
}

// EVENT LISTENERS
// NAME: input, blur, keydown (prevent digits)
nameInput.addEventListener('input', () => {
    const res = isNameValid(nameInput.value);
    if (!res.ok) {
        showError(nameError, res.msg);
        markCheck(nameCheck, false);
    } else {
        hideError(nameError);
        markCheck(nameCheck, true);
    }
    updateSubmitState();
});

nameInput.addEventListener('blur', () => {
    const res = isNameValid(nameInput.value);
    if (!res.ok) showError(nameError, res.msg);
    else hideError(nameError);
    updateSubmitState();
});

nameInput.addEventListener('keydown', (ev) => {
    if (/\d/.test(ev.key)) {
        ev.preventDefault();
        showError(nameError, 'Digits not allowed in name.');
        setTimeout(() => { if (nameError.textContent === 'Digits not allowed in name.') hideError(nameError); }, 1000);
    }
});

// EMAIL: input, blur
emailInput.addEventListener('input', () => {
    const res = isEmailValid(emailInput.value);
    if (!res.ok) {
        showError(emailError, res.msg);
        markCheck(emailCheck, false);
    } else {
        hideError(emailError);
        markCheck(emailCheck, true);
    }
    updateSubmitState();
});

emailInput.addEventListener('blur', () => {
    const res = isEmailValid(emailInput.value);
    if (!res.ok) showError(emailError, res.msg);
    else hideError(emailError);
    updateSubmitState();
});

// PASSWORD: input, keydown (CapsLock), blur
passInput.addEventListener('input', () => {
    const val = passInput.value;
    updateStrength(val);
    const res = isPasswordValid(val);
    if (!res.ok) showError(passwordError, res.msg);
    else hideError(passwordError);
    updateSubmitState();
});

passInput.addEventListener('keydown', (ev) => {
    if (ev.getModifierState && ev.getModifierState('CapsLock')) {
        capsWarning.hidden = false;
    } else {
        capsWarning.hidden = true;
    }

    if (ev.key === ' ' && passInput.selectionStart === 0) {
        ev.preventDefault();
        showError(passwordError, 'Password cannot start with a space.');
        setTimeout(() => { if (passwordError.textContent === 'Password cannot start with a space.') hideError(passwordError); }, 900);
    }
});

passInput.addEventListener('blur', () => {
    capsWarning.hidden = true;
    const res = isPasswordValid(passInput.value);
    if (!res.ok) showError(passwordError, res.msg);
    else hideError(passwordError);
    updateSubmitState();
});

// FORM submit
form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const n = isNameValid(nameInput.value);
    const e = isEmailValid(emailInput.value);
    const p = isPasswordValid(passInput.value);

    if (n.ok && e.ok && p.ok) {
        formResult.hidden = false;
        formResult.textContent = 'Form submitted successfully (demo).';
        setTimeout(() => {
            form.reset();
            strengthBar.style.width = '0%';
            markCheck(nameCheck, false);
            markCheck(emailCheck, false);
            markCheck(passCheck, false);
            formResult.hidden = true;
            submitBtn.disabled = true;
        }, 1200);
    } else {
        if (!n.ok) showError(nameError, n.msg);
        if (!e.ok) showError(emailError, e.msg);
        if (!p.ok) showError(passwordError, p.msg);
        updateSubmitState();
    }
});

// initial
submitBtn.disabled = true;