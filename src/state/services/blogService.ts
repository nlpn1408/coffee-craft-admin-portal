import { baseApi } from './baseApi';
import { Blog, NewBlog, UpdateBlog } from '@/types'; // Assuming Blog is in index.ts
import { API_ENDPOINTS } from '@/lib/constants/api';

// Define a type for the paginated response
interface PaginatedBlogResponse {
    data: Blog[];
    total: number;
    // Add other pagination fields if your API returns them (e.g., page, limit)
}

// Define query args type for getBlogs
interface GetBlogsQueryArgs {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    active?: boolean; // Optional, Admin/Staff only
    authorId?: string; // Optional filter
}

// Define a service using a base API setup
export const blogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query to get a list of blog posts
        getBlogs: builder.query<PaginatedBlogResponse, GetBlogsQueryArgs>({
            query: (params) => ({
                url: API_ENDPOINTS.BLOGS,
                params, // Pass query parameters
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'Blogs' as const, id })),
                          { type: 'Blogs', id: 'LIST' },
                      ]
                    : [{ type: 'Blogs', id: 'LIST' }],
        }),

        // Query to get a single blog post by ID
        getBlogById: builder.query<Blog, string>({
            query: (id) => `${API_ENDPOINTS.BLOGS}/${id}`,
            providesTags: (result, error, id) => [{ type: 'Blogs', id }],
        }),

        // Mutation to create a new blog post
        createBlog: builder.mutation<Blog, NewBlog>({
            query: (newBlog) => ({
                url: API_ENDPOINTS.BLOGS,
                method: 'POST',
                body: newBlog,
            }),
            invalidatesTags: [{ type: 'Blogs', id: 'LIST' }],
        }),

        // Mutation to update an existing blog post
        updateBlog: builder.mutation<Blog, { id: string } & UpdateBlog>({
            query: ({ id, ...updateData }) => ({
                url: `${API_ENDPOINTS.BLOGS}/${id}`,
                method: 'PUT', // Use PUT as per docs
                body: updateData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Blogs', id }, { type: 'Blogs', id: 'LIST' }],
        }),

        // Mutation to delete a blog post
        deleteBlog: builder.mutation<void, string>({ // Returns 204 No Content
            query: (id) => ({
                url: `${API_ENDPOINTS.BLOGS}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Blogs', id }, { type: 'Blogs', id: 'LIST' }],
        }),
    }),
    overrideExisting: false,
});

// Export hooks for usage in components
export const {
    useGetBlogsQuery,
    useGetBlogByIdQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
} = blogApi;
