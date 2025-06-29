import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import Image from "next/image";

const Page = async () => {
  // const users = await prisma.user.findMany();
  return (
    <div>
      {/* <pre>{JSON.stringify(users, null, 2)}</pre> */}
    </div>
  );
};

export default Page;
