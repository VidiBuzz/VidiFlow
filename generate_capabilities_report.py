from fpdf import FPDF
from datetime import datetime


class PDFReport(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 16)
        self.set_text_color(30, 58, 138)
        self.cell(
            0,
            10,
            "OpenCode AI - Complete Capabilities Report",
            new_x="LMARGIN",
            new_y="NEXT",
            align="C",
        )
        self.set_font("helvetica", "", 10)
        self.set_text_color(100, 100, 100)
        self.cell(
            0,
            5,
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            new_x="LMARGIN",
            new_y="NEXT",
            align="C",
        )
        self.ln(5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def chapter_title(self, title):
        self.set_font("helvetica", "B", 14)
        self.set_text_color(30, 58, 138)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT", align="L")
        self.ln(2)

    def chapter_subtitle(self, subtitle):
        self.set_font("helvetica", "B", 12)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, subtitle, new_x="LMARGIN", new_y="NEXT", align="L")

    def body_text(self, text):
        self.set_font("helvetica", "", 10)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 5, text)
        self.ln(3)

    def bullet_point(self, text):
        self.set_font("helvetica", "", 10)
        self.set_text_color(0, 0, 0)
        self.cell(5)  # Indent
        self.cell(5, 5, chr(149), new_x="RIGHT", new_y="TOP")
        self.multi_cell(180, 5, text)


# Create PDF
pdf = PDFReport()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

# Introduction
pdf.chapter_title("Executive Summary")
pdf.body_text(
    "This document provides a comprehensive overview of all operational modes, capabilities, and specialized functions available in OpenCode AI. These capabilities enable complex software engineering tasks, research, automation, and system integration."
)

# Mode 1: Standard Conversation Mode
pdf.chapter_title("1. Standard Conversation Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "The default operational mode for general assistance, questions, and guidance. This mode supports natural language understanding and provides concise, helpful responses."
)
pdf.chapter_subtitle("Capabilities")
pdf.bullet_point("General Q&A and explanations")
pdf.bullet_point("Code review and debugging assistance")
pdf.bullet_point("Architecture and design recommendations")
pdf.bullet_point("Best practices guidance")
pdf.bullet_point("Troubleshooting support")
pdf.ln(3)

# Mode 2: Deep Research Mode
pdf.add_page()
pdf.chapter_title("2. Deep Research Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "An advanced research capability combining browser automation with systematic data collection and analysis. Powered by Playwright MCP for web scraping and content extraction."
)
pdf.chapter_subtitle("Activation")
pdf.body_text(
    'Command: "Activate deep research on [URL]" or "Start deep research on [topic]"'
)
pdf.chapter_subtitle("Tools Available")
pdf.bullet_point("Playwright MCP Server - Browser automation")
pdf.bullet_point("Chromium browser (v145.0.7632.6) - Full browser control")
pdf.bullet_point("Screenshot capture - Visual documentation")
pdf.bullet_point("Content extraction - Text, links, images, headings")
pdf.bullet_point("Multi-page navigation - Systematic crawling")
pdf.chapter_subtitle("Research Agent Location")
pdf.body_text("Path: .agent/skills/deep-research-agent/")
pdf.bullet_point("SKILL.md - Agent configuration and workflow")
pdf.bullet_point("research-agent.js - Browser automation script")
pdf.bullet_point("kb-import.js - Knowledge base import tool")
pdf.chapter_subtitle("Output Structure")
pdf.body_text("All research saved to: research/[topic]/")
pdf.bullet_point("findings.md - Main research findings")
pdf.bullet_point("sources.md - List of sources")
pdf.bullet_point("data/ - Raw extracted data (JSON)")
pdf.bullet_point("screenshots/ - Visual references (PNG)")

# Mode 3: Code Development Mode
pdf.add_page()
pdf.chapter_title("3. Code Development Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "Specialized mode for writing, editing, and executing code across multiple programming languages and frameworks."
)
pdf.chapter_subtitle("Supported Languages")
pdf.bullet_point("JavaScript/TypeScript/Node.js")
pdf.bullet_point("Python (with pip package management)")
pdf.bullet_point("PHP (WordPress, Laravel, etc.)")
pdf.bullet_point("Bash/Shell scripting")
pdf.bullet_point("HTML/CSS/SCSS")
pdf.bullet_point("SQL (MySQL, PostgreSQL, SQLite)")
pdf.chapter_subtitle("Development Tools")
pdf.bullet_point("File operations (read, write, edit)")
pdf.bullet_point("Code search and grep functionality")
pdf.bullet_point("Git operations (status, commit, push)")
pdf.bullet_point("Package management (npm, pip, composer)")
pdf.bullet_point("Syntax highlighting and formatting")

# Mode 4: Task Automation Mode
pdf.chapter_title("4. Task Automation Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "Complex multi-step task execution using specialized sub-agents. Breaks down large projects into manageable, trackable tasks."
)
pdf.chapter_subtitle("Tools")
pdf.bullet_point("todowrite - Create and manage task lists")
pdf.bullet_point("task - Launch specialized sub-agents")
pdf.bullet_point("Bash - Execute system commands")
pdf.chapter_subtitle("Sub-Agent Types")
pdf.bullet_point("General Agent - Multi-purpose task execution")
pdf.bullet_point("Explore Agent - Codebase exploration and analysis")
pdf.chapter_subtitle("Task Management")
pdf.body_text("States: pending, in_progress, completed, cancelled")
pdf.body_text("Priority levels: high, medium, low")

# Mode 5: MCP Tool Mode
pdf.add_page()
pdf.chapter_title("5. MCP (Model Context Protocol) Tool Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "Access to specialized tools through the Model Context Protocol, enabling integration with external services and systems."
)
pdf.chapter_subtitle("Available MCP Tools")
pdf.chapter_subtitle("A. Browser and Web Tools")
pdf.bullet_point("webfetch - Fetch web content (text, markdown, HTML)")
pdf.bullet_point("websearch - Real-time web search via Exa AI")
pdf.bullet_point("browser - Browser automation via Puppeteer")
pdf.bullet_point("playwright - Modern browser automation")
pdf.chapter_subtitle("B. Database Tools")
pdf.bullet_point("Database MCP servers (PostgreSQL, SQLite)")
pdf.bullet_point("Direct SQL query execution")
pdf.bullet_point("Connection to localhost:127.0.0.1")
pdf.chapter_subtitle("C. Development Tools")
pdf.bullet_point("GitHub MCP - Repository management")
pdf.bullet_point("Filesystem MCP - File operations")
pdf.bullet_point("Figma MCP - Design integration")
pdf.bullet_point("Context7 MCP - Documentation search")
pdf.chapter_subtitle("D. Communication Tools")
pdf.bullet_point("Gmail MCP - Email operations")
pdf.bullet_point("Google Drive MCP - File storage")
pdf.bullet_point("Google Workspace MCP - Suite integration")
pdf.bullet_point("YouTube MCP - Video management")

# Mode 6: Planning and Strategy Mode
pdf.chapter_title("6. Planning and Strategy Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "Systematic planning and architectural design for complex projects. Creates structured roadmaps with milestones and deliverables."
)
pdf.chapter_subtitle("Planning Tools")
pdf.bullet_point("superpowers-plan - Systematic planning framework")
pdf.bullet_point("superpowers-brainstorm - Deep analysis and ideation")
pdf.bullet_point("superpowers-execute-plan - Step-by-step execution")
pdf.chapter_subtitle("Deliverables")
pdf.bullet_point("Project timelines and milestones")
pdf.bullet_point("Resource allocation plans")
pdf.bullet_point("Risk assessment and mitigation")
pdf.bullet_point("Technical architecture diagrams")

# Mode 7: Knowledge Base Mode
pdf.add_page()
pdf.chapter_title("7. Knowledge Base Integration Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "Import and manage research findings, documents, and data into structured knowledge bases for retrieval and analysis."
)
pdf.chapter_subtitle("Knowledge Base Import")
pdf.bullet_point("Qdrant vector database integration")
pdf.bullet_point("File-based knowledge storage")
pdf.bullet_point("Document chunking and embedding")
pdf.bullet_point("Metadata tagging and organization")
pdf.chapter_subtitle("Supported Formats")
pdf.bullet_point("Markdown (.md)")
pdf.bullet_point("JSON data files")
pdf.bullet_point("PDF documents (read capability)")
pdf.bullet_point("CSV/Excel spreadsheets")
pdf.bullet_point("Text files")

# Mode 8: System Integration Mode
pdf.chapter_title("8. System Integration Mode")
pdf.chapter_subtitle("Overview")
pdf.body_text(
    "Integration with external systems, servers, and services through SSH, APIs, and direct connections."
)
pdf.chapter_subtitle("Connection Methods")
pdf.bullet_point("SSH connections to remote servers")
pdf.bullet_point("SiteGround hosting integration")
pdf.bullet_point("WordPress admin access")
pdf.bullet_point("Database direct connections")
pdf.bullet_point("API endpoint interactions")
pdf.chapter_subtitle("Current Active Connections")
pdf.bullet_point("Candid Studios Portal (portal.candidstudios.net)")
pdf.bullet_point("ModalityVector.com (Cloudflare R2)")
pdf.bullet_point("SiteGround hosting environments")
pdf.bullet_point("Local development servers")

# Special Capabilities
pdf.add_page()
pdf.chapter_title("9. Specialized Capabilities")
pdf.chapter_subtitle("A. PDF Operations")
pdf.bullet_point("Read PDF files (PyPDF2 installed)")
pdf.bullet_point("Extract text and metadata")
pdf.bullet_point("Generate PDF reports (fpdf2)")
pdf.bullet_point("Multi-page document processing")
pdf.chapter_subtitle("B. Web Development")
pdf.bullet_point("WordPress development and customization")
pdf.bullet_point("Elementor template creation")
pdf.bullet_point("ACF (Advanced Custom Fields) configuration")
pdf.bullet_point("Schema markup implementation")
pdf.bullet_point("SEO optimization")
pdf.chapter_subtitle("C. Database Management")
pdf.bullet_point("MySQL/PostgreSQL administration")
pdf.bullet_point("Query optimization")
pdf.bullet_point("Data migration and import")
pdf.bullet_point("Backup and restoration")
pdf.chapter_subtitle("D. Automation and Scripting")
pdf.bullet_point("Custom automation scripts")
pdf.bullet_point("Scheduled task creation")
pdf.bullet_point("Data processing pipelines")
pdf.bullet_point("File system automation")

# Command Reference
pdf.chapter_title("10. Quick Command Reference")
pdf.chapter_subtitle("Research Commands")
pdf.bullet_point('"Activate deep research on [URL]" - Start web research')
pdf.bullet_point('"Research [topic] thoroughly" - Comprehensive research')
pdf.bullet_point('"Import to knowledge base" - Save research findings')
pdf.chapter_subtitle("Code Commands")
pdf.bullet_point('"Write [type] code for [purpose]" - Code generation')
pdf.bullet_point('"Debug this code" - Troubleshooting')
pdf.bullet_point('"Refactor [file]" - Code improvement')
pdf.chapter_subtitle("Task Commands")
pdf.bullet_point('"Create a todo list for [project]" - Task planning')
pdf.bullet_point('"Execute plan for [task]" - Multi-step execution')
pdf.bullet_point('"Check status" - Review task progress')

# Active Projects
pdf.add_page()
pdf.chapter_title("11. Currently Active Projects")
pdf.chapter_subtitle("A. Candid Studios Website Redevelopment")
pdf.body_text("Scope: 600+ pages, 14 cities, 200+ venues")
pdf.bullet_point("16-week timeline with 25 specialized agents")
pdf.bullet_point("SEO architecture: 306 to 111 pages")
pdf.bullet_point("8 CSV master files for WordPress import")
pdf.bullet_point("Deep research agent configured and tested")
pdf.bullet_point("PyPDF2 installed for document processing")
pdf.chapter_subtitle("B. VidiSmart Tech Stack Application")
pdf.bullet_point("Interactive 3D visualization with Three.js")
pdf.bullet_point("Tech stack recommendation system")
pdf.bullet_point("Static site deployment ready")

# Conclusion
pdf.chapter_title("12. Summary and Next Steps")
pdf.body_text(
    "OpenCode AI operates through multiple interconnected modes, each designed for specific task types. The system is currently configured with Deep Research Mode active and ready for comprehensive web research tasks."
)
pdf.body_text(
    "All capabilities are accessible through natural language commands, with automatic mode selection based on task requirements. The system maintains context across sessions through project files and documentation."
)
pdf.chapter_subtitle("Immediate Availability")
pdf.bullet_point("Deep Research Mode - Active and tested")
pdf.bullet_point("PDF Processing - PyPDF2 and fpdf2 installed")
pdf.bullet_point("Browser Automation - Playwright configured")
pdf.bullet_point("Code Development - All languages supported")
pdf.bullet_point("Task Management - Todo system ready")
pdf.bullet_point("MCP Tools - 14+ servers available")

# Footer
pdf.ln(10)
pdf.set_font("helvetica", "I", 8)
pdf.set_text_color(100, 100, 100)
pdf.cell(
    0,
    5,
    "OpenCode AI Capabilities Report - Confidential",
    new_x="LMARGIN",
    new_y="NEXT",
    align="C",
)
pdf.cell(
    0,
    5,
    "Generated for Candid Studios and VidiSmart Projects",
    new_x="LMARGIN",
    new_y="NEXT",
    align="C",
)

# Save PDF
output_path = "/mnt/m/code/vidismart/opencode_capabilities_report.pdf"
pdf.output(output_path)
print(f"✅ PDF Report created successfully!")
print(f"📄 Location: {output_path}")
print(f"📊 Total Pages: {pdf.page_no()}")
