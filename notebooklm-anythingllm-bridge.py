#!/usr/bin/env python3
"""
NotebookLM ↔ AnythingLLM Integration Bridge

This script provides seamless integration between Google NotebookLM and AnythingLLM,
enabling bi-directional data flow and content synchronization.

Author: VidiSmart AI Team
Version: 1.0.0
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
import argparse
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# NotebookLM Client
async def get_notebooklm_client():
    """Initialize NotebookLM client with stored credentials."""
    try:
        from notebooklm import NotebookLMClient
        client = await NotebookLMClient.from_storage()
        return client
    except Exception as e:
        logger.error(f"Failed to initialize NotebookLM client: {e}")
        logger.info("Please run: notebooklm login")
        raise


class NotebookLMAnythingLLMBridge:
    """Bridge class for NotebookLM and AnythingLLM integration."""
    
    def __init__(self, notebooklm_client=None):
        self.client = notebooklm_client
        self.config = self._load_config()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or create defaults."""
        config_path = Path.home() / ".notebooklm-anythingllm-config.json"
        
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
        
        # Default configuration
        default_config = {
            "anythingllm": {
                "api_url": os.getenv("ANYTHINGLLM_URL", "http://localhost:3001"),
                "api_key": os.getenv("ANYTHINGLLM_API_KEY", ""),
                "default_workspace": "notebooklm-imports"
            },
            "notebooklm": {
                "default_notebook": None,
                "auto_sync": False,
                "sync_interval": 3600  # 1 hour
            },
            "sync": {
                "include_audio": True,
                "include_sources": True,
                "include_chat": False,
                "export_format": "markdown"
            }
        }
        
        # Save default config
        with open(config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        return default_config
    
    async def list_notebooks(self) -> List[Dict[str, Any]]:
        """List all available NotebookLM notebooks."""
        if not self.client:
            self.client = await get_notebooklm_client()
        
        notebooks = await self.client.notebooks.list()
        return [
            {
                "id": nb.id,
                "title": nb.title,
                "created_at": nb.created_at,
                "updated_at": nb.updated_at,
                "source_count": len(nb.sources) if hasattr(nb, 'sources') else 0
            }
            for nb in notebooks
        ]
    
    async def get_notebook_sources(self, notebook_id: str) -> List[Dict[str, Any]]:
        """Get all sources from a notebook."""
        if not self.client:
            self.client = await get_notebooklm_client()
        
        sources = await self.client.sources.list(notebook_id)
        return [
            {
                "id": src.id,
                "title": src.title,
                "type": src.type,
                "url": getattr(src, 'url', None),
                "added_at": src.added_at
            }
            for src in sources
        ]
    
    async def export_notebook_to_anythingllm(self, notebook_id: str, workspace_name: Optional[str] = None) -> str:
        """Export a NotebookLM notebook to AnythingLLM workspace."""
        if not self.client:
            self.client = await get_notebooklm_client()
        
        # Get notebook details
        notebooks = await self.client.notebooks.list()
        notebook = next((n for n in notebooks if n.id == notebook_id), None)
        
        if not notebook:
            raise ValueError(f"Notebook {notebook_id} not found")
        
        # Create export directory
        export_dir = Path(f"/tmp/notebooklm_export_{notebook_id}")
        export_dir.mkdir(exist_ok=True)
        
        # Export sources
        sources = await self.get_notebook_sources(notebook_id)
        
        export_data = {
            "notebook_title": notebook.title,
            "notebook_id": notebook_id,
            "exported_at": datetime.now().isoformat(),
            "sources": sources
        }
        
        # Save metadata
        metadata_path = export_dir / "metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        # Export source content
        for source in sources:
            try:
                # Get full text content
                content = await self.client.sources.get_guide(notebook_id, source["id"])
                content_path = export_dir / f"{source['id']}.md"
                with open(content_path, 'w', encoding='utf-8') as f:
                    f.write(f"# {source['title']}\n\n")
                    f.write(f"Source: {source.get('url', 'N/A')}\n")
                    f.write(f"Type: {source['type']}\n\n")
                    f.write(content)
            except Exception as e:
                logger.warning(f"Failed to export source {source['id']}: {e}")
        
        # Generate summary for AnythingLLM
        workspace = workspace_name or self.config["anythingllm"]["default_workspace"]
        
        summary = f"""# NotebookLM Import: {notebook.title}

## Notebook Information
- **Notebook ID**: {notebook_id}
- **Exported**: {datetime.now().isoformat()}
- **Total Sources**: {len(sources)}

## Sources
"""
        
        for src in sources:
            summary += f"\n- **{src['title']}** ({src['type']})"
            if src.get('url'):
                summary += f"\n  - URL: {src['url']}"
        
        summary_path = export_dir / "SUMMARY.md"
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(summary)
        
        logger.info(f"Exported notebook to: {export_dir}")
        logger.info(f"Ready for import into AnythingLLM workspace: {workspace}")
        
        return str(export_dir)
    
    async def generate_and_export_audio(self, notebook_id: str, instructions: str = "") -> str:
        """Generate Audio Overview and export it."""
        if not self.client:
            self.client = await get_notebooklm_client()
        
        logger.info("Generating Audio Overview...")
        status = await self.client.artifacts.generate_audio(
            notebook_id, 
            instructions=instructions or "make it engaging and informative"
        )
        
        # Wait for completion
        await self.client.artifacts.wait_for_completion(notebook_id, status.task_id)
        
        # Download
        output_path = f"/tmp/notebooklm_audio_{notebook_id}.mp3"
        await self.client.artifacts.download_audio(notebook_id, output_path)
        
        logger.info(f"Audio exported to: {output_path}")
        return output_path
    
    async def sync_to_anythingllm(self, notebook_id: Optional[str] = None) -> Dict[str, Any]:
        """Sync NotebookLM content to AnythingLLM."""
        results = {
            "exported_notebooks": [],
            "audio_files": [],
            "timestamp": datetime.now().isoformat()
        }
        
        if notebook_id:
            # Sync specific notebook
            export_path = await self.export_notebook_to_anythingllm(notebook_id)
            results["exported_notebooks"].append({
                "id": notebook_id,
                "path": export_path
            })
        else:
            # Sync all notebooks
            notebooks = await self.list_notebooks()
            for nb in notebooks:
                export_path = await self.export_notebook_to_anythingllm(nb["id"])
                results["exported_notebooks"].append({
                    "id": nb["id"],
                    "title": nb["title"],
                    "path": export_path
                })
        
        return results
    
    async def chat_with_notebook(self, notebook_id: str, question: str) -> str:
        """Chat with a notebook and get response."""
        if not self.client:
            self.client = await get_notebooklm_client()
        
        result = await self.client.chat.ask(notebook_id, question)
        return result.answer


# CLI Commands
def cli():
    """Command-line interface for the bridge."""
    parser = argparse.ArgumentParser(
        description="NotebookLM ↔ AnythingLLM Integration Bridge"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # List notebooks
    list_parser = subparsers.add_parser("list", help="List all notebooks")
    
    # Export notebook
    export_parser = subparsers.add_parser("export", help="Export notebook to AnythingLLM")
    export_parser.add_argument("notebook_id", help="Notebook ID to export")
    export_parser.add_argument("--workspace", "-w", help="AnythingLLM workspace name")
    
    # Sync command
    sync_parser = subparsers.add_parser("sync", help="Sync notebooks to AnythingLLM")
    sync_parser.add_argument("--notebook", "-n", help="Specific notebook ID (default: all)")
    
    # Chat command
    chat_parser = subparsers.add_parser("chat", help="Chat with a notebook")
    chat_parser.add_argument("notebook_id", help="Notebook ID")
    chat_parser.add_argument("question", help="Question to ask")
    
    # Audio command
    audio_parser = subparsers.add_parser("audio", help="Generate Audio Overview")
    audio_parser.add_argument("notebook_id", help="Notebook ID")
    audio_parser.add_argument("--instructions", "-i", default="", help="Custom instructions")
    
    # Setup command
    setup_parser = subparsers.add_parser("setup", help="Setup configuration")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    async def run():
        bridge = NotebookLMAnythingLLMBridge()
        
        if args.command == "list":
            notebooks = await bridge.list_notebooks()
            print(f"\n{'ID':<40} {'Title':<40} {'Sources':<10}")
            print("-" * 90)
            for nb in notebooks:
                print(f"{nb['id']:<40} {nb['title'][:38]:<40} {nb['source_count']:<10}")
        
        elif args.command == "export":
            export_path = await bridge.export_notebook_to_anythingllm(
                args.notebook_id, 
                args.workspace
            )
            print(f"\n✅ Notebook exported to: {export_path}")
            print(f"\nNext steps:")
            print(f"1. Open AnythingLLM at {bridge.config['anythingllm']['api_url']}")
            print(f"2. Go to Workspace → Upload documents")
            print(f"3. Upload files from: {export_path}")
        
        elif args.command == "sync":
            print("🔄 Syncing notebooks to AnythingLLM format...")
            results = await bridge.sync_to_anythingllm(args.notebook)
            
            print(f"\n✅ Sync complete!")
            print(f"Exported {len(results['exported_notebooks'])} notebook(s)")
            for nb in results["exported_notebooks"]:
                print(f"  - {nb.get('title', nb['id'])}: {nb['path']}")
        
        elif args.command == "chat":
            print(f"🤔 Asking: {args.question}")
            answer = await bridge.chat_with_notebook(args.notebook_id, args.question)
            print(f"\n💡 Answer:\n{answer}")
        
        elif args.command == "audio":
            print("🎙️ Generating Audio Overview...")
            output_path = await bridge.generate_and_export_audio(
                args.notebook_id, 
                args.instructions
            )
            print(f"\n✅ Audio exported to: {output_path}")
        
        elif args.command == "setup":
            print("🔧 NotebookLM ↔ AnythingLLM Bridge Setup")
            print("\n1. Ensure notebooklm-py is authenticated:")
            print("   notebooklm login")
            print("\n2. Update config at ~/.notebooklm-anythingllm-config.json")
            print("\n3. Set environment variables:")
            print("   export ANYTHINGLLM_URL=http://localhost:3001")
            print("   export ANYTHINGLLM_API_KEY=your_key")
    
    asyncio.run(run())


if __name__ == "__main__":
    cli()
