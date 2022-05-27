export const sessionOptions = {
  password: 'nbsdkjLKDiisplywe0Ki65qmsghKSs&kams0e0s', //process.env.SECRET_COOKIE_PASSWORD,
  cookieName: "hey-messenger",
  cookieOptions: {
    maxAge: 3600,
    secure: 'production' //process.env.NODE_ENV === "production",
  },
};
