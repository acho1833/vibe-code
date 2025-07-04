import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateSlug } from 'random-word-slugs';
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne: baseProcedure.input(z.object({
        id: z.string().min(1, "ID cannot be empty"),
    })).query(async ({ input }) => {
        const project = await prisma.project.findUnique({
            where: {
                id: input.id,
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
    getMany: baseProcedure.query(async () => {
        const projects = await prisma.project.findMany({
            orderBy: {
                updatedAt: 'desc',
            }
        });
        return projects;
    }),
    create: baseProcedure.input(z.object({
        value: z.string().min(1, "Value cannot be empty").max(10000, "Value cannot exceed 10,000 characters"),
    })).mutation(async ({ input }) => {
        const createdProject = await prisma.project.create({
            data: {
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