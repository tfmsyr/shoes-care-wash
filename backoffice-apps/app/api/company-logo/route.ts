import { NextRequest, NextResponse } from "next/server";

const COMPANY_API_PATH = "/v1/app/companies/manage";

const buildCompanyAssetCandidates = (src?: string | null) => {
  if (!src) return [];
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return [src];

  const cleanSrc = src.trim();
  const normalized = cleanSrc.replace(/\\/g, "/");
  const trimmed = normalized.replace(/^\.?\//, "");
  const withoutPublic = trimmed.replace(/^public\//, "");
  const withoutStorage = trimmed.replace(/^storage\//, "");
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBase) {
    return [
      cleanSrc,
      `/${trimmed}`,
      `/${withoutPublic}`,
      `/storage/${withoutStorage}`,
    ];
  }

  try {
    const apiUrl = new URL(apiBase);
    const origin = apiUrl.origin;
    const apiBaseUrl = apiUrl.toString().replace(/\/+$/, "");
    const apiPath = apiUrl.pathname.replace(/\/+$/, "");
    const apiRoot = `${origin}${apiPath}`;
    const apiParent = apiPath.includes("/")
      ? `${origin}${apiPath.substring(0, apiPath.lastIndexOf("/"))}`
      : origin;

    return Array.from(
      new Set([
        cleanSrc,
        `${origin}/${trimmed}`,
        `${origin}/${withoutPublic}`,
        `${origin}/storage/${withoutStorage}`,
        `${apiRoot}/${trimmed}`,
        `${apiRoot}/${withoutPublic}`,
        `${apiRoot}/storage/${withoutStorage}`,
        `${apiParent}/${trimmed}`,
        `${apiParent}/${withoutPublic}`,
        `${apiParent}/storage/${withoutStorage}`,
        `${apiBaseUrl}/${trimmed}`,
        `${apiBaseUrl}/${withoutPublic}`,
        new URL(cleanSrc, origin).toString(),
        new URL(trimmed, `${apiRoot}/`).toString(),
        new URL(trimmed, `${apiParent}/`).toString(),
      ]),
    );
  } catch {
    return [cleanSrc];
  }
};

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

const buildCompanyProfileUrl = () => {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return "";
  if (apiBase.endsWith("/v1/app")) return `${apiBase}/companies/manage`;
  return `${apiBase}${COMPANY_API_PATH}`;
};

const extractCompanyImageCandidates = (companyData: any) => {
  const rawCandidates = [
    companyData?.logo,
    companyData?.photo,
    companyData?.data?.logo,
    companyData?.data?.photo,
  ].filter(Boolean);

  return rawCandidates.flatMap((value) => buildCompanyAssetCandidates(String(value)));
};

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  const authHeader =
    request.headers.get("authorization") ||
    (process.env.NEXT_PUBLIC_AUTH_TOKEN
      ? `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
      : null);

  let candidates = buildCompanyAssetCandidates(src);

  if (candidates.length === 0) {
    const companyProfileUrl = buildCompanyProfileUrl();

    if (companyProfileUrl) {
      try {
        const companyResponse = await fetch(companyProfileUrl, {
          headers: authHeader
            ? {
                Authorization: authHeader,
                Accept: "application/json",
              }
            : {
                Accept: "application/json",
              },
          cache: "no-store",
        });

        if (companyResponse.ok) {
          const companyJson = await companyResponse.json();
          candidates = extractCompanyImageCandidates(companyJson);
        }
      } catch (error) {
        console.error("company-logo proxy failed to load company profile", error);
      }
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ message: "Missing logo source" }, { status: 400 });
  }

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        headers: authHeader
          ? {
              Authorization: authHeader,
              Accept: "image/*,*/*",
            }
          : {
              Accept: "image/*,*/*",
            },
        cache: "no-store",
      });

      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "image/png";
      const arrayBuffer = await response.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      console.error("company-logo proxy fetch failed:", candidate, error);
    }
  }

  console.error("company-logo proxy could not resolve logo", {
    src,
    candidates,
  });
  return NextResponse.json({ message: "Logo not found" }, { status: 404 });
}
