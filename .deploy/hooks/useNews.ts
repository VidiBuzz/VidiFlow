"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NewsCard } from "@/components/NewsCard";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  published_date: string;
  thumbnail?: string;
  video_content?: string;
  category: string;
  views?: number;
}

export function useNews(options?: { category?: string; limit?: number }) {
  return useQuery({
    queryKey: ["news", options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.category) params.set("category", options.category);
      if (options?.limit) params.set("limit", options.limit.toString());
      
      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      
      const data = await response.json();
      return data.data as NewsArticle[];
    },
  });
}

export function useNewsAggregation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topics: string[]) => {
      const response = await fetch("/api/news/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, limit: 20 }),
      });
      if (!response.ok) throw new Error("Failed to aggregate news");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate news cache to show new articles
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useSearch() {
  return useMutation({
    mutationFn: async ({ query, type = "hybrid" }: { query: string; type?: string }) => {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type }),
      });
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
  });
}

export function useVideoGeneration() {
  return useMutation({
    mutationFn: async ({ title, script, style }: { title: string; script: string; style?: string }) => {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, script, style }),
      });
      if (!response.ok) throw new Error("Failed to generate video");
      return response.json();
    },
  });
}

// Hook for real-time video generation status
export function useVideoJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["video-job", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await fetch(`/api/video/generate?jobId=${jobId}`);
      if (!response.ok) throw new Error("Failed to check job status");
      return response.json();
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Stop polling when complete
      const status = (query as any)?.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 5000; // Poll every 5 seconds
    },
  });
}
