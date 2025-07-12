import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const messageRouter = createTRPCRouter({
    getMany: protectedProcedure.input(z.object({
        projectId: z.string().min(1, "Project ID cannot be empty"),
    })).query(async ({ input, ctx }) => {
        const messages = await prisma.message.findMany({
            where: {
                projectId: input.projectId,
                project: {
                    userId: ctx.auth.userId,
                }
            },
            orderBy: {
                updatedAt: 'asc',
            },
            include: {
                fragment: true,
            },
        });
        return messages;
    }),
    create: protectedProcedure.input(z.object({
        value: z.string().min(1, "Value cannot be empty").max(10000, "Value cannot exceed 10,000 characters"),
        projectId: z.string().min(1, "Project ID cannot be empty"),
    })).mutation(async ({ input, ctx }) => {
        const existingProject = await prisma.project.findUnique({
            where: {
                id: input.projectId,
                userId: ctx.auth.userId,
            },
        });

        if (!existingProject) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Project with ID ${input.projectId} not found`,
            });
        }

        try {
            await consumeCredits();
        } catch (error) {
            if (error instanceof Error) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Something weng wrong',
                });
            }
            throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: 'Insufficient credits to create a message',
            });
        }

        const createdMessage = await prisma.message.create({
            data: {
                projectId: existingProject.id,
                content: input.value,
                role: "USER",
                type: "RESULT",
            },
        });

        await inngest.send({
            name: 'code-agent/run',
            data: {
                value: input.value,
                projectId: existingProject.id,
            },
        });

        return createdMessage;
    })
});