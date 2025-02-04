import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailPayload {
  userId: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email }: WelcomeEmailPayload = await req.json();
    console.log("Sending welcome email to:", email, "for user:", userId);

    const emailResponse = await resend.emails.send({
      from: "FlowText <no-reply@tnormarketing.com>",
      to: [email],
      subject: "Welcome to FlowText! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to FlowText</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                padding: 20px 0;
              }
              .content {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .phone-number {
                background-color: #f5f5f5;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
                font-size: 24px;
                color: #ea384c;
                font-weight: bold;
              }
              .button {
                display: inline-block;
                background-color: #ea384c;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 4px;
                text-decoration: none;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #ea384c;">Welcome to FlowText! 🎉</h1>
              </div>
              <div class="content">
                <p>We're thrilled to have you on board! Your account has been successfully created and you're ready to start sending powerful SMS campaigns.</p>
                <p>Here's your default phone number to get started:</p>
                <div class="phone-number">
                  +1 (514) 612-5967
                </div>
                <p>With FlowText, you can:</p>
                <ul>
                  <li>Create and manage SMS campaigns</li>
                  <li>Build contact groups</li>
                  <li>Track message delivery and engagement</li>
                  <li>Access detailed analytics</li>
                </ul>
                <center>
                  <a href="${supabaseUrl}" class="button">Go to Dashboard</a>
                </center>
              </div>
              <div class="footer">
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>© 2024 FlowText. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);