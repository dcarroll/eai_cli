import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core/lib/cli-ux';
import EAIToken from '../../../utils/token';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const clipboard = require('clipboardy');

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
  // protected sfEinstein = require('sf-einstein');

  // eslint-disable-next-line class-methods-use-this
  public async run(): Promise<GetTokenResult> {
    const eaitoken = new EAIToken();
    const configToken = await eaitoken.getAuthToken();
    return eaitoken.getAccessTokenViaRefreshToken().then(async () => {
      if (GetToken.flags.toclipboard) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await clipboard.write(configToken.access_token);
        ux.log('Token has been placed in your clipboard.');
        return { username: configToken.user_name, token: configToken.access_token };
      } else {
        ux.log('Retrieved token for ' + configToken.user_name + '\n' + configToken.access_token);
        return { username: configToken.user_name, token: configToken.access_token };
      }
    });
  }
}
