export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/test',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiresInt: parseInt(process.env.JWT_EXPIRES_IN) || 3600,
  saltRounds: parseInt(process.env.SALT_ROUNDS),
});
