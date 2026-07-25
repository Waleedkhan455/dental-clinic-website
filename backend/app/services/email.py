"""Email sending for patient notifications (appointment confirmations).

Uses the standard-library ``smtplib`` run in a worker thread so it never blocks
the event loop, and adds no third-party dependency. When SMTP is not configured
(no host/user/password), sending is a safe no-op that logs what *would* have
been sent — so the app works out of the box and real delivery switches on the
moment credentials are added to ``.env``.
"""

import asyncio
import logging
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage

from app.core.config import get_settings
from app.services.booking import CLINIC_TZ

logger = logging.getLogger(__name__)

# Clinic details shown in the email body.
CLINIC_NAME = "Zimal Dental Clinic And Implant Center"
CLINIC_PHONE = "+92 347 913 2302"
CLINIC_ADDRESS = "Siran Arcade, Upper Chanai, Mansehra 21300, Khyber Pakhtunkhwa"


def _send_sync(msg: EmailMessage) -> None:
    """Blocking SMTP send — run via ``asyncio.to_thread`` from ``send_email``."""
    settings = get_settings()
    assert settings.smtp_host  # guarded by emails_enabled before we get here
    if settings.smtp_ssl:
        server: smtplib.SMTP = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20)
    else:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20)
    try:
        if settings.smtp_starttls and not settings.smtp_ssl:
            server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
    finally:
        try:
            server.quit()
        except Exception:  # noqa: BLE001 - closing best-effort
            pass


async def send_email(*, to: str, subject: str, text_body: str, html_body: str) -> bool:
    """Send a multipart (text + HTML) email. Returns True if actually sent."""
    settings = get_settings()
    if not settings.emails_enabled:
        logger.warning(
            "SMTP not configured — email NOT sent. Would send to %s | subject: %s", to, subject
        )
        return False

    msg = EmailMessage()
    msg["From"] = f"{settings.smtp_from_name} <{settings.email_from}>"
    msg["Reply-To"] = settings.email_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    try:
        await asyncio.to_thread(_send_sync, msg)
        logger.info("Email sent to %s | subject: %s", to, subject)
        return True
    except Exception as exc:  # noqa: BLE001 - never let email failure bubble up
        logger.error("Failed to send email to %s: %s", to, exc)
        return False


async def send_otp_email(*, to_email: str, code: str) -> bool:
    """Email a one-time verification code used during account sign-up."""
    subject = f"Your {CLINIC_NAME} verification code"
    text_body = (
        f"Your verification code is: {code}\n\n"
        f"Enter this code to finish creating your account. It expires in 10 minutes.\n"
        f"If you didn't request this, you can ignore this email.\n\n"
        f"{CLINIC_NAME}\n"
    )
    html_body = f"""\
<div style="background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#1d4ed8;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;color:#ffffff;">Verify your email</h1>
    </div>
    <div style="padding:24px;text-align:center;">
      <p style="margin:0 0 16px;color:#475569;">Enter this code to finish creating your account:</p>
      <div style="font-size:34px;font-weight:700;letter-spacing:8px;color:#1d4ed8;">{code}</div>
      <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
      <p style="margin:16px 0 0;font-weight:600;color:#0f172a;">{CLINIC_NAME}</p>
    </div>
  </div>
</div>
"""
    return await send_email(to=to_email, subject=subject, text_body=text_body, html_body=html_body)


def _format_when(scheduled_at: datetime) -> str:
    """Format a stored (UTC) appointment time in clinic-local time (PKT)."""
    aware = scheduled_at if scheduled_at.tzinfo else scheduled_at.replace(tzinfo=timezone.utc)
    local = aware.astimezone(CLINIC_TZ)
    return local.strftime("%A, %d %B %Y at %I:%M %p") + " (PKT)"


async def send_appointment_confirmation(
    *,
    to_email: str,
    patient_name: str,
    doctor_name: str | None,
    service_name: str | None,
    scheduled_at: datetime,
) -> bool:
    """Email the patient that their appointment has been confirmed."""
    when = _format_when(scheduled_at)
    dentist = doctor_name or "our dentist"
    subject = f"Your appointment at {CLINIC_NAME} is confirmed"

    service_text = f"Service: {service_name}\n" if service_name else ""
    text_body = (
        f"Dear {patient_name},\n\n"
        f"Good news — your dental appointment has been CONFIRMED.\n\n"
        f"When: {when}\n"
        f"Dentist: {dentist}\n"
        f"{service_text}"
        f"Clinic: {CLINIC_NAME}\n"
        f"Address: {CLINIC_ADDRESS}\n"
        f"Phone / WhatsApp: {CLINIC_PHONE}\n\n"
        f"Please arrive about 10 minutes early. If you need to reschedule or "
        f"cancel, please call or WhatsApp us on {CLINIC_PHONE}.\n\n"
        f"We look forward to seeing you.\n"
        f"{CLINIC_NAME}\n"
    )

    service_row = (
        f'<tr><td style="padding:4px 0;color:#475569;">Service</td>'
        f'<td style="padding:4px 0;font-weight:600;color:#0f172a;">{service_name}</td></tr>'
        if service_name
        else ""
    )
    html_body = f"""\
<div style="background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#1d4ed8;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;color:#ffffff;">Appointment confirmed</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;">Dear {patient_name},</p>
      <p style="margin:0 0 20px;color:#475569;">
        Good news — your dental appointment has been <strong style="color:#15803d;">confirmed</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:4px 0;color:#475569;width:110px;">When</td>
            <td style="padding:4px 0;font-weight:600;">{when}</td></tr>
        <tr><td style="padding:4px 0;color:#475569;">Dentist</td>
            <td style="padding:4px 0;font-weight:600;">{dentist}</td></tr>
        {service_row}
      </table>
      <div style="margin:20px 0;padding:16px;background:#eff6ff;border-radius:8px;font-size:14px;color:#1e3a8a;">
        <strong>{CLINIC_NAME}</strong><br/>
        {CLINIC_ADDRESS}<br/>
        Phone / WhatsApp: {CLINIC_PHONE}
      </div>
      <p style="margin:0;color:#475569;font-size:14px;">
        Please arrive about 10 minutes early. To reschedule or cancel, call or WhatsApp us on {CLINIC_PHONE}.
      </p>
    </div>
  </div>
</div>
"""

    return await send_email(to=to_email, subject=subject, text_body=text_body, html_body=html_body)


async def send_appointment_reschedule(
    *,
    to_email: str,
    patient_name: str,
    doctor_name: str | None,
    service_name: str | None,
    old_scheduled_at: datetime | None,
    new_scheduled_at: datetime,
    confirmed: bool = True,
) -> bool:
    """Email the patient that the clinic moved their appointment to a new time."""
    new_when = _format_when(new_scheduled_at)
    old_when = _format_when(old_scheduled_at) if old_scheduled_at else None
    dentist = doctor_name or "our dentist"
    subject = f"Your appointment at {CLINIC_NAME} has been rescheduled"

    status_line = (
        "Your appointment is confirmed for the new time shown below."
        if confirmed
        else "Please note the new time shown below."
    )
    service_text = f"Service: {service_name}\n" if service_name else ""
    old_text = f"Previous time: {old_when}\n" if old_when else ""
    text_body = (
        f"Dear {patient_name},\n\n"
        f"The clinic has RESCHEDULED your dental appointment. {status_line}\n\n"
        f"New time: {new_when}\n"
        f"{old_text}"
        f"Dentist: {dentist}\n"
        f"{service_text}"
        f"Clinic: {CLINIC_NAME}\n"
        f"Address: {CLINIC_ADDRESS}\n"
        f"Phone / WhatsApp: {CLINIC_PHONE}\n\n"
        f"If the new time doesn't suit you, please call or WhatsApp us on {CLINIC_PHONE}.\n\n"
        f"{CLINIC_NAME}\n"
    )

    old_row = (
        f'<tr><td style="padding:4px 0;color:#475569;">Previous</td>'
        f'<td style="padding:4px 0;color:#94a3b8;text-decoration:line-through;">{old_when}</td></tr>'
        if old_when
        else ""
    )
    service_row = (
        f'<tr><td style="padding:4px 0;color:#475569;">Service</td>'
        f'<td style="padding:4px 0;font-weight:600;color:#0f172a;">{service_name}</td></tr>'
        if service_name
        else ""
    )
    html_body = f"""\
<div style="background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#b45309;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;color:#ffffff;">Appointment rescheduled</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;">Dear {patient_name},</p>
      <p style="margin:0 0 20px;color:#475569;">
        The clinic has <strong style="color:#b45309;">rescheduled</strong> your appointment. {status_line}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:4px 0;color:#475569;width:110px;">New time</td>
            <td style="padding:4px 0;font-weight:700;color:#0f172a;">{new_when}</td></tr>
        {old_row}
        <tr><td style="padding:4px 0;color:#475569;">Dentist</td>
            <td style="padding:4px 0;font-weight:600;">{dentist}</td></tr>
        {service_row}
      </table>
      <div style="margin:20px 0;padding:16px;background:#eff6ff;border-radius:8px;font-size:14px;color:#1e3a8a;">
        If the new time doesn't suit you, call or WhatsApp us on <strong>{CLINIC_PHONE}</strong>.<br/><br/>
        <strong>{CLINIC_NAME}</strong><br/>{CLINIC_ADDRESS}
      </div>
    </div>
  </div>
</div>
"""

    return await send_email(to=to_email, subject=subject, text_body=text_body, html_body=html_body)


async def send_appointment_cancellation(
    *,
    to_email: str,
    patient_name: str,
    doctor_name: str | None,
    service_name: str | None,
    scheduled_at: datetime,
) -> bool:
    """Email the patient that their appointment has been cancelled."""
    when = _format_when(scheduled_at)
    dentist = doctor_name or "our dentist"
    subject = f"Your appointment at {CLINIC_NAME} has been cancelled"

    service_text = f"Service: {service_name}\n" if service_name else ""
    text_body = (
        f"Dear {patient_name},\n\n"
        f"Your dental appointment has been CANCELLED.\n\n"
        f"When: {when}\n"
        f"Dentist: {dentist}\n"
        f"{service_text}\n"
        f"If you'd like to rebook, please call or WhatsApp us on {CLINIC_PHONE}, "
        f"or book online any time.\n\n"
        f"{CLINIC_NAME}\n"
        f"{CLINIC_ADDRESS}\n"
    )

    service_row = (
        f'<tr><td style="padding:4px 0;color:#475569;">Service</td>'
        f'<td style="padding:4px 0;font-weight:600;color:#0f172a;">{service_name}</td></tr>'
        if service_name
        else ""
    )
    html_body = f"""\
<div style="background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#b91c1c;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;color:#ffffff;">Appointment cancelled</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;">Dear {patient_name},</p>
      <p style="margin:0 0 20px;color:#475569;">
        Your dental appointment has been <strong style="color:#b91c1c;">cancelled</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:4px 0;color:#475569;width:110px;">When</td>
            <td style="padding:4px 0;font-weight:600;">{when}</td></tr>
        <tr><td style="padding:4px 0;color:#475569;">Dentist</td>
            <td style="padding:4px 0;font-weight:600;">{dentist}</td></tr>
        {service_row}
      </table>
      <div style="margin:20px 0;padding:16px;background:#eff6ff;border-radius:8px;font-size:14px;color:#1e3a8a;">
        Would you like to rebook? Call or WhatsApp us on <strong>{CLINIC_PHONE}</strong>, or book online any time.<br/><br/>
        <strong>{CLINIC_NAME}</strong><br/>{CLINIC_ADDRESS}
      </div>
    </div>
  </div>
</div>
"""

    return await send_email(to=to_email, subject=subject, text_body=text_body, html_body=html_body)
