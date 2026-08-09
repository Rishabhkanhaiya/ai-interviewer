import requests

def run():
    url = "http://127.0.0.1:8000/api/sessions/start"
    data = {
        "company": "test",
        "role": "sde",
        "round_type": "technical",
        "language_pref": "hinglish",
        "camera_mode": "video"
    }
    headers = {
        "Authorization": "Bearer fake_token"
    }
    
    try:
        r = requests.post(url, json=data, headers=headers)
        print("STATUS:", r.status_code)
        print("BODY:", r.text)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    run()
