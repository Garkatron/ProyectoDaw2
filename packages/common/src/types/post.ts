export enum PostStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export interface Post {
  id: number,
  user_id: number,
  title: string,
  content: string,
  status: PostStatus,
  created_at: string,
  updated_at: string,
}