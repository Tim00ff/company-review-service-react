export const simulateDelay = () => 
  new Promise(resolve => setTimeout(resolve, 500));

export const generateId = (prefix) => {
  const random = Math.random().toString(36).substr(2, 6);
  return `${prefix}_${random}`;
};

export const validateSchema = (data, schema) => {
  const errors = [];
  // Реализация валидации с помощью схемы (zod/yup)
  return errors;
};