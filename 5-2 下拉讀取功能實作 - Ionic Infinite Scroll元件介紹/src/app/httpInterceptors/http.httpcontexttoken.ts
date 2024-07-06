import { HttpContextToken } from '@angular/common/http';

/**
 * 用於跳過自動加入 Bearer Token Auth Header 的 HttpContextToken
 * @type {HttpContextToken<boolean>}
 */
export const SKIP_ADD_BEARER_TOKEN_AUTH_HEADER: HttpContextToken<boolean> =
  new HttpContextToken<boolean>(() => false);

/**
 * 用於跳過自動加入 OpenAI Beta Header 的 HttpContextToken
 * @type {HttpContextToken<boolean>}
 */
export const SKIP_ADD_OPENAI_BETA_HEADER: HttpContextToken<boolean> =
  new HttpContextToken<boolean>(() => false);

/**
 * 用於跳過自動加入 OpenAI BaseUrl 的 HttpContextToken
 * @type {HttpContextToken<boolean>}
 */
export const SKIP_ADD_OPENAI_BASE_URL: HttpContextToken<boolean> =
  new HttpContextToken<boolean>(() => false);
