import {
  convert, format, Donation, Payment,
} from "@raise/shared"

export default (donation: Donation, payments: Payment[]): string => `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title>
  </title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }
  </style>
  <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
  <!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix { width:100% !important; }
        </style>
        <![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }
  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }
  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }
  </style>
  <style type="text/css">
    .btn-block>a {
      display: block !important
    }

    @media only screen and (min-width:600px) {

      .md-rounded-bottom,
      .md-rounded-bottom>table {
        border-radius: 0 0 12px 12px
      }

      .md-p-20px {
        padding: 20px
      }
    }
  </style>
</head>

<body style="word-spacing:normal;background-color:#eeeeee;">
  <div style="background-color:#eeeeee;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#2ECAD6" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#2ECAD6;background-color:#2ECAD6;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="background:#2ECAD6;background-color:#2ECAD6;width:100%;">
        <tbody>
          <tr>
            <td
              style="direction:ltr;font-size:0px;padding:30px;padding-bottom:32px;padding-left:30px;padding-right:30px;padding-top:30px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix"
                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.375;text-align:left;color:#ffffff;">
                                  Raise: A Celebration of Giving</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size:0px;word-break:break-word;">
                                <div style="height:60px;line-height:60px;">&#8202;</div>
                              </td>
                            </tr>
                            <!-- TODO: get more permanent URL -->
                            <tr>
                              <td align="left"
                                style="font-size:0px;padding:0px;padding-top:0px;padding-right:0px;padding-bottom:8px;padding-left:0px;word-break:break-word;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                  style="border-collapse:collapse;border-spacing:0px;">
                                  <tbody>
                                    <tr>
                                      <td style="width:125px;">
                                        <img height="auto"
                                          src="https://joinraise.org/static/logo-f03bd75fe8438dc33ade971089a649f0.png"
                                          style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                          width="125" />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td align="left"
                                style="font-size:0px;padding:8px;padding-top:8px;padding-right:8px;padding-bottom:30px;padding-left:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:40px;line-height:1.25;text-align:left;color:#ffffff;">
                                  <strong>Thank you for your donation!</strong></div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:20px;line-height:1.5;text-align:left;color:#ffffff;">
                                  ${donation.donorName.split(" ")[0]}, you've done a great thing today.<br /><br />Your donation will protect ${convert.gbpToPeopleProtected(payments[0].donationAmount + (payments[0].matchFundingAmount ?? 0))}
                                  people from malaria. You've also taken an important step on your journey to positive,
                                  deliberate, effective giving.</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="background:#ffffff;background-color:#ffffff;width:100%;">
        <tbody>
          <tr>
            <td
              style="direction:ltr;font-size:0px;padding:30px;padding-bottom:30px;padding-left:30px;padding-right:30px;padding-top:20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix"
                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:28px;line-height:1.5;text-align:left;color:#000000;">
                                  Payment details</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <table cellpadding="0" cellspacing="0" width="100%" border="0"
                                  style="color:#000000;font-family:'Helvetica', 'Arial', sans-serif;font-size:13px;line-height:22px;table-layout:auto;width:100%;border:none;">
                                  ${payments[0].donationAmount > 0 ? `<tr style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px">
                                    <td style="padding: 2px 0;">Your donation to AMF</td>
                                    <td style="padding: 2px 0;text-align:right;white-space:pre;">${format.amountDropPenceIfZero(payments[0].donationAmount)}</td>
                                  </tr>` : ""}
                                  ${payments[0].contributionAmount > 0 ? `<tr style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px">
                                      <td style="padding: 2px 0;">Your contribution to Raise</td>
                                      <td style="padding: 2px 0;text-align:right;white-space:pre;">${format.amountDropPenceIfZero(payments[0].contributionAmount)}</td>
                                  </tr>` : ""}
                                  <tr style="height:6px">
                                    <td></td>
                                    <td></td>
                                  </tr>
                                  <tr
                                    style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;border-top:1px solid #bbb;font-weight:bold">
                                    <td style="padding: 8px 0 2px 0;">Total paid</td>
                                    <td style="padding: 8px 0 2px 0;text-align:right;white-space:pre;">${format.amountDropPenceIfZero(payments[0].donationAmount + payments[0].contributionAmount)}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ${payments.length > 1 ? `<tr>
                              <td align="left" style="font-size:0px;padding:32px 8px 5px 8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.5;text-align:left;color:#000000;">
                                  You also set up future donations to AMF:</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <table cellpadding="0" cellspacing="0" width="100%" border="0"
                                  style="color:#000000;font-family:'Helvetica', 'Arial', sans-serif;font-size:13px;line-height:22px;table-layout:auto;width:100%;border:none;">
                                  ${payments.slice(1).map((p) => `<tr style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px">
                                      <td style="padding: 2px 0;">${format.date(p.at)}</td>
                                      <td style="padding: 2px 0;text-align:right;white-space:pre;">${format.amountDropPenceIfZero(p.donationAmount + p.contributionAmount)}</td>
                                  </tr>`).join("")}
                                  <tr style="height:6px">
                                    <td></td>
                                    <td></td>
                                  </tr>
                                  <tr
                                    style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;border-top:1px solid #bbb;font-weight:bold">
                                    <td style="padding: 8px 0 2px 0;">Total future donations</td>
                                    <td style="padding: 8px 0 2px 0;text-align:right;white-space:pre;">${format.amountDropPenceIfZero(payments.slice(1).reduce((acc, cur) => acc + cur.donationAmount + cur.contributionAmount, 0))}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>` : ""}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#5D215E" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#5D215E;background-color:#5D215E;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="background:#5D215E;background-color:#5D215E;width:100%;">
        <tbody>
          <tr>
            <td
              style="direction:ltr;font-size:0px;padding:30px;padding-bottom:30px;padding-left:30px;padding-right:30px;padding-top:20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix"
                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:28px;line-height:1.5;text-align:left;color:#ffffff;">
                                  Multiply your impact</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.5;text-align:left;color:#ffffff;">
                                  Want to go even further? Sharing your donation on social media can boost your impact
                                  further! Talking about effective giving with friends and family can be a great way for
                                  you to champion the movement.</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
    <!-- TODO: Get a Raise asset here -->
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="md-rounded-bottom-outlook" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div class="md-rounded-bottom" style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="background:#ffffff;background-color:#ffffff;width:100%;">
        <tbody>
          <tr>
            <td
              style="direction:ltr;font-size:0px;padding:30px;padding-bottom:40px;padding-left:30px;padding-right:30px;padding-top:20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix"
                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="center"
                                style="font-size:0px;padding:0px;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                  style="border-collapse:collapse;border-spacing:0px;" class="mj-full-width-mobile">
                                  <tbody>
                                    <tr>
                                      <td style="width:540px;" class="mj-full-width-mobile">
                                        <img height="auto"
                                          src="https://getvero.s3.amazonaws.com/uploads%2F6f361cb8c6e0b33c89cae59a1d3f944a%2Ffullsize%2F7b72034c-ab13-47aa-b3dd-f24939f3aef9-abstract.png"
                                          style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                          width="540" />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:28px;line-height:1.5;text-align:left;color:#000000;">
                                  Tell us how to be better</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div
                                  style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.5;text-align:left;color:#000000;">
                                  We're on a mission to make giving a deliberate, positive action. Your insights could
                                  help inform our future strategy, so we'd really appreciate 2 mins of your time to
                                  complete a short feedback survey.<br /><br />If you've got any other ideas or have a
                                  query about your donation, just hit reply or contact us at <a
                                    href="mailto:raisenational@gmail.com">raisenational@gmail.com</a>.</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size:0px;word-break:break-word;">
                                <div style="height:8px;line-height:8px;">&#8202;</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" vertical-align="middle" class="btn-block"
                                style="font-size:0px;padding:8px;word-break:break-word;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                  style="border-collapse:separate;width:100%;line-height:100%;">
                                  <tr>
                                    <td align="center" bgcolor="#cccccc" role="presentation"
                                      style="border:none;border-radius:8px;cursor:auto;mso-padding-alt:10px 25px;background:#cccccc;"
                                      valign="middle">
                                      <a href="https://example.com"
                                        style="display:inline-block;background:#cccccc;color:#333333;font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;font-weight:normal;line-height:1.75;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:8px;"
                                        target="_blank">
                                        <strong>Start the survey</strong>
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="md-p-20px-outlook" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div class="md-p-20px" style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>`
