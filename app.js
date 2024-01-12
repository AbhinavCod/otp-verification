const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");
const client = require("twilio")(
  "AC37f3aaa147acf834e2f4fde9a97cc300",
  "b5f7159ac35ff067fa34ccfc98317919"
);
const verifySid = "VA14115f3db871e5c14b17d3288c28bea8";
const tempPath = path.join(__dirname, "./templates");
const staticPath = path.join(__dirname, "./public");
const partialPath = path.join(__dirname, "./templates/partials");

app.use(express.static(staticPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "hbs");
app.set("views", tempPath);
hbs.registerPartials(partialPath);

app.get("/", (req, res) => {
  res.render("index");
});

// Endpoint to initiate otp verification
app.post("/send-otp", (req, res) => {
  const { phonenumber } = req.body;

  client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phonenumber, channel: "sms" })
    .then((verification) => {
      console.log(verification.status);
      // res.json({ status: verification.status });
      res.render("verifyOtp");
    })
    .catch((err) => {
      console.log("Error sending otp : ", err);
      res.status(500).json({ error: "Failed to send otp" });
    });
});

// Endpoint to verify entered otp
app.post("/verify-otp", (req, res) => {
  const { phonenumber, otpCode } = req.body;

  client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phonenumber, code: otpCode })
    .then((verificationCheck) => {
      console.log(verificationCheck.status);
      // res.json({ status: verificationCheck.status });
      res.render("Welcome");
    })
    .catch((err) => {
      console.log("Error verifying OTP:", err);
      res.json({ error: "Failed to verify OTP" });
    });
});

app.listen(port, () => {
  console.log(`Listening to port no ${port}`);
});
