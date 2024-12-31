import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getEnvironment } from "../../functions/environment";
import { edustackAPIRequestType } from "../../types/request";

const environment = getEnvironment();
export const getAuthURL = () => {
  switch (environment) {
    case "local":
      return process.env.DEV_AUTH_URI;
      break;
    case "staging":
      return process.env.STAGING_AUTH_URI;
      break;
    case "production":
      return process.env.LIVE_AUTH_URI;
      break;

    default:
      return "";
      break;
  }
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
    let response: AxiosResponse;

    const headers = {
      Authorization: `Bearer ${token || ""}`,
      "x-header-secure-key": process.env.EDUSTACK_SECURE_HEADER_KEY,
    };

    switch (method.toLowerCase()) {
      case "get":
        response = await this.authInstance.get(endpoint, { headers });
        break;
      case "post":
        response = await this.authInstance.post(endpoint, data, { headers });
        break;
      case "put":
        response = await this.authInstance.put(endpoint, data, { headers });
        break;
      case "delete":
        response = await this.authInstance.delete(endpoint, { headers });
        break;
      default:
        throw new Error(`Unsupported method ${method}`);
    }

    return response;
  }
}

// Create instance of EduStack service
const edustackInstance = new edustackConnect();

export const makeAuthRequest = edustackInstance.makeAuthRequest;

