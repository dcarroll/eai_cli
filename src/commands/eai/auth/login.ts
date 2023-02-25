/* eslint-disable sf-plugin/no-hardcoded-messages-flags */
/* eslint-disable sf-plugin/flag-summary */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    name: Flags.string({ char: 'n', required: true, description: messages.getMessage('flags.name.summary') }),
    pemlocation: Flags.string({
      char: 'f',
      required: true,
      description: messages.getMessage('flags.pemlocation.summary'),
    }),
    expiration: Flags.integer({ char: 'e', default: 1, description: messages.getMessage('flags.expiration.summary') }),
    setdefaultusername: Flags.boolean({
      char: 's',
      default: true,
      description: messages.getMessage('flags.setdefaultusername.summary'),
    }),
    alias: Flags.string({ char: 'a', required: false, description: messages.getMessage('flags.alias.summary') }),
  };

  protected static requiresEaiUsername = true;
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected sfEinstein = require('sf-einstein');

  // eslint-disable-next-line class-methods-use-this
  public async run(): Promise<LoginResult> {
    const eaitoken = new EAIToken();
    return eaitoken
      .getAccessTokenViaLogin(String(Login.flags.name), Number(Login.flags.expiration), String(Login.flags.pemlocation))
      .then(() => {
        if (Boolean(Login.flags.setdefaultusername) === true) {
          void eaitoken.setDefaultUsername(String(Login.flags.name));
        }
        if (Login.flags.alias) {
          void eaitoken.setAlias(String(Login.flags.alias), String(Login.flags.name));
        }
        ux.log(messages.getMessage('commandsuccess'));
        return { username: String(Login.flags.name), message: messages.getMessage('commandsuccess') };
      });
    /* const econfig = await ConfigFile.create({ isGlobal: true, filename: 'einstein.json' });

    econfig.setContentsFromObject(authtoken);
    econfig.set('pemlocation', join(process.cwd(), this.flags.pemlocation));
    econfig.write();*/
  }
}
