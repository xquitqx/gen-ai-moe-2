import { StackContext } from 'sst/constructs';
import { Fn } from 'aws-cdk-lib';

export function GrammarToolStack({ stack }: StackContext) {
  const grammarToolName = 'grammarToolDNS';
  let grammarToolDNS: string;

  if (stack.stage === 'prod') {
    // Use the external LanguageTool API URL in the production environment
    grammarToolDNS = 'https://api.languagetool.org/v2/check'; // Public API endpoint

    // Export the API URL for use by other stacks
    stack.addOutputs({
      [grammarToolName]: {
        value: grammarToolDNS,
        exportName: grammarToolName,
      },
    });
  } else {
    // In non-production environments, import the API URL
    grammarToolDNS = Fn.importValue(grammarToolName);
    stack.addOutputs({
      GrammarTool: grammarToolDNS,
    });
  }

  return { grammarToolDNS };
}
