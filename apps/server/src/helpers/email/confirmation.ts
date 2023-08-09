import {
  convert, format, calcMatchFunding,
} from '@raise/shared';
import env from '../../env/env';
import { Donation, Fundraiser, Payment } from '../../schemas';
import renderHtml, { RenderedHtml } from './renderHtml';
import footer from './footer';

export default (fundraiser: Fundraiser, donation: Donation, payments: Payment[]): RenderedHtml => {
  const totalDonated = payments.reduce((acc, p) => acc + p.donationAmount, 0);
  const totalExpectedMatchFunding = payments.reduce((acc, p) => acc + (p.matchFundingAmount ?? calcMatchFunding({
    donationAmount: p.donationAmount,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit === null ? null : fundraiser.matchFundingPerDonationLimit - acc,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingRemaining: fundraiser.matchFundingRemaining === null ? null : fundraiser.matchFundingRemaining - acc,
    alreadyMatchFunded: acc,
  })), 0);

  const peopleProtected = convert.moneyToPeopleProtected(fundraiser.currency, totalDonated * (donation.giftAid ? 1.25 : 1) + totalExpectedMatchFunding);

  return renderHtml`<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">

<!-- fundraiserId: ${fundraiser.id} -->
<!-- donationId: ${donation.id} -->
<!-- paymentId: ${payments[0].id} -->

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
    ${env.STAGE !== 'prod' ? renderHtml`<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#F2CA1A" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#F2CA1A;background-color:#F2CA1A;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#F2CA1A;background-color:#F2CA1A;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:12px 30px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.375;text-align:left;color:#000000;">Warning: This email was sent from a non-prod environment</div>
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
    <!--[if mso | IE]></td></tr></table><![endif]-->` : ''}

    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#2ECAD6" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#2ECAD6;background-color:#2ECAD6;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#2ECAD6;background-color:#2ECAD6;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:30px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.375;text-align:left;color:#ffffff;">${fundraiser.publicName}: A Celebration of Giving</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:0px;padding-top:40px;padding-right:0px;padding-bottom:8px;padding-left:0px;word-break:break-word;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                  <tbody>
                                    <tr>
                                      <td style="width:125px;">
                                        <img height="auto" src="https://www.joinraise.org/shared/email-images/logo-white.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="125" />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:40px;line-height:1.25;text-align:left;color:#ffffff;"><strong>Thank you for your donation!</strong></div>
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
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:30px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:20px;line-height:1.5;text-align:left;color:#000000;">
                                Dear ${donation.donorName.split(' ')[0]},<br /><br />
                                Thank you so much for donating through ${fundraiser.publicName} this year and joining our community celebrating positive, deliberate giving!<br /><br />
                                ${donation.charity === 'AMF' ? `Your donation will help protect ${peopleProtected} people from malaria.` : `Your donation to ${donation.charity} will do a lot of good.`} We think that impact is something worth celebrating, and we look forward to seeing you at ${fundraiser.eventLink ? renderHtml`<a href="${fundraiser.eventLink}">our Summer Party</a>` : 'our Summer Party'}.<br /><br />
                                In the meantime, if you are keen to get more involved in our movement, check out our website for ways you can help or ${fundraiser.moreInvolvedLink ? renderHtml`<a href="${fundraiser.moreInvolvedLink}" target="_blank">get in touch with us</a>` : 'get in touch with us'}. Alternatively, you can follow us on social media to keep up to date during our donations period. Plus, celebrating giving is more fun with friends, so why not encourage them to join too?<br /><br />
                                We're looking forward to celebrating our collective impact with you soon!<br /><br />
                                Best wishes,<br />
                                The ${fundraiser.publicName} Team
                                </div>
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
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="md-rounded-bottom-outlook" style="width:600px;" width="600" bgcolor="#5D215E" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div class="md-rounded-bottom" style="background:#5D215E;background-color:#5D215E;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#5D215E;background-color:#5D215E;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:30px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:28px;line-height:1.5;text-align:left;color:#ffffff;">Payment details</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <table cellpadding="0" cellspacing="0" width="100%" border="0" style="color:#ffffff;font-family:'Helvetica', 'Arial', sans-serif;font-size:13px;line-height:22px;table-layout:auto;width:100%;border:none;">
                                  ${payments[0].donationAmount > 0 ? renderHtml`<tr style="font-family:'Helvetica', 'Arial', sans-serif">
                                    <td style="padding: 2px 0;font-size:18px">Your donation to ${donation.charity}</td>
                                    <td style="padding: 2px 0;text-align:right;white-space:nowrap;font-size:18px">${format.amountShort(fundraiser.currency, payments[0].donationAmount)}</td>
                                  </tr>` : ''}
                                  ${payments[0].contributionAmount > 0 ? renderHtml`<tr style="font-family:'Helvetica', 'Arial', sans-serif">
                                      <td style="padding: 2px 0;font-size:18px">Your Summer Party contribution</td>
                                      <td style="padding: 2px 0;text-align:right;white-space:nowrap;font-size:18px">${format.amountShort(fundraiser.currency, payments[0].contributionAmount)}</td>
                                  </tr>` : ''}
                                  <tr style="height:6px">
                                    <td></td>
                                    <td></td>
                                  </tr>
                                  <tr
                                    style="font-family:'Helvetica', 'Arial', sans-serif;border-top:1px solid #bbb;font-weight:bold">
                                    <td style="padding: 8px 0 2px 0;font-size:18px">Total paid</td>
                                    <td style="padding: 8px 0 2px 0;text-align:right;white-space:nowrap;font-size:18px">${format.amountShort(fundraiser.currency, payments[0].donationAmount + payments[0].contributionAmount)}</td>
                                  </tr>
                                  ${donation.giftAid === true ? renderHtml`<tr>
                                  </tr>
                                  <tr
                                    style="font-family:'Helvetica', 'Arial', sans-serif;font-weight:bold">
                                    <td style="padding: 8px 0 2px 0;font-size:18px">Gift Aid added</td>
                                    <td style="padding: 8px 0 2px 0;text-align:right;white-space:nowrap;font-size:18px">${format.amountShort(fundraiser.currency, payments[0].donationAmount * 0.25)}</td>
                                  </tr>` : ''}
                                </table>
                              </td>
                            </tr>
                            ${payments.length > 1 ? renderHtml`<tr>
                              <td align="left" style="font-size:0px;padding:32px 8px 5px 8px;word-break:break-word;">
                                <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.5;text-align:left;color:#ffffff;">
                                  You also set up future donations:</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                                <table cellpadding="0" cellspacing="0" width="100%" border="0" style="color:#ffffff;font-family:'Helvetica', 'Arial', sans-serif;line-height:22px;table-layout:auto;width:100%;border:none;">
                                  ${payments.slice(1).map((p) => renderHtml`<tr style="font-family:'Helvetica', 'Arial', sans-serif">
                                      <td style="padding: 2px 0;font-size:18px">${format.date(p.at)}</td>
                                      <td style="padding: 2px 0;text-align:right;white-space:nowrap;font-size:18px">${format.amountShort(fundraiser.currency, p.donationAmount + p.contributionAmount)}</td>
                                  </tr>`)}
                                  <tr style="height:6px">
                                    <td></td>
                                    <td></td>
                                  </tr>
                                  <tr
                                    style="font-family:'Helvetica', 'Arial', sans-serif;border-top:1px solid #bbb;font-weight:bold">
                                    <td style="padding: 8px 0 2px 0;font-size:18px">Total future donations</td>
                                    <td style="padding: 8px 0 2px 0;text-align:right;white-space:nowrap;font-size:18px">${format.amountShort(fundraiser.currency, payments.slice(1).reduce((acc, cur) => acc + cur.donationAmount + cur.contributionAmount, 0))}</td>
                                  </tr>
                                  ${donation.giftAid === true ? renderHtml`<tr>
                                  </tr>
                                  <tr
                                    style="font-family:'Helvetica', 'Arial', sans-serif;font-weight:bold">
                                    <td style="padding: 8px 0 2px 0;font-size:18px">Total future Gift Aid to be added</td>
                                    <td style="padding: 8px 0 2px 0;text-align:right;white-space:nowrap;font-size:18px">${format.amountShort(fundraiser.currency, payments.slice(1).reduce((acc, cur) => acc + cur.donationAmount + cur.contributionAmount, 0) * 0.25)}</td>
                                  </tr>` : ''}
                                </table>
                              </td>
                            </tr>` : ''}
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
    ${footer()}
  </div>
</body>

</html>`;
};
