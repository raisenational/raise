/* eslint-disable no-restricted-imports */
import _axios, {
  AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useEffect, useState } from 'react';
import env from '../env/env';
import { makeClient, routes, Routes } from './generated-api-client';

export interface AuthState {
  accessToken: {
    value: string,
    expiresAt: number,
  },
  refreshToken: {
    value: string,
    expiresAt: number,
  }
  groups: string[],
}

const LS_AUTH_KEY = 'raise_auth';
const getAuthFromLocalStorage = (): AuthState | undefined => {
  const value = typeof localStorage === 'undefined' ? null : localStorage.getItem(LS_AUTH_KEY);
  if (value !== null) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed.accessToken !== 'object') return undefined;
      if (typeof parsed.accessToken.value !== 'string') return undefined;
      if (typeof parsed.accessToken.expiresAt !== 'number') return undefined;
      if (typeof parsed.refreshToken !== 'object') return undefined;
      if (typeof parsed.refreshToken.value !== 'string') return undefined;
      if (typeof parsed.refreshToken.expiresAt !== 'number') return undefined;
      if (parsed.refreshToken.expiresAt < (new Date().getTime() / 1000)) return undefined;
      if (!Array.isArray(parsed.groups)) return undefined;
      if (!parsed.groups.every((g: unknown) => typeof g === 'string')) return undefined;
      return {
        accessToken: {
          value: parsed.accessToken.value,
          expiresAt: parsed.accessToken.expiresAt,
        },
        refreshToken: {
          value: parsed.refreshToken.value,
          expiresAt: parsed.refreshToken.expiresAt,
        },
        groups: parsed.groups,
      };
    } catch {
      // invalid JSON
    }
  }
  return undefined;
};

let authState: AuthState | undefined;
const authStateListeners = new Set<() => void>();
const setAuthState = (newState?: AuthState) => {
  authState = newState;
  try {
    if (newState) {
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(newState));
    } else {
      localStorage.removeItem(LS_AUTH_KEY);
    }
  } catch {
    // no-op
  }
  authStateListeners.forEach((l) => l());
};
let refreshTimeout: NodeJS.Timeout | undefined;
authStateListeners.add(() => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  if (!authState?.accessToken.expiresAt) {
    return;
  }

  refreshTimeout = setTimeout(() => {
    if (authState && authState.refreshToken.expiresAt * 1000 > Date.now()) {
      makeClient(axiosWithDefaults)('post /admin/login/refresh', { refreshToken: authState.refreshToken.value }).then((res) => {
        setAuthState(res.data);
      }).catch((error) => {
        console.error('Failed to refresh tokens', error);
        setAuthState();
      });
    }
  }, Math.max(0, authState.accessToken.expiresAt * 1000 - Date.now() - 10_000));
});
setAuthState(getAuthFromLocalStorage());

export const useAuthState = () => {
  const [state, setState] = useState(authState);
  useEffect(() => {
    const listener = () => {
      setState(authState);
    };
    authStateListeners.add(listener);
    listener();
    return () => { authStateListeners.delete(listener); };
  }, []);
  return [state, setAuthState] as const;
};

const defaultConfig: AxiosRequestConfig = {
  baseURL: env.API_BASE_URL,
  timeout: 60000,
};

const logoutOnTokenExpiry = (err: unknown) => {
  if (typeof err === 'object' && err !== null && 'isAxiosError' in err) {
    const axiosError = err as AxiosError;
    if (axiosError.response?.status === 401 && typeof axiosError.response?.data?.message === 'string' && axiosError.response.data.message.startsWith('Token expired')) {
      setAuthState();
      // eslint-disable-next-line no-alert
      setTimeout(() => alert('You have been logged out as the server indicated your access token has expired.'), 100);
    }
  }
  return Promise.reject(err);
};

const axiosWithDefaults = setupCache(_axios.create(defaultConfig), { interpretHeader: false });
axiosWithDefaults.interceptors.response.use(undefined, logoutOnTokenExpiry);

export interface ResponseValues<Result, RequestData, ErrorResult = unknown> {
  data?: Result,
  loading: boolean,
  error?: AxiosError<ErrorResult, RequestData>,
  response?: AxiosResponse<Result, RequestData>,
}

type UseReqCoreResult<
  Route extends keyof Routes,
  RequestData extends Routes[Route]['request'],
  Params extends Routes[Route]['params'],
  Result extends Routes[Route]['response'],
  ErrorResult,
  RefetchArgs extends [] | [
    ...Params extends null ? [] : [params: Params],
    ...RequestData extends null ? [] : [data: RequestData],
  ] = [] | [
    ...Params extends null ? [] : [params: Params],
    ...RequestData extends null ? [] : [data: RequestData],
  ],
> = [
  ResponseValues<Result, RequestData, ErrorResult>,
  (...args: RefetchArgs) => Promise<AxiosResponse<Result>>,
];

export type UseReqResult<
  Route extends keyof Routes,
  RequestData extends Routes[Route]['request'],
  Params extends Routes[Route]['params'],
  Result extends Routes[Route]['response'],
  ErrorResult = unknown> = UseReqCoreResult<Route, RequestData, Params, Result, ErrorResult, [] | [
    ...Params extends null ? [] : [params: Params],
    ...RequestData extends null ? [] : [data: RequestData],
  ]>;

export type UseManualReqResult<
  Route extends keyof Routes,
  RequestData extends Routes[Route]['request'],
  Params extends Routes[Route]['params'],
  Result extends Routes[Route]['response'],
  ErrorResult = unknown> = UseReqCoreResult<Route, RequestData, Params, Result, ErrorResult, [
    ...Params extends null ? [] : [params: Params],
    ...RequestData extends null ? [] : [data: RequestData],
  ]>;

export interface UseReqOptions {
  manual?: boolean,
}

export const useManualReq = <
  Route extends keyof Routes,
  RequestData extends Routes[Route]['request'],
  Params extends Routes[Route]['params'],
  Result extends Routes[Route]['response'],
  ErrorResult = unknown,
>(
    route: Route,
    ...argArr: [
      ...[options?: UseReqOptions & { manual: true }],
    ]
  ): UseManualReqResult<Route, RequestData, Params, Result, ErrorResult> => useReqCore(route, { options: { ...argArr[0], manual: true } });

export const useReq = <
  Route extends keyof Routes,
  RequestData extends Routes[Route]['request'],
  Params extends Routes[Route]['params'],
  Result extends Routes[Route]['response'],
  ErrorResult = unknown,
>(
    route: Route,
    ...argArr: [
      ...Params extends null ? [] : [params: Params],
      ...RequestData extends null ? [] : [data: RequestData],
      ...[options?: UseReqOptions],
    ]
  ): UseReqResult<Route, RequestData, Params, Result, ErrorResult> => useReqCore(route, convertArgsToObj(routes[route], argArr));

const useReqCore = <
  Route extends keyof Routes,
  RequestData extends Routes[Route]['request'],
  Params extends Routes[Route]['params'],
  Result extends Routes[Route]['response'],
  ErrorResult = unknown,
>(route: Route, args: {
    params?: Params extends null ? Record<string, never> : Params,
    data?: RequestData extends null ? undefined : RequestData,
    options: UseReqOptions,
  }): UseReqCoreResult<Route, RequestData, Params, Result, ErrorResult> => {
  // Hack for Gatsby SSR so that dynamic components appear to be loading
  if (typeof window === 'undefined') {
    return [{
      loading: true,
    }, () => Promise.reject()];
  }

  const [auth] = useAuthState();

  const config: AxiosRequestConfig<RequestData> = {
    method: routes[route].method,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    url: args.params ? routes[route].makePath(args.params as any) : undefined,
    data: args.data,
    ...(auth?.accessToken.value ? {
      headers: {
        Authorization: `Bearer ${auth.accessToken.value}`,
      },
    } : {}),
  };

  const [data, setData] = useState<Result | undefined>(undefined);
  const [response, setResponse] = useState<AxiosResponse<Result, RequestData> | undefined>(undefined);
  const [error, setError] = useState<AxiosError<ErrorResult, RequestData> | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (bypassCache?: boolean, ...overrideArgsArr: [] | [
    ...Params extends null ? [] : [params: Params],
    ...RequestData extends null ? [] : [data: RequestData],
  ]): Promise<AxiosResponse<Result, RequestData>> => {
    const overrideArgs = isEmpty(overrideArgsArr) ? undefined : convertArgsToObj(routes[route], overrideArgsArr);

    setLoading(true);
    const p = axiosWithDefaults.request({
      ...config,
      ...(overrideArgs ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        url: routes[route].makePath(overrideArgs.params as any),
        data: overrideArgs.data,
      } : undefined),
      ...(bypassCache ? {
        cache: {
          override: true,
        },
      } : {}),
    });
    try {
      const r = await p;
      setResponse(r);
      setData(r.data);
    } catch (err) {
      setError(err as AxiosError<ErrorResult, RequestData>);
    } finally {
      setLoading(false);
    }
    return p;
  };

  useEffect(() => {
    if (!args.options.manual) {
      fetchData();
    }
  }, []); // execute once only

  return [{
    data, loading, error, response,
  }, (...a) => fetchData(true, ...a)];
};

const isEmpty = <T>(arg: T[]): arg is [] => arg.length === 0;

const convertArgsToObj = <
  Route extends keyof Routes,
  RequestData extends Routes[Route]['request'],
  Params extends Routes[Route]['params']>(route: typeof routes[keyof typeof routes], args: [
    ...Params extends null ? [] : [params: Params],
    ...RequestData extends null ? [] : [data: RequestData],
    ...([] | [options?: UseReqOptions]),
  ]): {
    params: Params extends null ? Record<string, never> : Params,
    data: RequestData extends null ? undefined : RequestData,
    options: UseReqOptions,
  } => {
  const paramsIndex = route.hasParams ? 0 : null;
  const params = (paramsIndex === null ? {} : args[paramsIndex]) as Params extends null ? Record<string, never> : Params;
  // eslint-disable-next-line no-nested-ternary
  const dataIndex = route.hasRequest ? (route.hasParams ? 1 : 0) : null;
  const data = (dataIndex === null ? undefined : args[dataIndex]) as RequestData extends null ? undefined : RequestData;
  // eslint-disable-next-line no-nested-ternary
  const optionsIndexIfPresent = route.hasRequest ? (route.hasParams ? 2 : 1) : (route.hasParams ? 1 : 0);
  const options = (args[optionsIndexIfPresent] ?? {}) as UseReqOptions;

  return {
    params, data, options,
  };
};

export const useRawReq = () => makeClient(useRawAxios());

export const useRawAxios = (): AxiosInstance => {
  const [auth] = useAuthState();
  if (auth?.accessToken.value) {
    const axios = _axios.create({
      ...defaultConfig,
      headers: {
        ...defaultConfig.headers,
        Authorization: `Bearer ${auth.accessToken.value}`,
      },
    });
    axios.interceptors.response.use(undefined, logoutOnTokenExpiry);

    return axios;
  }

  return axiosWithDefaults;
};

export const asResponseValues = <TResponse, TBody, TError>(item: TResponse | undefined, inheritFrom: ResponseValues<unknown, TBody, TError>): ResponseValues<TResponse, TBody, TError> => ({
  data: item ?? undefined,
  loading: inheritFrom.loading,
  error: inheritFrom.error,
  response: inheritFrom.response === undefined || item === undefined || item === null ? undefined : {
    data: item,
    status: inheritFrom.response.status,
    statusText: inheritFrom.response.statusText,
    headers: inheritFrom.response.headers,
    config: inheritFrom.response.config,
    request: inheritFrom.response.request,
  },
});
