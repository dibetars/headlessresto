'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Typed API wrapper for the NestJS backend.
 * Automatically injects auth headers + tenant context.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & {
    orgId?: string;
    locationId?: string;
    accessToken?: string;
  } = {},
): Promise<T> {
  const { orgId, locationId, accessToken, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (orgId) headers['x-organization-id'] = orgId;
  if (locationId) headers['x-location-id'] = locationId;

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error ${res.status}`);
  }

  return res.json();
}
