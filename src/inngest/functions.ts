import { openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        // await step.sleep("wait-a-moment", "5s");

        const codeAgent = createAgent({
            name: 'code-agent',
            system: 'You are an expert next.js developer. You write readable, maintainable, and efficient code.  You write simple Next.js & React snippets.',
            model: openai({ model: 'gpt-4o' })
        });

        const { output } = await codeAgent.run(
            `Write the following text: ${event.data.value}`,
        )

        return { output };
    },
);
