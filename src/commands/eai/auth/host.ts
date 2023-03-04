import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAIToken from '../../../utils/token';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.auth.host', [
  'summary',
  'description',
  'examples',
  'flags.serviceurl.summary',
  'flags.default.summary',
]);

export type EaiAuthHostResult = {
  status: string;
  serviceurl: string;
};

export default class EaiAuthHost extends SfCommand<EaiAuthHostResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    serviceurl: Flags.string({
      summary: messages.getMessage('flags.serviceurl.summary'),
      char: 'u',
      required: false,
      exclusive: ['default'],
    }),
    default: Flags.boolean({
      summary: messages.getMessage('flags.default.summary'),
      char: 'd',
      required: false,
      exclusive: ['serviceurl'],
    }),
  };

  private static isValidUrl(url: string): boolean {
    try {
      url = new URL(url) as unknown as string;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ux.log('----> ' + (e.message as string) + '');
      ux.log('----> You entered ' + url + ' as the service URL\n');
    }
    return true;
  }

  public async run(): Promise<EaiAuthHostResult> {
    const { flags } = await this.parse(EaiAuthHost);

    let serviceurl = flags.serviceurl;

    if (serviceurl) {
      if (EaiAuthHost.isValidUrl(serviceurl)) serviceurl = await EAIToken.setDefaultServiceURL(serviceurl);
    } else if (flags.default) {
      serviceurl = await EAIToken.setDefaultServiceURL('default');
    } else {
      serviceurl = await EAIToken.getDefaultServiceURL();
    }

    ux.log('The service URL is ' + serviceurl);
    return {
      status: 'Successfully set/retrieved service URL',
      serviceurl,
    };
  }
}
