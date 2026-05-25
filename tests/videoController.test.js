import { beforeEach, expect, it, test, vi, describe } from 'vitest';
import { createRequire } from 'module';
import { browserFormat } from 'vitest/internal/browser';

const require = createRequire(import.meta.url);

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Video = require("../modules/video/videoModel");
const User = require("../modules/user/userModel");
const fs = require("fs");
const path = require("path");

describe("Testa o video controller", () => {
    let videoController;

    beforeEach(() => {
        // vi.resetModules();
        vi.clearAllMocks();
        vi.restoreAllMocks();
        videoController = require("../modules/video/videoController");
    });

    it("uploadVideo deve redirecionar para o '/upload", async () => {
        const req = {
            body: {
                tittle: "Olá",
                description: "Mundão"
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
            send: vi.fn()
        };

        await videoController.uploadVideo(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/upload')

    });

    it("uploadVideo deve redirecionar para o '/feed", async () => {
        const req = {
            body: {
                tittle: "Olá",
                description: "Mundão"
            },
            session: {
                user: {
                    id: 1
                } 
            },
            files: {
                video: ["video-upado.mp4"],
                thumbnail: ["thumb-upada.png"]
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn()
        };

        vi.spyOn(Video, 'create').mockResolvedValue({});

        vi.spyOn(User, 'increment').mockResolvedValue([]);

        await videoController.uploadVideo(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/feed')

    });

    it("uploadVideo deve redirecionar para o '/upload ao ter rejected values dos Models", async () => {
        const req = {
            body: {
                tittle: "Olá",
                description: "Mundão"
            },
            session: {
                user: {
                    id: 1
                } 
            },
            files: {
                video: ["video-upado.mp4"],
                thumbnail: ["thumb-upada.png"]
            },
            flash: vi.fn()
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn()
        };

        vi.spyOn(Video, 'create').mockRejectedValue(new Error("Erro"));

        vi.spyOn(User, 'increment').mockRejectedValue(new Error("Erro"));

        await videoController.uploadVideo(req, res);

        expect(req.flash).toHaveBeenCalledWith("error", "Erro ao fazer upload do vídeo. Tente novamente.");

        expect(res.redirect).toHaveBeenCalledWith('/upload')

    });

    it("streamVideo deve passar o if(!video)", async () => {
        const req = {
            params: {
                id: 1
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn()
        };

        vi.spyOn(Video, 'findByPk').mockResolvedValue(null);

        await videoController.streamVideo(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("streamVideo deve passar o if(range)", async () => {
        const req = {
            params: {
                id: 1
            },
            headers: {
                range: "bytes=0-1024"
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn(),
            writeHead: vi.fn()
        };

        vi.spyOn(Video, 'findByPk').mockResolvedValue({});

        vi.spyOn(path, 'join').mockResolvedValue("public/video-falso.mp4");

        vi.spyOn(fs, 'statSync').mockResolvedValue({size: 512});

        vi.spyOn(fs, 'createReadStream').mockResolvedValue({ pipe: vi.fn() });

        await videoController.streamVideo(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(206, {
            "Accept-Ranges": "bytes",
            "Content-Length": 1025,
            "Content-Range": "bytes 0-1024/undefined",
            "Content-Type": "video/mp4",
        });
    });

    it("streamVideo deve ir para o else de if(range)", async () => {
        const req = {
            params: {
                id: 1
            },
            headers: {
                range: null
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn(),
            writeHead: vi.fn()
        };

        vi.spyOn(Video, 'findByPk').mockResolvedValue({});

        vi.spyOn(path, 'join').mockResolvedValue("public/video-falso.mp4");

        vi.spyOn(fs, 'statSync').mockReturnValue({size: 512});

        vi.spyOn(fs, 'createReadStream').mockResolvedValue({ pipe: vi.fn() });

        await videoController.streamVideo(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(200, {
            "Content-Length": 512,
            "Content-Type": "video/mp4",
        });
    });

    it("streamVideo deve incrementar as views do video", async () => {
        const req = {
            params: {
                id: 1
            },
            headers: {
                range: null
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn(),
            writeHead: vi.fn()
        };

        const videoIncrement = vi.fn().mockResolvedValue([1]);

        vi.spyOn(Video, 'findByPk').mockResolvedValue({
            increment: videoIncrement
        });

        vi.spyOn(path, 'join').mockReturnValue("public/video-falso.mp4");
        vi.spyOn(fs, 'statSync').mockReturnValue({size: 512});
        vi.spyOn(fs, 'createReadStream').mockReturnValue({ pipe: vi.fn() });

        // vi.spyOn(Video, 'increment').mockResolvedValue([1]);

        await videoController.streamVideo(req, res);

        expect(videoIncrement).toHaveBeenCalledWith("views");
    });

    it("getAllVideos deve retornar os videos encontrados no banco", async () => {
        vi.spyOn(Video, 'findAll').mockResolvedValue({});
        
        const videos = await videoController.getAllVideos();

        expect(Video.findAll).toHaveBeenCalled();
    });

    it("renderVideoPage deve falhar no if(!video) e redirecionar para '/feed'", async () => {
        const req = {
            params: {
                id: 1
            },
            headers: {
                range: null
            },
            flash: vi.fn(),
            session: {
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn(),
            writeHead: vi.fn()
        };

        vi.spyOn(Video, 'findByPk').mockResolvedValue(null);

        await videoController.renderVideoPage(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/feed')
    });

    it("renderVideoPage deve passar no if(req.session.user) e redirecionar para '/feed'", async () => {
        const req = {
            params: {
                id: 1
            },
            headers: {
                range: null
            },
            flash: vi.fn(),
            session: {
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn(),
            writeHead: vi.fn()
        };

        vi.spyOn(Video, 'findByPk').mockResolvedValue(null);

        await videoController.renderVideoPage(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/feed')
    });

    it("renderVideoPage deve passar a função e redirecionar para '/feed'", async () => {
        const req = {
            params: {
                id: 1
            },
            headers: {
                range: null
            },
            flash: vi.fn(),
            session: {
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            render: vi.fn(),
            send: vi.fn(),
            writeHead: vi.fn()
        };

        vi.spyOn(Video, 'findByPk').mockResolvedValue({title: "Olá"});

        await videoController.renderVideoPage(req, res);

        expect(res.render).toHaveBeenCalledWith("video", { title: "Olá", video: {title: "Olá"}, isLiked: true})
    });

    it("renderVideoPage deve falhar no try e redirecionar para '/feed'", async () => {
        const req = {
            params: {
                id: 1
            },
            headers: {
                range: null
            },
            flash: vi.fn(),
            session: {
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn(),
            writeHead: vi.fn()
        };

        vi.spyOn(Video, 'findByPk').mockRejectedValue(new Error("AFDAKJFKASJDK"));

        await videoController.renderVideoPage(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/feed');
    });
});
