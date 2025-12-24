/**
 * Middleware de validação de email
 * Garante que o email sempre vem do token JWT, nunca do frontend
 * 
 * REGRA CRÍTICA: NUNCA aceitar email vindo do body, query params ou headers customizados
 */

/**
 * Valida e garante que o email usado é sempre do token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const enforceEmailFromToken = (req, res, next) => {
  // Garantir que req.user.email existe (deve vir do authenticateToken)
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      error: 'Email do usuário não encontrado no token',
      code: 'NO_EMAIL_IN_TOKEN'
    });
  }

  const emailFromToken = req.user.email;

  // Remover qualquer email que possa ter vindo do frontend
  if (req.body && req.body.email) {
    console.warn(`⚠️ SECURITY: Tentativa de enviar email no body. Removendo. Email do token será usado: ${emailFromToken}`);
    delete req.body.email;
  }

  if (req.query && req.query.email) {
    console.warn(`⚠️ SECURITY: Tentativa de enviar email no query. Removendo. Email do token será usado: ${emailFromToken}`);
    delete req.query.email;
  }

  if (req.params && req.params.email) {
    console.warn(`⚠️ SECURITY: Tentativa de enviar email nos params. Removendo. Email do token será usado: ${emailFromToken}`);
    delete req.params.email;
  }

  // Garantir que o email usado é sempre do token
  req.userEmail = emailFromToken;

  next();
};

/**
 * Middleware para validar que o email do token corresponde ao operador solicitado
 * Útil para rotas que recebem operatorId mas devem validar pelo email
 */
export const validateEmailMatch = (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      error: 'Email do usuário não encontrado no token',
      code: 'NO_EMAIL_IN_TOKEN'
    });
  }

  // Se houver operatorId no body/params, validar que corresponde ao email do token
  // Isso deve ser feito consultando o banco de dados
  // Por enquanto, apenas garantimos que o email do token será usado
  req.userEmail = req.user.email;

  next();
};

/**
 * Middleware para garantir que operações sempre filtram por email do token
 * Adiciona o email do token automaticamente aos filtros de query
 */
export const addEmailFilter = (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      error: 'Email do usuário não encontrado no token',
      code: 'NO_EMAIL_IN_TOKEN'
    });
  }

  // Adicionar email do token aos filtros de query
  if (!req.query) {
    req.query = {};
  }
  
  // O email sempre vem do token, nunca do query
  req.query._emailFromToken = req.user.email;

  next();
};

