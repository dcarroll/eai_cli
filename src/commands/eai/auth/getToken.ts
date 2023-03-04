import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core/lib/cli-ux';
import clipboard = require('clipboardy');
import EAIToken from '../../../utils/token';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'hello.world', [
  'summary',
  'description',
  'examples',
  'flags.name.summary',
  'info.hello',
]);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.

export type GetTokenResult = {
  username: string;
  token: string;
};

export default class GetToken extends SfCommand<GetTokenResult> {
  public static summary = messages.getMessage('summary');
  public static examples = [
    `$ sfdx eai:auth:gettoke
  Successfully obtained auth token
  `,
  ];

  public static flags = {
    toclipboard: Flags.boolean({
      char: 'c',
      summary: messages.getMessage('summary'),
      description: messages.getMessage('description'),
    }), // 'add token to clipboard without displaying in terminal' })
  };

  public static requiresProject = false;
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;

  public async run(): Promise<GetTokenResult> {
    const { flags } = await this.parse(GetToken);

    const eaitoken = new EAIToken();
    const configToken = await eaitoken.getAuthToken();
    return eaitoken.getAccessTokenViaRefreshToken().then(async () => {
      if (flags.toclipboard) {
        await clipboard.write(configToken.accessToken);
        ux.log('Token has been placed in your clipboard.');
        return { username: configToken.userName, token: configToken.accessToken };
      } else {
        ux.log('Retrieved token for ' + configToken.userName + '\n' + configToken.accessToken);
        return { username: configToken.userName, token: configToken.accessToken };
      }
    });
  }
}
