import { toast } from "react-hot-toast";

interface Response {
  message: string;
  code: number;
  data: Record<string, any>; // 发生错误时，为 {}
}

export async function request<T = any>(
  url: string,
  options?: RequestInit & {
    token?: string;
    alert?: { successMsg?: string; errMsg?: string; silence?: boolean };
  }
): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
        ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    });

    if (!res.ok) {
      const errMsg = `请求失败：${res.status}`;
      toast.error(errMsg);
      throw new Error(errMsg);
    }

    const responseData: Response = await res.json();

    // 成功提示（如果传了 successMsg）
    if (!options?.alert?.silence) {
      if (responseData.code === 200) {
        toast.success(options?.alert?.successMsg || responseData.message);
      } else {
        toast.error(options?.alert?.errMsg || responseData.message);
      }
    }

    return responseData.data as T;
  } catch (error: any) {
    toast.error(error?.message || "请求出错");
    throw error;
  }
}
