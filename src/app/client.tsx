'use client'

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const Client = () => {
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.hello.queryOptions({text: 'world'}));

    return (
        <div>{JSON.stringify(data, null, 2)}</div>
    );
}
 
export default Client;