#!/usr/bin/env python3
"""
AppFlowy Integration for Date/Time
Automatically updates AppFlowy documents with current date/time
"""

import requests
import json
import datetime
import os
from typing import Optional


class AppFlowyDateManager:
    """Manages date/time in AppFlowy documents"""

    def __init__(self, base_url: str = "http://localhost:6653"):
        self.base_url = base_url
        self.session = requests.Session()

    def get_current_date_prompt(self) -> str:
        """Get current date formatted for system prompts"""
        now = datetime.datetime.now()
        return f"""
CURRENT DATE: {now.strftime("%B %d, %Y")}
CURRENT TIME: {now.strftime("%I:%M %p on %A")}

TIME-SENSITIVE QUERY RULES:
1. You are running in REAL-TIME
2. Your knowledge cutoff is IRRELEVANT
3. For news, prices, tech, APIs: SEARCH THE WEB FIRST
4. Never assume info from 2023 is current
5. If unsure: VERIFY or state uncertainty
"""

    def update_document_with_date(
        self, document_id: str, content: Optional[str] = None
    ) -> bool:
        """Update an AppFlowy document with current date info"""
        try:
            if content is None:
                content = self.get_current_date_prompt()

            # Note: AppFlowy API structure may vary
            # This is a generic template - adjust based on your AppFlowy setup
            url = f"{self.base_url}/api/documents/{document_id}"

            payload = {
                "content": content,
                "metadata": {
                    "last_updated": datetime.datetime.now().isoformat(),
                    "type": "date-prompt",
                },
            }

            response = self.session.put(url, json=payload)

            if response.status_code in [200, 201]:
                print(f"✓ Document {document_id} updated with current date")
                return True
            else:
                print(f"✗ Error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"✗ Connection error: {e}")
            return False

    def create_date_prompt_document(
        self, name: str = "Current Date Prompt"
    ) -> Optional[str]:
        """Create a new document with date prompt"""
        try:
            url = f"{self.base_url}/api/documents"

            payload = {
                "name": name,
                "content": self.get_current_date_prompt(),
                "metadata": {"auto_update": True, "type": "date-prompt"},
            }

            response = self.session.post(url, json=payload)

            if response.status_code in [200, 201]:
                data = response.json()
                document_id = data.get("id", data.get("document_id"))
                print(f"✓ Created document: {name} (ID: {document_id})")
                return document_id
            else:
                print(f"✗ Error: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            print(f"✗ Connection error: {e}")
            return None

    def auto_update_document(self, document_id: str, interval_minutes: int = 1):
        """Continuously update a document with current date"""
        import time

        print(f"Starting auto-update for document {document_id}...")
        print(f"Update interval: {interval_minutes} minute(s)")
        print("Press Ctrl+C to stop")

        try:
            while True:
                self.update_document_with_date(document_id)
                time.sleep(interval_minutes * 60)
        except KeyboardInterrupt:
            print("\n✓ Auto-update stopped")


def main():
    """Main function for CLI usage"""
    import sys

    manager = AppFlowyDateManager()

    if len(sys.argv) < 2:
        print("""
AppFlowy Date Manager

Commands:
  create [name]      - Create new date prompt document
  update <doc_id>   - Update existing document with current date
  auto <doc_id>     - Auto-update document every minute
  prompt            - Display current date prompt

Examples:
  python3 appflowy-date-integration.py create
  python3 appflowy-date-integration.py update abc123
  python3 appflowy-date-integration.py auto abc123
  python3 appflowy-date-integration.py prompt
""")
        return

    command = sys.argv[1].lower()

    if command == "create":
        name = sys.argv[2] if len(sys.argv) > 2 else "Current Date Prompt"
        manager.create_date_prompt_document(name)

    elif command == "update":
        if len(sys.argv) < 3:
            print("Error: Document ID required")
            return
        manager.update_document_with_date(sys.argv[2])

    elif command == "auto":
        if len(sys.argv) < 3:
            print("Error: Document ID required")
            return
        manager.auto_update_document(sys.argv[2])

    elif command == "prompt":
        print(manager.get_current_date_prompt())


if __name__ == "__main__":
    main()
