import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { ux } from '@oclif/core';
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from '../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.examples', [
  'summary',
  'description',
  'examples',
  'flags.datasetid.summary',
  'flags.datasetid.description',
  'flags.labelid.summary',
  'flags.labelid.description',
]);

export type EaiLanguageExamplesResult = {
  message: string;
  data: JsonMap;
};

export default class EaiLanguageExamples extends SfCommand<EaiLanguageExamplesResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    datasetid: Flags.string({
      summary: messages.getMessage('flags.datasetid.summary'),
      description: messages.getMessage('flags.datasetid.description'),
      char: 'i',
      required: false,
    }),
    labelid: Flags.string({
      summary: messages.getMessage('flags.labelid.summary'),
      description: messages.getMessage('flags.labelid.description'),
      char: 'l',
      required: false,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  private static formatResults(examples: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    ux.table(examples.data, {
      id: {
        header: 'Example Id',
      },
      labelId: {
        get: (row) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const lbl = Object(row.label);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return String(lbl.id);
        },
        header: 'Label Id',
      },
      createdAt: {
        get: (row) => new Date(String(row.createdAt)).toLocaleString(),
        header: 'Created',
      },
      labelName: {
        header: 'Label Name',
        get: (row) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const lblname = Object(row.label);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
          return String(lblname.name);
        },
      },
      datasetId: {
        get: (row) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const lblname = Object(row.label);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
          return String(lblname.datasetId);
        },
        header: 'Dataset Id',
      },
      numExamples: {
        header: 'Labels',
        get: (row) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const lblname = Object(row.label);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
          return String(lblname.numExamples);
        },
      },
    });
  }

  public async run(): Promise<EaiLanguageExamplesResult> {
    const { flags } = await this.parse(EaiLanguageExamples);
    if (!flags.datasetid && !flags.laeblid) {
      throw new SfError('You must provide either the dataset id or the label id');
    }
    const path: string = flags.datasetid
      ? `v2/language/datasets/${flags.datasetid}/examples/`
      : `v2/language/examples?labelId=${flags.labelid}`;

    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = 'Successfully retrieved language examples';
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      ux.log(`Retrieved ${data['data']['length']} examples`);
      EaiLanguageExamples.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
