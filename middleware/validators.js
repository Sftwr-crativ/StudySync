const { body } = require('express-validator');

// Validações para registro de usuário
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email deve ter no máximo 255 caracteres'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Senha deve ter entre 6 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    })
];

// Validações para login
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Validações para criação de usuário via API
const validateUserAPI = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email deve ter no máximo 255 caracteres'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Senha deve ter entre 6 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
];

// Validações para atualização de usuário
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email deve ter no máximo 255 caracteres'),

  body('password')
    .optional()
    .isLength({ min: 6, max: 128 })
    .withMessage('Senha deve ter entre 6 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
];

// Validações para criação de grupo
const validateGroup = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome do grupo deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_]+$/)
    .withMessage('Nome do grupo deve conter apenas letras, números, espaços, hífens e underscores'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
];

// Validações para atualização de grupo
const validateGroupUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome do grupo deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_]+$/)
    .withMessage('Nome do grupo deve conter apenas letras, números, espaços, hífens e underscores'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
];

// Validações para criação de tarefa
const validateTask = [
  body('group_id')
    .isInt({ min: 1 })
    .withMessage('Grupo é obrigatório'),

  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),

  body('due_date')
    .isISO8601()
    .withMessage('Data de vencimento deve ser uma data válida')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(value);

      if (isNaN(dueDate.getTime())) {
        throw new Error('Data de vencimento deve ser uma data válida');
      }

      if (dueDate < today) {
        throw new Error('Data de vencimento não pode ser no passado');
      }
      return true;
    }),

  body('assigned_user_id')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Permite vazio (será o próprio usuário)
      }
      if (!Number.isInteger(parseInt(value)) || parseInt(value) < 1) {
        throw new Error('Usuário responsável deve ser válido');
      }
      return true;
    })
];

// Validações para atualização de tarefa
const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),

  body('due_date')
    .optional()
    .isDate()
    .withMessage('Data de vencimento deve ser uma data válida'),

  body('status')
    .optional()
    .isIn(['to-do', 'doing', 'done'])
    .withMessage('Status deve ser: to-do, doing ou done')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUserAPI,
  validateUserUpdate,
  validateGroup,
  validateGroupUpdate,
  validateTask,
  validateTaskUpdate
};
