import { beforeEach, expect, it, test, vi, describe } from 'vitest';
import { createRequire } from 'module';
import { browserFormat } from 'vitest/internal/browser';

const require = createRequire(import.meta.url);

const Like = require('../modules/like/likeModel');
const Video = require('../modules/video/videoModel');

describe("Testa o like controller", () => {
    let likeController;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        likeController = require("../modules/like/likeController");
    })

    it("toggleLike deve retornar status 200", async () => {
        const req = {
            params: {
                videoId: 1
            },
            session: {
                user: {
                    id: 1
                }  
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        vi.spyOn(Like, 'findOrCreate').mockResolvedValueOnce([
            {
                id: 1,
                destroy: vi.fn().mockReturnThis()
            },
            false
        ]);

        vi.spyOn(Video, 'decrement').mockResolvedValueOnce([1]);
        
        await likeController.toggleLike(req, res);

        expect(res.status).toHaveBeenLastCalledWith(200);
    });

    it("toggleLike deve retornar status 201", async () => {
        const req = {
            params: {
                videoId: {
                    id: 1
                }
            },
            session: {
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        vi.spyOn(Like, 'findOrCreate').mockResolvedValueOnce([
            {
                id: 1,
                destroy: vi.fn().mockReturnThis()
            },
            true
        ]);

        vi.spyOn(Video, 'increment').mockResolvedValueOnce([1]);
        
        await likeController.toggleLike(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("toggleLike deve retornar status 500", async () => {
        const req = {
            params: {
                videoId: {
                    id: 1
                }
            },
            session:{
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        vi.spyOn(Like, 'findOrCreate').mockResolvedValueOnce({
            like: {
                id: 1,
                destroy: vi.fn().mockReturnThis()
            },
            created: true
        });

        vi.spyOn(Video, 'increment').mockResolvedValueOnce({ops:1});
        
        await likeController.toggleLike(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

    });

    it("checkLikeStatus deve retoranr status 200", async () => {
        const req = {
            params: {
                videoId: {
                    id: 1
                }
            },
            session:{
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        vi.spyOn(Like, 'findOne').mockResolvedValueOnce({
            id: 1,
            userId: 1,
            videoId: 1
        });

        await likeController.checkLikeStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        
    });

    it("checkLikeStatus deve retoranr status 500", async () => {
        const req = {
            params: {
                videoId: {
                    id: 1
                }
            },
            session:{
                user: {
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        vi.spyOn(Like, 'findOne').mockRejectedValueOnce();

        await likeController.checkLikeStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        
    });
});