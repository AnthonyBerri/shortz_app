import { beforeEach, expect, it, test, vi, describe } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const Comment = require('../modules/comment/commentModel');
const Video = require('../modules/video/videoModel');

describe("commentControler", () => {
    let commentController;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        commentController = require("../modules/comment/commentController");
    })
    
    it("addComment deve retornar status 201", async () => {
        const req = {
            body :{
                content: "Comentado comentario!"
            },
            params:{
                videoId: 6
            },
            session:{
                user:{
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        vi.spyOn(Comment, 'create').mockResolvedValueOnce({
            id: 99,
            content: "Comentando Comentarios!",
            userId: 1,
            videoId: 6
        });

        vi.spyOn(Video, 'increment').mockResolvedValueOnce([1]);
        
        vi.spyOn(Comment, 'findByPk').mockResolvedValueOnce({
            id: 99,
            content: "Comentando Comentario2!",
            User: { username: "teste", fullName: "Testador", profilePicture: "" }
        });

        await commentController.addComment(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("addComment deve retornar status 400", async () => {
        const req = {
            body :{
                content: ""
            },
            params:{
                videoId: 1
            },
            session:{
                user:{
                    id: 1
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await commentController.addComment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("addComment deve retornar status 550", async () => {
        const req = {
            body :{
                content: "Comentado comentario!"
            },
            params:{
                videoId: null
            },
            session:{
                user:{
                    id: null
                }
            }
        }

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await commentController.addComment(req, res);

        expect(res.status).toHaveBeenCalledWith(550);

    })

    it("getComments deve retornar status 200", async () => {
        const req = {
            params: {
                videoId: 1
            }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }

        vi.spyOn(Comment, 'findAll').mockResolvedValueOnce({});

        await commentController.getComments(req, res)

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getComments deve retornar status 500", async () => {
        const req = {
            params: {
                videoId: 1
            }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }

        await commentController.getComments(req, res)

        expect(res.status).toHaveBeenCalledWith(500);
    });
})
