"""
VidiSmart Agent Orchestrator - Main Entry Point
================================================
Multi-agent crew using CrewAI + Vespa MCP for content creation.
"""

import os
import sys
from typing import Optional
from dotenv import load_dotenv

from crewai import LLM, Agent, Task, Crew, Process
from crewai_tools import MCPServerAdapter, ScrapeWebsiteTool, SerperDevTool

# Add local tools to path
sys.path.append(os.path.dirname(__file__))
from tools.directus_tool import get_directus_tools
from tools.comfyui_tool import get_comfyui_tools

# Load environment
load_dotenv()


# =============================================================================
# LLM CONFIGURATION
# =============================================================================

def get_llm(provider: str = "lmstudio") -> LLM:
    """
    Configure LLM based on provider.
    
    Providers:
    - lmstudio: Qwen 3.5 27B on port 1234 (primary)
    - ollama: MiMo v2 Omni on port 11434 (alternative)
    """
    if provider == "lmstudio":
        return LLM(
            model="openai/qwen3.5-27b",
            api_base=os.getenv("LMSTUDIO_API_BASE", "http://localhost:1234/v1"),
            api_key="lm-studio",
        )
    elif provider == "ollama":
        return LLM(
            model="openai/mimo-v2-omni",
            api_base=os.getenv("OLLAMA_API_BASE", "http://localhost:11434/v1"),
            api_key="ollama",
        )
    else:
        raise ValueError(f"Unknown provider: {provider}")


# =============================================================================
# TOOLS CONFIGURATION
# =============================================================================

def get_vespa_tools() -> list:
    """Get Vespa MCP tools if available."""
    vespa_url = os.getenv("VESPA_MCP_URL", "http://localhost:8089/mcp/")
    
    try:
        with MCPServerAdapter({"url": vespa_url, "transport": "sse"}) as tools:
            return list(tools)
    except Exception as e:
        print(f"Warning: Vespa MCP not available: {e}")
        return []


def get_all_tools() -> dict:
    """Get all tools organized by category."""
    tools = {
        "web": [],
        "directus": [],
        "comfyui": [],
        "vespa": [],  # Populated at runtime via MCP
    }
    
    # Add web tools if API keys are available
    try:
        if os.getenv("SERPER_API_KEY"):
            tools["web"].append(SerperDevTool())
        tools["web"].append(ScrapeWebsiteTool())
    except Exception as e:
        print(f"Warning: Web tools not available: {e}")
    
    # Add Directus tools
    try:
        tools["directus"] = get_directus_tools(os.getenv("DIRECTUS_TOKEN"))
    except Exception as e:
        print(f"Warning: Directus tools not available: {e}")
    
    # Add ComfyUI tools
    try:
        tools["comfyui"] = get_comfyui_tools(os.getenv("COMFYUI_API_KEY"))
    except Exception as e:
        print(f"Warning: ComfyUI tools not available: {e}")
    
    return tools


# =============================================================================
# AGENTS
# =============================================================================

def create_research_agent(llm, tools: list) -> Agent:
    """Research agent that searches Vespa and web for information."""
    return Agent(
        role="Research Specialist",
        goal="Find and retrieve relevant information from Vespa knowledge base and web",
        backstory="""You are an expert researcher with deep knowledge of the VidiSmart 
        ecosystem. You use Vespa's powerful vector search to find relevant consultants, 
        technologies, and case studies. You also scrape websites for latest information.
        
        Your research directly feeds into content creation and video production.""",
        llm=llm,
        tools=tools,
        verbose=True,
        allow_delegation=False,
        max_iter=5,
    )


def create_content_agent(llm, tools: list) -> Agent:
    """Content creation agent for writing and formatting."""
    return Agent(
        role="Senior Content Creator",
        goal="Create engaging, SEO-optimized content that showcases AI expertise",
        backstory="""You are a skilled content writer specializing in AI, technology, 
        and digital transformation. You create compelling content that educates and 
        converts readers into VidiSmart platform users.
        
        Your writing style is:
        - Professional yet accessible
        - Data-driven with specific examples
        - SEO-optimized with natural keyword integration
        - Engaging with clear calls-to-action""",
        llm=llm,
        tools=tools,
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )


def create_video_agent(llm, tools: list) -> Agent:
    """Video production planning agent."""
    return Agent(
        role="Video Production Director",
        goal="Plan and script video content optimized for AI generation",
        backstory="""You are an expert video producer who understands how to create 
        compelling video scripts optimized for AI video generation with ComfyUI.
        
        You understand:
        - Visual storytelling techniques
        - Timing and pacing for short-form content
        - AI video generation capabilities and limitations
        - Brand consistency in visual media""",
        llm=llm,
        tools=tools,
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )


def create_quality_agent(llm) -> Agent:
    """Quality assurance agent for reviewing content."""
    return Agent(
        role="Quality Assurance Director",
        goal="Review and approve all content before publication",
        backstory="""You are a meticulous quality assurance specialist with years of 
        experience in content review. You ensure all content meets VidiSmart's high 
        standards for:
        
        - Technical accuracy
        - Brand consistency  
        - SEO optimization
        - Readability and engagement
        - Visual quality (for video content)""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=2,
    )


# =============================================================================
# TASKS
# =============================================================================

def create_research_task(agent: Agent) -> Task:
    """Task to search Vespa and web for consultant data."""
    return Task(
        description="""
        Conduct comprehensive research on AI consultants in {industry}.
        
        Steps:
        1. Use vespa_search to find consultants in the database
        2. Use directus_search to get consultant profiles from CMS
        3. Use scrape_website_tool to get additional info from consultant websites
        4. Compile findings into a structured research report
        
        Focus on:
        - Top 5-10 consultants by relevance
        - Their specializations and expertise
        - Notable case studies
        - Contact information and links
        """,
        expected_output="""
        A comprehensive research report containing:
        - Executive summary of findings
        - List of top consultants with profiles
        - Key trends in {industry} AI consulting
        - Data sources and references
        """,
        agent=agent,
    )


def create_content_task(agent: Agent, context: list) -> Task:
    """Task to create content based on research."""
    return Task(
        description="""
        Create a compelling blog post about AI consulting in {industry}.
        
        Requirements:
        - Length: 1500-2000 words
        - Include consultant highlights from research
        - Add relevant statistics and data points
        - Include 3-5 internal links to VidiSmart resources
        - Optimize for SEO keywords: "AI consulting {industry}", 
          "digital transformation {industry}", "{industry} AI solutions"
        
        Structure:
        1. Hook/Introduction (150 words)
        2. State of AI in {industry} (300 words)
        3. Top Trends (400 words)
        4. Featured Consultants (400 words)
        5. Getting Started Guide (200 words)
        6. Conclusion + CTA (150 words)
        """,
        expected_output="""
        A polished blog post in Markdown format with:
        - Proper heading hierarchy (H1, H2, H3)
        - Bullet points and numbered lists where appropriate
        - Block quotes for expert insights
        - SEO meta description (150 chars)
        - Suggested title and slug
        """,
        agent=agent,
        context=context,
    )


def create_video_task(agent: Agent, context: list) -> Task:
    """Task to create video script based on content."""
    return Task(
        description="""
        Create a video production script based on the blog post.
        
        Video Specs:
        - Duration: 60-90 seconds
        - Format: 16:9 (1024x576)
        - Style: Professional, clean, tech-forward
        - Target: LinkedIn/Twitter marketing
        
        For each scene include:
        1. Scene number and duration
        2. Visual description (for ComfyUI generation)
        3. Narration text (if applicable)
        4. On-screen text/graphics
        5. Transitions and effects
        
        Create 6-8 scenes that tell a coherent story.
        """,
        expected_output="""
        A detailed video script with:
        - Scene-by-scene breakdown table
        - Visual prompts for ComfyUI (formatted for copy-paste)
        - Narration text with timing markers
        - Suggested background music style
        - Thumbnail concepts (3 options)
        """,
        agent=agent,
        context=context,
    )


def create_quality_task(agent: Agent, context: list) -> Task:
    """Task to review all generated content."""
    return Task(
        description="""
        Review the blog post and video script for quality assurance.
        
        Review Criteria:
        1. Accuracy (1-10): Is the information correct and current?
        2. Brand Alignment (1-10): Does it match VidiSmart's voice and style?
        3. SEO Optimization (1-10): Are keywords well-integrated?
        4. Engagement (1-10): Is it compelling and actionable?
        5. Technical Feasibility (1-10): Can the video be produced with ComfyUI?
        
        For any score below 7, provide specific improvement suggestions.
        
        End with a clear APPROVED or REQUIRES_REVISION verdict.
        """,
        expected_output="""
        A quality review report containing:
        - Scorecard (5 criteria, 1-10 each)
        - Specific feedback for each section
        - Recommended edits (if any)
        - Final verdict: APPROVED or REQUIRES_REVISION
        """,
        agent=agent,
        context=context,
    )


# =============================================================================
# CREW EXECUTION
# =============================================================================

def run_crew(
    industry: str = "healthcare",
    llm_provider: str = "lmstudio",
    verbose: bool = True
) -> dict:
    """
    Run the complete agent crew.
    
    Args:
        industry: Target industry for research
        llm_provider: LLM to use ('lmstudio' or 'ollama')
        verbose: Enable verbose output
        
    Returns:
        Dictionary with results from each task
    """
    print(f"\n{'='*60}")
    print(f"  VidiSmart Agent Orchestrator")
    print(f"  Industry: {industry}")
    print(f"  LLM: {llm_provider}")
    print(f"{'='*60}\n")
    
    # Initialize LLM
    llm = get_llm(llm_provider)
    
    # Get tools
    all_tools = get_all_tools()
    
    # Create agents with appropriate tools
    researcher = create_research_agent(
        llm, 
        all_tools["web"] + all_tools["directus"] + all_tools["vespa"]
    )
    content_creator = create_content_agent(llm, [])
    video_planner = create_video_agent(llm, all_tools["comfyui"])
    qa_lead = create_quality_agent(llm)
    
    # Create tasks with dependencies
    research_task = create_research_task(researcher)
    content_task = create_content_task(content_creator, [research_task])
    video_task = create_video_task(video_planner, [content_task])
    quality_task = create_quality_task(qa_lead, [content_task, video_task])
    
    # Create crew
    crew = Crew(
        agents=[researcher, content_creator, video_planner, qa_lead],
        tasks=[research_task, content_task, video_task, quality_task],
        verbose=verbose,
        process=Process.sequential,
        memory=True,  # Enable crew memory for context
        cache=True,   # Enable caching
    )
    
    # Run crew
    result = crew.kickoff(inputs={"industry": industry})
    
    return {
        "crew": crew,
        "result": result,
        "industry": industry,
    }


def run_with_vespa_mcp(industry: str = "healthcare") -> dict:
    """
    Run crew with Vespa MCP tools dynamically loaded.
    This is the preferred method when Vespa MCP is available.
    """
    vespa_url = os.getenv("VESPA_MCP_URL", "http://localhost:8089/mcp/")
    
    try:
        with MCPServerAdapter({"url": vespa_url, "transport": "sse"}) as vespa_tools:
            print(f"Connected to Vespa MCP at {vespa_url}")
            print(f"Available tools: {[t.name for t in vespa_tools]}")
            
            # Run crew with Vespa tools
            llm = get_llm("lmstudio")
            all_tools = get_all_tools()
            
            researcher = create_research_agent(
                llm,
                list(vespa_tools) + all_tools["web"] + all_tools["directus"]
            )
            content_creator = create_content_agent(llm, [])
            video_planner = create_video_agent(llm, all_tools["comfyui"])
            qa_lead = create_quality_agent(llm)
            
            research_task = create_research_task(researcher)
            content_task = create_content_task(content_creator, [research_task])
            video_task = create_video_task(video_planner, [content_task])
            quality_task = create_quality_task(qa_lead, [content_task, video_task])
            
            crew = Crew(
                agents=[researcher, content_creator, video_planner, qa_lead],
                tasks=[research_task, content_task, video_task, quality_task],
                verbose=True,
                process=Process.sequential,
                memory=True,
            )
            
            result = crew.kickoff(inputs={"industry": industry})
            
            return {
                "crew": crew,
                "result": result,
                "industry": industry,
            }
            
    except Exception as e:
        print(f"Vespa MCP not available: {e}")
        print("Falling back to standard mode...")
        return run_crew(industry)


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="VidiSmart Agent Orchestrator")
    parser.add_argument("--industry", default="healthcare", help="Target industry")
    parser.add_argument("--llm", default="lmstudio", choices=["lmstudio", "ollama"])
    parser.add_argument("--no-mcp", action="store_true", help="Disable Vespa MCP")
    
    args = parser.parse_args()
    
    if args.no_mcp:
        result = run_crew(args.industry, args.llm)
    else:
        result = run_with_vespa_mcp(args.industry)
    
    print("\n" + "="*60)
    print("CREW EXECUTION COMPLETE")
    print("="*60)
    print(result["result"])
