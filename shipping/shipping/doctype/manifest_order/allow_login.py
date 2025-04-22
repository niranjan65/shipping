import frappe
from frappe import auth
import logging
from urllib.parse import urlparse

# @frappe.whitelist(allow_guest=True)
# def login(usr, pwd):
#     allowed_origin = "202.165.197.58"
# allowed_path = "/app/scaner/new-scaner-1"

# # Get the origin of the request
# # request = frappe.local.request
# request = frappe.local.request
# # origin = request.headers.get('Origin') or request.headers.get('Referer') or request.headers.get('Host')
# origin = request.headers.get('Host')
# useragent = request.headers.get('User-Agent')

# logging.info(f"Request Origin: {origin}")

# logging.info("Origin and path check passed, proceeding with authentication")

# usr = usr
# pwd = pwd

# try:
# login_manager = frappe.auth.LoginManager()
# login_manager.authenticate(user=usr, pwd=pwd)
# login_manager.post_login()
# except frappe.exceptions.AuthenticationError:
# logging.error(f"Authentication failed for user: {usr}")
# frappe.clear_messages()
# frappe.response["message"] = {
# "success_key": 0,
# "message": "Authentication Error!",
# "usr": usr,
# "pwd": pwd
# }
# return

# api_generate = generate_keys(frappe.session.user)
# user = frappe.get_doc('User', frappe.session.user)

# logging.info(f"Successful login for user: {frappe.session.user}")
# frappe.response["message"] = {
# "success_key": 1,
# "message": "Authentication success",
# "sid": frappe.session.sid,
# "api_key": user.api_key,
# "api_secret": api_generate,
# "origin": useragent,

# }
# frappe.response["home_page"] = "/login"
# frappe.response["full_name"] = "Attendance Scanner"
# frappe.response["csrf_token"] = frappe.generate_hash()
# # logging.info(f"Login attempt from URL: {data}")


# def generate_keys(user):
# user_details = frappe.get_doc('User', user)
# api_secret = frappe.generate_hash(length=15)

# if not user_details.api_key:
# api_key = frappe.generate_hash(length=15)
# user_details.api_key = api_key

# user_details.api_secret = api_secret
# user_details.save()

# return api_secret

@frappe.whitelist(allow_guest=True)
def login(usr, pwd):
    # logging.info(f"Login attempt from URL: {fullUrl}")
    
    # allowed_origin = "202.165.197.58"
    # allowed_path = "/app/scaner/new-scaner-1"
    
    # Get the origin of the request
    # request = frappe.local.request
    request = frappe.local.request
    # origin = request.headers.get('Origin') or request.headers.get('Referer') or request.headers.get('Host')
    origin = request.headers.get('Host') 
    useragent = request.headers.get('User-Agent') 

    logging.info(f"Request Origin: {origin}")
    # logging.info(f"Request Referer: {referer}")

    # Check if the origin matches the allowed origin
    # if not origin or not origin.startswith(allowed_origin):
    #     logging.warning(f"Unauthorized access attempt. Origin: {origin}")
    #     frappe.response["message"] = {
    #         "success_key": 0,
    #         "message": "Unauthorized access. Invalid origin.",
    #         "origin": origin
    #     }
    #     return

    # Check if the path in fullUrl starts with the allowed path
    # parsed_url = urlparse(fullUrl)
    # if not parsed_url.path.startswith(allowed_path):
    #     logging.warning(f"Unauthorized access attempt. Invalid path: {parsed_url.path}")
    #     frappe.response["message"] = {
    #         "success_key": 0,
    #         "message": "Unauthorized access. Invalid path.",
            
    #     }
    #     return

    logging.info("Origin and path check passed, proceeding with authentication")

    usr = usr
    pwd = pwd

    try:
        login_manager = frappe.auth.LoginManager()
        login_manager.authenticate(user=usr, pwd=pwd)
        login_manager.post_login()
    except frappe.exceptions.AuthenticationError:
        logging.error(f"Authentication failed for user: {usr}")
        frappe.clear_messages()
        frappe.response["message"] = {
            "success_key": 0,
            "message": "Authentication Error!"
        }
        return 

    api_generate = generate_keys(frappe.session.user)
    user = frappe.get_doc('User', frappe.session.user)
    csrf_token = frappe.sessions.get_csrf_token()

    logging.info(f"Successful login for user: {frappe.session.user}")
    frappe.response["message"] = {
        "success_key": 1,
        "message": "Authentication success",
        "sid": frappe.session.sid,
        "api_key": user.api_key,
        "api_secret": api_generate,
        "origin": useragent,
    }
    frappe.response["home_page"] = "/login"
    frappe.response["full_name"] = "Attendance Scanner"
    frappe.response["csrf_token"] = csrf_token

def generate_keys(user):
    user_details = frappe.get_doc('User', user)
    api_secret = frappe.generate_hash(length=15)

    if not user_details.api_key:
        api_key = frappe.generate_hash(length=15)
        user_details.api_key = api_key

    user_details.api_secret = api_secret
    user_details.save()

    return api_secret