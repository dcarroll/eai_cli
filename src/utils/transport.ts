// import { readFileSync } from 'fs';
import fetch from 'cross-fetch';
import EAIToken from './token';

export default class EAITransport {
  protected expiration = null;
  protected accessToken = null;
  protected eaiToken: EAIToken = new EAIToken();
  protected retryCount = 0;

  public async makeRequest(requestData: { path: RequestInfo | URL; form: string; method: string }): Promise<JSON> {
    return this.doRequest(requestData);
  }

  public async doRequest(requestData: { path: RequestInfo | URL; form: string; method: string }): Promise<JSON> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.eaiToken.getAuthToken().then(async (authtoken) => {
      // const controller = new Controller();
      await this.eaiToken.getAccessTokenViaRefreshToken();
      const res = await fetch(requestData.path, {
        // : controller.signal,
        body: requestData.form,
        headers: {
          Authorization: 'Bearer ' + authtoken.access_token,
        },
        method: requestData.method,
      });
      if (!res.ok) {
        if (res.status === 504) {
          throw new Error(res.statusText);
        } else {
          return res.json().then((data) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new Error(String(data.message));
          });
        }
      } else {
        // eslint-disable-next-line camelcase
        return res.json().then(
          (data1) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, camelcase
            data1
        );
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async makeRefreshTokenRequest(requestData: { form: string; path: string; method: string }): Promise<object> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return fetch(requestData.path, {
      body: requestData.form,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      method: requestData.method,
    }).then(async (res) => {
      if (!res.ok) {
        const strBody = (await res.text()).toString(); //  res.body.toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = JSON.parse(strBody);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (body.errors) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          throw new Error(body.errors[0]);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if (body.message || body.message === 'Invalid Token') {
          // Bad token, need to rerun the login
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          throw new Error(body.message);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          throw new Error(body.message);
        }
      } else {
        return res.json().then(
          (data) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            data
        );
      }
    });
  }
}
