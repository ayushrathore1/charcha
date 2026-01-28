/**
 * Medha AI - New User Welcome Email Script
 * 
 * Setup:
 * 1. Open Google Sheet -> Extensions -> Apps Script
 * 2. Paste this code, save, and run sendWelcomeEmails()
 *    OR run sendMailIndividual() to test with your own email first.
 */

const IMAGE_URLS = {
  logo: "https://ik.imagekit.io/ayushrathore1/MEDHA%20Revision%20Logo%20(5)/6.svg?updatedAt=1767677218473",
  chatbot: "https://ik.imagekit.io/ayushrathore1/Medha/updatedchatbot_ss?updatedAt=1765775924405",
  rtuExams: "https://ik.imagekit.io/ayushrathore1/Medha/rtuExams_ss.png?updatedAt=1765727195646",
  rtuSolution: "https://ik.imagekit.io/ayushrathore1/Medha/exam_question_solution?updatedAt=1765776086648",
  flashcards: "https://ik.imagekit.io/ayushrathore1/Medha/flashcards_ss?updatedAt=1765728832385",
  quiz: "https://ik.imagekit.io/ayushrathore1/Medha/Quiz_ss?updatedAt=1765728910610",
  notes: "https://ik.imagekit.io/ayushrathore1/Medha/notes_ss?updatedAt=1765728957524",
  dashboard: "https://ik.imagekit.io/ayushrathore1/Medha/Dashboard_ss?updatedAt=1765727053177",
  messages: "https://ik.imagekit.io/ayushrathore1/Medha/messages_ss?updatedAt=1765776024761",
  updates: "https://ik.imagekit.io/ayushrathore1/Medha/updates_ss?updatedAt=1765729008754"
};

function sendWelcomeEmails() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Start from row 1 (skipping header row 0)
  for (let i = 1; i < data.length; i++) {
    const name = data[i][1]; // Column B (Name)
    const email = data[i][2]; // Column C (Email)
    // You might want to add a "Sent" column check here to avoid duplicates
    
    if (email && email.includes('@')) {
      try {
        const subject = "Welcome to Medha AI - Your Smart Study Companion";
        const htmlBody = generateWelcomeEmailBody(name);
        
        GmailApp.sendEmail(email, subject, "", {
          htmlBody: htmlBody,
          name: "Medha AI",
          replyTo: "rathoreayush512@gmail.com"
        });
        
        Logger.log(`Email sent to: ${email}`);
        Utilities.sleep(1000); // Prevent hitting rate limits
        
      } catch (error) {
        Logger.log(`Failed to send to ${email}: ${error}`);
      }
    } 
  }
  
  Logger.log("All welcome emails sent!");
}

/**
 * Send a single welcome email to a specific person.
 * Usage: Edit the targetEmail and targetName variables below, then run this function.
 */
function sendMailIndividual() {
  // ==========================================
  // ENTER DETAILS HERE
  const targetEmail = "enter_email_here@example.com"; 
  const targetName = "Ayush";
  // ==========================================
  
  if (!targetEmail || !targetEmail.includes('@')) {
    Logger.log("❌ Error: Please enter a valid email address in the 'targetEmail' variable.");
    return;
  }
  
  Logger.log(`📧 Preparing to send email to: ${targetName} <${targetEmail}>`);
  
  try {
    const subject = "Welcome to Medha AI - Your Smart Study Companion";
    const htmlBody = generateWelcomeEmailBody(targetName);
    
    GmailApp.sendEmail(targetEmail, subject, "", {
      htmlBody: htmlBody,
      name: "Medha AI",
      replyTo: "rathoreayush512@gmail.com"
    });
    
    Logger.log(`✅ Email sent successfully to ${targetEmail}`);
  } catch (error) {
    Logger.log(`❌ Failed to send email: ${error.toString()}`);
  }
}

function generateWelcomeEmailBody(name) {
  const userName = name || "Student";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <img src="${IMAGE_URLS.logo}" alt="Medha AI" style="width: 70px; height: 70px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
        MEDHA AI
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        The Ultimate AI-Powered Study Platform for RTU Students
      </p>
    </div>
    
    <!-- Welcome Message -->
    <div style="padding: 40px 30px 20px 30px;">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
        Hello ${userName}!
      </h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Welcome to <strong>Medha AI</strong>! We are revolutionizing the way you study by bridging the gap between static content and interactive AI learning.
      </p>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Here is a tour of the powerful features now at your fingertips:
      </p>
    </div>
      
    <!-- ==================== FEATURES LIST ==================== -->
    <div style="padding: 0 20px 40px 20px;">
      
      <!-- Feature 1: AI Chatbot -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.chatbot}" alt="AI Chatbot with Web Access" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            🤖 AI Chatbot with Web Access
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            Ask anything! Our advanced Llama-3-70b powered chatbot has real-time web access. It knows your RTU syllabus, can fetch the latest tech news, and explain complex topics instantly.
          </p>
        </div>
      </div>
      
      <!-- Feature 2: RTU Exams & Solutions -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.rtuExams}" alt="RTU Previous Year Questions" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            📚 RTU Exams & "Medha, Solve It!"
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
            Access a comprehensive database of Previous Year Questions (PYQs) organized by semester and unit.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #667eea; padding: 10px 15px; margin-bottom: 15px;">
            <p style="margin: 0; font-size: 13px; color: #555;">
              <strong>✨ Magic Feature:</strong> Click the "Medha, Solve It" button to generate perfect, step-by-step answers tailored for exams!
            </p>
          </div>
          <img src="${IMAGE_URLS.rtuSolution}" alt="AI Generated Solution" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;">
        </div>
      </div>

      <!-- Feature 3: Smart Flashcards -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.flashcards}" alt="Smart Flashcards" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            ⚡ Smart AI Flashcards
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
             Revise faster! Select any topic and let AI generate key flashcards for you. Mark them as viewed and track your mastery of subjects.
          </p>
        </div>
      </div>

      <!-- Feature 4: Interactive Quizzes -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.quiz}" alt="Interactive Quizzes" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            🎯 Interactive Quizzes
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            Test your knowledge with subject-wise and topic-wise quizzes. Get instant feedback and scoring to evaluate your exam readiness.
          </p>
        </div>
      </div>

      <!-- Feature 5: Comprehensive Notes -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.notes}" alt="Subject Notes" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            📝 Comprehensive Notes
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            Access well-structured notes for your subjects to ensure you never miss incomplete concepts.
          </p>
        </div>
      </div>

      <!-- Feature 6: Dashboard & Planner -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.dashboard}" alt="Smart Dashboard" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            📊 Daily Planner & Dashboard
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            Stay organized with an AI-generated daily study plan tailored to your exam schedule. Track your tasks with the integrated To-Do list.
          </p>
        </div>
      </div>

      <!-- Feature 7: Direct Messaging -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.messages}" alt="Direct Messaging" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            💬 Direct Admin Support
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            Have a suggestion or found a bug? Message the developers directly through the app and track the status of your feedback.
          </p>
        </div>
      </div>

      <!-- Feature 8: Future Updates -->
      <div style="background: #ffffff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
        <img src="${IMAGE_URLS.updates}" alt="Feature Updates" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #efefef;">
        <div style="padding: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">
            🚀 Constantly Evolving
          </h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            We are always adding new features. Check the "Updates" section to see what's new and what's coming next!
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://medha-revision.vercel.app" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 30px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); text-transform: uppercase; letter-spacing: 1px;">
           Start Learning Now
        </a>
      </div>
      
      <!-- Closing -->
      <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 30px; text-align: center;">
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
          "Knowledge is power, but enthusiasm pulls the switch."
        </p>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0;">
          Best Wishes, <br>
          <strong>Ayush Rathore</strong><br>
          <span style="color: #888;">Creator of Medha AI</span>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #888; font-size: 13px; margin: 0 0 12px 0;">
        You are receiving this email because you signed up for Medha AI.
      </p>
      <div style="margin-top: 15px;">
        <a href="https://www.linkedin.com/in/ayushrathore1" 
           style="display: inline-block; color: #0077b5; text-decoration: none; font-weight: 600; font-size: 14px;">
           Connect on LinkedIn
        </a>
        <span style="color: #ccc; margin: 0 10px;">|</span>
        <a href="https://medha-revision.vercel.app" 
           style="display: inline-block; color: #764ba2; text-decoration: none; font-weight: 600; font-size: 14px;">
           Visit Platform
        </a>
      </div>
    </div>
    
  </div>
</body>
</html>
  `;
}
