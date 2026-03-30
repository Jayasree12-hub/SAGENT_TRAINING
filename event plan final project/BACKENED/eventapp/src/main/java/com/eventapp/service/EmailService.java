package com.eventapp.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from:onboarding@resend.dev}")
    private String resendFrom;

    @Value("${app.backend-url:http://localhost:8081}")
    private String backendUrl;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendInvitationEmail(String guestEmail,
                                    String eventName,
                                    String date,
                                    String location,
                                    Long eventId,
                                    String customMessage) {

        String encodedEmail = URLEncoder.encode(guestEmail, StandardCharsets.UTF_8);
        String attendLink = backendUrl + "/api/rsvp/respond?eventId=" + eventId
                + "&email=" + encodedEmail + "&response=yes";

        String declineLink = backendUrl + "/api/rsvp/respond?eventId=" + eventId
                + "&email=" + encodedEmail + "&response=no";

        String safeEventName = fallback(eventName, "Upcoming Event");
        String safeDate = fallback(date, "To be announced");
        String safeLocation = fallback(location, "Venue to be announced");

        String subject = "You're invited: " + safeEventName;
        String text = buildInvitationText(safeEventName, safeDate, safeLocation, customMessage, attendLink, declineLink);
        String html = buildInvitationHtml(safeEventName, safeDate, safeLocation, customMessage, attendLink, declineLink);

        sendEmail(guestEmail, subject, html, text);
    }

    public void sendFeedbackEmail(String guestEmail, String eventName) {
        String subject = "Feedback Request - " + eventName;
        String text = "Dear Guest,\n\n"
                + "Thank you for attending " + eventName + ".\n\n"
                + "Please give your feedback:\n"
                + frontendUrl + "/feedback\n\n"
                + "Thank you.";
        String html = "<p>Dear Guest,</p>"
                + "<p>Thank you for attending <strong>" + eventName + "</strong>.</p>"
                + "<p>Please give your feedback:</p>"
                + "<p><a href=\"" + frontendUrl + "/feedback\">Submit feedback</a></p>"
                + "<p>Thank you.</p>";

        sendEmail(guestEmail, subject, html, text);
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        String subject = "Your OTP Code";
        String html = "<p>Your verification code is <strong>" + otpCode + "</strong>.</p>"
                + "<p>This code expires in 5 minutes.</p>";
        String text = "Your verification code is " + otpCode + ". This code expires in 5 minutes.";

        sendEmail(toEmail, subject, html, text);
    }

    private void sendEmail(String toEmail, String subject, String html, String text) {
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendViaResend(toEmail, subject, html);
            return;
        }

        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            throw new RuntimeException("Email not configured. Set MAIL_USERNAME and MAIL_PASSWORD.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            if (mailUsername != null && !mailUsername.isBlank()) {
                helper.setFrom(mailUsername);
            }
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(text, html);
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("SMTP send failed", e);
            throw new RuntimeException("Failed to send email. Check SMTP settings.");
        }
    }

    private void sendViaResend(String toEmail, String subject, String html) {
        try {
            String payload = "{"
                    + "\"from\":\"" + escapeJson(resendFrom) + "\","
                    + "\"to\":[\"" + escapeJson(toEmail) + "\"],"
                    + "\"subject\":\"" + escapeJson(subject) + "\","
                    + "\"html\":\"" + escapeJson(html) + "\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.error("Resend failed: status={} body={}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to send email");
            }
        } catch (Exception e) {
            logger.error("Resend error", e);
            throw new RuntimeException("Failed to send email");
        }
    }

    private String buildInvitationText(String eventName,
                                       String date,
                                       String location,
                                       String customMessage,
                                       String acceptLink,
                                       String declineLink) {
        StringBuilder builder = new StringBuilder();
        builder.append("You're invited to ").append(eventName).append(".\n\n");
        builder.append("Date: ").append(date).append("\n");
        builder.append("Location: ").append(location).append("\n\n");
        if (customMessage != null && !customMessage.isBlank()) {
            builder.append(customMessage.trim()).append("\n\n");
        }
        builder.append("Accept: ").append(acceptLink).append("\n");
        builder.append("Decline: ").append(declineLink).append("\n");
        return builder.toString();
    }

    private String buildInvitationHtml(String eventName,
                                       String date,
                                       String location,
                                       String customMessage,
                                       String acceptLink,
                                       String declineLink) {
        String customMessageHtml = customMessage != null && !customMessage.isBlank()
                ? "<p style=\"margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.7;\">"
                + escapeHtml(customMessage.trim()) + "</p>"
                : "";

        return "<!doctype html>"
                + "<html><body style=\"margin:0;padding:0;background:#f4efe4;font-family:Georgia,'Times New Roman',serif;\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f4efe4;padding:32px 16px;\">"
                + "<tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:620px;background:#ffffff;border:1px solid #e7dfcf;border-radius:24px;overflow:hidden;box-shadow:0 18px 40px rgba(26,26,20,0.08);\">"
                + "<tr><td style=\"padding:40px 40px 28px;text-align:center;background:linear-gradient(180deg,#fffefb 0%,#f7f1e7 100%);\">"
                + "<div style=\"font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#9a7b2f;margin-bottom:18px;\">Event Invitation</div>"
                + "<h1 style=\"margin:0;color:#1d1b16;font-size:34px;font-weight:500;line-height:1.2;\">" + escapeHtml(eventName) + "</h1>"
                + "<p style=\"margin:14px 0 0;color:#6b7280;font-size:15px;line-height:1.7;\">You have been invited to join this event. Please confirm your RSVP below.</p>"
                + "</td></tr>"
                + "<tr><td style=\"padding:0 40px 36px;\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"border-collapse:separate;border-spacing:0;background:#fcfaf5;border:1px solid #ece4d7;border-radius:18px;margin-top:-6px;\">"
                + "<tr><td style=\"padding:24px 24px 10px;text-align:center;\">"
                + "<div style=\"font-size:13px;color:#8b7355;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px;\">Event Details</div>"
                + "</td></tr>"
                + "<tr><td style=\"padding:0 24px 24px;\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">"
                + "<tr><td style=\"padding:10px 0;color:#8b7355;font-size:13px;text-transform:uppercase;letter-spacing:0.14em;\">Date</td><td style=\"padding:10px 0;text-align:right;color:#1f2937;font-size:16px;font-weight:600;\">" + escapeHtml(date) + "</td></tr>"
                + "<tr><td style=\"padding:10px 0;color:#8b7355;font-size:13px;text-transform:uppercase;letter-spacing:0.14em;border-top:1px solid #ece4d7;\">Location</td><td style=\"padding:10px 0;text-align:right;color:#1f2937;font-size:16px;font-weight:600;border-top:1px solid #ece4d7;\">" + escapeHtml(location) + "</td></tr>"
                + "</table>"
                + "</td></tr>"
                + "</table>"
                + "<div style=\"padding-top:28px;text-align:center;\">"
                + customMessageHtml
                + "<div style=\"margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;\">Choose one option below. Your response will be tracked automatically.</div>"
                + "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:0 auto 18px;\">"
                + "<tr>"
                + "<td style=\"padding:0 8px 12px;\"><a href=\"" + acceptLink + "\" style=\"display:inline-block;background:#15803d;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:700;\">Accept</a></td>"
                + "<td style=\"padding:0 8px 12px;\"><a href=\"" + declineLink + "\" style=\"display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:700;\">Decline</a></td>"
                + "</tr>"
                + "</table>"
                + "<p style=\"margin:0;color:#6b7280;font-size:13px;line-height:1.7;\">If you already responded, we'll keep your original answer.</p>"
                + "</div>"
                + "</td></tr>"
                + "</table>"
                + "</td></tr>"
                + "</table>"
                + "</body></html>";
    }

    private String fallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
