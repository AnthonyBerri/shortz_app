module.exports = (req, res, next) => {
    const User = req.session.user;
    console.log(User);

    if (req.session.user) {
        return next(); // Está logado, pode seguir
    }
    req.flash('error', 'Você precisa estar logado para acessar esta página.');
    res.redirect('/login');
};