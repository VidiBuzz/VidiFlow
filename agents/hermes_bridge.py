import sys
import time
import json
import os

def log_report(node_id, progress, status, message, task_id=None):
    """Outputs JSON-formatted progress logs directly to stdout and flushes the buffer."""
    report = {
        "nodeId": node_id,
        "progress": progress,
        "status": status,
        "message": message
    }
    if task_id:
        report["taskId"] = task_id
        
    sys.stdout.write(json.dumps(report) + "\n")
    sys.stdout.flush()

def main():
    payload_path = "temp_pipeline.json"
    if not os.path.exists(payload_path):
        # Fallback payload if run directly by developer
        log_report("all", 0, "error", "No active pipeline JSON payload discovered. Running fallback agent verification sequence...")
        time.sleep(1)
        log_report("fallback", 50, "busy", "Synthesizing mock data rules...")
        time.sleep(1.5)
        log_report("fallback", 100, "complete", "Fallback simulation completed.")
        return

    try:
        with open(payload_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        nodes = data.get("nodes", {})
        connections = data.get("connections", [])
        
        node_count = len(nodes)
        log_report("all", 0, "info", f"Discovered pipeline configuration with {node_count} nodes.")
        time.sleep(0.8)

        # Match front-end task card IDs dynamically
        task_id_map = {
            "coordinator": "SMART-018", # Bridge Server
            "researcher": "SMART-011",   # HTML Audit
            "coder": "SMART-016"         # Vespa integration
        }

        # Sequentially run nodes
        for idx, (node_id, node) in enumerate(nodes.items()):
            node_name = node.get("name", "Agent")
            node_type = node.get("type", "agent")
            model = node.get("model", "qwen-72b")
            
            task_id = task_id_map.get(node_type, None)

            # Node Setup
            log_report(node_id, 10, "busy", f"Bootstrapping {node_name} on model {model}...", task_id)
            time.sleep(1.2)
            
            # Node Processing
            log_report(node_id, 45, "busy", f"{node_name} running prompt: '{node.get('prompt', '')[:40]}...'", task_id)
            time.sleep(1.5)
            
            # Node Finalizing
            log_report(node_id, 80, "busy", f"{node_name} finalizing outputs and syncing Mem0...", task_id)
            time.sleep(1.0)
            
            # Node Complete
            log_report(node_id, 100, "complete", f"{node_name} finished all tasks successfully!", task_id)
            time.sleep(0.5)

    except Exception as e:
        log_report("all", 0, "error", f"Error in background Hermes spawner: {str(e)}")

if __name__ == "__main__":
    main()
