import { expect, it, test, vi, describe } from 'vitest';
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");


describe("Testar o auth.js", () => {
    it("Deve redirecinar o usuario para o /login", () => {
        const req = {
            session: {
                user: null
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        const next = vi.fn();
        auth(req, res, next);
        expect(res.redirect).toHaveBeenCalledWith("/login");
    });

    it("Deve chamar a função next por passar no if(req.session.user)", () => {
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
            },
            flash: vi.fn()
        }
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        }
        const next = vi.fn();
        auth(req, res, next)
        expect(next).toHaveBeenCalled();
    });
});