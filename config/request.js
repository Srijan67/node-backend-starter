// export const secret = process.env.SECRET_KEY;
module.exports = {
  jwtObj: {
    secret: process.env.SECRET_KEY,
    algorithms: ["HS256"],
  },
  getTokenVerificaton: function async(value) {
    //to verify token
    let tokenArr = value.header("authorization").split(" ");
    let tokenData = jwt.verify(tokenArr[1], jwtObj.secret);
    return tokenData; //boolean(maybe)
  },
};
