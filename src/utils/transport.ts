/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { readFileSync } from 'fs';
import fetch from 'cross-fetch';
import { JsonMap } from '@salesforce/ts-types';
import EAIToken from './token';

export default class EAITransport {
  protected expiration = null;
  protected accessToken = null;
  protected eaiToken: EAIToken = new EAIToken();
  protected retryCount = 0;

  public async makeRequest(requestData: { path: RequestInfo | URL; form: string; method: string }): Promise<JsonMap> {
    return this.doRequest(requestData);
  }

  public async doRequest(
    requestData: { path: RequestInfo | URL; form: string; method: string },
    abort?: boolean
  ): Promise<JsonMap> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.eaiToken.getAuthToken().then(async (authtoken) => {
      if ((requestData.path as string).startsWith('/')) requestData.path = (requestData.path as string).substring(1);

      const localPath = (await EAIToken.getDefaultServiceURL()) + (requestData.path as string);

      return fetch(localPath, {
        body: requestData.form,
        headers: {
          Authorization: `Bearer ${authtoken.accessToken}`,
        },
        method: requestData.method,
      }).then(async (res) => {
        if (!res.ok && !abort) {
          if (res.status === 504) throw new Error(res.statusText);
          else if (res.status === 401) {
            await this.eaiToken.getAccessTokenViaRefreshToken();
            return this.doRequest(requestData, true);
          } else return res.json();
        } else if (res.ok) {
          return res.json();
        } else {
          throw new Error(res.statusText);
        }
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async makeRefreshTokenRequest(requestData: { form: string; path: string; method: string }): Promise<object> {
    const localPath = (await EAIToken.getDefaultServiceURL()) + requestData.path;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fetch(localPath, {
      body: requestData.form,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      method: requestData.method,
    }).then(async (res: Response) => {
      if (!res.ok) {
        const strBody = await res.text();
        const body: JsonMap = JSON.parse(strBody);
        if (body['errors']) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          throw new Error(body.errors[0]);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if (body.message || body.message === 'Invalid Token') {
          // Bad token, need to rerun the login
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          throw new Error(body.message as string);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          throw new Error(body.message as string);
        }
      } else {
        return res.json();
      }
    });
  }
}
