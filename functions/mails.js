const nodemailer = require("nodemailer");
/**************define your bucketName***************/
let bucketName = `${process.env.EMAIL_BUCKET}`;
/**************import module template***************/
let moduleTemplate = require("./mailTemplate/mailTemplate");
const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
exports.sendMail = async function (email, body, subject, type, fileName) {
  console.log(email, body, subject, type);
  const transporter = nodemailer.createTransport({
    service: "FastMail",
    auth: {
      user: "allwell_support@fastmail.com",
      pass: `${process.env.password}`,
    },
  });
  /*****************get template******************/
  const mailBody = await moduleTemplate.getTemplate(body, type);
  /*****************get attachment******************/

  // send mail with defined transport object
  try {
    let result = await transporter.sendMail({
      from: "allwell_support@fastmail.com", // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: mailBody, // html body
    });
    let accepted = result.accepted;
    if (accepted.length > 0) {
      return "done";
    }
    return result;
  } catch (error) {
    console.log(error);
    return "error";
  }
};
exports.getTemplates = async (req, res) => {
  let listTemplates = [];
  await firestore
    .collection("templates")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        listTemplates.push(doc.data());
      });
      res.status(200).send(listTemplates);
    })
    .catch(() => {
      res.status(400).send("Could not get templates");
    });
};
exports.update = async (req, res) => {
  data = req.body || {};
  mailRef = firestore.collection("templates");
  snapshot = await mailRef
    .doc(data.ID)
    .update(data)
    .then((doc) => {
      console.info("document updated");
      return res.status(200).send(doc);
    })
    .catch((err) => {
      console.error(err);
      return res.status(404).send({
        error: "unable to update document",
        err,
      });
    });
};
exports.add = async (req, res) => {
  data = req.body || {};
  mailRef = firestore.collection("templates").doc();
  data.ID = mailRef.id;
  snapshot = await mailRef
    .set(data)
    .then((doc) => {
      console.info("document added");
      return res.status(200).send(doc);
    })
    .catch((err) => {
      console.error(err);
      return res.status(404).send({
        error: "unable to add document",
        err,
      });
    });
};
