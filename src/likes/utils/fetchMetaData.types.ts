export interface IYoutubeMeta {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
}
export interface ITwitterMeta {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height?: any;
  type: string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
}