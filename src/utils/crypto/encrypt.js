import CryptoJS from "crypto-js";

export const encrypt = ({ data, cryptoKey = process.env.CRYPTO_KEY }) => {
  return CryptoJS.AES.encrypt(data, cryptoKey).toString(); //second argument is the scret key w used tostring cause it dont return a string to force a string returning
};
