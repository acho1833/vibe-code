import { prisma } from '@/lib/db';
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from '@/prompt';
import { Sandbox } from '@e2b/code-interpreter';
import { createAgent, createNetwork, createState, createTool, Message, openai, Tool } from "@inngest/agent-kit";
import z from 'zod';
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from './utils';
import { SANDBOX_TIMEOUT } from './types';

type AgentState = {
    summary: string;
    files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/run" },
    async ({ event, step }) => {
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create('vibe-nextjs-kc-test-2');
            await sandbox.setTimeout(SANDBOX_TIMEOUT);
            return sandbox.sandboxId;
        });

        const previousMessages = await step.run("get-previous-messages", async () => {
            const formattedMessages: Message[] = [];

            const messages = await prisma.message.findMany({
                where: {
                    projectId: event.data.projectId
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 5,
            });

            for (const message of messages) {
                formattedMessages.push({
                    content: message.content,
                    role: message.role === 'ASSISTANT' ? 'assistant' : 'user',
                    type: 'text'
                });
            }

            return formattedMessages.reverse();
        });

        const state = createState<AgentState>({
            summary: '',
            files: {}
        }, {
            messages: previousMessages,
        });

        // await step.sleep("wait-a-moment", "5s");

        const codeAgent = createAgent<AgentState>({
            name: 'code-agent',
            description: 'An expert coding agent',
            system: PROMPT,
            model: openai({ model: 'gpt-4.1', defaultParameters: { temperature: 0.1 } }),
            tools: [
                createTool({
                    name: 'terminal',
                    description: 'Run commands in the terminal',
                    parameters: z.object({
                        command: z.string()
                    }),
                    handler: async ({ command }, { step }) => {
                        return await step?.run("terminal", async () => {
                            const buffers = { stdout: '', stderr: '' };

                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const result = await sandbox.commands.run(command, {
                                    onStdout: (data) => {
                                        buffers.stdout += data;
                                    },
                                    onStderr: (data) => {
                                        buffers.stderr += data;
                                    }
                                });

                                return result.stdout;
                            } catch {
                                console.error(`Error running command: ${command}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`);
                            }
                        });
                    }
                }),
                createTool({
                    name: 'createOrUpdateFiles',
                    description: 'Create or update files in the sandbox',
                    parameters: z.object({
                        files: z.array(z.object({
                            path: z.string(),
                            content: z.string()
                        }))
                    }),
                    handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
                        const newFiles = await step?.run("create-or-update-files", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId);
                                for (const file of files) {
                                    await sandbox.files.write(file.path, file.content);
                                    updatedFiles[file.path] = file.content;
                                }

                                return updatedFiles;

                            } catch (e) {
                                console.error(`Error creating or updating files: ${e}`);
                            }
                        });

                        if (newFiles && typeof newFiles === 'object') {
                            network.state.data.files = newFiles;
                        }
                    }
                }),
                createTool({
                    name: 'readFiles',
                    description: 'Read files from the sandbox',
                    parameters: z.object({
                        files: z.array(z.string()),
                    }),
                    handler: async ({ files }, { step }) => {
                        return await step?.run("read-files", async () => {
                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const contents = [];

                                for (const file of files) {
                                    const content = await sandbox.files.read(file);
                                    contents.push({ path: file, content });
                                }

                                return JSON.stringify(contents);
                            } catch (e) {
                                return `Error reading files: ${e}`;
                            }
                        });
                    }
                })
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantMessageText = lastAssistantTextMessageContent(result);
                    if (lastAssistantMessageText && network) {
                        if (lastAssistantMessageText.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantMessageText;
                        }
                    }

                    return result;
                }
            }
        });

        const network = createNetwork<AgentState>({
            name: 'coding-agent-network',
            agents: [codeAgent],
            maxIter: 15,
            defaultState: state,
            router: async ({ network }) => {
                const summary = network.state.data.summary;
                if (summary) {
                    return;
                }

                return codeAgent;
            }
        })

        const result = await network.run(event.data.value, {
            state
        });

        const fragmentTitleGenerator = createAgent({
            name: 'fragment-title-generator',
            description: 'Generates a short, descriptive title for a code fragment',
            system: FRAGMENT_TITLE_PROMPT,
            model: openai({ model: 'gpt-4o' }),
        });

        const responseGenerator = createAgent({
            name: 'response-generator',
            description: 'Generates a user-friendly message explaining what was built',
            system: RESPONSE_PROMPT,
            model: openai({ model: 'gpt-4o' }),
        });

        const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary);
        const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);

        const parseAgentOutput = (value: Message[]) => {
            const output = value[0];

            if (output.type !== 'text') {
                return 'Here you go';
            }

            if (Array.isArray(output.content)) {
                return output.content.map(txt => txt).join('');
            }
            return output.content;
        }

        const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            const host = sandbox.getHost(3000);
            return `https://${host}`;
        });

        await step.run('save-result', async () => {
            if (isError) {
                return await prisma.message.create({
                    data: {
                        projectId: event.data.projectId,
                        content: "Error occurred while processing the request.",
                        role: 'ASSISTANT',
                        type: 'ERROR',
                    }
                });
            }
            return await prisma.message.create({
                data: {
                    projectId: event.data.projectId,
                    content: parseAgentOutput(responseOutput),
                    role: 'ASSISTANT',
                    type: 'RESULT',
                    fragment: {
                        create: {
                            sandboxUrl,
                            title: parseAgentOutput(fragmentTitleOutput),
                            files: result.state.data.files,
                        }
                    }
                }
            });
        });

        return { url: sandboxUrl, title: parseAgentOutput(fragmentTitleOutput), files: result.state.data.files, summary: result.state.data.summary };
    },
);
