const db = require("../DB/connect");

const insertDocumentationDetails = async (
  ophId,
  aadharFrontUrl,
  aadharBackUrl,
  panFrontUrl,
  signatureImageUrl,
  bankName,
  accountHolderName,
  accountNumber,
  ifscCode,
  agreementAccepted
) => {
  // Note: Uses standardized column names: oph_id, snake_case for all fields
  const [result] = await db.execute(
    `INSERT INTO documentation_details (
      oph_id,
      aadhar_front_url,
      aadhar_back_url,
      pan_front_url,
      signature_image_url,
      bank_name,
      account_holder_name,
      account_number,
      ifsc_code,
      agreement_accepted,
      step_status,
      reject_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      aadhar_front_url = VALUES(aadhar_front_url),
      aadhar_back_url = VALUES(aadhar_back_url),
      pan_front_url = COALESCE(VALUES(pan_front_url), pan_front_url),
      signature_image_url = VALUES(signature_image_url),
      bank_name = VALUES(bank_name),
      account_holder_name = VALUES(account_holder_name),
      account_number = VALUES(account_number),
      ifsc_code = VALUES(ifsc_code),
      agreement_accepted = VALUES(agreement_accepted),
      step_status = VALUES(step_status),
      reject_reason = VALUES(reject_reason),
      updated_at = NOW()`,
    [
      ophId,
      aadharFrontUrl ?? null,
      aadharBackUrl ?? null,
      panFrontUrl ?? null,
      signatureImageUrl ?? null,
      bankName ?? null,
      accountHolderName ?? null,
      accountNumber ?? null,
      ifscCode ?? null,
      agreementAccepted ?? 0,
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

/**
 * Documentation Details model - Database operations only
 * Uses standardized column names: oph_id, snake_case for all fields
 */
const getDocumentationDetails = async (ophId) => {
  // Note: Uses standardized column name: oph_id (not ophid)
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE oph_id = ?",
    [ophId]
  );

  return rows;
};

const getDocumentationDetailsByOphId = async (ophId) => {
  // Note: Uses standardized column names: oph_id, snake_case for all fields
  // Map snake_case DB columns to PascalCase for backward compatibility with frontend
  const [rows] = await db.execute(
    `SELECT 
      ud.oph_id as ophid,
      dd.aadhar_front_url as AadharFrontURL,
      dd.aadhar_back_url as AadharBackURL,
      dd.pan_front_url as PanFrontURL,
      dd.signature_image_url as SignatureImageURL,
      dd.bank_name as BankName,
      dd.account_holder_name as AccountHolderName,
      dd.account_number as AccountNumber,
      dd.ifsc_code as IFSCCode,
      dd.agreement_accepted as AgreementAccepted,
      dd.reject_reason,
      dd.step_status
    FROM user_details ud 
    LEFT JOIN documentation_details dd ON ud.oph_id = dd.oph_id 
    WHERE ud.oph_id = ?`,
    [ophId]
  );

  return rows;
};

module.exports = {
  insertDocumentationDetails,
  getDocumentationDetails,
  getDocumentationDetailsByOphId,
};
