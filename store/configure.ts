import { fetchBaseQuery } from "@reduxjs/toolkit/query";

let hasHandledSessionError = false;

export const createBaseQuery = (baseUrl: string) => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      //  headers.set("content-type", "application/json");
      headers.set("accept", "*");

      return headers;
    },
  });
};

export const baseQueryWithReauth = (baseQuery: any) => {
  return async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (
      result.error &&
      (result.error.status === 401 || result.error.status === 429)
    ) {
      handleApiErrors(result.error, api);
    }

    return result;
  };
};

const handleApiErrors = (error: any, api: any) => {
  let errorMessage = "";
  console.log("API error", error, api, errorMessage);

  switch (error.data?.message) {
    case "Invalid Token":
    case "Session expired":
    case "You have been logged out":
    case "Authorization token not found":
      if (!hasHandledSessionError) {
        hasHandledSessionError = true;
        errorMessage = "Your session has expired. Please log in again.";

        window.location.replace("/auth/login");
      }
      break;

    case "ThrottlerException: Too Many Requests":
      errorMessage = "Too many requests. Please try again later.";
      // Display a notification or alert if needed
      break;
    default:
      console.log("Unhandled API error:", error);
      return;
  }
};
