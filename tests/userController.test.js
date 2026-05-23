import { beforeEach, expect, it, test, vi, describe } from 'vitest';
import { createRequire } from 'module';
import { browserFormat } from 'vitest/internal/browser';

const require = createRequire(import.meta.url);

const bcrypt = require('bcryptjs');
const fs = require("fs");
const path = require("path");
const User = require('../modules/user/userModel');
const Video = require('../modules/video/videoModel');

describe("Testa o user controller", () => {
    let userController;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        userController = require("../modules/user/userController");
    })

    it("register deve redirecinar para /register se a senha for diferente do confirmar senha", async () => {
        const req = {
            body: {
                username: "Anthony",
                email: "anthony@gmail.com",
                password: 1234,
                confirmPassword: 4321,
                fullName: "Anthony Felix Berri"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        await userController.register(req, res);

        expect(res.redirect).toHaveBeenLastCalledWith('/register');
    });

    it("register deve redirecinar para /register se o email ou nome já existe", async () => {
        const req = {
            body: {
                username: "Anthony",
                email: "anthony@gmail.com",
                password: 1234,
                confirmPassword: 1234,
                fullName: "Anthony Felix Berri"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce({
            username: "Anthony",
            email: "anthony@gmail.com",
            password: 1234,
            confirmPassword: 1234,
            fullName: "Anthony Felix Berri"
        });

        await userController.register(req, res);

        expect(res.redirect).toHaveBeenLastCalledWith('/register');
    });

    it("register deve redirecinar para /login após usuario ser criado", async () => {
        const req = {
            body: {
                username: "Anthony",
                email: "anthony@gmail.com",
                password: 1234,
                confirmPassword: 1234,
                fullName: "Anthony Felix Berri"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        vi.spyOn(User, 'create').mockResolvedValueOnce({});

        vi.spyOn(bcrypt, 'genSalt').mockResolvedValueOnce({})

        vi.spyOn(bcrypt, 'hash').mockResolvedValueOnce({})

        await userController.register(req, res);

        expect(res.redirect).toHaveBeenLastCalledWith('/login');
    });

    it("register deve redirecinar para /register por falhar o try e cair no catch", async () => {
        const req = {
            body: {
                username: "Anthony",
                email: "anthony@gmail.com",
                password: 1234,
                confirmPassword: 1234,
                fullName: "Anthony Felix Berri"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        vi.spyOn(User, 'create').mockRejectedValueOnce({});

        await userController.register(req, res);

        expect(res.redirect).toHaveBeenLastCalledWith('/register');
    });

    it("login deve redirecionar para '/login' se o usuario não existir", async () => {
        const req = {
            body: {
                login: "asdasdas",
                password: "sdjasdk"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        await userController.login(req, res);

        expect(res.redirect).toHaveBeenLastCalledWith('/login')
    });

    it("login deve redirecionar para o './feed' se tudo der certo", async () => {
        const req = {
            session: {
                user: {}
            },
            body: {
                login: "Anthony",
                password: "1234"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce({});

        vi.spyOn(bcrypt, 'compare').mockResolvedValue({});

        vi.spyOn(userController, 'getProfile').mockResolvedValueOnce({
            user: {
                id: 1,
                user: "Anthony",
                fullName11: "Anthony Felix Berri"
            }
        })

        await userController.login(req, res);

        expect(res.redirect).toHaveBeenCalledWith('./feed')
    });

    it("login deve redirecionar para o '/login' se falhar o try", async () => {
        const req = {
            body: {
                login: "Anthony",
                password: "1234"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        await userController.login(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/login')
    });

    it("logout deve testar o destroy da instancia do usuario no session", async () => {
        const req = {
            session: {
                user: {
                    id: 1,
                    user: "Anthony"
                },
                destroy: vi.fn((callback) => callback())
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };
        
        await userController.logout(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/')
    });

    it("getProfile deve retornar o usuario", async () => {
        const userId = 1;

        vi.spyOn(User, 'findByPk').mockResolvedValueOnce({
            id: 1,
            username: "Anthony",
            fullName: "Anthony Felix Berri",
            email: "anthony@gmail.com"
        })

        const user = await userController.getProfile(userId);

        expect(user).toEqual({
            id: 1,
            username: "Anthony",
            fullName: "Anthony Felix Berri",
            email: "anthony@gmail.com"
        });
    });

    it("getProfile deve falhar o try", async () => {
        const userId = 60;

        vi.spyOn(User, 'findByPk').mockRejectedValueOnce({});

        await expect(userController.getProfile(userId)).rejects.toThrow('Erro ao buscar perfil do usuário.');
    });

    it("renderPublicProfile deve redirecionar para '/feed'", async () => {
        const req = {
            params: {
                username: "Anthony"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);
        
        await userController.renderPublicProfile(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/feed')
    });

    it("renderPublicProfile deve redirecionar para '/feed'", async () => {
        const req = {
            params: {
                username: "Anthony"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce({});
        
        await userController.renderPublicProfile(req, res);

        expect(res.render).toHaveBeenCalledWith('profile')
    });
});