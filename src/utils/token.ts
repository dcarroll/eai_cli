import { readFileSync } from 'fs';
import { ConfigFile } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import TokenGen, { LoginResponse } from './tokengen';

type AuthToken = {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expiresIn?: string;
  userName: string;
  pemLocation: string;
  defaultHost?: string;
};

export default class EAIToken {
  public isTest = false;

  protected token: AuthToken;
  protected expiration = null;
  protected privateKey = '';

  public constructor() {
    this.token = { accessToken: '', tokenType: '', refreshToken: '', userName: '', pemLocation: '' };
  }

  public static async setAlias(alias: string, username: string): Promise<string> {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/alias.json' }).then((econfig) => {
      econfig.set(username, alias);
      return alias;
    });
  }

  public static async setDefaultUsername(username: string): Promise<void> {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/eai_config.json' }).then(async (econfig) => {
      econfig.set('defaultusername', username);
      await econfig.write();
      return;
    });
  }

  public static async setDefaultServiceURL(hostUrl: string): Promise<string> {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/eai_config.json' }).then(async (econfig) => {
      if (hostUrl === 'default') {
        hostUrl = 'https://api.einstein.ai/';
      } else if (!hostUrl.endsWith('/')) {
        hostUrl += '/';
      }
      econfig.set('defaulthost', hostUrl);
      await econfig.write();
      return hostUrl;
    });
  }

  public static async getDefaultServiceURL(): Promise<string> {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/eai_config.json' }).then((econfig) => {
      if (econfig.has('defaulthost')) {
        return econfig.get('defaulthost') as string;
      } else {
        return '';
      }
    });
  }

  private static configContentsToToken(contents: JsonMap): AuthToken {
    const authToken: AuthToken = {
      pemLocation: contents.pemlocation as string,
      accessToken: contents.accessToken as string,
      expiresIn: contents.expires_in as string,
      refreshToken: contents.refresh_token as string,
      userName: contents.user_name as string,
      tokenType: contents.token_type as string,
      defaultHost: contents.defaulthost as string,
    };
    return authToken;
  }

  private static convertConfigToToken(config: ConfigFile<object>): AuthToken {
    const contents = config.getContents();
    return EAIToken.configContentsToToken(contents);
  }

  private static async getDefaultUsername(): Promise<string> {
    return ConfigFile.create({ isGlobal: true, filename: 'eai/eai_config.json' }).then(
      (econfig) => econfig.get('defaultusername') as string
    );
  }

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
    if (this.expiration !== null && this.expiration > halfLife && this.token !== null) {
      return this.token;
    }

    const serviceUrl = await EAIToken.getDefaultServiceURL();
    const loginResponse = await TokenGen.generateToken(serviceUrl, accountId, this.privateKey);
    let authToken = await this.updateTokenConfig(loginResponse);
    authToken = await this.writeTokenInfo();
    this.token = authToken;

    return this.token;
  }

  public async getAuthToken(): Promise<AuthToken> {
    return this.readTokenInfo();
  }

  public async getAccessTokenViaRefreshToken(): Promise<AuthToken> {
    await this.readTokenInfo();
    const validFor = 60 * 60;
    const token = await TokenGen.refreshToken(await EAIToken.getDefaultServiceURL(), this.token.refreshToken, validFor);
    this.token.accessToken = token;
    this.token = await this.updateTokenConfig(this.token as unknown as LoginResponse);
    return this.token;
  }

  public async writeTokenInfo(): Promise<AuthToken> {
    const econfig = await ConfigFile.create({ isGlobal: true, filename: await this.getConfigFileName() });
    econfig.setContentsFromObject(this.token);

    const newContents: JsonMap = await econfig.write();
    return newContents as AuthToken;
  }

  public async readTokenInfo(): Promise<AuthToken> {
    return this.getConfigFile().then((cfile) => {
      this.token = EAIToken.convertConfigToToken(cfile);
      return this.token;
    });
  }

  /* **************** Private member functions ****************** */

  private async getConfigFileName(): Promise<string> {
    if (!this.token) {
      const un = await EAIToken.getDefaultUsername();
      return `eai/${un}.json`;
    } else {
      // console.log('Username: ' + this._token.user_name);
      return `eai/${this.token.userName}.json`;
    }
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

  private async updateTokenConfig(data: LoginResponse): Promise<AuthToken> {
    this.token.accessToken = data.access_token;
    this.token.expiresIn = data.expires_in;
    this.token.tokenType = data.token_type;
    this.token.refreshToken = data.refresh_token;
    return this.writeTokenInfo().then((tinfo) => tinfo);
  }
}
