export const MyEncryptionTransformerConfig = {
  key: process.env.ENCRYPTION_KEY as string,
  algorithm: process.env.ENCRYPTION_ALGORITHM as string,
  ivLength: 16,
  iv: process.env.IV as string
};