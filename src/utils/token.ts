/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */

import { readFileSync } from 'fs';
import { ConfigFile } from '@salesforce/core';
// import { readFileSync } from 'fs';
import jwt = require('jsonwebtoken');
import fetch = require('node-fetch');
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from './transport';

interface AuthToken extends JsonMap {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: string;
  user_name: string;
  pemlocation: string;
}
export default class EAIToken {
  // protected accessToken = null;
  //  protected username = null;
  // protected refreshToken = null;
  protected _token: AuthToken;
  protected expiration = null;
  protected privateKey = '';

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getAccessTokenViaLogin(accountId: string, ttl: number, pemlocation: string): Promise<AuthToken> {
    if (!accountId || !pemlocation) {
      throw new Error('please provice accountId AND pem file location');
    }
    if (pemlocation.length > 300) {
      this.privateKey = pemlocation;
    } else {
      this.privateKey = readFileSync(pemlocation, 'utf8');
    }

    const halfLife = Date.now() / 1000 + (ttl * 60) / 2;
    if (
      this.expiration !== null &&
      this.expiration > halfLife &&
      // eslint-disable-next-line no-underscore-dangle
      this._token !== null
    ) {
      // eslint-disable-next-line no-underscore-dangle
      return this._token;
    }
    const payloadExpiration = Date.now() / 1000 + ttl * 60;
    const payload = {
      aud: 'https://api.einstein.ai/v2/oauth2/token',
      exp: payloadExpiration,
      sub: accountId,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const token = jwt.sign(payload, this.privateKey.replace(/\\n/g, '\n'), { algorithm: 'RS256' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return fetch('https://api.einstein.ai/v2/oauth2/token', {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}&scope=offline`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })
      .then((response: { ok: boolean; statusText: string; json: () => object }) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        // const { access_token } = response.json();
        return response.json();
      })
      .then((accessToken) => {
        this._token = accessToken as AuthToken;
        this._token.user_name = accountId;
        this._token.pemlocation = this.privateKey;
        void this.writeTokenInfo();
        return this._token;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  public async getAuthToken(): Promise<AuthToken> {
    return this.readTokenInfo();
  }

  public async getAccessTokenViaRefreshToken(): Promise<AuthToken> {
    await this.readTokenInfo();
    const transport = new EAITransport();
    const form = 'grant_type=refresh_token&refresh_token=' + this._token.refresh_token + '&valid_for=30000';
    const path = 'https://api.einstein.ai/v2/oauth2/token/';
    return transport
      .makeRefreshTokenRequest({ form, path, method: 'POST' })
      .then((tok) => this.updateTokenConfig(tok as AuthToken))
      .catch((err) => {
        console.log('error');
        if (err.message === 'Invalid Token') {
          return this.getAccessTokenViaLogin(this._token.user_name, 30, this._token.pemlocation).then((tokk) => tokk);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          throw new Error(err);
        }
      });
  }

  public async writeTokenInfo(): Promise<AuthToken> {
    const econfig = await ConfigFile.create({ isGlobal: true, filename: await this.getConfigFileName() });
    econfig.setContentsFromObject(this._token);
    return econfig.write().then((configContents) => this.configContentsToToken(configContents));
  }

  public async readTokenInfo(): Promise<AuthToken> {
    return this.getConfigFile().then((cfile) =>
      this.convertConfigToToken(cfile).then((tok) => {
        this._token = tok;
        return tok;
      })
    );
  }

  public async convertConfigToToken(config: ConfigFile<object>): Promise<AuthToken> {
    const contents = config.getContents();
    const authToken: AuthToken = {
      pemlocation: contents.pemlocation as string,
      access_token: contents.access_token as string,
      expires_in: contents.expires_in as string,
      refresh_token: contents.refresh_token as string,
      user_name: contents.user_name as string,
      token_type: contents.token_type as string,
    };
    return authToken;
  }

  public async configContentsToToken(contents): Promise<AuthToken> {
    const authToken: AuthToken = {
      pemlocation: contents.pemlocation as string,
      access_token: contents.access_token as string,
      expires_in: contents.expires_in as string,
      refresh_token: contents.refresh_token as string,
      user_name: contents.user_name as string,
      token_type: contents.token_type as string,
    };
    return authToken;
  }

  public async updateTokenConfig(data: AuthToken): Promise<AuthToken> {
    this._token.access_token = data.access_token;
    this._token.expires_in = data.expires_in;
    this._token.token_type = data.token_type;
    return this.writeTokenInfo().then((tinfo) => tinfo);
  }

  public async setDefaultUsername(username: string): Promise<void> {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/eai_config.json' }).then(async (econfig) => {
      econfig.set('defaultusername', username);
      await econfig.write();
      return;
    });
  }

  public async getDefaultUsername(): Promise<string> {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/eai_config.json' }).then(async (econfig) =>
      econfig.get('defaultusername').toString()
    );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public async setAlias(alias: string, username: string) {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/alias.json' }).then(async (econfig) => {
      econfig.set(username, alias);
    });
  }

  private async getConfigFile(): Promise<ConfigFile<object>> {
    return ConfigFile.create({ isGlobal: true, filename: await this.getConfigFileName() }).then(async (econfig) => {
      if (!(await econfig.exists())) {
        throw new Error('You need to run login before running other commands');
      } else {
        return econfig;
      }
    });
  }

  private async getConfigFileName(): Promise<string> {
    if (!this._token) {
      const un = await this.getDefaultUsername();
      return `eai/${un}.json`;
    } else {
      // console.log('Username: ' + this._token.user_name);
      return `eai/${this._token.user_name}.json`;
    }
  }
}
