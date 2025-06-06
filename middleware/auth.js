// Middleware para verificar se o usuário está autenticado
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect('/login?message=Você precisa fazer login para acessar esta página');
  }
}

// Middleware para verificar se o usuário NÃO está autenticado (para páginas de login/registro)
function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  } else {
    return next();
  }
}

// Middleware para adicionar informações do usuário às views
function addUserToViews(req, res, next) {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.userId;
  next();
}

module.exports = {
  requireAuth,
  requireGuest,
  addUserToViews
};
