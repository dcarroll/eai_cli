import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAIToken from '../../../utils/token';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.load('test', 'eai.auth.login', [
  'summary',
  'description',
  'examples',
  'commandsuccess',
  'flags.name.summary',
  'flags.pemlocation.summary',
  'flags.expiration.summary',
  'flags.setdefaultusername.summary',
  'flags.alias.summary',
  'info.hello',
  'flags.istest.summary',
]);

export type LoginResult = {
  username: string;
  message: string;
};

export default class Login extends SfCommand<LoginResult> {
  public static description = messages.getMessage('description');
  public static summary = messages.getMessage('summary');

  public static examples = [
    `$ sfdx eai:auth:login -n name@company.com -f einstein_platform.pem -e 1
  Successfully obtained auth token for name@company.com
  `,
  ];

  public static requiresProject = false;

  public static flags = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    name: Flags.string({
      char: 'n',
      required: true,
      summary: messages.getMessage('flags.name.summary'),
    }),
    pemlocation: Flags.string({
      char: 'f',
      required: true,
      summary: messages.getMessage('flags.pemlocation.summary'),
    }),
    expiration: Flags.integer({
      char: 'e',
      default: 99999,
      summary: messages.getMessage('flags.expiration.summary'),
    }),
    setdefaultusername: Flags.boolean({
      char: 's',
      default: true,
      summary: messages.getMessage('flags.setdefaultusername.summary'),
    }),
    alias: Flags.string({
      char: 'a',
      required: false,
      summary: messages.getMessage('flags.alias.summary'),
    }),
    istest: Flags.boolean({
      summary: messages.getMessage('flags.istest.summary'),
      char: 't',
      default: false,
    }),
  };

  protected static requiresEaiUsername = true;
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;

  public async run(): Promise<LoginResult> {
    const { flags } = await this.parse(Login);
    const eaitoken = new EAIToken();
    eaitoken.isTest = flags.istest;

    return eaitoken
      .getAccessTokenViaLogin(String(flags.name), Number(flags.expiration), String(flags.pemlocation))
      .then(() => {
        if (Boolean(Login.flags.setdefaultusername) === true) {
          void EAIToken.setDefaultUsername(String(flags.name));
        }
        if (Login.flags.alias) {
          void EAIToken.setAlias(String(flags.alias), String(flags.name));
        }
        ux.log(messages.getMessage('commandsuccess'));
        return { username: String(flags.name), message: messages.getMessage('commandsuccess') };
      });
  }
}
