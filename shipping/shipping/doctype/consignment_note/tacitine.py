import frappe
import requests

@frappe.whitelist(allow_guest=True)
def get_bw_plan_list():
    url = "https://tacitine.anantdv.com:2480/umapi2.php"

    payload = {
        "api_version": "2",
        "client_id": "testtacitine",
        "ps_key": "3cd4_57b3_9d73_B862",
        "nas_id": "anantdv",
        "action_id": "get_bw_plan_list",
        "req_params": '{"ref_group_id":"default","plan_type":"all","rule_enable":"all"}'
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        response = requests.post(url, data=payload, headers=headers, verify=False)  
        response.raise_for_status()  # raises error if status != 200
        result = response.json()
        return result.get("results", [])
    except Exception as e:
        frappe.log_error(f"Error calling Tacitine API: {e}")
        return {"error": str(e)}



@frappe.whitelist(allow_guest=True)
def payment_request(mobile: str):
    url = "https://www.gifts.digicelpacific.com/mycash/"

    payload = {
        "api_key": "FLz3wiFA6FVeyjxAZ93z8kWMcfFkWj",
        "username": "taf_tacitine",
        "password": "DbsTaf7ac",
        "method": "paymentRequest",
        "product_id": "233",
        "amount": "1",
        "customer_mobile": mobile,
        "merchant_mobile": "6793000130",
        "narration": "this is a dummy transaction",
        "order_id": "123456"
    }

    try:
        # send as multipart/form-data (like JS FormData)
        response = requests.post(url, files=payload)
        response.raise_for_status()
        result = response.json()

        if result.get("response_code") == 0:
            return {
                "success": True,
                "request_id": result.get("request_id"),
                "data": result
            }
        else:
            return {
                "success": False,
                "data": result
            }

    except Exception as e:
        frappe.log_error(
            title="Digicel payment_request API Error",
            message=str(e)
        )
        return {"success": False, "error": str(e)}




@frappe.whitelist(allow_guest=True)
def send_otp_request(mobile: str):
    url = "https://www.gifts.digicelpacific.com/mycash/"


    payload = {
        "api_key": "FLz3wiFA6FVeyjxAZ93z8kWMcfFkWj",
        "username": "taf_tacitine",
        "password": "DbsTaf7ac",
        "method": "sendOTP",
        "mobile_number": mobile
    }

    try:
        response = requests.post(url, data=payload)  
        response.raise_for_status()
        result = response.json()

        
        if result.get("response_code") == 0:
            return {"success": True, "data": result}
        else:
            return {"success": False, "data": result}

    except Exception as e:
        frappe.log_error(f"Error in Digicel sendOTP API: {e}")
        return {"error": str(e)}

@frappe.whitelist(allow_guest=True)
def approvePayment(mobile: str, request_id, otp ):
    url = "https://www.gifts.digicelpacific.com/mycash/"


    payload = {
        "api_key": "FLz3wiFA6FVeyjxAZ93z8kWMcfFkWj",
        "username": "taf_tacitine",
        "password": "DbsTaf7ac",
        "method": "approvePayment",
        "request_id": request_id,
        "otp": otp,
        "customer_mobile": mobile
    }

    try:
        response = requests.post(url, data=payload)  
        response.raise_for_status()
        result = response.json()

        
        if result.get("response_code") == 0:
            return {"success": True, "data": result}
        else:
            return {"success": False, "data": result}

    except Exception as e:
        frappe.log_error(f"Error in Digicel sendOTP API: {e}")
        return {"error": str(e)}



import random

@frappe.whitelist(allow_guest=True)
def add_user_to_tacitine(plan_name: str, mobile: str):
    url = "https://tacitine.anantdv.com:2480/umapi2.php"

    # Generate 6-digit random password
    new_password = ''.join(random.choices("0123456789", k=6))

    payload = {
        "api_version": "2",
        "client_id": "testtacitine",
        "ps_key": "3cd4_57b3_9d73_B862",
        "nas_id": "anantdv",
        "action_id": "add_user",
        "req_params": frappe.as_json({
            "user_id": mobile,
            "user_pass_type": "specify",
            "user_pass": new_password,
            "account_validity": "num_minutes_from_acct_creation",
            "validity_data": "9999",
            "delete_expired_acct": "enable",
            "del_q_exceeded_acct": "enable",
            "pri_bandwidth_plan_name": plan_name,
            "num_mac_binding": "0",
            "num_conc_logins": "0",
        })
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        response = requests.post(url, data=payload, headers=headers, verify=False)
        response.raise_for_status()
        result = response.json()

        return {
            "success": True,
            "api_response": result,
            "mobile": mobile,
            "password": new_password
        }

    except Exception as e:
        frappe.log_error(f"Error in add_user_to_tacitine: {e}")
        return {"success": False, "error": str(e)}



