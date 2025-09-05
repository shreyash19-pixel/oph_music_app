const docs = require("../model/documentation_details");
const personal_details = require("../model/personal_details");
const prof_details = require("../model/professional_details");
const professions = require("../model/professions");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { uploadToS3, uploadToS3Form } = require("../utils");
const { log } = require("console");

const { S3Client, DeleteObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: process.env.AWS_REGION }); // replace with your region
const bucketName = process.env.S3_BUCKET; 

const membershipForm = async (req, res) => {
  {
    try {
      // Fetch professions from database instead of hardcoding
      const professionOptions = await professions.getAll();

      const banking = [
        { id: 1, bank_name: "State Bank of India" },
        { id: 2, bank_name: "HDFC Bank" },
        { id: 3, bank_name: "ICICI Bank" },
        { id: 4, bank_name: "Axis Bank" },
        { id: 5, bank_name: "Punjab National Bank" },
        { id: 6, bank_name: "Bank of Baroda" },
        { id: 7, bank_name: "Kotak Mahindra Bank" },
        { id: 8, bank_name: "Canara Bank" },
        { id: 9, bank_name: "IndusInd Bank" },
        { id: 10, bank_name: "Union Bank of India" },
      ];
      const { ophid } = req.query;
      const OPH_ID = ophid;


      // Fetch artist data
      // const artist = await DB.knex('artists as a')
      // .leftJoin('professions as p', 'a.profession_id', 'p.id')
      // .where('a.id', req.params.id)
      // .first('a.*', 'p.name as profession_name');

      const artist = await personal_details.getFullPersonalDetails(ophid);
      const artistProf = await prof_details.getProfessionalByOphId(OPH_ID);
      const artistDoc = await docs.getDocumentationDetailsByOphId(ophid);

      const formattedDate = artist[0].createdAt.toISOString().split("T")[0];
      const aadharFrontUrl = artistDoc[0].AadharFrontURL;
      const aadharBackUrl = artistDoc[0].AadharBackURL;

      const panFrontUrl = artistDoc[0].PanFrontURL;

      const bankname = parseInt(artistDoc[0].BankName); // Convert from string to number
      const BankName = banking.find((b) => b.id === bankname)?.bank_name;

      const bankDetails = {
        bank_name: BankName,
        bank_acc_number: artistDoc[0].AccountNumber,
        bank_ifsc_code: artistDoc[0].IFSCCode,
        bank_acc_name: artistDoc[0].AccountHolderName,
      };
      const signatureUrl = artistDoc[0].SignatureImageURL;

      const professionId = parseInt(artistProf[0].Profession); // Convert from string to number
      const professionName = professionOptions.find(
        (p) => p.id === professionId
      )?.name;

      if (!artist) {
        return res.status(404).send("Artist not found");
      }
      // const paymentId = await DB.knex('payments').where('artist_id', artist.id).where('plan_id', 4).where('status', 0).first('trans_id');
      // // Fetch bank details
      // const bankDetails = await DB.knex('user_bank_accs')
      // .leftJoin('banks as b', 'user_bank_accs.bank_id', 'b.id')
      // .where('artist_id', artist.id)
      // .first('user_bank_accs.*', 'b.bank_name as bank_name');

      // Fetch documents
      // const documents = await DB.knex('user_docs')
      //   .where('artist_id', artist.id)
      //   .first();

      // // Get S3 URLs for documents
      // const aadharFrontUrl = documents?.aadhar_front;
      // const aadharBackUrl = documents?.aadhar_back;
      // const panFrontUrl = documents?.pan_front;
      // // const panBackUrl = documents?.pan_back;
      // const signatureUrl = documents?.signature;
      // const profileImgUrl = artist.profile_img_url;
      const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Form</title>
      <style>
        :root {
          --purple: #5D4E8C;
          --turquoise: #49C7BC;
          --gray: #F7F7F7;
        }



        .page {
          width: 210mm;
          min-height: 276mm;
          background: white;
          margin: 0 auto;
          padding: 0;
          padding-left: 50px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
          margin-left: -50px;
          display: flex;
          align-items: flex-start;
        }

        .header-left {
          background: var(--turquoise);
          color: white;
          padding: 20px;
          width: 40%;
        }

        .header-right {
          background: var(--purple);
          color: white;
          padding: 20px;
          width: 60%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          height: 50px;
        }

        .contact {
          font-size: 12px;
          text-align: right;
        }

        .tagline {
          display: flex;
          justify-content: center;
          gap: 20px;
          padding: 10px 0;
          font-size: 14px;
        }

        .section-header {
          background: var(--purple);
          color: white;
          font-size: 20px;
          padding: 10px;
          margin: 20px 0 10px 0px;
          display: flex;
          align-items: center;
        }

        .section-header::before {
          content: '';
          width: 15px;
          height: 15px;
          background: white;
          margin-right: 10px;
        }

        .form-group {
          margin: 10px 0px;
        }

        .form-group label {
          display: block;
          color: var(--purple);
          font-size: 14px;
          margin-bottom: 5px;
        }

        .form-input {
          width: 100%;
          height: 30px;
          color: black;
          background: var(--gray);
          border: none;
          margin-top: 5px;
        }

        .gender-group {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .row {
          display: flex;
          gap: 20px;
        }

        .col {
          flex: 1;
        }

        .signature-section {
          margin: 40px 20px;
          display: flex;
          color: var(--purple);
          justify-content: space-between;
        }
        .signature-section label{
          color: var(--purple);
        }

        .signature-box {
          width: 200px;
          height: 100px;
          background: var(--gray);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-break {
          page-break-after: always;
          break-after: page;
        }

        .page-number {
          background: var(--turquoise);
          color: white;
          width: 30%;
          padding: 5px 20px;
          text-align: right;
          font-size: 12px;
        }
          .label{
            width: 50%;
            padding-right: 10px;
            color: var(--purple);
          }

        .website {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          margin-left: -50px;
          background: var(--purple);
          color: white;
          padding: 0px 20px;
          font-size: 12px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          background: var(--gray);
        }

        .company-section {
          background: var(--purple);
          color: white;
          padding: 10px;
          margin: 20px 0;
        }

        .noc {
          padding: 20px;
        }
.form-row {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
.form-row label {
           display: block;
          color: var(--purple);
          font-size: 14px;
          margin-bottom: 5px;
        }

        .form-label {
            min-width: 200px;
            color: #333;
            font-weight: 500;
        }

        .noc p {
          font-size: 14px;
          line-height: 1.6;
          text-align: justify;
        }
        .sign-text{
            display: flex; justify-content: center;
        }
        ol li {
    margin-bottom: 10px; /* Adjust the value for more or less space */
  }
  .header-image {
    width: 223mm;
  }
  
  .field {
    display: grid;
    margin-bottom: 1em;
  }
  .grid-template-columns-2 {
      grid-template-columns: 1fr 2fr;
  }
  .grid-template-columns-3 {
      grid-template-columns: 1fr 1fr 1fr;
  }
  .field-name {
      font-size: 12px;
      color: #000;
  }
  .field-value {
      font-size: 12px;
      background-color: var(--gray);
      padding: 8px;
  }
  .field-value-box {
      font-size: 12px;
      background-color: var(--gray);
      height: 20px;
      width: 20px;
  }
  .w-100 {
      width: 100%;
  }
  .w-80 {
      width: 80%;
  }
  .w-60 {
      width: 60%;
  }
  .w-50 {
      width: 50%;
  }
  .mr-22 {
      margin-right: 22px;
  }
  .mb-16 {
      margin-bottom: 16px;
  }
  .ml-16 {
      margin-left: 16px;
  }
  .mt-16 {
      margin-top: 16px;
  }
  .pt-8 {
      padding-top: 8px;
  }
  .d-flex {
      display: flex;
  }
  .justify-content-between {
      justify-content: space-between;
  }
  .align-items-center {
    align-items: center;
  }
  .text-decoration-underline {
      text-decoration: underline;
  }
  .text-align-center {
      text-align: center;
  }
  .text-align-right {
      text-align: right;
  }
  .border-top {
      border-top: 3px solid #000;
  }
      </style>
    </head>
    <body>
      <!-- Page 1 -->
      <div class="page">
        <div class="header">
        <img src="https://ophcommunity.s3.ap-south-1.amazonaws.com/assets/membership_header.jpg" alt="Header" class="header-image" width="223mm">
        </div>
        <div class="row gap-10">
        <div class="form-group">
          <label class="field-name">Artist Membership Code</label>
          <div class="field-value"> ${artist[0].ophid || ""} &nbsp;</div>
        </div>
        <div class="form-group">
          <label class="field-name">Date</label>
          <!-- artist.created_at.toLocaleDateString().split("T")[0] -->
          <div class="field-value">${formattedDate || ""}</div>
        </div>
        </div>

        <div class="section-header">Personal Data Information</div>

        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center ">
                <span>Legal Name</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-80">${artist[0].full_name || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Stage Name</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-80">${artist[0].stage_name || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Phone Number</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${artist[0].contact_num || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Email ID</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">
            ${artist[0].email || ""}
            </span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Location</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">
            ${artist[0].location || ""}
            </span>
        </div>

        <div class="section-header">Professional Data Information</div>
        

        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Profession</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${professionName || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Instagram</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${artistProf[0].InstagramLink || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Facebook</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${artistProf[0].FacebookLink || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Spotify</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${artistProf[0].SpotifyLink || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Apple</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${artistProf[0].AppleMusicLink || ""}</span>
        </div>
        <div>
            <span class="field-name">
                Experience
            </span>
        </div>
        <div class="field grid-template-columns-3">
            <div class="mr-22">
                <span class="field-name">
                    Monthly
                </span>
                <div class="field-value">${parseInt(artistProf[0].ExperienceMonthly % 12) || "N/A"}</div>
            </div>
            <div>
                <span class="field-name">
                    Yearly
                </span>
                <div class="field-value">${parseInt(artistProf[0].ExperienceMonthly / 12) || "0"}</div>
            </div>
        </div>
        <div>
            <span class="field-name">
                Number of songs planning
            </span>
        </div>
        <div class="field grid-template-columns-3">
            <div class="mr-22">
                <span class="field-name">
                    Monthly
                </span>
                <div class="field-value">${(artistProf[0].SongsPlanningType === "monthly" && artistProf[0].SongsPlanningCount) || "N/A"}</div>
            </div>
            <div class="mr-22">
                <span class="field-name">
                    Quarterly
                </span>
                <div class="field-value">${(artistProf[0].SongsPlanningType === "quarterly" && artistProf[0].SongsPlanningCount) || "N/A"}</div>
            </div>
            <div>
                <span class="field-name">
                    Yearly
                </span>
                <div class="field-value">${(artistProf[0].SongsPlanningType === "yearly" && artistProf[0].SongsPlanningCount) || "N/A"}</div>
            </div>
        </div>

        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 1</div>
        </div>
      </div>
      <div class="page-break"></div>

      <!-- Page 2 -->
      <div class="page">
        <div class="section-header">Documentation Data Information</div>

        <div class="row" style=" padding-right: 10px;align-items: center; display: grid; grid-template-columns: 1fr 0.6fr 1fr; gap: 20px;">
          <div>
            <label class="label">Profile Image</label>
            <input type="checkbox" ${artist[0]?.personal_photo ? "checked" : ""} disabled>
          </div>
          <div>
            <label class="label">File Name :</label>
          </div>
          <div>
            <div class="field-value mb-16">${artist[0]?.personal_photo?.split("/")[artist[0]?.personal_photo?.split("/").length - 1] || ""}</div>
          </div>
        </div>

        <div class="row" style=" padding-right: 10px;align-items: center; display: grid; grid-template-columns: 1fr 0.6fr 1fr; gap: 20px;">
          <div>
            <label class="label">Bio</label>
            <input type="checkbox" ${artistProf[0]?.Bio ? "checked" : ""} disabled>
          </div>
          <div>
            <label class="label">Video Bio</label>
            <input type="checkbox" ${artistProf[0]?.VideoURL ? "checked" : ""} disabled>
          </div>
          <div>
            <div class="field-value mb-16">${artistProf[0]?.VideoURL?.split("/")[artist[0]?.VideoURL?.split("/").length - 1] || ""}</div>
          </div>
        </div>

        <div class="row" style=" padding-right: 10px;align-items: center; display: grid; grid-template-columns: 1fr 0.6fr 1fr; gap: 20px;">
          <div>
            <label class="label">Photos</label>
            <input type="checkbox" ${artistProf[0]?.PhotoURLs ? "checked" : ""} disabled>
          </div>

        </div>
        <div class="row" style=" padding-right: 10px;align-items: center; display: grid; grid-template-columns: 1fr 0.6fr 1fr; gap: 20px;">
          <div>
            <label class="label">Aadhar Card</label>
            <input type="checkbox" ${aadharFrontUrl ? "checked" : ""} disabled>
          </div>
          <div>
            <label class="label">File Name :</label>
          </div>
          <div>
            <div class="field-value mb-16">${aadharFrontUrl?.split("/")[aadharFrontUrl?.split("/").length - 1] || ""}</div>
          </div>
        </div>
        <div class="row" style=" padding-right: 10px;align-items: center; display: grid; grid-template-columns: 1fr 0.6fr 1fr; gap: 20px;">
          <div>
            <label class="label">Aadhar Card Back</label>
            <input type="checkbox" ${aadharBackUrl ? "checked" : ""} disabled>
          </div>
          <div>
            <label class="label">File Name :</label>
          </div>
          <div>
            <div class="field-value mb-16">${aadharBackUrl?.split("/")[aadharBackUrl?.split("/").length - 1] || ""}</div>
          </div>
        </div>

          <div class="row" style=" padding-right: 10px;align-items: center; display: grid; grid-template-columns: 1fr 0.6fr 1fr; gap: 20px;">
          <div>
            <label class="label">Pan Card</label>
            <input type="checkbox" ${panFrontUrl ? "checked" : ""} disabled>
          </div>
          <div>
            <label class="label">File Name :</label>
          </div>
          <div>
            <div class="field-value mb-16">${panFrontUrl?.split("/")[panFrontUrl?.split("/").length - 1] || ""}</div>
          </div>
        </div>

        <div class="field grid-template-columns-2">
          <span class="field-name d-flex justify-content-between align-items-center">
              <span>Bank Name</span>
              <span class="mr-22">:</span>
          </span>
          <span class="field-value w-60">${bankDetails?.bank_name || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Account Number</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${bankDetails?.bank_acc_number || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>IFSC Code</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${bankDetails?.bank_ifsc_code || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Account Holder Name</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${bankDetails?.bank_acc_name || ""}</span>
        </div>
        <div class="field grid-template-columns-2">
          <span class="field-name d-flex justify-content-between align-items-center">
              <span>Accept Terms - Condition,
                  NOC & Agreement.</span>
              <span class="mr-22">:</span>
          </span>
          <input type="checkbox" checked disabled>
        </div>

        <div class="signature-section">
          <div>

          </div>
          <div>
             <div class="signature-box">
              <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
            </div>
            <div class="sign-text">Signature of Artist</div>
          </div>
        </div>
        <div class="section-header">For Office Use Only</div>
  

        <div class="field grid-template-columns-2">
          <span class="field-name d-flex justify-content-between align-items-center">
              <span>Date</span>
              <span class="mr-22">:</span>
          </span>
          <span class="field-value w-60"></span>
        </div>
        <div class="field grid-template-columns-2">
          <span class="field-name d-flex justify-content-between align-items-center">
              <span>All Details are Correct & Checked</span>
              <span class="mr-22">:</span>
          </span>
          <input type="checkbox" disabled>
        </div>
        <div class="field grid-template-columns-2">
          <span class="field-name d-flex justify-content-between align-items-center">
              <span>Payment ID</span>
              <span class="mr-22">:</span>
          </span>
          <span class="field-value w-60"></span>
        </div>
        <div class="field grid-template-columns-2">
          <span class="field-name d-flex justify-content-between align-items-center">
              <span>Artist Membership Code</span>
              <span class="mr-22">:</span>
          </span>
          <span class="field-value w-60"></span>
        </div>

        <div class="signature-section">
            <div></div>
            <div>
                <div class="signature-box"></div>
                <div class="signature-label">Signature Of Authorized Person</div>
            </div>
        </div>
        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 2</div>
        </div>
      </div>
      <div class="page-break"></div>

      <!-- Page 3 -->
      <div class="page">
        <div class="section-header">NON OBJECTION CERTIFICATE</div>

        <div class="noc">
          <h2 style="text-align: center; color: black; font-size: 16px; font-weight: bold;">NON-OBJECTION CERTIFICATE (NOC)</h2>
          
          <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Legal Name</span>
                <span class="mr-22">:</span>
            </span>
            <span class="field-value w-60">${artist[0].full_name || ""}</span>
          </div>
          <div class="field grid-template-columns-2">
            <span class="field-name d-flex justify-content-between align-items-center">
                <span>Date</span>
                <span class="mr-22">:</span>
            </span>
            <!-- artist.created_at.toLocaleDateString().split("T")[0] -->
            <span class="field-value w-60">${formattedDate || ""}</span>
          </div>
          <div class="form-group">
          <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
To: OPH Community<br><br>
Subject: Non-Objection Certificate<br><br>
I, as an artist, do hereby declare and certify that I have thoroughly read, understood, and unequivocally accept the Terms &
Conditions, as well as the agreement put forth by the OPH Community. I further affirm that I have no objections whatsoever to
the contents of the said Terms & Conditions or the obligations outlined therein.<br><br>
By signing this NOC, I expressly confirm the following:<br><br>
I have voluntarily provided all personal and professional details during the signup process, and I hereby declare that the
information shared by me is accurate, truthful, and complete to the best of my knowledge.<br><br>
I grant explicit permission to OPH Community to display, use, and process the details I have shared as per their requirements
for the purposes of their initiative, program, or any other related activities.<br><br>
I have no objection to the usage, publication, or dissemination of my shared details as per the scope of the Terms & Conditions
agreed upon.<br><br>
I affirm that I have no objection to the submission, distribution, release, upload, promotion, marketing, and all services provided
by the OPH Community Platform for my song.<br><br>
I warrant that I am the sole and exclusive owner of all rights, title, and interest in the Song. I confirm that I am the sole creator of
the Song.<br><br>
I authorize OPH Community to undertake all necessary actions related to the distribution, release, upload, promotion,
marketing, and other services of the Song on the OPH Community Platform. This authorization includes actions undertaken at
their sole discretion and in the manner they deem appropriate.<br><br>
Authorization explicitly includes, but is not limited to: (a) Distributing the Song on digital and/or physical platforms. (b)
Promoting the Song through any and all marketing channels. (c) Performing any other actions incidental to or associated with
the Song's release.<br><br>
By granting this authorization, I agree not to assert any further claims, demands, or objections regarding the use of the Song as
described above.<br><br>
I am signing this NOC voluntarily, without any coercion, undue influence, or misrepresentation by any party.<br><br>
By checking the checkbox and making the payment, the artist affirms that they accept all the terms and conditions stated above
and have provided their consent. This action shall also be considered equivalent to signing this declaration.<br><br>
This certificate is issued in good faith as a formal declaration of my consent and agreement with OPH Community and its
associated activities. I understand that this document establishes a clear and mutual understanding of the obligations and
rights between both parties.<br><br>

          </label>
          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>

        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 3</div>
        </div>
      </div>
      <div class="page-break"></div>

      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <h2 style="text-align: center; color: black; font-size: 16px; font-weight: bold;">Terms and Conditions of the OPH Community Platform</h2>
          <div class="form-group">
          <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Welcome to the OPH Community Platform. By accessing or using the OPH Community Platform, including but not limited to
            both the website and the artist portal, you (the "User" or "Artist") agree to abide by and be bound by these Terms and
            Conditions ("Terms"). Please read these Terms carefully before proceeding with any use of the Platform. If you do not agree to
            these Terms, you should refrain from using the Platform.
          </p>
          <hr>
          <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            General Overview <br>
            OPH Community is an open-source network collaboration platform that is a fully technology-driven, one-stop solution designed
to support an artist’s journey from start to success. The platform with no middlemen, providing direct access and a pre-booking
system for music releases. It ensures 100% revenue and ownership remain with the artists and offers additional benefits such
as competitions, events, and educational learning opportunities. To access the Platform, you agree to abide by these Terms.

          </p>
          <hr>
          <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Website Composition and Functions <br>
            The Platform website has six main sections: Home, Event, Artists, Resources, Leaderboard, and Contact. Each section offers
different services and functionalities, as follows: <br>

<ul>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Homepage
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        The Home page gives an overview of the user statistics on the Platform with videos, podcasts, artist songs, showcases, and
rankings. It also features a media player for artist songs, tutorials, and calls to action to encourage users to join the Platform.
The data is covered under Section 43 of the IT Act, 2000 ("IT Act, 2000").

    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Event Page
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        The Event page gives all information regarding upcoming and past events held by OPH, which include the registration and
payment gateway for participation in the event. Rewards of the events will be provided offline and no online data of the
financial details will be collected. The transactions are also according to Section 10A of the IT Act, 2000, through which electronic
transactions get legal recognition.

    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists Page
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        This page is for displaying rankings, artist profiles, and media content by artists. Automatic calculations are involved with
ranking data and no adjustments allowed through manual entries. Personal data use is subjected to Section 72 of the IT Act,
2000, for data privacy protection.
    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Leaderboard Page
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        The Resources page contains artist stories, podcasts, tutorials, and other relevant learning content.
    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Resources Page
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        The Home page gives an overview of the user statistics on the Platform with videos, podcasts, artist songs, showcases, and
rankings. It also features a media player for artist songs, tutorials, and calls to action to encourage users to join the Platform.
The data is covered under Section 43 of the IT Act, 2000 ("IT Act, 2000").
    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Contact Page
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        The Contact page enables the Platform to connect with its artists. The contact form captures personal information such as full
        name, email address, mobile number, and Instagram handle. Such information is protected under Rule 4 of the IT Rules, 2011.

    </p>
</ul>


          </p>

          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div>

          </div>
          <div>
             <div class="signature-box">
              <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
            </div>
            <div class="sign-text">Signature of Artist</div>
          </div>
        </div>
        </div>

        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 4</div>
        </div>
      </div>
      <div class="page-break"></div>

      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <div class="form-group">

          <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Artist Portal and Services <br>
            An artist portal allows artists to edit their profiles and services by their own accounts. An artist, who registers, agrees to:
 <br>

<ul>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Registration Process

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists will be required to provide valid personal details and supporting documents, such as an Aadhar card, bio, signature,
and bank account details, for verification. After successful verification, an account will be generated. Registration is done after
taking consent for the use of Aadhar for verification under Section 7 of the Aadhaar Act, 2016.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Song Submission

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists can submit their songs through two project patterns: <br>
        New Project Pattern: Songs that have never been uploaded elsewhere can be released solely on the OPH platform. The
        copyright will belong to the artist, but he or she will assign rights to OPH to upload and publish the song. The revenue will be
        paid directly to the artist. <br>
        Hybrid Project Pattern: Songs already released elsewhere can be uploaded to OPH. The artist owns the copyright but gives
        OPH permission to upload and distribute the song. Artists cannot file copyright infringement against OPH. The money
        generated from the song will be paid directly to the artist. These terms comply with the Copyright Act, 1957.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Revenue and Payment Terms
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists will receive their money from the song submission within 10-15 days of the withdrawal request. The Indian Contract
Act, 1872, does not refund event participation fees, membership payments, and song registration fees.

    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Content and Copyright
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        By submitting content, the artist hereby declares that the content is original and that he grants OPH the right to upload and
distribute the content. The artist undertakes not to sue OPH for any legal remedy for the uploaded content as contemplated
under the Copyright Act, 1957.

    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Responsibilities of Artist

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists must abide by the services offered by the Platform. Artists shall not request changes or dictate terms relating to the
        services of the Platform. OPH may modify its pricing or services at any time, subject to Section 37 of the Indian Contract Act,
        1872.

    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Event Participation
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists are liable to pay non-refundable participation fees for events. Rewards from events will be processed offline, and
artists will provide the necessary details for disbursement as required by Section 10 of the Indian Contract Act, 1872.

    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Limitation of Liability

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        OPH is not responsible or liable for any damage, loss, or dispute arising out of the use of the Platform. Artists agree to
indemnify OPH from all claims connected with the uploading of content, ranking, or distribution of revenue under Section 73
of the Indian Contract Act, 1872.

    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Terms Modifications

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        OPH reserves the right to modify or update these Terms at its discretion. Continued use of the Platform constitutes
        acceptance of the updated Terms, in compliance with Rule 5 of the IT Rules, 2011.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Service Availability and Charges

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Blocking dates for weekends is free, but it may charge later. Date changes will attract a fee of INR 100. According to Section
10 of the Indian Contract Act, 1872, changes are permissible up to one week before the date scheduled.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Revenue and Payments

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists can take the revenue after processing periods. Service charges, such as Song Registration Forms, are non-refundable
as per Section 2(1)(r) of the Consumer Protection Act, 2019.


    </p>
</ul>


          </p>
          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>

        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 5</div>
        </div>
      </div>
      <div class="page-break"></div>
      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <div class="form-group">

<ul>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Transparency and Data

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Live data, including rankings and KPIs, will be updated according to the specified schedule. Artists cannot request
additional data or proof beyond what is displayed. This is governed under Section 72 of the IT Act, 2000.



    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Tickets and Requests

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Requests for modifications under wrong categories will be declined without compromise, based on the Indian Contract
        Act, 1872.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Liabilities and Responsibilities

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        OPH shall not be liable for defamation or negative publicity due to an artist's public profile, as stated in Section 499 of the
Indian Penal Code.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Eligibility for TV Publishing
    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        The OPH team determines the eligibility for TV publishing. Only eligible artists may be considered for publishing, in
        accordance with Section 38 of the Copyright Act, 1957.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Data Collection

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Data collected from users participating in events will solely be used for promotional and engagement purposes, in
        compliance with the IT Rules, 2011.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Governing Law and Dispute Resolution

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        These Terms are subject to Indian law. Any dispute shall be settled by arbitration or conciliation in accordance with the
Arbitration and Conciliation Act, 1996.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Calendar Rules


    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        The Artists cannot choose the dates already blocked for releasing a song. Once a submission has been rejected for errors
or for failing to comply with requirements, all money paid for reservation of dates shall be non-refundable. Artist must reblock a new date of release for future submissions.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Fair Treatment

    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        All artists are treated equally, and no special treatment is given to any particular individual so that it can be fair and
transparent.



    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Use of the Platform


    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artists shall be responsible for knowing how to use the Platform properly. All transactions are final and cannot be cancelled
unless otherwise stated, and it follows Section 2(h) of the Indian Contract Act, 1872.


    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        General Duties


    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Settlement is NOT allowed for OPH in case any registered user or artist does not participate in events. All notifications sent to
the artists will be on purely work-related matters.


    </p>

    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Submission Rules



    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Artist submitting "Free for Profit Beats" in wrong categories, will attract strikes. Post-publication copyright violations, will
attract the strikes as given by the Copyright Act, 1957.



    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Analytics and Metrics



    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Metrics and analytics are calculated transparently. Regular updates within the specified timeframes are there. In case of
delay in analytics, there will be visible revenue supplied.



    </p>
    <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Ticket Policy


    </li>
    <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        Those requests raised under incorrect categories will be declined according to the Indian Contract Act, 1872.



    </p>
</ul>


          </p>
          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>


        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 6</div>
        </div>
      </div>
      <div class="page-break"></div>
      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <div class="form-group">

            <ul>
                <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Forms and Updates
                </li>
                <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  The update of the forms, like sign-up and song registration, shall be processed within 24 to 48 hours.




                </p>
                <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Intellectual Property


                </li>
                <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  All intellectual property rights of the Platform are protected under the Copyright Act, 1957. Any unauthorized use is strictly
                  prohibited.



                </p>
                <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Refunds and Corrections


                </li>
                <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Refunds will be issued only in certain conditions. Artists can request basic changes but should note that most changes will
                  not be accommodated


                </p>
                <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Leaderboard and Ranking Rules
                </li>
                <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Rankings on the leaderboard, based on performance metrics, are final and non-negotiable.



                </p>
                <li style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Account Management & Security:

                </li>
                <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
                  Artists are solely responsible for maintaining the confidentiality of their account credentials, including but not limited to
                  passwords.



                </p>
            </ul>


          </p>
          <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            OPH shall not be liable for any unauthorized access due to the negligence of Artists.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            OPH reserves the right to suspend or deactivate accounts, with prior notice, in cases of policy violations, including but not
limited to fraud, hate speech, or breach of applicable laws.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Content Guidelines & Moderation:<br>
            Artists shall not upload content that infringes on intellectual property rights, includes explicit material, or violates any
applicable law in India, including the Information Technology Act, 2000.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            OPH reserves the right to remove any content violating these guidelines without prior notice. Artists shall have the right to
appeal such removal.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Third-Party Platforms:
<br>
OPH shall not be held liable for any actions taken by third-party platforms, such as removal of content by streaming
services (e.g., Spotify).
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            The availability of caller tunes is subject to the discretion of telecom providers, and OPH shall bear no responsibility in this
regard.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Updates & Maintenance: <br>
            OPH shall notify Artists of scheduled downtime at least 48 hours in advance.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            OPH reserves the right to add, modify, or remove features without prior notice.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            OPH shall not be held liable for any delays or failures in performance due to force majeure events, including but not
            limited to natural disasters, pandemics, or government restrictions.


        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Age Restrictions: <br>
            Artists must be at least 18 years of age or provide verifiable parental/legal guardian consent to use the Platform Services.

        </p>


        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Governing Law & Jurisdiction: <br>
            These T&Cs shall be governed by and construed in accordance with the laws of India.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Any disputes arising under these T&Cs shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.

        </p>
          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>


        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 7</div>
        </div>
      </div>
      <div class="page-break"></div>
      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <div class="form-group">
          </p>

        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Limitation of Liability:<br>
            OPH shall bear no liability for any acts, omissions, or conduct of the Artist. The Artist assumes full responsibility for their
actions in all circumstances. <br>
OPH shall not be liable for indirect, incidental, or consequential damages, including but not limited to lost opportunities or
revenue.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Beta Features:<br>
            Artists acknowledge that beta features may have limitations, and they use such features at their own risk
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Updates to T&Cs:<br>
            Any changes to these T&Cs shall be communicated to Artists via email or the Portal. <br>
Continued use of the Platform following updates constitutes acceptance of the revised T&Cs.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Disclaimers:<br>
            OPH does not guarantee success, exposure, or revenue for Artists. <br>
All services are provided on an "as-is" basis without warranties of any kind.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Intellectual Property Infringement:<br>
            OPH shall implement a DMCA policy outlining the process for reporting and countering infringement claims. <br>
Artists shall ensure their content does not infringe upon third-party intellectual property rights.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Language & Communication:<br>
            These T&Cs are provided in English, and all disputes shall be resolved in English. <br>
Official communications shall be conducted exclusively via email, WhatsApp, or the Platform.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            No Partnership/Agency:<br>
            Nothing in these T&Cs shall be deemed to create any partnership, agency, or employment relationship between OPH and
Artists
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Survival Clause:<br>
            Certain provisions, including but not limited to ownership and liability clauses, shall survive termination of an Artist’s
account.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Feedback & Dispute Resolution:<br>
            Artists may submit feedback via OPH’s support channels. <br>
Disputes shall follow an escalation process, including mediation and arbitration as per the Arbitration and Conciliation Act,
1996.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Ownership & Intellectual Property:<br>
            Artists retain full ownership of their music, videos, and all other content created or uploaded to the Platform, in
accordance with Section 17 of the Copyright Act, 1957, which vests ownership of original works with the creator. <br>
OPH shall obtain only a limited, non-exclusive, royalty-free license to distribute, market, and promote the Artist’s content
for the benefit of the Artist, as permitted under Section 30 of the Copyright Act, 1957, which governs licensing agreements.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Revenue & Payments:
<br>
Artists shall receive 100% of their earnings from audio and video monetization, in compliance with Section 18 of the Indian
Contract Act, 1872, which ensures lawful consideration for services rendered.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            A detailed breakdown of revenue sources, including but not limited to streaming, downloads, and licensing, shall be made
available to Artists on the Platform.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            There shall be no minimum withdrawal thresholds or hidden fees, and payment processing timelines shall be defined as
10-15 business days from the date of revenue generation, in accordance with the Payment and Settlement Systems Act,
2007, which regulates payment timelines and transparency.
        </p>

          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>


        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 8</div>
        </div>
      </div>
      <div class="page-break"></div>
      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <div class="form-group">
          </p>

        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Platform Stability:
<br>
OPH guarantees a minimum monthly platform availability of 99%, with compensation mechanisms for prolonged downtime,
in accordance with the Consumer Protection Act, 2019, which safeguards consumer rights and provides for compensation in
case of service deficiencies.


        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Educational Resources:
<br>
All learning materials provided by OPH are the exclusive property of OPH, and OPH retains full ownership and intellectual
property rights over them, as per the Copyright Act, 1957. <br>
Members are granted a limited, non-exclusive, non-transferable license to use these materials solely for personal, noncommercial purposes.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Contact Us:<br>
            For any question or complaint, you can contact OPH using the contact details available on the Contact Page. Communications
will be covered by Section 72A of the IT Act, 2000.
        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Acknowledgement:<br>
            You acknowledge having read, understood, and agreeing to the Terms and Conditions every time you access the OPH
Community Platform.

        </p>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            Compliance<br>
            This document ensures compliance with the relevant Indian laws while safeguarding the rights and obligations of the artists aswell as the Platform.

        </p>
        <hr>
        <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
            This Artist Agreement (the "Agreement") is entered into by and between OPH Community (hereinafter referred to as "OPH
Community" or "Platform") and the individual artist (hereinafter referred to as the "Artist"), collectively referred to as the
"Parties." By registering for and participating in OPH Community, the Artist agrees to be bound by the following terms and
conditions. This Agreement shall be deemed a legally binding contract upon the Artist's submission and registration with OPH
Community.
        </p>
        <hr>

     <ol style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        <li >
            Acceptance of Changes The Artist accepts and agrees that the dates, features, and all other details of the event related to
OPH Community are subject to alteration, cancellation, or change without prior notice by OPH Community at its discretion.
The Artist agrees to follow any such changes.
        </li>
        <li>
            Event Terms Acceptance Upon registration to any event organized by OPH Community, the Artist agrees to be bound by all
the terms and conditions of such events as may be applicable. The parties mutually and explicitly acknowledge and agree
that the registration and participation in any event form the basis of a valid contract within the realm of Section 10 of the
Indian Contract Act, 1872, wherein their consent to the terms forms the foundation of the contract.

        </li>
        <li>
            Consent to Terms By checking the checkbox or otherwise agreeing to and continuing the registration or submission
process, the Artist agrees and consents to all terms and conditions of this Agreement, establishing a binding legal
relationship between the parties.

        </li>
      <li>
        Updatable Profile on Chargeable Terms The Artist acknowledges and agrees that any updation, amendment, or change to
the Artist's profile made on OPH Community may be on chargeable terms at the discretion of the Platform at any given time.
      </li>
    </ol>


          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>


        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 9</div>
        </div>
      </div>
      <div class="page-break"></div>
      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <div class="form-group">
     <ol start="5" style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        <li >
            Ranking Transparency The Artist understands and agrees that all rankings shown on leaderboards, spotlight pages, or
any other ranking systems in OPH Community are calculated based on particular performance metrics. The Artist also
understands that such rankings cannot be contested.

        </li>
        <li>
            Refund Decisions Artist shall be bounded by OPH Community's refund policy. Any disputes arose between them shall be
submitted to the review team for its final decision which shall be binding upon both parties. Artist further acknowledges
that refunds, if granted, will follow the provisions of Section 72 of the Indian Contract Act, 1872 and is to be provided only
when paid either by mistake or due to coercion.

        </li>
        <li>
            Management Authority The Artist acknowledges that once they join OPH Community, the Platform shall have exclusive
authority over all decisions, actions, and management of the Artist’s participation. The Artist agrees that no requests for
changes to Platform decisions will be entertained by OPH Community.


        </li>
      <li>
        Strike Policy The Artist agrees to adhere to OPH Community's strike policy wherein three (3) strikes may lead to
deactivation of the Artist's account. The Artist accepts that OPH Community has the protection accorded by Section 79 of
the Information Technology Act, 2000, and will act only as an intermediary unless such due diligence is not followed.
      </li>
      <li>
        Correct Submissions The Artist covenants to ensure all submissions, without limitation, by way of illustration and not by
        way of limitation, content, projects, materials, are entered under the appropriate project type, and are to be accurate. The
        Artist holds the Platform harmless for any and all errors, or discrepancies arising from submitted content.
      </li>
      <li> Data Security The Artist consents to OPH Community’s implementation of reasonable security measures to safeguard
        the personal data provided by the Artist during registration. The Platform agrees to comply with Section 43A of the
        Information Technology Act, 2000, in protecting personal data from unauthorized access or misuse.</li>
      <li>. General Agreement The Artist agrees as follows: a. To accept and be bound by the Terms and Conditions outlined in
        this Agreement. b. To provide accurate, truthful, and updated information at the time of registration and participating. To
        grant OPH Community permission to use details from the Artist for purposes such as uploading, release, distribution, and
        marketing. These may include, but are not limited to, advertising.</li>
      <li> Content Submission and Obligations The Artist agrees to: a. Provide 100% copyright-free content for new projects or
        initiatives. b. Grant OPH Community the right to modify, distribute, and use the submitted content, including videos,
        images, and other marketing materials, for promotional and other purposes in accordance with the platform's policies.
        </li>
      <li>Rights and Ownership The Artist grants OPH Community full and exclusive rights to release, host, and distribute the
        Artist's content across all relevant platforms, including television, digital media, and any other distribution channels. The
        Artist acknowledges that OPH Community retains all intellectual property rights with respect to the Platform and its
        services.
        </li>
      <li>Revenue Sharing Agreement The Artist will comply with the revenue sharing model of OPH Community prevailing at
        the time of registration or participation and accept that the same may be altered from time to time with due notice. All
        withdrawals of income will be governed by the timeliness and taxation policies of the Platform, consistent with the extant
        laws so far as Section 194J of the Income Tax Act, 1961 is concerned among others.
        </li>
      <li>Indemnification. Artist will indemnify, defend, and hold harmless OPH Community, its affiliates, agents, employees, and
        representatives from any and all claims, damages, losses, or liabilities arising from or related to the Artist's use of the
        Platform, including but not limited to violations of this Agreement or applicable laws.
        </li>
      <li>Fees & Refunds One-time fees and per-song fees are non-refundable except under specific circumstances, as
        governed by Section 56 of the Indian Contract Act, 1872, which deals with the doctrine of frustration and impossibility of
        performance</li>
    </ol>


          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>


        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 10</div>
        </div>
      </div>
      <div class="page-break"></div>
      <div class="page">
        <div class="section-header">TERMS AND CONDITIONS</div>

        <div class="noc">
          <div class="form-group">
     <ol start="17" style="font-size: 12px; line-height: 1.6; text-align: left; color: black;">
        <li >
            Service Commitments Service Level Agreements (SLAs) shall govern marketing, creative deliverables, and distribution
timelines, ensuring accountability as per Section 73 of the Indian Contract Act, 1872, which provides for compensation in
case of breach of contract. OPH shall handle licensing and logistics for TV releases at no additional cost to the Artist, subject
to prior written approval from the Artist, in compliance with the Cinematograph Act, 1952, and the Copyright Act, 1957.
        </li>
        <li>
            Data Privacy & Usage OPH shall comply with the Information Technology Act, 2000, and the Information Technology
(Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, to ensure the
protection of Artists’ personal and sensitive data. Artists’ data shall be used solely for Platform operations and shall not be
sold, shared, or disclosed to third parties without explicit consent, as mandated under Section 43A of the Information
Technology Act, 2000.


        </li>
        <li>
            Termination & Content Removal Artists may terminate their accounts at any time, and all content shall be removed or
            archived upon written request, in compliance with Section 5 of the Information Technology (Intermediary Guidelines and
            Digital Media Ethics Code) Rules, 2021. The term "Lifetime" shall refer to the operational life of OPH. In the event of platform
            shutdown, Artists shall receive a minimum of 90 days’ prior notice, as per Section 56 of the Indian Contract Act, 1872, which
            governs the termination of agreements due to impossibility of performance.


        </li>
      <li>
        . Community & Conduct Artists shall adhere to community guidelines prohibiting hate speech, discriminatory behavior,
and unethical collaborations, in compliance with Section 79 of the Information Technology Act, 2000, which mandates the
removal of unlawful content. Criteria for competitions hosted by OPH shall be published transparently and made accessible
to all participants, in accordance with the Prize Competitions Act, 1955.

      </li>
      <li>
        Support & Communication Support requests shall be responded to within 48 hours, with ticket resolution within 72
hours, as per Section 10 of the Indian Contract Act, 1872, which mandates that all agreements must be made with free
consent and lawful consideration.
      </li>
      <li>  Exclusivity & Portability Artists remain free to use other platforms, services, or tools for their work. No exclusivity
        requirements shall be imposed on Artists by OPH, in compliance with the Competition Act, 2002, which prohibits anticompetitive agreements.</li>
      <li>.  Documentation Fees A non-refundable, one-time documentation fee is required for lifetime membership, as governed
        by Section 74 of the Indian Contract Act, 1872, which deals with liquidated damages and penalties</li>
     <hr>

     <p style="font-size: 12px; line-height: 1.6; text-align: left; color: black;padding: 30px 0;font-weight: bold;">
        By registering and participating in OPH Community, the Artist hereby acknowledges and agrees to all the terms and
conditions contained in this Agreement. In case of any queries or clarifications, the Artist may reach out to contact
number available on contact page of website.
<br>
<br>
This Agreement shall be governed by the laws of India and any dispute arising out of or in connection with this
Agreement shall be subject to arbitration in accordance with the Arbitration and Conciliation Act, 1996.
     </p>
<hr>
    </ol>
<br>
<br>
<br>
<br>
<br>
<br>

<br>

<br>

<br>

<br>


          </div>
          <!-- NOC content continues -->

          <div class="signature-section">
          <div></div>
            <div>
              <div class="signature-box">
                <img src="${signatureUrl}" alt="Signature" style="max-width: 100%; max-height: 100%;">
              </div>
              <div class="sign-text">Signature of Artist</div>
            </div>
          </div>
        </div>


        <div class="website">ophcommunity.org
        <div class="page-number">Page.No - 11</div>
        </div>
      </div>
    </body>
    </html>
    `;
      // Generate HTML

      res.send(html);
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the HTML content
        await page.setContent(html, { waitUntil: "networkidle0" });

        // Generate PDF as buffer
        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: {
            top: "10mm",
            bottom: "10mm",
            left: "10mm",
            right: "10mm",
          },
        });

        await browser.close();

        const fileName = `${artist[0].full_name.replace(/\s+/g, "_")}.pdf`;
        const s3Key = `pdfs/${fileName}`;

        // Check if file exists
        try {
          await s3.send(new HeadObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
          }));

          // If no error, file exists — delete it
          await s3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
          }));
        } catch (err) {
          if (err.name !== "NotFound") {
            console.error("Error checking/deleting existing file:", err.message);
            throw err;
          }
          // If NotFound, ignore — file does not exist
        }
        const file = {
          originalname: fileName,
          buffer: pdfBuffer,
          mimetype: "application/pdf",
        };
        try {
          const s3Url = await uploadToS3Form(file, "pdfs");

        } catch (err) {
          console.error("Upload failed:", err.message);
        }
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error("Error generating membership form:", error);
      res.status(500).send("Error generating membership form");
    }
  }
};

module.exports = membershipForm;
