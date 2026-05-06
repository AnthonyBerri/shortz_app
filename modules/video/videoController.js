const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Video = require("./videoModel");
const User = require("../user/userModel");
const fs = require("fs");
const path = require("path");

exports.uploadVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.session.user.id;

        // Verifica se os arquivos foram enviados
        if (!req.files || !req.files.video || !req.files.thumbnail) {
            req.flash("error", "Por favor, envie o vídeo e a capa.");
            return res.redirect("/upload");
        }

        const videoFile = req.files.video[0];
        const thumbnailFile = req.files.thumbnail[0];

        // Cria o novo vídeo no banco de dados
        await Video.create({
            title,
            description,
            videoPath: videoFile.filename,
            thumbnailPath: thumbnailFile.filename,
            userId,
        });

        // Atualiza a contagem de vídeos do usuário
        await User.increment('videosCount', { where: { id: userId } });

        req.flash("sucess", "Vídeo enviado com sucesso!");
        res.redirect("/feed");
    } catch (error) {
        console.error("Erro ao fazer upload do vídeo: ", error);
        req.flash("error", "Erro ao fazer upload do vídeo. Tente novamente.");
        res.redirect("/upload");
    }
};

exports.streamVideo = async (req, res) => {
    const videoId = req.params.id;

    try{
        const video = await Video.findByPk(videoId);

        if(!video){
            return res.status(404).send("Video não encontrado.");
        }

        const videoPath = path.join(__dirname, "../../public/uploads/videos", video.videoPath);
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chuncksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chuncksize,
                "Content-Type": "video/mp4",
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
        
        // Incrementa as visualizações (opcional, pode ser movido para um evento de player)
        await video.increment("views");
    } catch (error) {
        console.error("Erro ao fazer streaming do video: ", error);
        res.status(500).send("Erro interno do servidor.");
    }
};

exports.getAllVideos = async () => {
    const videos = await Video.findAll({
        include: [{
            model: User,
            attributes: ["id", "username", "fullName", "profilePicture"]
        }],
        order: [["createdAt", "DESC"]],
        limit: 20
    });
    return videos;
};

exports.renderVideoPage = async (req, res) => {
    const videoId = req.params.id;

    try {
        const video = await Video.findByPk(videoId, {
            include: [{
                model: User,
                attributes: ["id", "username", "fullName", "profilePicture"]
            }],
            attributes: {
                include: [
                    [sequelize.literal("(SELECT COUNT(*) FROM `likes` WHERE `likes`.`video_id` = `Video`.`id`)"), "likesCount"],
                    [sequelize.literal("(SELECT COUNT(*) FROM `comments` WHERE `comments`.`video_id` = `Video`.`id`)"), "commentsCount"]
                ]
            }
        });

        if(!video) {
            req.flash("error", "Vídeo não encontrado.");
            return res.redirect("/feed");
        }

        let isLiked = false;
        if (req.session.user) {
            const userId = req.session.user.id;
            const Like = require("../like/likeModel");
            const existingLike = await Like.findOne({ where: { userId, videoId } });
            isLiked = !!existingLike;
        }
        
        res.render("video", { title: video.title, video, isLiked});
    } catch (error) {
        console.error("Erro ao carregar a página do vídeo:", error);
        req.flash("error", "Erro ao carregar lo vídeo. Tente novamente");
        res.redirect("/feed");
    }
};