import { Octokit } from '@octokit/rest';
import { BoardConfig, SubmissionProof, TaskConfig } from '@/types/types';
import { stringToUuid } from "@/lib/uuid";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

const elizaAgentUserId = process.env.ELIZA_AGENT_USER_ID || "";
const elizaAgentId = process.env.ELIZA_AGENT_ID || "";
const elizaAgentUrl = `${process.env.ELIZA_API_URL}/${elizaAgentId}/message`;

export type ProofType = 'Plain Text' | 'Image' | 'Github Pull Request' | 'Contract Verification' | 'X Follow' | 'X Post' | 'Join Discord';

interface AIReviewRequest {
  proofTypes: ProofType[];
  proofData: SubmissionProof;
  taskName: string;
  taskDescription: string;
  aiReviewPrompt: string;
  taskConfig?: TaskConfig;
  boardConfig?: BoardConfig;
}

interface AIReviewResponse {
  approved: boolean;
  reviewComment: string;
}

export class AIReviewService {
  private async getContentToReview(proofTypes: ProofType[], proofData: SubmissionProof, taskConfig?: TaskConfig, boardConfig?: BoardConfig): Promise<string> {
    console.log('Proof Types:', proofTypes);
    console.log('Proof Data:', proofData);
    console.log('Task Config:', taskConfig);

    const contents: string[] = [];

    for (const proofType of proofTypes) {
      try {
        let content = '';
        switch (proofType) {
          case 'Plain Text':
            content = proofData.text || '';
            break;

          case 'Image':
            content = proofData.image || '';
            break;

          case 'Github Pull Request':
            if (proofData.github) {
              const prUrl = proofData.github;
              const [owner, repo, , prNumber] = prUrl.split('/').slice(-4);

              const { data: prData } = await octokit.pulls.get({
                owner,
                repo,
                pull_number: parseInt(prNumber)
              });

              const { data: files } = await octokit.pulls.listFiles({
                owner,
                repo,
                pull_number: parseInt(prNumber)
              });

              const fileContents = await Promise.all(
                files.map(async (file) => {
                  if (file.status === 'removed') {
                    return `File: ${file.filename}\nStatus: Removed`;
                  }

                  try {
                    const { data: fileData } = await octokit.repos.getContent({
                      owner,
                      repo,
                      path: file.filename,
                      ref: prData.head.sha
                    });

                    if (typeof fileData === 'object' && 'content' in fileData) {
                      const content = Buffer.from(fileData.content, 'base64').toString();
                      return `File: ${file.filename}
Status: ${file.status}
Changes: ${file.additions} additions, ${file.deletions} deletions
Content:
\`\`\`
${content}
\`\`\`
`;
                    }
                    return `File: ${file.filename}\nStatus: ${file.status} (Binary file or too large)`;
                  } catch (error) {
                    console.error(`Error fetching content for ${file.filename}:`, error);
                    return `File: ${file.filename}\nStatus: ${file.status}\nError: Failed to fetch content`;
                  }
                })
              );

              content = `PR Title: ${prData.title}
PR Description: ${prData.body || 'No description provided'}
PR State: ${prData.state}
PR Branch: ${prData.head.ref} -> ${prData.base.ref}
Changed Files:
${fileContents.join('\n\n')}`;
            }
            break;

          case 'Contract Verification':
            if (proofData.contract) {
              const network = taskConfig?.contractNetwork || 'Flow EVM';

              let apiUrl = '';
              let apiKey = '';

              switch (network) {
                case 'Mantle':
                  apiUrl = 'https://api.mantlescan.xyz/api';
                  apiKey = process.env.MANTLESCAN_API_KEY || '';
                  break;
                case 'Mantle Sepolia':
                  apiUrl = 'https://api-sepolia.mantlescan.xyz/api';
                  apiKey = process.env.MANTLESCAN_API_KEY || '';
                  break;
                case 'Linea':
                  apiUrl = 'https://api.lineascan.build/api';
                  apiKey = process.env.LINEASCAN_API_KEY || '';
                  break;
                case 'Linea Sepolia':
                  apiUrl = 'https://api-sepolia.lineascan.build/api';
                  apiKey = process.env.LINEASCAN_API_KEY || '';
                  break;
                case 'Ethereum':
                  apiUrl = 'https://api.etherscan.io/api';
                  apiKey = process.env.ETHERSCAN_API_KEY || '';
                  break;
                case 'Sepolia':
                  apiUrl = 'https://api-sepolia.etherscan.io/api';
                  apiKey = process.env.ETHERSCAN_API_KEY || '';
                  break;
                case 'Flow EVM':
                case 'Flow EVM Testnet':
                  const isTestnet = network === 'Flow EVM Testnet';
                  apiUrl = isTestnet
                    ? 'https://evm-testnet.flowscan.io/api/v2'
                    : 'https://evm.flowscan.io/api/v2';
                  break;
              }

              let content = '';

              if (network.startsWith('Flow EVM')) {
                // BlockScout API 调用
                try {
                  const response = await fetch(
                    `${apiUrl}/smart-contracts/${proofData.contract}`
                  );
                  const data = await response.json();
                  console.log('Flow EVM API Response:', data.source_code);

                  if (data.source_code) {
                    const sourceCode = data.source_code;

                    // 尝试解析多文件合约
                    try {
                      const parsedSource = JSON.parse(sourceCode);
                      content = Object.entries(parsedSource)
                        .filter(([filename]) => !filename.toLowerCase().includes('lib/') &&
                          !filename.toLowerCase().includes("@")
                        )
                        .map(([filename, fileContent]) => {
                          if (typeof fileContent === 'object' && fileContent !== null && 'content' in fileContent) {
                            return `File: ${filename}\n${(fileContent as any).content}`;
                          } else {
                            return `File: ${filename}\n${fileContent}`;
                          }
                        })
                        .join('\n\n');
                    } catch (e) {
                      // 如果不是多文件格式，直接使用源代码
                      content = sourceCode;
                    }
                  } else {
                    throw new Error('Contract source code not found');
                  }
                } catch (error: any) {
                  console.error('Error fetching from BlockScout API:', error);
                  throw new Error(`Failed to fetch contract source code: ${error.message}`);
                }
              } else {
                // 原有的 Etherscan 风格 API 调用
                const response = await fetch(
                  `${apiUrl}?module=contract&action=getsourcecode&address=${proofData.contract}&apikey=${apiKey || ''}`
                );
                const data = await response.json();
                let sourceCode = data.result[0].SourceCode || '';

                try {
                  const parsedSource = JSON.parse(sourceCode.slice(1, -1));
                  const sources = parsedSource.sources;

                  content = Object.entries(sources)
                    .filter(([filename]) => !filename.toLowerCase().includes('lib/') &&
                      !filename.toLowerCase().includes("@")
                    )
                    .map(([filename, fileContent]) => {
                      if (typeof fileContent === 'object' && fileContent !== null && 'content' in fileContent) {
                        return `File: ${filename}\n${(fileContent as any).content}`;
                      } else {
                        throw new Error(`Invalid file content for ${filename}`);
                      }
                    })
                    .join('\n\n');
                } catch (e) {
                  content = sourceCode;
                }
              }

              if (!content) {
                throw new Error('No source code content found');
              }
              return content;
            }
            break;

          default:
            console.warn(`Unsupported proof type: ${proofType}`);
            continue;
        }

        if (content) {
          contents.push(`${proofType}: ${content}`);
        }
      } catch (error) {
        console.error(`Error processing ${proofType}:`, error);
        throw new Error(`Failed to process ${proofType}`);
      }
    }

    if (contents.length === 0) {
      throw new Error('No valid proof content found');
    }

    return contents.join('\n\n');
  }


}