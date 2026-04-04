import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string | null;
  ranking: number;
  trending: boolean;
  new: boolean;
  visits: number;
  pricing: string;
}

interface ToolsResponse {
  success: boolean;
  data: Tool[];
  meta?: any;
}

interface UseToolsOptions {
  category?: string;
  search?: string;
  sort?: string;
  limit?: number;
}

export function useTools(options: UseToolsOptions = {}) {
  return useQuery({
    queryKey: ["tools", options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.category) params.set("category", options.category);
      if (options.search) params.set("q", options.search);
      if (options.sort) params.set("sort", options.sort);
      if (options.limit) params.set("limit", options.limit.toString());

      const response = await fetch(`/api/tools?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tools");
      
      const data: ToolsResponse = await response.json();
      return data.data;
    },
  });
}

export function useInfiniteTools(options: UseToolsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["tools", "infinite", options],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      if (options.category) params.set("category", options.category);
      if (options.search) params.set("q", options.search);
      if (options.sort) params.set("sort", options.sort);
      params.set("limit", "20");
      params.set("offset", (pageParam * 20).toString());

      const response = await fetch(`/api/tools?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tools");
      
      const data: ToolsResponse = await response.json();
      return {
        data: data.data,
        nextPage: data.data.length === 20 ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

export function useToolFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toolId: string) => {
      // In production, this would call your API
      const response = await fetch("/api/tools/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      });
      if (!response.ok) throw new Error("Failed to favorite tool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}

export function useToolSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/tools?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      const data: ToolsResponse = await response.json();
      return data.data;
    },
  });
}
