import requests
import json
import time

# Configuration
MESH_URL = "http://localhost:3000/api/transact"
# Replace with a real Agent ID from your database
AGENT_ID = "YOUR_AGENT_ID_HERE"

def request_mesh_authorization(provider_name, amount, category):
    print(f"[*] Agent attempting to pay ₹{amount} to {provider_name}...")
    
    payload = {
        "agentId": AGENT_ID,
        "providerName": provider_name,
        "amount": amount,
        "category": category
    }
    
    try:
        response = requests.post(MESH_URL, json=payload)
        data = response.json()
        
        print("\n--- MESH DECISION ---")
        print(f"Status: {data.get('status')}")
        print(f"Risk Score: {data.get('riskScore')}")
        print(f"Reasoning: {data.get('reasoning')}")
        print("---------------------\n")
        
        if data.get('status') == 'COMPLETED':
            print("[✓] Authorized. Proceeding with API call...")
            return True
        elif data.get('status') == 'PENDING_APPROVAL':
            print("[!] Paused. Waiting for human approval on MESH Dashboard.")
            return False
        else:
            print("[X] Blocked by MESH AI Risk Engine.")
            return False
            
    except Exception as e:
        print(f"Error contacting MESH: {e}")
        return False

if __name__ == "__main__":
    print("Initializing Autonomous Agent...")
    time.sleep(1)
    
    # 1. Normal, safe transaction
    print("\nTask: Agent needs to scrape a website.")
    request_mesh_authorization("ScraperAPI", 15, "Compute")
    
    time.sleep(2)
    
    # 2. Risky, anomalous transaction
    print("\nTask: Agent attempting to buy expensive dataset.")
    request_mesh_authorization("ShadyDataBroker", 4500, "Data")
