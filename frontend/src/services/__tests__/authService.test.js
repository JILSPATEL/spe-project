import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock axios and localStorage BEFORE importing the service ─────────────────
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            post: vi.fn(),
            get: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() }
            }
        }))
    }
}));

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// ─── Import services AFTER mocks are defined ──────────────────────────────────
import { authService, sellerAuthService } from '../authService';

// ─── authService ──────────────────────────────────────────────────────────────
describe('authService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('getCurrentUser() returns null when not logged in', () => {
        expect(authService.getCurrentUser()).toBeNull();
    });

    it('isAuthenticated() returns false when no token', () => {
        expect(authService.isAuthenticated()).toBe(false);
    });

    it('isAuthenticated() returns true when token is stored', () => {
        localStorage.setItem('token', 'fake-jwt-token');
        expect(authService.isAuthenticated()).toBe(true);
    });

    it('logout() removes token, user, and localCart', () => {
        localStorage.setItem('token', 'fake-jwt-token');
        localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Test' }));
        localStorage.setItem('localCart', JSON.stringify([]));

        authService.logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(localStorage.getItem('localCart')).toBeNull();
    });

    it('getCurrentUser() parses and returns user from localStorage', () => {
        const user = { id: 'u1', name: 'Test User', email: 'test@example.com' };
        localStorage.setItem('user', JSON.stringify(user));

        const result = authService.getCurrentUser();
        expect(result).toEqual(user);
    });
});

// ─── sellerAuthService ────────────────────────────────────────────────────────
describe('sellerAuthService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('getCurrentSeller() returns null when not logged in', () => {
        expect(sellerAuthService.getCurrentSeller()).toBeNull();
    });

    it('isAuthenticated() returns false when no seller or token', () => {
        expect(sellerAuthService.isAuthenticated()).toBe(false);
    });

    it('isAuthenticated() returns true when both seller and token are stored', () => {
        localStorage.setItem('seller', JSON.stringify({ id: 's1' }));
        localStorage.setItem('token', 'fake-jwt-token');
        expect(sellerAuthService.isAuthenticated()).toBe(true);
    });

    it('logout() removes token and seller', () => {
        localStorage.setItem('token', 'fake-jwt-token');
        localStorage.setItem('seller', JSON.stringify({ id: 's1' }));

        sellerAuthService.logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('seller')).toBeNull();
    });

    it('getCurrentSeller() parses and returns seller from localStorage', () => {
        const seller = { id: 's1', name: 'Test Seller', email: 'seller@example.com' };
        localStorage.setItem('seller', JSON.stringify(seller));

        const result = sellerAuthService.getCurrentSeller();
        expect(result).toEqual(seller);
    });
});
