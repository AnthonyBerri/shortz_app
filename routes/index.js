var express = require('express');
var router = express.Router();
const userController = require('../modules/user/userController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/profileMulter');
const session = require('express-session');

/* requisição GET para a página inicial. */
router.get('/', function(req, res, next) {
  res.render('landing', { title: 'Videos Curtos e Engajadores' });
});

module.exports = router;

// // requisição GET para formulario de cadastro
// router.get('/register', function(req, res){
//   res.render('register', {title: 'Criar Conta' });
// });

// // Rota que processa o formulário de cadastro
// router.post('/register', userController.register);

// // Rota para exibir o formulário de login
// router.get('/login', (req, res) => {
//   res.render('login', {title: 'Login'})
// });


// // Rota para processar o formulário de login
// router.post('/login', userController.login);


// // Rota pasa processar o logout
// router.get('/logout', userController.logout);

// // Rota para exibir o feed de vídeos (protegida por autenticação)
// router.get('/feed', authMiddleware, async (req, res) => {
//   const user = await userController.getProfile(req.session.user.id);
//   res.render('home', { user });
// });

// // Rota para exibir o prefil do usuário (protegida por autenticação)
// router.get('/profile/edit', authMiddleware, async (req, res) => {
//   const user = await userController.getProfile(req.session.user.id);
//   res.render('edit-profile', { user });
// });

// // Rota de atualização (Protegia + Upload de 1 arquivo chamado 'profilePicture')

// router.post('/profile/edit', authMiddleware, upload.single('profilePicture'), userController.updateProfile);

// module.exports = router;
