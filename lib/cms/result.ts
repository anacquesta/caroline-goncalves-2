import type { Store } from "./seed";
export type ApiResult = {
  error: string;
  url: string;
  configured: boolean;
  authenticated: boolean;
  store: Store;
  settings: Record<string, string>;
  messages: {
    id: string;
    name: string;
    email: string;
    company: string;
    subject: string;
    message: string;
    created_at: string;
  }[];
};
export async function readResult(response: Response): Promise<ApiResult> {
  return (await response.json()) as ApiResult;
}
