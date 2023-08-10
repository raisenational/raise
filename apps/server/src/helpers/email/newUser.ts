import env from '../../env/env';
import { UserCreation } from '../../schemas';
import renderHtml, { RenderedHtml } from './renderHtml';
import footer from './footer';

export default (person: UserCreation, sender: string): RenderedHtml => {
  return renderHtml`<!doctype html>
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
                                  <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.375;text-align:left;color:#ffffff;">Raise: A Celebration of Giving</div>
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
                                  <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:40px;line-height:1.25;text-align:left;color:#ffffff;"><strong>Your account has been created!</strong></div>
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
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="md-rounded-bottom" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div class="md-rounded-bottom" style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
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
                                  Dear ${person.name},<br /><br />
                                  Your account has been created on the Raise platform. <br /><br />
                                  You should be able to login at <a href="${env.CUSTOM_RAISE_DOMAIN.concat('/admin')}" target="_blank" >${env.CUSTOM_RAISE_DOMAIN.concat('/admin')}</a>, using your account ${person.email}. <br /><br />
                                  For more information about using the Raise Platform, <a href="https://docs.google.com/document/d/1H5RdqTJijH-wWb2thCqJrT8IoLiVvxSpWLDEUmDyLxU/edit">click here</a>. <br/><br/>
                                  Best wishes, <br/>
                                  ${sender}
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
      ${footer()}
    </div>
  </body>

  </html>`;
};
