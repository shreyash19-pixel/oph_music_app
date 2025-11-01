const db = require("../DB/connect");

const insertDocumentationDetails = async (
  OPH_ID,
  AadharFrontURL,
  AadharBackURL,
  PanFrontURL,
  SignatureImageURL,
  BankName,
  AccountHolderName,
  AccountNumber,
  IFSCCode,
  AgreementAccepted
) => {

  const [result] = await db.execute(
    `INSERT INTO documentation_details (
      OPH_ID,
      AadharFrontURL,
      AadharBackURL,
      PanFrontURL,
      SignatureImageURL,
      BankName,
      AccountHolderName,
      AccountNumber,
      IFSCCode,
      AgreementAccepted,
      step_status,
      reject_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    ON DUPLICATE KEY UPDATE
      AadharFrontURL = VALUES(AadharFrontURL),
      AadharBackURL = VALUES(AadharBackURL),
      PanFrontURL = COALESCE(VALUES(PanFrontURL), PanFrontURL),
      SignatureImageURL = VALUES(SignatureImageURL),
      BankName = VALUES(BankName),
      AccountHolderName = VALUES(AccountHolderName),
      AccountNumber = VALUES(AccountNumber),
      IFSCCode = VALUES(IFSCCode),
      AgreementAccepted = VALUES(AgreementAccepted),
      step_status = VALUES(step_status),
      reject_reason = VALUES(reject_reason)
      `,
    [
      OPH_ID,
      AadharFrontURL,
      AadharBackURL,
      PanFrontURL,
      SignatureImageURL,
      BankName,
      AccountHolderName,
      AccountNumber,
      IFSCCode,
      AgreementAccepted,
      'under review', // step_status
      null             // reject_reason
    ]
  );

  return result;
};


// const insertDocumentationDetails = async (
//   OPH_ID,
//   AadharFrontURL,
//   AadharBackURL,
//   PanFrontURL,
//   PanBackURL,
//   SignatureImageURL,
//   BankName,
//   AccountHolderName,
//   AccountNumber,
//   IFSCCode,
//   AgreementAccepted
// ) => {
//   const [result] = await db.execute(
//     `INSERT INTO documentation_details (
//       OPH_ID,
//       AadharFrontURL,
//       AadharBackURL,
//       PanFrontURL,
//       PanBackURL,
//       SignatureImageURL,
//       BankName,
//       AccountHolderName,
//       AccountNumber,
//       IFSCCode,
//       AgreementAccepted
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       OPH_ID,
//       AadharFrontURL,
//       AadharBackURL,
//       PanFrontURL,
//       PanBackURL,
//       SignatureImageURL,
//       BankName,
//       AccountHolderName,
//       AccountNumber,
//       IFSCCode,
//       AgreementAccepted,
//     ]
//   );

//   return result;
// };

const getDocumentationDetails = async (OPH_ID) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE ophid = ?",
    [OPH_ID]
  );

  return rows;
};

const getDocumentationDetailsByOphId = async (OPH_ID) => {
  const [rows] = await db.execute(
    "SELECT ud.ophid, dd.AadharFrontURL, dd.AadharBackURL, dd.PanFrontURL, dd.SignatureImageURL, dd.BankName, dd.AccountHolderName, dd.AccountNumber, dd.IFSCCode, dd.AgreementAccepted, dd.reject_reason, dd.step_status FROM user_details ud LEFT JOIN documentation_details dd ON ud.ophid = dd.OPH_ID WHERE ud.ophid = ?",
    // "SELECT * FROM documentation_details WHERE OPH_ID = ?",
    [OPH_ID]
  );

  return rows;
};

module.exports = {
  insertDocumentationDetails,
  getDocumentationDetails,
  getDocumentationDetailsByOphId,
};
