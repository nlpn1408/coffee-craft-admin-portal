import { Tag, NewTag } from "@/types"; // Assuming NewTag will be defined in types/api.ts
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

// Define a type for the expected response structure for getTags
interface GetTagsResponse {
  data: Tag[];
  total: number;
  // Add other pagination/metadata fields if your API returns them
}

// Define a type for the query parameters for getTags
interface GetTagsQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const tagService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTags: build.query<GetTagsResponse, GetTagsQueryArgs | void>({
      query: (params) => ({
        url: API_ENDPOINTS.TAGS, // Assuming '/tags' is the endpoint
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Tags" as const, id })),
              { type: "Tags", id: "LIST" },
            ]
          : [{ type: "Tags", id: "LIST" }],
    }),
    getTag: build.query<Tag, string>({
      query: (id) => `${API_ENDPOINTS.TAGS}/${id}`,
      providesTags: (result, error, id) => [{ type: "Tags", id }],
    }),
    createTag: build.mutation<Tag, NewTag>({
      query: (body) => ({
        url: API_ENDPOINTS.TAGS,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tags", id: "LIST" }],
    }),
    updateTag: build.mutation<Tag, { id: string; body: Partial<NewTag> }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.TAGS}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tags", id },
        { type: "Tags", id: "LIST" },
      ],
    }),
    deleteTag: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.TAGS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Tags", id },
        { type: "Tags", id: "LIST" },
        { type: "Products", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetTagQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagService;
