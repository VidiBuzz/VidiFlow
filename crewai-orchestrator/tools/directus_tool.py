"""
Directus Integration Tool for CrewAI
=====================================
Provides tools for interacting with Directus CMS.
"""

import httpx
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from crewai.tools import BaseTool


class DirectusConfig(BaseModel):
    """Directus connection configuration."""
    url: str = Field(default="http://localhost:8055")
    token: Optional[str] = Field(default=None)


class DirectusSearchTool(BaseTool):
    """Tool for searching Directus collections."""
    name: str = "directus_search"
    description: str = """
    Search collections in Directus CMS. Use this to find:
    - AI consultants and their profiles
    - Case studies
    - Technology stack information
    - Content metadata
    
    Returns matching items from the specified collection.
    """
    
    config: DirectusConfig = Field(default_factory=DirectusConfig)
    
    def _run(
        self,
        collection: str,
        query: Optional[str] = None,
        limit: int = 10,
        filter_field: Optional[str] = None,
        filter_value: Optional[str] = None
    ) -> str:
        """
        Search a Directus collection.
        
        Args:
            collection: Collection name (e.g., 'consultants', 'case_studies')
            query: Search query (searches all text fields)
            limit: Maximum number of results
            filter_field: Specific field to filter on
            filter_value: Value to filter by
            
        Returns:
            JSON string of matching items
        """
        headers = {}
        if self.config.token:
            headers["Authorization"] = f"Bearer {self.config.token}"
        
        # Build filter
        filter_obj = {}
        if filter_field and filter_value:
            filter_obj[filter_field] = {"_contains": filter_value}
        
        params = {
            "limit": limit,
            "filter": filter_obj if filter_obj else None
        }
        
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        try:
            response = httpx.get(
                f"{self.config.url}/items/{collection}",
                headers=headers,
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            
            data = response.json()
            return str(data.get("data", []))
            
        except Exception as e:
            return f"Error searching Directus: {str(e)}"


class DirectusGetTool(BaseTool):
    """Tool for getting specific items from Directus."""
    name: str = "directus_get"
    description: str = """
    Get a specific item from Directus by ID. Use this to retrieve:
    - Full consultant profiles
    - Detailed case studies
    - Complete content items
    """
    
    config: DirectusConfig = Field(default_factory=DirectusConfig)
    
    def _run(self, collection: str, item_id: str) -> str:
        """
        Get a specific item from Directus.
        
        Args:
            collection: Collection name
            item_id: Item ID (UUID)
            
        Returns:
            JSON string of the item
        """
        headers = {}
        if self.config.token:
            headers["Authorization"] = f"Bearer {self.config.token}"
        
        try:
            response = httpx.get(
                f"{self.config.url}/items/{collection}/{item_id}",
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            
            data = response.json()
            return str(data.get("data", {}))
            
        except Exception as e:
            return f"Error getting item from Directus: {str(e)}"


class DirectusCreateTool(BaseTool):
    """Tool for creating items in Directus."""
    name: str = "directus_create"
    description: str = """
    Create a new item in Directus. Use this to:
    - Add new consultant entries
    - Create content drafts
    - Save generated content
    
    Returns the created item with its ID.
    """
    
    config: DirectusConfig = Field(default_factory=DirectusConfig)
    
    def _run(self, collection: str, data: Dict[str, Any]) -> str:
        """
        Create a new item in Directus.
        
        Args:
            collection: Collection name
            data: Item data dictionary
            
        Returns:
            JSON string of the created item
        """
        headers = {
            "Content-Type": "application/json"
        }
        if self.config.token:
            headers["Authorization"] = f"Bearer {self.config.token}"
        
        try:
            response = httpx.post(
                f"{self.config.url}/items/{collection}",
                headers=headers,
                json=data,
                timeout=10.0
            )
            response.raise_for_status()
            
            result = response.json()
            return str(result.get("data", {}))
            
        except Exception as e:
            return f"Error creating item in Directus: {str(e)}"


# Factory function
def get_directus_tools(token: Optional[str] = None) -> List[BaseTool]:
    """Get all Directus tools configured with token."""
    config = DirectusConfig(token=token)
    
    return [
        DirectusSearchTool(config=config),
        DirectusGetTool(config=config),
        DirectusCreateTool(config=config),
    ]
