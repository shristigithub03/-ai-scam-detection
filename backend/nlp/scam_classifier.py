# scam_classifier.py
import sys
from transformers import pipeline

message = sys.argv[1]

# Load pre-trained model (example)
classifier = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sms-spam")
result = classifier(message)[0]

label = result['label']
risk = "High" if label.lower() == "spam" else "Low"
guidance = "Do not click suspicious links." if label.lower() == "spam" else "Safe message"

print(f"{label}|{risk}|{guidance}")