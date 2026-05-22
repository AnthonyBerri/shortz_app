import { expect, it, test, vi } from 'vitest';
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

test("Deve verificar se o usuario está loggado", () => {
    const req = {
        session: {
            user: {
                id: 2,
                username: 'anthony',
                email: 'anthonyberri030@gmail.com',
                fullName: 'Anthony Felix Berri',
                bio: null,
                profilePicture: 'default-profile.png'
            }
        }
    }
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        redirect: vi.fn()
    }
    const next = vi.fn();
    auth(req, res, next)
    expect(next).toHaveBeenCalled();
    // expect(res.redirect).toHaveBeenCalledWith("/login");
});
