import os
import httpx
import logging

WATI_API_ENDPOINT = os.getenv("WATI_API_ENDPOINT")
WATI_API_TOKEN = os.getenv("WATI_API_TOKEN")

async def send_whatsapp_template(to_phone: str, template_name: str, template_data: dict):
    """
    Send a WhatsApp template message via Wati API.
    Placeholder for actual Wati implementation (Phase 35).
    """
    if not WATI_API_ENDPOINT or not WATI_API_TOKEN:
        logging.warning("WATI API not configured. WhatsApp message skipped.")
        return False
        
    url = f"{WATI_API_ENDPOINT}/api/v1/sendTemplateMessage"
    headers = {
        "Authorization": f"Bearer {WATI_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Transform template_data to WATI's parameter format
    parameters = [{"name": k, "value": v} for k, v in template_data.items()]
    
    payload = {
        "broadcast_name": template_name,
        "template_name": template_name,
        "parameters": parameters
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}?whatsappNumber={to_phone}",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            logging.info(f"WhatsApp template {template_name} sent to {to_phone}")
            return True
    except Exception as e:
        logging.error(f"Failed to send WhatsApp message: {e}")
        return False
