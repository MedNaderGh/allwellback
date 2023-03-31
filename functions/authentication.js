const { Firestore, FieldValue } = require("@google-cloud/firestore");
require("dotenv").config();
const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const firestore = new Firestore();
require("dotenv").config();
const moduleEmail = require("./mails");
exports.signup = async (user, res) => {
  let connection = `${process.env.AUTH0_CONNECTION}`;
  let client_id = `${process.env.AUTH0_CLIENT_ID}`;
  let userInfo = user;
  await axios({
    url: `${process.env.AUTH0_URL}`,
    method: "post",
    data: {
      client_id: client_id,
      email: user.email,
      password: user.password,
      connection: connection,
    },
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async ({ data }) => {
      const { _id } = data;
      let userData = {
        uid: _id,
        email: user.email,
      };
      try {
        const userRef = firestore.collection("user").doc();
        userData.ID = userRef.id;
        await userRef
          .set(userData)
          .then((doc) => {
            console.info("stored new doc id#", doc.id);
            if (res) {
              res.status(200).send({
                status: "success",
                message: "entry added successfully",
                data: userData,
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } catch (error) {
        res.status(400).send({
          status: "Already exist",
        });
      }
    })
    .catch((error) => {
      res.status(400).send({
        status: "Already exist",
      });
    });
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  let options = {
    method: "POST",
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    data: {
      grant_type: "password",
      username: email,
      password: password,
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
    },
  };
  try {
    let authData = [];

    let axiosResp = await axios(options);
    if (axiosResp.status == 200) {
      let tokenData = axiosResp.data;
      tokenData.expires_in = TokenExpiredTime();
      let userData = await this.getUserAuthData(email);
      authData = [{ token: tokenData, user: userData }];

      return res.status(200).json({
        status: "success",
        response: authData,
      });
    } else {
      return res.status(403).json({
        status: "error",
        response: {},
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      response: error.message,
    });
  }
};
exports.getUserAuthData = async (email) => {
  let userProperties;
  await firestore
    .collection("user")
    .where("email", "==", email)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        userProperties = doc.data();
      });
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
  return userProperties;
};
TokenExpiredTime = () => {
  let currentTime = new Date();
  let newDate = currentTime.setTime(
    currentTime.getTime() + 24 * 60 * 60 * 1000
  );
  let expirationDate = new Date(newDate);
  return expirationDate;
};
exports.sendReset = async (req, res) => {
  const { email } = req.body;
  await firestore
    .collection("user")
    .where("email", "==", email)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.size === 0) {
        return res.status(400).send("Email doesn't Exist");
      } else {
        try {
          moduleEmail.sendMail(
            email,
            {
              url: `http://localhost:8080/#/confirmPassword?email=${btoa(
                email
              )}`,
            },
            "Reset Password",
            "resetPassword"
          );
        } catch (error) {
          return res.status(400).send("Could not send Email");
        } finally {
          res.status(200).send("send Email");
        }
      }
    });
};
exports.updatePassword = async (req, res) => {
  await axios({
    url: `${process.env.TOKEN_URL}`,
    method: "POST",
    headers: { "content-type": "application/json" },
    data: {
      client_id: `${process.env.AUTH0_CLIENT_ID}`,
      client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
      audience: `${process.env.API_IDENTIFIER}`,
      grant_type: `${process.env.AUTH0_GRANT_TYPE}`,
    },
  }).then(async ({ data }) => {
    token = data.access_token;
  });
  let uid;
  const ParamObj = req.body;
  const userQuery = await firestore
    .collection("user")
    .where("email", "==", ParamObj.email)
    .get();
  userQuery.forEach((doc) => {
    const user = doc.data();
    uid = user.uid;
  });
  await axios({
    url: `${process.env.API_IDENTIFIER}users/auth0|${uid}`,
    method: "patch",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    data: {
      connection: `${process.env.AUTH0_CONNECTION}`,
      password: ParamObj.password,
    },
  }).then(async ({ data }) => {
    res.status(200).send(data);
  });
};
