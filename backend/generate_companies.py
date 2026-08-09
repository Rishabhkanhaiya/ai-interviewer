import json
import csv
import urllib.request

companies = set()

custom_companies = [
    "Google", "Meta", "Apple", "Amazon", "Netflix", "Microsoft", "Tesla", "Nvidia", "OpenAI", "Anthropic",
    "Flipkart", "Swiggy", "Zomato", "Paytm", "Ola", "TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra", 
    "Accenture", "Cognizant", "Capgemini", "IBM", "Oracle", "SAP", "Adobe", "Salesforce", "Uber", "Airbnb",
    "Stripe", "Plaid", "Razorpay", "Zerodha", "Cred", "PhonePe", "Myntra", "MakeMyTrip", "Oyo", "Byjus",
    "Unacademy", "Dream11", "Upstox", "Groww", "Postman", "BrowserStack", "Freshworks", "Zoho", "Atlassian",
    "TikTok", "ByteDance", "Snap", "Pinterest", "Spotify", "Shopify", "Snowflake", "Databricks", "SpaceX"
]
for c in custom_companies:
    companies.add(c)

try:
    url = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        lines = [l.decode('utf-8') for l in response.readlines()]
        reader = csv.DictReader(lines)
        for row in reader:
            if 'Security' in row:
                name = row['Security']
                name = name.replace(' Inc.', '').replace(' Inc', '').replace(' Corp.', '').replace(' Corp', '').replace(' Company', '')
                companies.add(name)
except Exception as e:
    print("Failed to fetch S&P 500:", e)

output_path = r"C:\Users\Rishabh_Joshi\Downloads\new folder 4\frontend\public\companies.json"
sorted_companies = sorted(list(companies))
with open(output_path, "w") as f:
    json.dump(sorted_companies, f)
print(f"Saved {len(sorted_companies)} companies to {output_path}")
