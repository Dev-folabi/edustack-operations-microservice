import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getEnvironment } from "../../functions/environment";
import { edustackAPIRequestType } from "../../types/request";
import dotenv from "dotenv";

dotenv.config();

const environment = getEnvironment();

export const getAuthURL = () => {
  switch (environment) {
    case "local":
      return (
        process.env.DEV_AUTH_URI || throwError("DEV_AUTH_URI is not defined")
      );
    case "staging":
      return (
        process.env.STAGING_AUTH_URI ||
        throwError("STAGING_AUTH_URI is not defined")
      );
    case "production":
      return (
        process.env.LIVE_AUTH_URI || throwError("LIVE_AUTH_URI is not defined")
      );
    default:
      throwError("Environment is not properly set");
  }
};

const throwError = (message: string): never => {
  throw new Error(message);
};

class edustackConnect {
  private authInstance: AxiosInstance;

  constructor() {
    this.authInstance = axios.create({
      baseURL: getAuthURL(),
    });
  }

  public async makeAuthRequest({
    endpoint,
    method,
    token,
    data,
  }: edustackAPIRequestType): Promise<AxiosResponse> {
    try {
      const headers = {
        Authorization: `Bearer ${token || ""}`,
        "x-header-secure-key":
          process.env.EDUSTACK_SECURE_HEADER_KEY || "default-secure-key",
      };

      switch (method.toLowerCase()) {
        case "get":
          return await this.authInstance.get(endpoint, { headers });
        case "post":
          return await this.authInstance.post(endpoint, data, { headers });
        case "put":
          return await this.authInstance.put(endpoint, data, { headers });
        case "delete":
          return await this.authInstance.delete(endpoint, { headers });
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Request failed";
      throw new Error(`Error in makeAuthRequest: ${message}`);
    }
  }
}

export const edustackInstance = new edustackConnect();
