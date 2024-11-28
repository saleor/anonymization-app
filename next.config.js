/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    CUSTOMER_SCRAMBLE_DOMAIN: process.env.CUSTOMER_SCRAMBLE_DOMAIN || "randomdomain.com",
  },
};
