import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Fallback data when Supabase table doesn't exist
const FALLBACK_CASE_STUDIES = [
  {
    id: "1",
    slug: "contractor-appointments",
    title: "How Contractor Appointments Books $134M with AI Automation",
    company_name: "Contractor Appointments",
    category: "professional-services",
    industry: "Professional Services",
    roi: "383%",
    roi_percentage: "383%",
    timeline: "90 days",
    problem: "With lead volumes growing to hundreds per day, manually handling after-hours replies and nurturing long-tail leads was impossible.",
    problem_description: "With lead volumes growing to hundreds per day, manually handling after-hours replies and nurturing long-tail leads was impossible. They were losing potential business because no one saw late-night SMS replies in time.",
    solution: "Built AI-powered scheduler using Zapier + OpenAI that automatically parses messages, checks contractor availability, and books appointments.",
    solution_description: "Built AI-powered scheduler using Zapier + OpenAI. When a homeowner responds via text, a Zap kicks off an AI workflow that parses the message, checks contractor availability, and books the appointment automatically.",
    results: "$134M in client revenue. 80-90% of leads handled automatically. 20-50 additional appointments booked daily.",
    results_description: "$134M in client revenue attributed to Zapier-powered flows. 80-90% of top-of-funnel lead replies handled automatically. 20-50 additional appointments booked daily. $300K incremental annual revenue from nurturing.",
    source_url: "https://zapier.com/blog/contractor-appointments-books-millions-with-ai-automation/",
    thumbnail: "/images/case-studies/contractor-appointments.png",
    thumbnail_url: "/images/case-studies/contractor-appointments.png",
    published_date: "2026-02-09",
    company_size: "11-50 employees",
    annual_revenue: "$134M client revenue",
    revenue: "$134M client revenue",
    budget: "$35K",
    investment_amount: "$35K",
    description: "Minnesota-based Contractor Appointments uses Zapier + OpenAI to handle 90% of leads automatically.",
    video_url: null,
    video_content: null,
    location: "Minnesota",
    employee_count: 35,
    tags: ["AI", "Zapier", "OpenAI", "Lead Generation"],
    key_metrics: { "Daily Appointments": "20-50", "Lead Automation": "80-90%", "Incremental Revenue": "$300K" },
    published: true
  },
  {
    id: "2",
    slug: "healthie",
    title: "Healthie Saves 60+ Hours Weekly with AI Agents",
    company_name: "Healthie",
    category: "healthcare",
    industry: "Healthcare SaaS",
    roi: "714%",
    roi_percentage: "714%",
    timeline: "60 days",
    problem: "Healthcare platform serving 40,000+ providers needed to scale without scaling headcount. Manual coaching and churn detection ate resources.",
    problem_description: "Healthcare platform serving 40,000+ providers needed to scale operations without scaling headcount. Manual sales coaching, call summaries, and churn detection were eating team resources.",
    solution: "Deployed AI agents for call coaching and summaries, weekly churn detection, and async QBR feedback aggregation.",
    solution_description: "Deployed AI agents for call coaching and summaries (Zoom → Salesforce → Slack), weekly churn detection across multiple systems, and async QBR feedback aggregation.",
    results: "60+ hours saved per week. Proactive churn prevention. Async product alignment.",
    results_description: "60+ hours saved per week across Sales and CS. Proactive churn prevention with weekly health insights. Async product alignment - no meetings required.",
    source_url: "https://zapier.com/blog/healthie-saves-60-hours-per-week-with-ai-agents/",
    thumbnail: "/images/case-studies/healthie-logo.svg",
    thumbnail_url: "/images/case-studies/healthie-logo.svg",
    published_date: "2026-02-02",
    company_size: "45 employees",
    annual_revenue: "$8.5M annual",
    revenue: "$8.5M annual",
    budget: "$28K",
    investment_amount: "$28K",
    description: "Healthcare platform automates onboarding, support, and operations with Zapier AI agents.",
    video_url: null,
    video_content: null,
    location: "New York",
    employee_count: 45,
    tags: ["AI Agents", "Healthcare", "Zapier"],
    key_metrics: { "Hours Saved Weekly": "60+", "Team Members": "20+", "Payback": "60 days" },
    published: true
  },
  {
    id: "3",
    slug: "grammarly",
    title: "Grammarly Scales Operations with Zapier",
    company_name: "Grammarly",
    category: "professional-services",
    industry: "SaaS",
    roi: "444%",
    roi_percentage: "444%",
    timeline: "90 days",
    problem: "Marketing ops had broken lead sync. Support ops had manual data entry. Both teams needed automation without engineering.",
    problem_description: "Marketing ops had broken lead sync between LinkedIn and CRM. Support ops had manual data entry and slow dev escalations. Both teams needed automation without engineering support.",
    solution: "Built Zapier workflows for CRM sync, automated compliance, and instant data transfer with automated escalation.",
    solution_description: "Built Zapier workflows for LinkedIn → CRM sync with error handling, automated opt-out compliance, Intercom tagging, and automated dev escalation pipeline.",
    results: "87% reduction in sync errors. 31% improvement in efficiency. 6 hours/day saved.",
    results_description: "87% reduction in sync errors. 31% improvement in plan efficiency. 6 hours/day saved for support team. 90%+ CSAT from faster resolution.",
    source_url: "https://zapier.com/blog/grammarly-scales-operations-with-zapier/",
    thumbnail: "/images/case-studies/grammarly.png",
    thumbnail_url: "/images/case-studies/grammarly.png",
    published_date: "2026-01-29",
    company_size: "900+ employees",
    annual_revenue: "$200M+ annual",
    revenue: "$200M+ annual",
    budget: "$45K",
    investment_amount: "$45K",
    description: "Grammarly uses Zapier to automate workflows across marketing and support.",
    video_url: null,
    video_content: null,
    location: "San Francisco, CA",
    employee_count: 900,
    tags: ["Zapier", "Marketing Ops", "Support Ops"],
    key_metrics: { "Sync Error Reduction": "87%", "Efficiency Gain": "31%", "Daily Hours Saved": "6" },
    published: true
  },
  {
    id: "4",
    slug: "payless-kitchen-bath",
    title: "Payless Kitchen & Bath Books 14 More Demos Weekly",
    company_name: "Payless Kitchen & Bath",
    category: "remodeling",
    industry: "Home Remodeling",
    roi: "287%",
    roi_percentage: "287%",
    timeline: "55 days",
    problem: "Disconnected communication tools. Lead volume too high to follow up manually.",
    problem_description: "Disconnected tools for SMS, email, and voicemail. New CRM needed seamless integration. Lead volume too high to follow up manually.",
    solution: "Implemented Hatch for unified communications with native CRM integration and automated cadences.",
    solution_description: "Implemented Hatch for unified communications with native LeadPerfection integration. Automated cadences across 9+ lead sources with dedicated chat team.",
    results: "14 more demos/week. 8X faster replies. Better ROI from existing leads.",
    results_description: "14 more demos booked per week. 8X faster reply times (33 min → 4 min). Better ROI from existing lead volume. 24/7 speed to lead coverage.",
    source_url: "https://www.usehatchapp.com/testimonials/payless",
    thumbnail: "/images/case-studies/payless-hatch.png",
    thumbnail_url: "/images/case-studies/payless-hatch.png",
    published_date: "2026-02-06",
    company_size: "28 employees",
    annual_revenue: "$12M annual",
    revenue: "$12M annual",
    budget: "$31K",
    investment_amount: "$31K",
    description: "California remodeler increases demos 8-14 per week with AI communication automation.",
    video_url: null,
    video_content: null,
    location: "Glendale, California",
    employee_count: 28,
    tags: ["Hatch", "SMS", "Lead Follow-up"],
    key_metrics: { "Extra Demos Weekly": "14", "Reply Speed": "8X faster", "Lead Sources": "9+" },
    published: true
  },
  {
    id: "5",
    slug: "inx-international",
    title: "INX International Increases Production 40% with Process AI",
    company_name: "INX International Ink Co.",
    category: "manufacturing",
    industry: "Manufacturing",
    roi: "482%",
    roi_percentage: "482%",
    timeline: "6 months",
    problem: "Legacy workforce challenges. Limited data access. Reactive operations.",
    problem_description: "Legacy workforce with retiring experienced staff. Limited access to MES data. Reactive rather than proactive operations. Performance fluctuations without root cause visibility.",
    solution: "Implemented Oden's Factory Analytics for downtime categorization and Process AI for real-time operator recommendations.",
    solution_description: "Implemented Oden's Factory Analytics for downtime categorization, then Process AI for real-time operator recommendations with predictive quality models.",
    results: "+21.4% OEE. +20.5% performance. 5x ROI in 6 months.",
    results_description: "+21.4% OEE increase. +20.5% performance. +11% availability. 5x ROI in 6 months. Moved from 24/7 to 24/5 schedule.",
    source_url: "https://oden.io/inx-process-ai-success-story/",
    thumbnail: "/images/case-studies/inx-international-logo.png",
    thumbnail_url: "/images/case-studies/inx-international-logo.png",
    published_date: "2026-02-05",
    company_size: "1,200 employees",
    annual_revenue: "$580M annual",
    revenue: "$580M annual",
    budget: "$85K",
    investment_amount: "$85K",
    description: "Global ink manufacturer achieves 5x ROI with AI-powered process optimization.",
    video_url: null,
    video_content: null,
    location: "Illinois",
    employee_count: 1200,
    tags: ["Manufacturing", "Oden", "Process AI"],
    key_metrics: { "OEE Increase": "+21.4%", "Performance Gain": "+20.5%", "ROI": "5x" },
    published: true
  },
  {
    id: "6",
    slug: "smith-ai",
    title: "Smith.ai Saves 250+ Hours Weekly with AI Call Analysis",
    company_name: "Smith.ai",
    category: "professional-services",
    industry: "Virtual Receptionist",
    roi: "650%",
    roi_percentage: "650%",
    timeline: "90 days",
    problem: "Manual call review across 5,000 weekly calls was impossible.",
    problem_description: "Manual call review across 5,000 weekly calls was impossible. Quality assurance suffered without consistent feedback.",
    solution: "Built Zapier workflow for AI call analysis with automated scoring and Slack coaching.",
    solution_description: "Built Zapier workflow to automatically process all calls through AI analysis, generate scores, and deliver coaching feedback via Slack.",
    results: "5,000 calls reviewed weekly. 250+ hours saved.",
    results_description: "5,000 calls reviewed weekly (was manual). 250+ hours saved per week. Consistent quality scores. Automated coaching feedback.",
    source_url: "https://www.cuspera.com/products/zapier-x-11031/customer-story",
    thumbnail: "/images/case-studies/smith-ai-logo.svg",
    thumbnail_url: "/images/case-studies/smith-ai-logo.svg",
    published_date: "2026-02-04",
    company_size: "150 employees",
    annual_revenue: "$18M annual",
    revenue: "$18M annual",
    budget: "$24K",
    investment_amount: "$24K",
    description: "AI receptionist company automates call quality review, saving 250+ hours weekly.",
    video_url: null,
    video_content: null,
    location: "California",
    employee_count: 150,
    tags: ["AI", "Call Analysis", "Zapier"],
    key_metrics: { "Calls Reviewed Weekly": "5,000", "Hours Saved Weekly": "250+", "ROI": "650%" },
    published: true
  },
  {
    id: "7",
    slug: "lapp",
    title: "LAPP Processes 350K+ Orders Annually with AI Document Automation",
    company_name: "LAPP",
    category: "manufacturing",
    industry: "Manufacturing",
    roi: "380%",
    roi_percentage: "380%",
    timeline: "12 months",
    problem: "350,000+ manual orders annually. 40,000+ product items made processing complex.",
    problem_description: "350,000+ manual orders annually across EMEA. 40,000+ product items made accurate processing complex. Manual entry was slow and error-prone.",
    solution: "Implemented Rossum AI for intelligent order processing with ERP integration.",
    solution_description: "Implemented Rossum AI for order processing with intelligent parsing, address validation, urgent order detection, and ERP integration.",
    results: "94.9% data field accuracy. Most orders fully automated.",
    results_description: "94.9% data field accuracy. Most orders now fully automated. One person manages entire interface. Faster, more accurate processing.",
    source_url: "https://rossum.ai/customer-stories/lapp",
    thumbnail: "/images/case-studies/lapp.png",
    thumbnail_url: "/images/case-studies/lapp.png",
    published_date: "2026-02-03",
    company_size: "2,100 employees",
    annual_revenue: "$1.2B annual",
    revenue: "$1.2B annual",
    budget: "$125K",
    investment_amount: "$125K",
    description: "German cable manufacturer automates order processing for 350K+ annual orders.",
    video_url: null,
    video_content: null,
    location: "Germany",
    employee_count: 2100,
    tags: ["Manufacturing", "Rossum", "Document AI"],
    key_metrics: { "Data Accuracy": "94.9%", "Annual Orders": "350K+", "Product Items": "40K+" },
    published: true
  },
  {
    id: "8",
    slug: "midwest-logistics",
    title: "MidWest Logistics Saves $1.7M with AI Predictive Maintenance",
    company_name: "MidWest Logistics",
    category: "logistics",
    industry: "Logistics",
    roi: "4,047%",
    roi_percentage: "4,047%",
    timeline: "18 months",
    problem: "$2.3M in losses from equipment failures. 450-truck fleet with constant downtime.",
    problem_description: "$2.3M in losses from equipment failures. 450-truck fleet facing constant unplanned downtime. Reactive maintenance wasn't sustainable.",
    solution: "Implemented AI predictive maintenance to monitor fleet health and predict failures.",
    solution_description: "Implemented AI predictive maintenance system to monitor fleet health, predict failures before they occur, and optimize maintenance scheduling.",
    results: "73% reduction in downtime. $1.7M saved.",
    results_description: "73% reduction in unplanned downtime. $1.7M saved. 4,047% ROI over 18 months. Predictive alerts prevented major failures.",
    source_url: "https://oxmaint.com/case-study/post/how-a-logistics-company-reduced-downtime-with-ai-powered-maintenance",
    thumbnail: null,
    thumbnail_url: null,
    published_date: "2026-02-08",
    company_size: "450 truck fleet",
    annual_revenue: "$85M annual",
    revenue: "$85M annual",
    budget: "$42K",
    investment_amount: "$42K",
    description: "Major logistics company slashes downtime 73% with AI predictive maintenance.",
    video_url: null,
    video_content: null,
    location: "Midwest USA",
    employee_count: 450,
    tags: ["Logistics", "Predictive Maintenance", "AI"],
    key_metrics: { "Downtime Reduction": "73%", "Savings": "$1.7M", "ROI": "4,047%" },
    published: true
  }
];

export async function GET(request: Request) {
  const supabase = getSupabase();
  
  if (supabase) {
    try {
      const { searchParams } = new URL(request.url);
      const industry = searchParams.get('industry');
      const limit = parseInt(searchParams.get('limit') || '50');
      
      let query = supabase
        .from('case_studies')
        .select('*')
        .eq('published', true)
        .order('published_date', { ascending: false })
        .limit(limit);
      
      if (industry && industry !== 'all') {
        query = query.eq('industry', industry);
      }
      
      const { data, error } = await query;
      
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, data });
      }
    } catch (error) {
      console.log('Supabase not ready, using fallback data');
    }
  }
  
  // Return fallback data
  return NextResponse.json({ success: true, data: FALLBACK_CASE_STUDIES });
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('case_studies')
      .insert([body])
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
