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
        // vi.resetModules();
        vi.clearAllMocks();
        vi.restoreAllMocks();
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

        vi.spyOn(User, 'findOne').mockRejectedValue({});

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

    it("renderPublicProfile deve redirecionar para '/feed' se o user não for encontrado", async () => {
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

    it("renderPublicProfile deve renderizar o perfil do usuario", async () => {
        const req = {
            params: {
                username: "Anthony"
            },
            session: {
                user: {
                    id: 1
                }
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce({id: 1, username: "Anthony"});
        
        await userController.renderPublicProfile(req, res);

        expect(res.render).toHaveBeenCalledWith("profile", { title: `@Anthony | Shortz-App`, profileUser: {id: 1, username: "Anthony"}, isOwner: true})
    });

    it("renderPublicProfile deve redirecionar para '/feed' se falhar no try", async () => {
        const req = {
            params: {
                username: "Anthony"
            },
            session: {
                user: {
                    id: 1
                }
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };
        
        vi.spyOn(User, 'findOne').mockRejectedValueOnce({});

        await userController.renderPublicProfile(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/feed')
    });

    it("updateProfile deve redirecionar para '/profile/edit' ao passar try", async () => {
        const req = {
            body: {
                fullName: "Anthony",
                bio: "Olá, eu sou o Anthony."
            },
            session: {
                user: {
                    id: 1
                }
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };

        vi.spyOn(User, 'findByPk').mockResolvedValueOnce({});

        vi.spyOn(User, 'update').mockResolvedValueOnce({});

        vi.spyOn(userController, 'getProfile').mockResolvedValueOnce({});

        await userController.updateProfile(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/profile/edit');
    });

    it("updateProfile deve redirecionar para '/profile/edit' ao falhar o try", async () => {
        const req = {
            body: {
                fullName: "Anthony",
                bio: "Olá, eu sou o Anthony."
            },
            session: {
                user: {
                    id: 1
                }
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };

        vi.spyOn(User, 'findByPk').mockRejectedValueOnce({});

        vi.spyOn(User, 'update').mockRejectedValueOnce({});

        vi.spyOn(userController, 'getProfile').mockRejectedValueOnce({});

        await userController.updateProfile(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/profile/edit');
    });

    it("updateProfile passa o if( req.file )", async () => {
        const req = {
            body: {
                fullName: "Anthony",
                bio: "Olá, eu sou o Anthony."
            },
            session: {
                user: {
                    id: 1
                }
            },
            file: "default-profile.png",
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };

        vi.spyOn(User, 'findByPk').mockRejectedValueOnce({});

        vi.spyOn(User, 'update').mockRejectedValueOnce({});

        vi.spyOn(userController, 'getProfile').mockRejectedValueOnce({});

        await userController.updateProfile(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/profile/edit');
    });

    it("updateProfile passa o if (req.file && oldUser.profilePicture && oldUser.profilePicture !== 'default-profile.png')", async () => {
        const req = {
            body: {
                fullName: "Anthony",
                bio: "Olá, eu sou o Anthony."
            },
            session: {
                user: {
                    id: 1
                }
            },
            file: {
                filename: "default-profile.png"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };

        vi.spyOn(User, 'findByPk').mockResolvedValueOnce({profilePicture: 'minha-profile-picture.png'});

        vi.spyOn(User, 'update').mockResolvedValueOnce({});

        vi.spyOn(userController, 'getProfile').mockResolvedValueOnce({});

        vi.spyOn(path, 'join').mockResolvedValueOnce({});

        vi.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
            callback(null);
        });

        await userController.updateProfile(req, res);

        expect(path.join).toHaveBeenCalledOnce();

        expect(fs.unlink).toHaveBeenCalledOnce();
    });

    it("updateProfile passa o if (err) do fs.unlink(...)", async () => {
        const req = {
            body: {
                fullName: "Anthony",
                bio: "Olá, eu sou o Anthony."
            },
            session: {
                user: {
                    id: 1
                }
            },
            file: {
                filename: "default-profile.png"
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn()
        };

        vi.spyOn(User, 'findByPk').mockResolvedValueOnce({profilePicture: 'minha-profile-picture.png'});

        vi.spyOn(User, 'update').mockResolvedValueOnce({});

        vi.spyOn(userController, 'getProfile').mockResolvedValueOnce({});

        vi.spyOn(path, 'join').mockResolvedValueOnce({});

        vi.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
            callback(new Error("erro"));
        });

        await userController.updateProfile(req, res);

        expect(path.join).toHaveBeenCalledOnce();

        expect(fs.unlink).toHaveBeenCalledOnce();
    });
});