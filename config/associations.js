// Carrega os modelos
const User  = require('../modules/user/userModel');
const Video = require('../modules/video/videoModel');
const Like = require('../modules/like/likeModel');
const Comment = require('../modules/comment/commentModel');

// Associações para Vídeo e User
User.hasMany(Video,     { foreignKey: 'userId' });
Video.belongsTo(User,   { foreignKey: 'userId' });

// Associações para Likes
User.hasMany(Like,      { foringKey: 'userId' });
Like.belongsTo(User,    { foreingKey: 'userId' });
Video.hasMany(Like,     { foreingKey: 'videoId' });
Like.belongsTo(Video,   { foreingKey: 'videoId' });

// Associações para Comments
User.hasMany(Comment,   { foreingKey: 'userId' });
Comment.belongsTo(User, { foreingKey: 'userId' });
Video.hasMany(Comment,  { foreingKey: 'videoId' });
Comment.belongsTo(Video,{ foreignKey: 'videoId' });