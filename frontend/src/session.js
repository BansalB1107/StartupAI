// Centralized tab-scoped session storage helper.
// Uses sessionStorage so each browser tab maintains its own independent session.
// This enables simultaneous Startup + Investor logins in separate tabs.

const session = {
    get: (key) => sessionStorage.getItem(key),
    set: (key, value) => sessionStorage.setItem(key, value),
    remove: (key) => sessionStorage.removeItem(key),
    clear: () => sessionStorage.clear(),
};

export default session;
