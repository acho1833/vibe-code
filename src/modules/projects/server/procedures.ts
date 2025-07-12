import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateSlug } from 'random-word-slugs';
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({
        id: z.string().min(1, "ID cannot be empty"),
    })).query(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: {
                id: input.id,
                userId: ctx.auth.userId
            },
        });
        if (!project) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Project with ID ${input.id} not found`,
            });
        }
        return project;
    }),
    getMany: protectedProcedure.query(async ({ ctx }) => {
        const projects = await prisma.project.findMany({
            where: {
                userId: ctx.auth.userId
            },
            orderBy: {
                updatedAt: 'desc',
            }
        });
        return projects;
    }),
    create: protectedProcedure.input(z.object({
        value: z.string().min(1, "Value cannot be empty").max(10000, "Value cannot exceed 10,000 characters"),
    })).mutation(async ({ input, ctx }) => {

        try {
            await consumeCredits();
        } catch (error) {
            if (error instanceof Error) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Something went wrong',
                });
            }
            throw new TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: 'Insufficient credits to create a message',
            });
        }

        const createdProject = await prisma.project.create({
            data: {
                userId: ctx.auth.userId,
                name: generateSlug(2, {
                    format: 'kebab',
                }),
                messages: {
                    create: {
                        content: input.value,
                        role: "USER",
                        type: "RESULT",
                    }
                }
            },
        });



        await inngest.send({
            name: 'code-agent/run',
            data: {
                value: input.value,
                projectId: createdProject.id,
            },
        });

        return createdProject;
    })
});