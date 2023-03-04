import * as jwt from 'jsonwebtoken';
import fetch from 'cross-fetch';
import { JsonMap } from '@salesforce/ts-types';

type MyRequestInit = {
  url: string;
  method: string;
  headers: object;
  body: string;
};

export type LoginResponse = {
  access_token: string;
  expires_in: string;
  refresh_token: string;
  token_type: string;
};

export default class TokenGen {
  public static async generateToken(baseUrl: string, accountId: string, privateKey: string): Promise<LoginResponse> {
    const token = await this.updateToken(baseUrl, accountId, privateKey);
    return token;
  }

  public static async refreshToken(pvsUrl: string, refreshToken: string, ttl: number): Promise<string> {
    const reqUrl = `${pvsUrl}v2/oauth2/token`;
    const options = this.getRefreshOptions(reqUrl, refreshToken, ttl);

    const response = await fetch(reqUrl, options as RequestInit);
    const granted = (await response.json()) as JSON;

    return granted['access_token'] as string;
  }

  protected static async updateToken(pvsUrl: string, accountId: string, privateKey: string): Promise<LoginResponse> {
    const reqUrl = pvsUrl + 'v2/oauth2/token';
    const assertion = this.getAssertion(pvsUrl, accountId, privateKey);
    const options = this.getOptions(reqUrl, assertion);

    const response = await fetch(reqUrl, options as RequestInit);
    const granted = (await response.json()) as JsonMap;

    return granted as LoginResponse;
  }

  protected static getAssertion(baseUrl: string, accountId: string, privateKey: string): string {
    const reqUrl = baseUrl + 'v2/oauth2/token';

    // eslint-disable-next-line camelcase
    const rsa_payload = {
      sub: accountId,
      aud: reqUrl,
    };

    // eslint-disable-next-line camelcase
    const rsa_options = {
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
      expiresIn: '25h',
    };

    const token = jwt.sign(rsa_payload, privateKey, rsa_options);

    return token;
  }

  protected static getOptions(reqUrl: string, assertion: string): MyRequestInit {
    return {
      url: reqUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(
        assertion
      )}&scope=offline`,
    };
  }

  protected static getRefreshOptions(reqUrl: string, refreshToken: string, ttl: number): MyRequestInit {
    return {
      url: reqUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}&valid_for=${ttl}`,
    };
  }
}
