export function translateFieldError(message, language) {
  if (language !== "hi" || !message) {
    return message;
  }

  const errorMap = {
    "Email is required": "ईमेल आवश्यक है",
    "Enter a valid email address": "कृपया सही ईमेल पता दर्ज करें",
    "Password is required": "पासवर्ड आवश्यक है",
    "Password must be at least 6 characters": "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    "Name is required": "नाम आवश्यक है",
    "Name must be at least 2 characters": "नाम कम से कम 2 अक्षरों का होना चाहिए",
    "Phone number is required": "फोन नंबर आवश्यक है",
    "Enter a valid phone number": "कृपया सही फोन नंबर दर्ज करें",
    "Confirm password is required": "पासवर्ड की पुष्टि आवश्यक है",
    "Passwords do not match": "दोनों पासवर्ड मेल नहीं खाते",
    "OTP is required": "ओटीपी आवश्यक है",
    "Enter a valid 6-digit OTP": "कृपया सही 6 अंकों का ओटीपी दर्ज करें",
  };

  return errorMap[message] || message;
}

export function translateAuthMessage(message, language) {
  if (language !== "hi" || !message) {
    return message;
  }

  const messageMap = {
    "Reset email is missing. Please request a new OTP.": "रीसेट ईमेल नहीं मिला। कृपया नया ओटीपी प्राप्त करें।",
    "Reset email is missing. Please restart the reset password flow.": "रीसेट ईमेल नहीं मिला। कृपया पासवर्ड रीसेट प्रक्रिया दोबारा शुरू करें।",
    "Login failed. Please try again.": "लॉग इन असफल रहा। कृपया पुनः प्रयास करें।",
    "Please try again.": "कृपया पुनः प्रयास करें।",
    "User not found": "उपयोगकर्ता नहीं मिला",
    "Invalid credentials": "दर्ज की गई जानकारी गलत है",
    "Your account is locked. Please contact your administrator.": "आपका खाता लॉक है। कृपया प्रशासक से संपर्क करें।",
    "Your email is not verified. I sent a verification email, please verify your email first.": "आपका ईमेल सत्यापित नहीं है। सत्यापन ईमेल भेज दिया गया है, कृपया पहले अपना ईमेल सत्यापित करें।",
    "Your email is not verified, and the verification email could not be sent.": "आपका ईमेल सत्यापित नहीं है और सत्यापन ईमेल भेजा नहीं जा सका।",
    "Registration failed. Please try again.": "पंजीकरण असफल रहा। कृपया पुनः प्रयास करें।",
    "Invalid or expired OTP": "ओटीपी गलत है या उसकी समय-सीमा समाप्त हो गई है",
    "OTP sent successfully. Please check your email.": "ओटीपी सफलतापूर्वक भेज दिया गया है। कृपया अपना ईमेल जांचें।",
    "Failed to send OTP": "ओटीपी भेजने में समस्या हुई",
    "OTP verified successfully": "ओटीपी सफलतापूर्वक सत्यापित हो गया",
    "Password changed successfully": "पासवर्ड सफलतापूर्वक बदल दिया गया",
    "Email already verified": "ईमेल पहले से सत्यापित है",
    "Email verified successfully": "ईमेल सफलतापूर्वक सत्यापित हो गया",
    "Verification link has expired": "सत्यापन लिंक की समय-सीमा समाप्त हो गई है",
    "Invalid verification token": "सत्यापन टोकन अमान्य है",
    "Token is missing": "टोकन नहीं मिला",
  };

  return messageMap[message] || message;
}
